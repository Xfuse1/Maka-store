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
    router.push("/auth")
    router.refresh()
  }

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
        
        <TabsTrigger value="settings">الإعدادات</TabsTrigger>
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

      <TabsContent value="orders">
        <Card>
          <CardHeader>
            <CardTitle>سجل الطلبات</CardTitle>
            <CardDescription>اضغط "طلباتي" للانتقال إلى صفحة الطلبات أو افتح تفاصيل طلب من هنا.</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">لا توجد طلبات حتى الآن.</div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => handleViewOrder(order.id)}>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold">طلب #{order.id.slice(0, 8)}</span>
                        <Badge className={`${getStatusColor(order.status)} text-white border-0`}>{getStatusLabel(order.status)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="font-bold text-lg">{order.total || order.total_price} ج.م</div>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleViewOrder(order.id); }}>
                        <Eye className="h-4 w-4 ml-2" />التفاصيل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
            <DialogDescription>{selectedOrder && `طلب #${selectedOrder.id.slice(0, 8)} بتاريخ ${new Date(selectedOrder.created_at).toLocaleDateString('ar-EG')}`}</DialogDescription>
          </DialogHeader>

          {isOrderLoading ? (
            <div className="py-8 text-center">جاري التحميل...</div>
          ) : selectedOrder ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">الحالة</h4>
                  <Badge className={`${getStatusColor(selectedOrder.status)} text-white border-0`}>{getStatusLabel(selectedOrder.status)}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">الإجمالي</h4>
                  <p className="text-lg font-bold text-primary">{selectedOrder.total || selectedOrder.total_price} ج.م</p>
                </div>
              </div>

              {selectedOrder.shipping_address && (
                <div>
                  <h4 className="font-semibold mb-2">عنوان الشحن</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{selectedOrder.shipping_address}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">المنتجات</h4>
                <div className="space-y-3">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-start border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{item.name || item.title || item.product_name || "منتج"}</p>
                        <p className="text-sm text-muted-foreground">{item.quantity} × {item.price || item.unit_price} ج.م</p>
                        {(item.size || item.color) && (
                          <p className="text-xs text-muted-foreground mt-1">{item.size && `المقاس: ${item.size} `}{item.color && `اللون: ${item.color}`}</p>
                        )}
                      </div>
                      <p className="font-semibold">{(item.quantity || 1) * (item.price || item.unit_price || 0)} ج.م</p>
                    </div>
                  ))}
                  {(!selectedOrder.items || selectedOrder.items.length === 0) && (<p className="text-sm text-muted-foreground">لا توجد تفاصيل للمنتجات</p>)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-500">حدث خطأ في تحميل التفاصيل</div>
          )}
        </DialogContent>
      </Dialog>

      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>إعدادات الحساب</CardTitle>
            <CardDescription>إدارة أمان حسابك وتسجيل الخروج.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
              <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">تسجيل الخروج</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
