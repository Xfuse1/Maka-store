
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

export const dynamic = "force-dynamic";

async function getReviews() {
  const supabase = await createClient();
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*, product:products(name_ar)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }

  return reviews ?? [];
}

export default async function ReviewsPage() {
  const reviews = await getReviews();

  const statusVariant: { [key: string]: "secondary" | "success" | "destructive" | "default" } = {
    pending: "secondary",
    approved: "success",
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

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المنتج</TableHead>
              <TableHead className="text-right">صاحب التقييم</TableHead>
              <TableHead className="text-center">التقييم</TableHead>
              <TableHead className="text-right">التعليق</TableHead>
              <TableHead className="text-center">الحالة</TableHead>
              <TableHead className="text-right">تاريخ الإنشاء</TableHead>
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium whitespace-nowrap text-right">
                    {review.product?.name_ar || "منتج محذوف"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">{review.reviewer_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < review.rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                          fill={i < review.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-right">{review.comment}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={statusVariant[review.status] || "default"}
                      className="capitalize"
                    >
                      {statusTranslations[review.status] || review.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    {new Date(review.created_at).toLocaleDateString("ar-EG", {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    <ReviewActions reviewId={review.id} currentStatus={review.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  لا توجد تقييمات لعرضها.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
