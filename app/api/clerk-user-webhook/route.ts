import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      throw new Error("CLERK_WEBHOOK_SECRET is not set");
    }

    const svix_id = req.headers.get("svix-id");
    const svix_timestamp = req.headers.get("svix-timestamp");
    const svix_signature = req.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

    const body = await req.text();
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (evt.type !== "user.created" && evt.type !== "user.updated") {
      return NextResponse.json({ ok: true });
    }

    const { id, email_addresses } = evt.data as {
      id: string;
      email_addresses?: Array<{ email_address: string }>;
    };
    const email = email_addresses?.[0]?.email_address ?? "";

    await supabase.from("users").upsert({ id, email });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
