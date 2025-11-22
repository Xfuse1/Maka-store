
"use client"

import { Menu, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface AdminHeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

export function AdminHeader({ setSidebarOpen }: AdminHeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
      <div className="md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </div>
      
      <div className="flex-1">
        <h1 className="font-semibold text-lg whitespace-nowrap">لوحة تحكم متجر مكة</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </div>
    </header>
  )
}
