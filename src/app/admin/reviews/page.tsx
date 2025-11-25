
import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { ReviewActions } from "./ReviewActions";
import AdminReviewsClient from "@/components/admin/AdminReviewsClient";

export const dynamic = "force-dynamic";

async function getReviews(filterStatus?: 'all' | 'approved' | 'rejected' | 'pending') {
  try {
    const supabase: any = await createClient();
    // Debug log: show incoming filterStatus on the server
    try {
      console.log("getReviews called with filterStatus:", filterStatus);
    } catch (e) {
      // ignore logging errors
    }
    let query: any = supabase
      .from("product_reviews")
      .select("*, product:products(name_ar)")
      .order("created_at", { ascending: false });

    // Apply server-side filter based on is_approved boolean
    if (filterStatus === 'approved') {
      query = query.eq('is_approved', true)
    } else if (filterStatus === 'rejected') {
      query = query.eq('is_approved', false)
    } else if (filterStatus === 'pending') {
      // pending => is_approved is null (not yet decided)
      query = query.is('is_approved', null)
    }

    const res: any = await query;

    // Debug: log what Supabase returned
    try {
      console.log("getReviews supabase response:", {
        count: Array.isArray(res?.data) ? res.data.length : undefined,
        error: res?.error ?? null,
      });
    } catch (e) {
      // ignore
    }

    // Supabase returns { data, error, status, statusText }
    const { data: reviews, error } = res || {};

    if (error) {
      // Log helpful error details when available
      try {
        console.error("Error fetching reviews:", {
          message: error.message ?? String(error),
          details: error.details ?? undefined,
          hint: error.hint ?? undefined,
          code: error.code ?? undefined,
        });
      } catch (logErr) {
        console.error("Error fetching reviews (unknown error):", error);
      }
      return [];
    }

    if (!Array.isArray(reviews)) return [];
    return reviews;
  } catch (err) {
    console.error("Unexpected error in getReviews:", err instanceof Error ? { message: err.message, stack: err.stack } : err);
    return [];
  }
}


export default async function ReviewsPage({ searchParams }: { searchParams?: { status?: string | string[] } }) {
  // Normalize searchParams.status which may be string or string[]
  const rawStatus = searchParams?.status as string | string[] | undefined;
  const statusStr = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;
  const allowed = ['all', 'approved', 'rejected', 'pending'];
  const statusParam = allowed.includes(statusStr || '') ? (statusStr as 'all' | 'approved' | 'rejected' | 'pending') : 'all';

  const reviews = await getReviews(statusParam);

  const statusVariant: { [key: string]: "secondary" | "destructive" | "default" | "outline" } = {
    pending: "secondary",
    approved: "default",
    rejected: "destructive",
  };

  const statusTranslations: { [key: string]: string } = {
    approved: "مقبول",
    pending: "قيد المراجعة",
    rejected: "مرفوض",
  };

  return (
    <div className="w-full p-4 md:p-8">
      <div className="flex items-center py-4">
        <h1 className="text-2xl font-bold">إدارة التقييمات</h1>
      </div>

      {/* Use client-side reviews component to perform filtering reliably in browser */}
      <AdminReviewsClient reviews={reviews} />
    </div>
  );
}
