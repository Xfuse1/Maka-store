// app/order-success/page.tsx
import Link from "next/link"

// Server Component (يدعم القراءة المباشرة من searchParams)
export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  // ننتظر searchParams حسب متطلبات Next.js 15
  const params = await searchParams
  
  // ندعم أكتر من اسم للبارام عشان ما يحصلش لخبطة
  const raw =
    (params?.orderNumber ??
      params?.orderNum ??
      params?.order ??
      params?.id) || ""

  const orderNumber = Array.isArray(raw) ? raw[0] : raw

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-xl w-full rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold mb-2">تم إرسال طلبك بنجاح 🎉</h1>
        <p className="text-muted-foreground mb-6">
          شكراً لك! سنقوم بالتواصل معك لتأكيد تفاصيل الشحن والدفع.
        </p>

        {orderNumber ? (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="font-medium">رقم الطلب</p>
            <p className="text-lg font-bold mt-1">{orderNumber}</p>
          </div>
        ) : (
          <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="font-medium">رقم الطلب غير متوفر في الرابط.</p>
            <p className="text-sm text-muted-foreground mt-1">
              تأكد أن إعادة التوجيه تحتوي على ?orderNumber=123…
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent/50"
          >
            العودة للرئيسية
          </Link>
          <Link
            href="/orders/"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            متابعة طلباتي
          </Link>
        </div>
      </div>
    </main>
  )
}
