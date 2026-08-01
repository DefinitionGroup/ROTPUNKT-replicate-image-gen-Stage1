import { clerkMiddleware } from "@clerk/nextjs/server";
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Skip i18n middleware for API routes and studio
  if (pathname.startsWith('/api') || pathname.startsWith('/studio')) {
    return NextResponse.next();
  }

  // Apply internationalization middleware
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Skip Studio and Next internals and static assets
    "/((?!studio|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|webm|png|gif|svg|lottie|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
