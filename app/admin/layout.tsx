"use client"

import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

// ✅ يطبّق قيم التصميم (ألوان/خطوط/تخطيط) كـ CSS variables على :root
import DesignProvider from "@/components/providers/design-provider"

// ✅ يهيّئ صفحات الافتراضيّة ويجهّز الستور
import { useInitializePages } from "@/lib/use-page-content"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // مرّة واحدة: إنشاء الصفحات الافتراضية لو مش موجودة
  useInitializePages()

  return (
    <div className="flex min-h-screen bg-background" dir="rtl">
      {/* يحقن قيم التصميم المتغيرة في :root */}
      <DesignProvider />

      <AdminSidebar />

      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
