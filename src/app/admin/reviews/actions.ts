
"use server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateReviewStatus(
  reviewId: number,
  status: "approved" | "rejected"
) {
  const supabase = await createSupabaseAdmin();

  const { data, error } = await supabase
    .from("reviews")
    .update({ status })
    .eq("id", reviewId);

  if (error) {
    console.error("Error updating review status:", error);
    return { error: "Could not update review status." };
  }

  // Revalidate the page to show the updated status
  revalidatePath("/admin/reviews");

  return { success: true };
}
