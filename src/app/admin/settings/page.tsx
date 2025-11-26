"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Store, Mail } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">الإعدادات العامة</h1>
        <p className="text-muted-foreground text-sm md:text-base">إدارة معلومات المتجر والإعدادات</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Store className="h-5 w-5 text-primary" />
              معلومات المتجر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-2 block">اسم المتجر</Label>
              <Input type="text" defaultValue="مكة" className="text-base" />
            </div>
            <div>
              <Label className="text-base font-medium mb-2 block">وصف المتجر</Label>
              <Textarea
                defaultValue="متجر مكة للأزياء النسائية الراقية - نقدم لكِ أفضل التصاميم العصرية التي تجمع بين الأصالة والحداثة"
                rows={4}
                className="text-base"
              />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => alert("تم حفظ معلومات المتجر")}>
              حفظ المعلومات
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Mail className="h-5 w-5 text-primary" />
              معلومات الاتصال
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-2 block">البريد الإلكتروني</Label>
              <Input type="email" defaultValue="info@mecca-fashion.com" className="text-base" />
            </div>
            <div>
              <Label className="text-base font-medium mb-2 block">رقم الهاتف</Label>
              <Input type="tel" defaultValue="01234567890" className="text-base" />
            </div>
            <div>
              <Label className="text-base font-medium mb-2 block">رقم الواتساب</Label>
              <Input type="tel" defaultValue="01234567890" className="text-base" />
            </div>
            <div>
              <Label className="text-base font-medium mb-2 block">العنوان</Label>
              <Textarea defaultValue="القاهرة، مصر" rows={3} className="text-base" />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => alert("تم حفظ معلومات الاتصال")}>
              حفظ معلومات الاتصال
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
