"use client"

import type React from "react"
import { useState } from "react" // ✅ أضيفي هذا السطر
import { useDesignStore } from "@/lib/design-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Palette, Type, Layout, ImageIcon } from "lucide-react"

export default function AdminDesignPage() {
  const { colors, fonts, layout, setColor, setFont, setLayout, setLogo, reset } = useDesignStore()
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const handleSaveColors = () => {
    alert("تم حفظ الألوان بنجاح!")
  }

  const handleSaveFonts = () => {
    alert("تم حفظ إعدادات الخطوط!")
  }

  const handleSaveLayout = () => {
    alert("تم حفظ إعدادات التخطيط!")
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      alert(`تم اختيار الشعار: ${file.name}`)
    }
  }

  const handleSaveLogo = () => {
    if (logoFile) {
      setLogo(logoFile.name)
      alert(`تم حفظ الشعار الجديد: ${logoFile.name}`)
    } else {
      alert("الرجاء اختيار ملف الشعار أولاً")
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">إعدادات التصميم</h1>
        <p className="text-muted-foreground text-base">تخصيص مظهر وألوان الموقع</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Palette className="h-5 w-5 text-primary" />
              الألوان الأساسية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-2 block">اللون الأساسي</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={colors.primary}
                  onChange={(e) => setColor("primary", e.target.value)}
                  className="w-20 h-12"
                />
                <Input
                  type="text"
                  value={colors.primary}
                  onChange={(e) => setColor("primary", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-base font-medium mb-2 block">لون الخلفية</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={colors.background}
                  onChange={(e) => setColor("background", e.target.value)}
                  className="w-20 h-12"
                />
                <Input
                  type="text"
                  value={colors.background}
                  onChange={(e) => setColor("background", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-base font-medium mb-2 block">لون النص</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={colors.foreground}
                  onChange={(e) => setColor("foreground", e.target.value)}
                  className="w-20 h-12"
                />
                <Input
                  type="text"
                  value={colors.foreground}
                  onChange={(e) => setColor("foreground", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSaveColors}>
              حفظ الألوان
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Type className="h-5 w-5 text-primary" />
              الخطوط
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-2 block">خط العناوين</Label>
              <Input 
                type="text" 
                value={fonts.heading} 
                onChange={(e) => setFont("heading", e.target.value)}
                className="text-base" 
              />
            </div>
            <div>
              <Label className="text-base font-medium mb-2 block">خط النصوص</Label>
              <Input 
                type="text" 
                value={fonts.body} 
                onChange={(e) => setFont("body", e.target.value)}
                className="text-base" 
              />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSaveFonts}>
              حفظ الخطوط
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <ImageIcon className="h-5 w-5 text-primary" />
              شعار الموقع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-2 block">رفع شعار جديد</Label>
              <Input type="file" accept="image/*,.svg" onChange={handleLogoUpload} className="text-base" />
              {logoFile && <p className="text-sm text-muted-foreground mt-2">الملف المختار: ${logoFile.name}</p>}
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">الشعار الحالي</p>
              <div className="flex justify-center">
                <img src="/mecca-logo.jpg" alt="الشعار الحالي" className="h-20 w-20" />
              </div>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSaveLogo}>
              حفظ الشعار الجديد
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Layout className="h-5 w-5 text-primary" />
              إعدادات التخطيط
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-base font-medium mb-2 block">عرض الحاوية</Label>
                <Input 
                  type="text" 
                  value={layout.containerWidth} 
                  onChange={(e) => setLayout("containerWidth", e.target.value)}
                  className="text-base" 
                />
              </div>
              <div>
                <Label className="text-base font-medium mb-2 block">نصف القطر</Label>
                <Input 
                  type="text" 
                  value={layout.radius} 
                  onChange={(e) => setLayout("radius", e.target.value)}
                  className="text-base" 
                />
              </div>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSaveLayout}>
              حفظ التخطيط
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-center">
        <Button 
          variant="outline" 
          onClick={reset}
          className="border-destructive text-destructive hover:bg-destructive/10"
        >
          استرجاع الإعدادات الافتراضية
        </Button>
      </div>
    </div>
  )
}
