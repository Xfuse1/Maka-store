import { getHeroSlides, createHeroSlide, deleteHeroSlide, toggleHeroSlideStatus } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Trash2, Eye, EyeOff } from "lucide-react"

export default async function HeroSlidesPage() {
  const slides: any[] = await getHeroSlides()

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">إدارة سلايدات العرض</h1>
        <p className="text-muted-foreground">إضافة وتعديل سلايدات الصفحة الرئيسية</p>
      </div>

      {/* Add New Slide Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>إضافة سلايد جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createHeroSlide} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name_ar">اسم السلايد (للإدارة)</Label>
                <Input id="name_ar" name="name_ar" required placeholder="مثال: سلايد ترحيبي" />
              </div>
              <div>
                <Label htmlFor="display_order">الترتيب</Label>
                <Input id="display_order" name="display_order" type="number" defaultValue="1" required />
              </div>
            </div>

            <div>
              <Label htmlFor="title_ar">العنوان الرئيسي</Label>
              <Input id="title_ar" name="title_ar" required placeholder="مثال: مرحباً بكِ في مكة" />
            </div>

            <div>
              <Label htmlFor="subtitle_ar">العنوان الفرعي</Label>
              <Input id="subtitle_ar" name="subtitle_ar" placeholder="مثال: أزياء نسائية راقية" />
            </div>

            <div>
              <Label htmlFor="description_ar">الوصف</Label>
              <Textarea
                id="description_ar"
                name="description_ar"
                placeholder="مثال: اكتشفي أحدث التصاميم العصرية"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="button_text_ar">نص الزر</Label>
                <Input id="button_text_ar" name="button_text_ar" placeholder="مثال: تسوقي الآن" />
              </div>
              <div>
                <Label htmlFor="button_link">رابط الزر</Label>
                <Input id="button_link" name="button_link" placeholder="مثال: /category/abayas" />
              </div>
            </div>

            <div>
              <Label htmlFor="image_url">رابط الصورة</Label>
              <Input
                id="image_url"
                name="image_url"
                placeholder="مثال: /placeholder.svg?height=700&width=1920&query=fashion"
              />
              <p className="text-sm text-muted-foreground mt-1">
                يمكنك استخدام placeholder.svg مع query لتوليد صورة تلقائية
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch id="is_active" name="is_active" defaultChecked />
              <Label htmlFor="is_active">نشط</Label>
            </div>

            <Button type="submit" className="w-full">
              إضافة السلايد
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Slides */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">السلايدات الحالية ({slides.length})</h2>
        {slides.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              لا توجد سلايدات حالياً. قم بإضافة سلايد جديد أعلاه.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {slides.map((slide) => (
              <Card key={slide.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Slide Preview */}
                    <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={slide.image_url || "/placeholder.svg"}
                        alt={slide.title_ar || slide.name_ar}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Slide Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{slide.title_ar || slide.name_ar}</h3>
                          <p className="text-sm text-muted-foreground">{slide.name_ar}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={slide.is_active ? "default" : "secondary"}>
                            {slide.is_active ? "نشط" : "غير نشط"}
                          </Badge>
                          <Badge variant="outline">ترتيب {slide.display_order}</Badge>
                        </div>
                      </div>

                      {slide.subtitle_ar && <p className="text-sm font-medium">{slide.subtitle_ar}</p>}
                      {slide.description_ar && <p className="text-sm text-muted-foreground">{slide.description_ar}</p>}

                      {slide.button_text_ar && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">زر:</span>
                          <span>{slide.button_text_ar}</span>
                          <span className="text-muted-foreground">→ {slide.button_link}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <form action={toggleHeroSlideStatus.bind(null, slide.id, slide.is_active)}>
                          <Button type="submit" variant="outline" size="sm">
                            {slide.is_active ? <EyeOff className="h-4 w-4 ml-2" /> : <Eye className="h-4 w-4 ml-2" />}
                            {slide.is_active ? "إخفاء" : "إظهار"}
                          </Button>
                        </form>
                        <form action={deleteHeroSlide.bind(null, slide.id)}>
                          <Button type="submit" variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
