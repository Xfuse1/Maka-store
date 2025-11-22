"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Package, Eye, Search, Filter } from "lucide-react"
import { getOrders, updateOrderStatus } from "@/lib/local-db"
import type { Order } from "@/lib/types"
import { ClientOnlyDate } from "@/components/ClientOnlyDate"

export default function OrdersManagementPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/idara-alkhasa")
      return
    }

    const loadedOrders = getOrders()
    setOrders(loadedOrders)
    setFilteredOrders(loadedOrders)
  }, [isAuthenticated, router])

  useEffect(() => {
    let filtered = orders

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerPhone.includes(searchQuery),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [searchQuery, statusFilter, orders])

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus as Order["orderStatus"])
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, orderStatus: newStatus as Order["orderStatus"] } : order,
    )
    setOrders(updatedOrders)
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus as Order["orderStatus"] })
    }
  }

  const getStatusBadge = (status: Order["orderStatus"]) => {
    const statusConfig = {
      pending: { label: "في انتظار", className: "bg-blue-500" },
      processing: { label: "في معالجة", className: "bg-yellow-500" },
      shipped: { label: "تم شحن", className: "bg-purple-500" },
      delivered: { label: "تم تسليم", className: "bg-green-500" },
      cancelled: { label: "ملغي", className: "bg-red-500" },
    }
    const config = statusConfig[status]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: Order["paymentStatus"]) => {
    const statusConfig = {
      pending: { label: "في انتظار دفع", className: "bg-orange-500" },
      paid: { label: "تم دفع", className: "bg-green-500" },
      failed: { label: "فشل دفع", className: "bg-red-500" },
    }
    const config = statusConfig[status]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout title="إدارة الطلبات" description="عرض وإدارة جميع الطلبات">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع طلبات</SelectItem>
              <SelectItem value="pending">في انتظار</SelectItem>
              <SelectItem value="processing">في معالجة</SelectItem>
              <SelectItem value="shipped">تم شحن</SelectItem>
              <SelectItem value="delivered">تم تسليم</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.length === 0 ? (
            <Card className="border-2">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">لا توجد طلبات</h3>
                <p className="text-muted-foreground">لم يتم العثور على طلبات تطابق البحث</p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold">طلب #{order.id.slice(-8)}</h3>
                        {getStatusBadge(order.orderStatus)}
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <p>
                          <span className="text-muted-foreground">العميل:</span>{" "}
                          <span className="font-medium">{order.customerName}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">الهاتف:</span>{" "}
                          <span className="font-medium">{order.customerPhone}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">المنتجات:</span>{" "}
                          <span className="font-medium">{order.items.length} منتج</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">الإجمالي:</span>{" "}
                          <span className="font-bold text-primary">{order.totalPrice} ج.م</span>
                        </p>
                        <p className="md:col-span-2">
                          <span className="text-muted-foreground">التاريخ:</span>{" "}
                           <ClientOnlyDate date={order.createdAt} className="font-medium" />
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:min-w-[200px]">
                      <Select value={order.orderStatus} onValueChange={(value) => handleStatusChange(order.id, value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">في انتظار</SelectItem>
                          <SelectItem value="processing">في معالجة</SelectItem>
                          <SelectItem value="shipped">تم شحن</SelectItem>
                          <SelectItem value="delivered">تم تسليم</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order)
                          setIsDetailsOpen(true)
                        }}
                        className="bg-transparent"
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب #{selectedOrder?.id.slice(-8)}</DialogTitle>
            <DialogDescription>معلومات كاملة عن الطلب</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <Card className="border-2">
                <CardContent className="p-6">
                  <h4 className="font-bold text-lg mb-4">معلومات العميل</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">الاسم</p>
                      <p className="font-medium">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">رقم الهاتف</p>
                      <p className="font-medium">{selectedOrder.customerPhone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">العنوان</p>
                      <p className="font-medium">{selectedOrder.shippingAddress}</p>
                    </div>
                    {selectedOrder.notes && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground mb-1">ملاحظات</p>
                        <p className="font-medium">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <h4 className="font-bold text-lg mb-4">المنتجات</h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0">
                        <div className="flex-1">
                          <p className="font-medium mb-1">{item.productName}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>اللون: {item.color}</span>
                            <span>المقاس: {item.size}</span>
                            <span>الكمية: {item.quantity}</span>
                          </div>
                        </div>
                        <p className="font-bold text-primary">{item.price * item.quantity} ج.م</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t-2">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-bold">الإجمالي:</span>
                      <span className="font-bold text-primary text-2xl">{selectedOrder.totalPrice} ج.م</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <h4 className="font-bold text-lg mb-4">حالة الطلب</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">حالة الطلب</p>
                      {getStatusBadge(selectedOrder.orderStatus)}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">حالة الدفع</p>
                      {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">طريقة الدفع</p>
                      <p className="font-medium">
                        {selectedOrder.paymentMethod === "cash" ? "دفع عند استلام" : "بطاقة ائتمان"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">تاريخ الطلب</p>
                       <ClientOnlyDate
                        date={selectedOrder.createdAt}
                        className="font-medium"
                        options={{
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
