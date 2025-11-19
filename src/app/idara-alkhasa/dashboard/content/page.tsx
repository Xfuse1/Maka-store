"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { FileText, Save } from "lucide-react"

export default function ContentPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [content, setContent] = useState({
    aboutUs: "",
    returnPolicy: "",
    shippingInfo: "",
    contactInfo: "",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/idara-alkhasa")
      return
    }

    // Load content from localStorage
    const savedContent = localStorage.getItem("mecca_content")
    if (savedContent) {
      setContent(JSON.parse(savedContent))
    } else {
      // Default content
      setContent({
        aboutUs: "مكة هو متجر للأزياء النسائية الراقية، نقدم لكِ أفضل التصاميم العصرية التي تجمع بين الأصالة والحداثة.",
        returnPolicy:
          "يمكنك إرجاع المنتجات خلال 14 يوم من تاريخ الاستلام. يجب أن تكون المنتجات في حالتها الأصلية مع جميع الملصقات.",
        shippingInfo: "نوفر الشحن لجميع أنحاء مصر. مدة التوصيل من 3-7 أيام عمل حسب المنطقة.",
        contactInfo: "واتساب: 01234567890\nالبريد الإلكتروني: info@mecca-fashion.com\nالعنوان: القاهرة، مصر",
      })
    }
  }, [isAuthenticated, router])

  const handleSave = () => {
    localStorage.setItem("mecca_content", JSON.stringify(content))
    alert("تم حفظ المحتوى بنجاح!")
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout title="إدارة المحتوى" description="تعديل محتوى الصفحات الثابتة">
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">من نحن</h3>
            </div>
            <Textarea
              value={content.aboutUs}
              onChange={(e) => setContent({ ...content, aboutUs: e.target.value })}
              rows={4}
              placeholder="اكتب نبذة عن المتجر..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">سياسة الإرجاع</h3>
            </div>
            <Textarea
              value={content.returnPolicy}
              onChange={(e) => setContent({ ...content, returnPolicy: e.target.value })}
              rows={4}
              placeholder="اكتب سياسة الإرجاع..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">معلومات الشحن</h3>
            </div>
            <Textarea
              value={content.shippingInfo}
              onChange={(e) => setContent({ ...content, shippingInfo: e.target.value })}
              rows={3}
              placeholder="اكتب معلومات الشحن..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">معلومات التواصل</h3>
            </div>
            <Textarea
              value={content.contactInfo}
              onChange={(e) => setContent({ ...content, contactInfo: e.target.value })}
              rows={4}
              placeholder="اكتب معلومات التواصل..."
            />
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90" size="lg">
          <Save className="w-5 h-5 ml-2" />
          حفظ جميع التغييرات
        </Button>
      </div>
    </AdminLayout>
  )
}
