"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Percent } from "lucide-react"
import { getCoupons, addCoupon, deleteCoupon } from "@/lib/local-db"
import type { Coupon } from "@/lib/types"

export default function CouponsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountValue: "",
    expiresAt: "",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/idara-alkhasa")
      return
    }

    const loadedCoupons = getCoupons()
    setCoupons(loadedCoupons)
  }, [isAuthenticated, router])

  const handleAddCoupon = () => {
    if (!newCoupon.code || !newCoupon.discountValue) {
      alert("الرجاء ملء جميع الحقول المطلوبة")
      return
    }

    const coupon: Coupon = {
      id: `coupon-${Date.now()}`,
      code: newCoupon.code.toUpperCase(),
      discountType: "percentage",
      discountValue: Number.parseFloat(newCoupon.discountValue),
      minPurchase: 0,
      maxUses: 999999,
      usedCount: 0,
      expiresAt: newCoupon.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    addCoupon(coupon)
    setCoupons([...coupons, coupon])
    setIsAddDialogOpen(false)
    setNewCoupon({ code: "", discountValue: "", expiresAt: "" })
  }

  const handleDeleteCoupon = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الكوبون؟")) {
      deleteCoupon(id)
      setCoupons(coupons.filter((c) => c.id !== id))
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout title="كوبونات الخصم" description="إدارة كوبونات الخصم والعروض">
      <div className="mb-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 ml-2" />
              إضافة كوبون جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة كوبون خصم جديد</DialogTitle>
              <DialogDescription>أضف كوبون خصم جديد للعملاء</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">كود الكوبون *</Label>
                <Input
                  id="code"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER2025"
                  className="uppercase"
                />
              </div>

              <div>
                <Label htmlFor="discount">نسبة الخصم (%) *</Label>
                <Input
                  id="discount"
                  type="number"
                  value={newCoupon.discountValue}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                  placeholder="10"
                  min="1"
                  max="100"
                />
              </div>

              <div>
                <Label htmlFor="expiresAt">تاريخ الانتهاء (اختياري)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={newCoupon.expiresAt}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                />
              </div>

              <Button onClick={handleAddCoupon} className="w-full">
                إضافة الكوبون
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Percent className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">لا توجد كوبونات حالياً</p>
            </CardContent>
          </Card>
        ) : (
          coupons.map((coupon) => (
            <Card key={coupon.id} className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1 font-mono">{coupon.code}</h3>
                    <Badge className="bg-primary text-primary-foreground">خصم {coupon.discountValue}%</Badge>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  {coupon.expiresAt && (
                    <p className="text-muted-foreground">
                      ينتهي في: {new Date(coupon.expiresAt).toLocaleDateString("ar-EG")}
                    </p>
                  )}
                  <p className="text-muted-foreground">عدد مرات الاستخدام: {coupon.usedCount}</p>
                  <p className="text-xs text-muted-foreground">
                    تم الإنشاء: {new Date(coupon.createdAt).toLocaleDateString("ar-EG")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  )
}
