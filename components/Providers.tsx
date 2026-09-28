"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/app/get-query-client";
import type * as React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { MotionProvider } from "@/components/design-system/motion-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: { colorPrimary: "#e30613", colorBackground: "#202020", borderRadius: "10px" },
      }}
    >
      <MotionProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </MotionProvider>
    </ClerkProvider>
  );
}
