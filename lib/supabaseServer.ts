import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

type AccessTokenProvider = () => Promise<string | null>;

export function createSupabaseUserClient(
  getAccessToken: AccessTokenProvider
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase user client is not configured");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: async (request, options = {}) => {
        const token = await getAccessToken();
        if (!token) {
          throw new Error("Clerk Supabase token is unavailable");
        }
        const headers = new Headers(options.headers);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(request, { ...options, headers });
      },
    },
  });
}

export function createSupabaseServerClient() {
  return createSupabaseUserClient(async () => {
    const { getToken } = await auth();
    return getToken({ template: "supabase" });
  });
}
