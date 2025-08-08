import { createClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";

export function useSupabaseWithClerk() {
  const { session } = useSession();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          const token = await session?.getToken({ template: "supabase" });
          const headers = new Headers(options.headers);
          headers.set("Authorization", `Bearer ${token}`);
          return fetch(url, { ...options, headers });
        },
      },
    }
  );

  return supabase;
}
