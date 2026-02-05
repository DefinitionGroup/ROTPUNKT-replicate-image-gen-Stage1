import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhook } from "@clerk/backend/webhooks";
import type { WebhookEvent } from "@clerk/backend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    let evt: WebhookEvent;
    try {
      evt = await verifyWebhook(req);
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
