import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createSupabaseUserClient } from "@/lib/supabaseServer";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  const { userId, getToken } = await getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { generationSetId, imageId } = await req.json();
    if (
      typeof generationSetId !== "string" ||
      !UUID_PATTERN.test(generationSetId) ||
      typeof imageId !== "string" ||
      !UUID_PATTERN.test(imageId)
    ) {
      return NextResponse.json(
        { error: "Valid generationSetId and imageId are required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseUserClient(() =>
      getToken({ template: "supabase" })
    );
    const { data, error } = await supabase.rpc("select_generation_best", {
      p_set_id: generationSetId,
      p_image_id: imageId,
    });

    if (error) {
      if (error.code === "P0002") {
        return NextResponse.json(
          { error: "Image or generation set not found" },
          { status: 404 }
        );
      }
      throw new Error(`Best-image selection failed: ${error.message}`);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Best-image selection route error:", error);
    return NextResponse.json(
      { error: "Failed to save best-image selection" },
      { status: 500 }
    );
  }
}
