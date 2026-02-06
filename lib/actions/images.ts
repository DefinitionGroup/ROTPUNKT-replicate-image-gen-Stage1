"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export type ImageRow = {
    id: string;
    url: string;
    created_at: string;
    imageprompt: string | null;
    is_upscaled: boolean;
    user_id?: string;
};

export async function getPaginatedImages(page: number, pageSize: number = 12) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const supabase = createSupabaseServerClient();

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
        .from("images")
        .select("id, url, created_at, imageprompt, is_upscaled, user_id", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        console.error("Error fetching paginated images:", error.message);
        throw new Error("Failed to fetch images");
    }

    return {
        images: (data as ImageRow[]) || [],
        nextPage: data.length === pageSize ? page + 1 : undefined,
        totalCount: count || 0,
    };
}
