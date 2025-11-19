"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Eye, Package, Truck, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateOrderStatus, getOrderById } from "@/lib/supabase/orders"

interface Order {
  id: string
  customer_email: string
  customer_name: string
  customer_phone: string
  status: string
  created_at: string
  total: number
  items: any
  address: string
  payment_method: string
  shipping_address: string
}

const orderStatuses = [
  { value: "pending", label: "تحت الإنشاء" },
  { value: "confirmed", label: "مؤكد" },
  { value: "processing", label: "جاري التجهيز" },
  { value: "shipped", label: "خرج للشحن" },
  { value: "delivered", label: "تم التوصيل" },
  { value: "cancelled", label: "ملغي" },
  { value: "refunded", label: "مسترجع" },
]

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/admin/orders")
        const result = await res.json()
        if (result.error) {
          console.error("Error fetching orders:", result.error)
          return
        }
        const mapped = (result.orders || []).map((o: any) => {
          // prefer an existing single-field shipping_address
          const singleAddress = (o.shipping_address || o.address || o.shipping_address_full || "").trim()

          const parts = [
            o.shipping_address_line1,
            o.shipping_address_line2,
            o.shipping_city,
            o.shipping_state,
            o.shipping_postal_code,
            o.shipping_country,
          ].filter(Boolean)

          // fallback to billing address fields if shipping not present
          const billingParts = [
            o.billing_address_line1,
            o.billing_address_line2,
            o.billing_city,
            o.billing_state,
            o.billing_postal_code,
            o.billing_country,
          ].filter(Boolean)

          const composed = singleAddress || (parts.length ? parts.join(", ") : (billingParts.length ? billingParts.join(", ") : ""))

          const normalizedItems = Array.isArray(o.items)
            ? o.items
            : typeof o.items === "string"
            ? (() => {
                try {
                  return JSON.parse(o.items)
                } catch {
                  return o.items
                }
              })()
            : o.items

          return {
            ...o,
            shipping_address: composed,
            items: normalizedItems,
          }
        })

        // helpful debug — remove or comment out in production
        try {
          // eslint-disable-next-line no-console
          console.debug("mapped orders sample:", mapped[0])
        } catch (_) {}

        setOrders(mapped)
      } catch (err) {
        console.error("Error fetching orders:", err)
      }
    }
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-500"
      case "confirmed":
        return "bg-cyan-500"
      case "processing":
        return "bg-yellow-500"
      case "shipped":
        return "bg-purple-500"
      case "delivered":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      case "refunded":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    const statusObj = orderStatuses.find((s) => s.value === status)
    return statusObj ? statusObj.label : status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Package
      case "confirmed":
        return Package
      case "processing":
        return Package
      case "shipped":
        return Truck
      case "delivered":
        return CheckCircle
      case "cancelled":
        return Package
      case "refunded":
        return Package
      default:
        return Package
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
      alert(`تم تحديث حالة الطلب " `)
    } catch (err: any) {
      console.error("[v0] Error updating order status (client):", err)
      const message = err?.message || (typeof err === "string" ? err : JSON.stringify(err))
      alert(`فشل تحديث حالة الطلب: ${message}`)
    }
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">إدارة الطلبات</h1>
        <p className="text-muted-foreground text-base">عرض ومتابعة جميع الطلبات</p>
      </div>

      <Card className="border-2 border-border mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن طلب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-base"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {filteredOrders.map((order) => {
          const StatusIcon = getStatusIcon(order.status)
          return (
            <Card key={order.id} className="border-2 border-border hover:border-primary/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${getStatusColor(order.status)}/10`}>
                      <StatusIcon className={`h-6 w-6 ${getStatusColor(order.status).replace("bg-", "text-")}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-foreground">{order.id}</h3>
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.created_at}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-primary">{order.total} ج.م</p>
                    <p className="text-sm text-muted-foreground">{order.items ? order.items.length : 0} منتج</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">اسم العميل</p>
                    <p className="font-medium text-foreground">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">البريد الإلكتروني</p>
                    <p className="font-medium text-foreground">{order.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">رقم الهاتف</p>
                    <p className="font-medium text-foreground">{order.customer_phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                    onClick={() => handleViewDetails(order)}
                  >
                    <Eye className="h-4 w-4" />
                    عرض التفاصيل
                  </Button>
                  {order.status !== "delivered" && (
                    <Select value={order.status} onValueChange={(value) => handleUpdateStatus(order.id, value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="تحديث الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-20">
          <Search className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-2xl font-bold mb-4 text-foreground">لا توجد نتائج</h3>
          <p className="text-muted-foreground">لم يتم العثور على طلبات تطابق بحثك</p>
        </div>
      )}

      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">تفاصيل الطلب {selectedOrder?.id}</DialogTitle>
            <DialogDescription>معلومات كاملة عن الطلب</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">اسم العميل</p>
                  <p className="font-bold text-foreground">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">رقم الهاتف</p>
                  <p className="font-bold text-foreground">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">البريد الإلكتروني</p>
                  <p className="font-bold text-foreground">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">تاريخ الطلب</p>
                  <p className="font-bold text-foreground">{selectedOrder.created_at}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">العنوان</p>
                <p className="font-bold text-foreground">{selectedOrder.shipping_address}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">طريقة الدفع</p>
                <p className="font-bold text-foreground">{selectedOrder.payment_method}</p>
              </div>

              <div className="border-t-2 border-border pt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-muted-foreground">عدد المنتجات</p>
                  <p className="font-bold text-foreground">{selectedOrder.items}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-foreground">الإجمالي</p>
                  <p className="text-2xl font-bold text-primary">{selectedOrder.total} ج.م</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => {
                    handleUpdateStatus(selectedOrder.id, value)
                    setSelectedOrder({ ...selectedOrder, status: value })
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="تحديث الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setShowOrderDetails(false)}>
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
