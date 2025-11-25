
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
const AdminSidebar = dynamic(() => import("@/components/admin/admin-sidebar").then((mod) => mod.AdminSidebar), { ssr: false })
const AdminHeader = dynamic(() => import("@/components/admin/admin-header").then((mod) => mod.AdminHeader), { ssr: false })
import { useInitializePages } from "@/lib/use-page-content"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useInitializePages()
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  // Respect previously saved user preference for the sidebar (persist in localStorage).
  // If no preference is set, default to closed so the sidebar doesn't appear unexpectedly.
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem("adminSidebarOpen");
      if (raw !== null) {
        setSidebarOpen(raw === "true");
      } else {
        setSidebarOpen(false);
      }
    } catch (err) {
      // ignore localStorage errors and keep sidebar closed by default
      setSidebarOpen(false);
    }
  }, []);

  // Persist changes to localStorage so the user's preference is remembered.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("adminSidebarOpen", isSidebarOpen ? "true" : "false");
    } catch (err) {
      // ignore write errors
    }
  }, [isSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-muted/40" dir="rtl">
      <AdminSidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1">
        <AdminHeader setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
