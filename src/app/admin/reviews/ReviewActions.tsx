
"use client";

import { Button } from "@/components/ui/button";
import { updateReviewStatus } from "./actions"; // We will create this server action
import { useTransition } from "react";

export function ReviewActions({ reviewId }: { reviewId: number }) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(() => {
      updateReviewStatus(reviewId, "approved");
    });
  };

  const handleReject = () => {
    startTransition(() => {
      updateReviewStatus(reviewId, "rejected");
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handleApprove}
        disabled={isPending}
      >
        {isPending ? "جاري..." : "نشر"}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={handleReject}
        disabled={isPending}
      >
        {isPending ? "جاري..." : "رفض"}
      </Button>
    </div>
  );
}
