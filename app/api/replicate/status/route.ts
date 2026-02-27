import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Replicate from "replicate";
import { uploadImages } from "@/lib/minioClient";
import { createClient } from "@supabase/supabase-js";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const isDev = process.env.NODE_ENV === "development";
const STATUS_TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  }) as Promise<T>;
}

function extractUrls(output: unknown): string[] {
  const urls: string[] = [];

  const processItem = (item: unknown) => {
    if (item && typeof item === "object" && "url" in item) {
      const maybeUrlFn = (item as { url?: unknown }).url;
      if (typeof maybeUrlFn === "function") {
        const result = maybeUrlFn.call(item);
        if (result && typeof result === "object" && "href" in result) {
          const href = (result as { href?: unknown }).href;
          if (typeof href === "string") urls.push(href);
        }
      }
      return;
    }

    if (typeof item === "string") {
      urls.push(item);
    }
  };

  if (Array.isArray(output)) {
    for (const item of output) {
      processItem(item);
    }
  } else {
    processItem(output);
  }

  return urls;
}

function toErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Generation failed";
}

type PersistenceResult = {
  persisted: boolean;
  transport?: "service_role" | "anon_clerk";
  inserted?: number;
  errors?: string[];
};

async function persistImagesToSupabase(params: {
  requestId: string;
  userId: string;
  prompt: string;
  urls: string[];
  getToken: ReturnType<typeof getAuth>["getToken"];
}): Promise<PersistenceResult> {
  const { requestId, userId, prompt, urls, getToken } = params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return {
      persisted: false,
      errors: ["Missing NEXT_PUBLIC_SUPABASE_URL"],
    };
  }

  const clients: Array<{
    name: "service_role" | "anon_clerk";
    client: ReturnType<typeof createClient>;
  }> = [];

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    clients.push({
      name: "service_role",
      client: createClient(
        supabaseUrl,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      ),
    });
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    clients.push({
      name: "anon_clerk",
      client: createClient(
        supabaseUrl,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          global: {
            fetch: async (url, options = {}) => {
              const token = await getToken({ template: "supabase" });
              const headers = new Headers(options.headers);
              if (token) headers.set("Authorization", `Bearer ${token}`);
              return fetch(url, { ...options, headers });
            },
          },
        }
      ),
    });
  }

  if (clients.length === 0) {
    return {
      persisted: false,
      errors: [
        "No Supabase credentials configured (need SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
      ],
    };
  }

  const insertPayload = urls.map((url) => ({
    url,
    imageprompt: prompt,
    user_id: userId,
  }));

  const errors: string[] = [];
  for (const { name, client } of clients) {
    try {
      const { data: existingRows, error: existingRowsError } = await client
        .from("images")
        .select("url")
        .eq("user_id", userId)
        .in("url", urls);

      if (existingRowsError) {
        throw new Error(`dedupe query failed: ${existingRowsError.message}`);
      }

      const existingUrls = new Set(
        (existingRows ?? []).map((row) => row.url as string)
      );
      const rowsToInsert = insertPayload.filter((row) => !existingUrls.has(row.url));

      if (rowsToInsert.length === 0) {
        if (isDev) {
          console.log(
            `[${requestId}] ℹ️ No new DB rows to insert (already persisted) via ${name}.`
          );
        }
        return { persisted: true, transport: name, inserted: 0 };
      }

      const { error: dbError } = await client.from("images").insert(rowsToInsert);
      if (dbError) {
        throw new Error(`insert failed: ${dbError.message}`);
      }

      return { persisted: true, transport: name, inserted: rowsToInsert.length };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "unknown persistence error";
      errors.push(`${name}: ${message}`);
      console.error(
        `[${requestId}] Supabase persistence via ${name} failed:`,
        error
      );
    }
  }

  return { persisted: false, errors };
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  if (isDev) console.log(`[${requestId}] 🔎 Polling generation status`);

  const { userId, getToken } = await getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { predictionId, prompt } = await req.json();

    if (!predictionId || typeof predictionId !== "string") {
      return NextResponse.json(
        { error: "predictionId is required" },
        { status: 400 }
      );
    }
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    const prediction = await withTimeout(
      replicate.predictions.get(predictionId),
      STATUS_TIMEOUT_MS,
      "Replicate status check"
    );

    const status = prediction.status ?? "starting";
    if (status !== "succeeded") {
      return NextResponse.json({
        status,
        error:
          status === "failed" || status === "canceled"
            ? toErrorMessage(prediction.error)
            : null,
      });
    }

    const generatedUrls = extractUrls(prediction.output);
    if (generatedUrls.length === 0) {
      throw new Error("No output received");
    }

    // Uploading and DB writes are best-effort in production.
    // If persistence fails, we still return succeeded with Replicate CDN URLs.
    let finalUrls = generatedUrls;
    try {
      // Deterministic object names keep finalization idempotent when polling.
      finalUrls = await uploadImages(generatedUrls, {
        deterministicPrefix: `prediction-${predictionId}`,
      });
    } catch (storageError) {
      console.error(
        `[${requestId}] MinIO upload failed; falling back to Replicate URLs:`,
        storageError
      );
      finalUrls = generatedUrls;
    }

    const persistence = await persistImagesToSupabase({
      requestId,
      userId,
      prompt,
      urls: finalUrls,
      getToken,
    });
    if (!persistence.persisted) {
      console.error(
        `[${requestId}] Failed to persist generation metadata to Supabase.`,
        persistence.errors
      );
    }

    return NextResponse.json({
      status: "succeeded",
      urls: finalUrls,
      persistedToSupabase: persistence.persisted,
      persistenceTransport: persistence.transport ?? null,
    });
  } catch (error) {
    console.error("Replicate status route error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to check generation status";
    if (message.toLowerCase().includes("timed out")) {
      return NextResponse.json(
        { error: "Status check timed out" },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Failed to check generation status" },
      { status: 500 }
    );
  }
}
