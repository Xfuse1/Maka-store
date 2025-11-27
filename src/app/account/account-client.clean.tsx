"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"

import { fetchOrderDetails } from "./actions"

interface AccountClientProps {
  user: any
  profile: any
  orders: any[]
}

export function AccountClient({ user, profile, orders }: AccountClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: profile?.name || "",
    phone: profile?.phone_number || "",
  })

  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isOrderLoading, setIsOrderLoading] = useState(false)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name: profileData.name,
          phone_number: profileData.phone,
          updated_at: new Date().toISOString(),
        } as any)
      if (error) throw error
      router.refresh()
      alert("تم تحديث الملف الشخصي بنجاح")
    } catch (error: any) {
      console.error("Error updating profile:", error)
      alert("حدث خطأ أثناء تحديث الملف الشخصي")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewOrder = async (orderId: string) => {
    setIsOrderLoading(true)
    setIsOrderDialogOpen(true)
    try {
      const details = await fetchOrderDetails(orderId)
      setSelectedOrder(details)
    } catch (error) {
      console.error("Failed to fetch order details", error)
      alert("فشل في تحميل تفاصيل الطلب")
      setIsOrderDialogOpen(false)
    } finally {
      setIsOrderLoading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      pending: "تحت الإنشاء",
      confirmed: "مؤكد",
      processing: "جاري التجهيز",
      shipped: "خرج للشحن",
      delivered: "تم التوصيل",
      cancelled: "ملغي",
      refunded: "مسترجع",
    }
    return statuses[status] || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-500"
      case "confirmed": return "bg-cyan-500"
      case "processing": return "bg-yellow-500"
      case "shipped": return "bg-purple-500"
      case "delivered": return "bg-green-500"
      case "cancelled": return "bg-red-500"
      case "refunded": return "bg-orange-500"
      default: return "bg-gray-500"
    }
  }

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    const target = `/auth?_cb=${Date.now()}`
    if (typeof window !== "undefined") {
      window.location.replace(target)
    } else {
      router.push("/auth")
      router.refresh()
    }
  }

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-1 gap-2 mb-6">
        <TabsTrigger value="profile" className="w-full">الملف الشخصي</TabsTrigger>
     
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>الملف الشخصي</CardTitle>
            <CardDescription>قم بتحديث معلوماتك الشخصية هنا.</CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileUpdate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" value={user.email} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
                <Input id="name" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} placeholder="أدخل اسمك" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input id="phone" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} placeholder="أدخل رقم هاتفك" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>{isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}</Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
