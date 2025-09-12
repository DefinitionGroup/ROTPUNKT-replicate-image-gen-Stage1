"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { disableDraftMode } from "@/app/actions";

export function DisableDraftMode() {
  const router = useRouter();
  const [pending, start] = useTransition();

  // Hide inside Presentation iframe
  if (
    typeof window !== "undefined" &&
    (window !== window.parent || !!window.opener)
  ) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() =>
        start(async () => {
          await disableDraftMode();
          router.refresh();
        })
      }
      aria-busy={pending}
    >
      {pending ? "Disabling…" : "Disable draft mode"}
    </button>
  );
}
