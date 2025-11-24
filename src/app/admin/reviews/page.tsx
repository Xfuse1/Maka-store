
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
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
import { getProductName } from "@/lib/supabase/products"; // We will create this function

export const dynamic = "force-dynamic";

async function getReviews() {
  const supabase = createServerComponentClient({ cookies });
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*, products(name)");

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }

  return reviews;
}

export default async function ReviewsPage() {
  const reviews = await getReviews();

  const statusVariant = {
    pending: "secondary",
    approved: "success",
    rejected: "destructive",
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">إدارة التقييمات</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المنتج</TableHead>
            <TableHead>صاحب التقييم</TableHead>
            <TableHead>التقييم</TableHead>
            <TableHead>التعليق</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell>{review.products.name}</TableCell>
              <TableCell>{review.reviewer_name}</TableCell>
              <TableCell>
                <div className="flex items-center">
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
              <TableCell className="max-w-xs truncate">{review.comment}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[review.status] || "default"}>
                  {review.status}
                </Badge>
              </TableCell>
              <TableCell>
                {review.status === "pending" && (
                  <ReviewActions reviewId={review.id} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
