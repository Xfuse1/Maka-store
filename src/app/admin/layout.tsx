
"use client"

import type React from "react"
import { useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { useInitializePages } from "@/lib/use-page-content"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useInitializePages()
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-muted/40" dir="rtl">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex">
        <AdminSidebar isSidebarOpen={true} setSidebarOpen={() => {}} />
      </div>

      {/* Sidebar for mobile */}
      <div className={`md:hidden`}>
        <AdminSidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      <div className="flex flex-col flex-1">
        <AdminHeader setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
