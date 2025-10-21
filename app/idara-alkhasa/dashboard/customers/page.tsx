"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Users, Search, Eye, Mail, Phone, MapPin, ShoppingBag } from "lucide-react"
import { getCustomers, getOrders } from "@/lib/local-db"
import type { Customer, Order } from "@/lib/types"

export default function CustomersManagementPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<Order[]>([])
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/idara-alkhasa")
      return
    }

    const loadedCustomers = getCustomers()
    setCustomers(loadedCustomers)
    setFilteredCustomers(loadedCustomers)
  }, [isAuthenticated, router])

  useEffect(() => {
    if (searchQuery) {
      const filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.includes(searchQuery) ||
          customer.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchQuery, customers])

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    const orders = getOrders().filter((order) => order.customerPhone === customer.phone)
    setCustomerOrders(orders)
    setIsDetailsOpen(true)
  }

  const getTotalSpent = (phone: string) => {
    const orders = getOrders().filter((order) => order.customerPhone === phone)
    return orders.reduce((sum, order) => sum + order.totalPrice, 0)
  }

  const getOrdersCount = (phone: string) => {
    return getOrders().filter((order) => order.customerPhone === phone).length
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout title="إدارة العملاء" description="عرض وإدارة معلومات العملاء">
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ابحث باسم العميل، رقم الهاتف، أو البريد الإلكتروني..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredCustomers.length === 0 ? (
            <Card className="border-2">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">لا يوجد عملاء</h3>
                <p className="text-muted-foreground">لم يتم العثور على عملاء تطابق البحث</p>
              </CardContent>
            </Card>
          ) : (
            filteredCustomers.map((customer) => {
              const ordersCount = getOrdersCount(customer.phone)
              const totalSpent = getTotalSpent(customer.phone)

              return (
                <Card key={customer.id} className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">{customer.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              عميل منذ {new Date(customer.createdAt).toLocaleDateString("ar-EG")}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{customer.phone}</span>
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span>{customer.email}</span>
                            </div>
                          )}
                          {customer.address && (
                            <div className="flex items-center gap-2 md:col-span-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>{customer.address}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 md:min-w-[200px]">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center p-3 bg-primary/10 rounded-lg">
                            <p className="text-2xl font-bold text-primary">{ordersCount}</p>
                            <p className="text-xs text-muted-foreground">طلب</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-lg font-bold text-green-600">{totalSpent}</p>
                            <p className="text-xs text-muted-foreground">ج.م</p>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => handleViewCustomer(customer)}
                          className="bg-transparent"
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          عرض التفاصيل
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل العميل</DialogTitle>
            <DialogDescription>معلومات كاملة عن العميل وطلباته</DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              <Card className="border-2">
                <CardContent className="p-6">
                  <h4 className="font-bold text-lg mb-4">المعلومات الشخصية</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">الاسم</p>
                      <p className="font-medium">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">رقم الهاتف</p>
                      <p className="font-medium">{selectedCustomer.phone}</p>
                    </div>
                    {selectedCustomer.email && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">البريد الإلكتروني</p>
                        <p className="font-medium">{selectedCustomer.email}</p>
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground mb-1">العنوان</p>
                        <p className="font-medium">{selectedCustomer.address}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">تاريخ التسجيل</p>
                      <p className="font-medium">
                        {new Date(selectedCustomer.createdAt).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <h4 className="font-bold text-lg mb-4">إحصائيات الطلبات</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold text-blue-600">{customerOrders.length}</p>
                      <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {customerOrders.reduce((sum, order) => sum + order.totalPrice, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">إجمالي المشتريات (ج.م)</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {customerOrders.length > 0
                          ? Math.round(
                              customerOrders.reduce((sum, order) => sum + order.totalPrice, 0) / customerOrders.length,
                            )
                          : 0}
                      </p>
                      <p className="text-sm text-muted-foreground">متوسط الطلب (ج.م)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <h4 className="font-bold text-lg mb-4">سجل الطلبات</h4>
                  {customerOrders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">لا توجد طلبات لهذا العميل</p>
                  ) : (
                    <div className="space-y-3">
                      {customerOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
                        >
                          <div>
                            <p className="font-medium mb-1">طلب #{order.id.slice(-8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-primary mb-1">{order.totalPrice} ج.م</p>
                            <Badge
                              className={
                                order.orderStatus === "delivered"
                                  ? "bg-green-500"
                                  : order.orderStatus === "cancelled"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                              }
                            >
                              {order.orderStatus === "delivered"
                                ? "تم تسليم"
                                : order.orderStatus === "cancelled"
                                  ? "ملغي"
                                  : order.orderStatus === "shipped"
                                    ? "تم شحن"
                                    : order.orderStatus === "processing"
                                      ? "في معالجة"
                                      : "في انتظار"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
