"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {  Award, Users, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePageSection, useInitializePages } from "@/app/lib/use-page-content"

export default function AboutPage() {
  useInitializePages()

  const heroTitle = usePageSection("/about", "hero.title", "من نحن")
  const heroSubtitle = usePageSection("/about", "hero.subtitle", "رحلتنا في عالم الموضة المحتشمة")
  const storyTitle = usePageSection("/about", "story.title", "قصتنا")
  const storyP1 = usePageSection("/about", "story.paragraph1", "بدأت رحلة مكة من حلم بسيط...")
  const storyP2 = usePageSection("/about", "story.paragraph2", "منذ انطلاقتنا، كرسنا جهودنا...")
  const storyP3 = usePageSection("/about", "story.paragraph3", "اليوم، نفخر بخدمة آلاف العميلات...")
  const valuesTitle = usePageSection("/about", "values.title", "قيمنا")
  const passionTitle = usePageSection("/about", "values.passion.title", "الشغف")
  const passionDesc = usePageSection("/about", "values.passion.description", "نحب ما نقوم به...")
  const qualityTitle = usePageSection("/about", "values.quality.title", "الجودة")
  const qualityDesc = usePageSection("/about", "values.quality.description", "نختار أفضل الأقمشة...")
  const customersTitle = usePageSection("/about", "values.customers.title", "العملاء")
  const customersDesc = usePageSection("/about", "values.customers.description", "رضاكِ وسعادتكِ...")
  const innovationTitle = usePageSection("/about", "values.innovation.title", "الابتكار")
  const innovationDesc = usePageSection("/about", "values.innovation.description", "نواكب أحدث صيحات الموضة...")
  const ctaTitle = usePageSection("/about", "cta.title", "ابدئي رحلتكِ معنا")
  const ctaSubtitle = usePageSection("/about", "cta.subtitle", "اكتشفي مجموعتنا الحصرية...")
  const ctaButton = usePageSection("/about", "cta.button", "تسوقي الآن")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4">
              <Image src="/logo-option-4.jpg" alt="مكة" width={80} height={80} priority />
              <h1 className="text-3xl font-bold text-foreground">مكة</h1>
            </Link>
            <Button asChild variant="outline" className="border-border hover:bg-primary/10 bg-transparent">
              <Link href="/">العودة للرئيسية</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">{heroTitle}</h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">{heroSubtitle}</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-border shadow-lg">
              <CardContent className="p-8 md:p-12">
                <h3 className="text-3xl font-bold mb-6 text-foreground text-center">{storyTitle}</h3>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p>{storyP1}</p>
                  <p>{storyP2}</p>
                  <p>{storyP3}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-16 text-foreground">{valuesTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 border-border hover:border-primary transition-all hover:shadow-xl">
              <CardContent className="p-8 text-center">
               
                <h4 className="text-xl font-bold mb-3 text-foreground">{passionTitle}</h4>
                <p className="text-muted-foreground leading-relaxed">{passionDesc}</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-primary transition-all hover:shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">{qualityTitle}</h4>
                <p className="text-muted-foreground leading-relaxed">{qualityDesc}</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-primary transition-all hover:shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">{customersTitle}</h4>
                <p className="text-muted-foreground leading-relaxed">{customersDesc}</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-primary transition-all hover:shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">{innovationTitle}</h4>
                <p className="text-muted-foreground leading-relaxed">{innovationDesc}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-foreground mb-6">{ctaTitle}</h3>
          <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">{ctaSubtitle}</p>
          <Button asChild size="lg" className="bg-foreground hover:bg-foreground/90 text-background text-lg px-8 py-6">
            <Link href="/">{ctaButton}</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2025 مكة. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  )
}
