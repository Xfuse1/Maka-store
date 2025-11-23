"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Award, Users, Sparkles } from "lucide-react"
import Link from "next/link"

import { getPageByPath } from "@/lib/supabase/pages"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

type PageContent = {
  sections: Record<string, string>
}

export default function AboutPage() {
  const [pageData, setPageData] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)

  // تحميل محتوى صفحة من الـ Admin (CMS)
  useEffect(() => {
    async function loadPage() {
      try {
        const page = await getPageByPath("/about")
        if (page) {
          setPageData(page)
        } else {
          console.warn("⚠️ Page /about not found in database, using default content")
        }
      } catch (error) {
        console.error("❌ Error loading page:", error)
      } finally {
        setLoading(false)
      }
    }
    loadPage()
  }, [])

  const getSection = (key: string, fallback: string) => {
    return pageData?.sections?.[key] || fallback
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-xl text-foreground/70">جاري التحميل...</div>
      </div>
    )
  }

  const heroTitle = getSection("hero.title", "من نحن")
  const heroSubtitle = getSection("hero.subtitle", "رحلتنا في عالم الموضة المحتشمة")
  const storyTitle = getSection("story.title", "قصتنا")
  const storyP1 = getSection(
    "story.paragraph1",
    "بدأت رحلة مكة من حلم بسيط: توفير أزياء نسائية راقية تجمع بين الأناقة العصرية والاحتشام الأصيل. نؤمن بأن كل امرأة تستحق أن تشعر بالثقة والجمال في ملابسها، دون التنازل عن قيمها ومبادئها."
  )
  const storyP2 = getSection(
    "story.paragraph2",
    "منذ انطلاقتنا، كرسنا جهودنا لتقديم تصاميم فريدة تعكس الذوق الرفيع والجودة العالية. نختار أقمشتنا بعناية فائقة، ونهتم بأدق التفاصيل في كل قطعة نقدمها لكِ."
  )
  const storyP3 = getSection(
    "story.paragraph3",
    "اليوم، نفخر بخدمة آلاف العميلات اللواتي وثقن بنا لنكون جزءاً من إطلالاتهن المميزة. رضاكِ هو هدفنا، وأناقتكِ هي نجاحنا."
  )

  // Helper to find first section value where key includes a fragment (case-insensitive)
  const findFirstByKeyIncludes = (fragment: string) => {
    if (!pageData?.sections) return null
    const entries = Object.entries(pageData.sections)
    const found = entries.find(([k]) => k.toLowerCase().includes(fragment.toLowerCase()))
    return found ? String(found[1]) : null
  }

  // If specific keys are not present, try to fallback to any section values that include the fragment,
  // or finally use the very first section value available.
  const firstSectionValue = (() => {
    if (!pageData?.sections) return null
    const entries = Object.entries(pageData.sections)
    if (entries.length === 0) return null
    return String(entries[0][1])
  })()

  const heroTitleFinal =
    heroTitle || findFirstByKeyIncludes("hero") || firstSectionValue || "من نحن"
  const heroSubtitleFinal =
    heroSubtitle || findFirstByKeyIncludes("subtitle") || "رحلتنا في عالم الموضة المحتشمة"

  // Story paragraphs
  const storyParagraphs: string[] = []
  if (pageData?.sections) {
    // explicit numbered paragraphs
    for (let i = 1; i <= 5; i++) {
      const v = pageData.sections[`story.paragraph${i}`]
      if (v) storyParagraphs.push(String(v))
    }

    if (storyParagraphs.length === 0) {
      // collect keys that start with 'story.'
      const storyEntries = Object.entries(pageData.sections).filter(([k]) =>
        k.toLowerCase().startsWith("story.")
      )
      storyEntries.sort((a, b) => a[0].localeCompare(b[0]))
      storyEntries.forEach(([, v]) => storyParagraphs.push(String(v)))
    }

    if (storyParagraphs.length === 0) {
      // fallback: take up to 3 section values that are not the hero title/subtitle
      const other = Object.entries(pageData.sections)
        .filter(([k]) => {
          const lk = k.toLowerCase()
          return !lk.includes("hero") && !lk.includes("title") && !lk.includes("subtitle")
        })
        .map(([, v]) => String(v))
        .slice(0, 3)
      storyParagraphs.push(...other)
    }
  }

  const valuesTitle = getSection("values.title", "قيمنا")
  const passionTitle = getSection("values.passion.title", "الشغف")
  const passionDesc = getSection(
    "values.passion.description",
    "نحب ما نقوم به ونسعى دائماً لتقديم الأفضل لعميلاتنا"
  )
  const qualityTitle = getSection("values.quality.title", "الجودة")
  const qualityDesc = getSection(
    "values.quality.description",
    "نختار أفضل الأقمشة ونهتم بأدق التفاصيل في كل منتج"
  )
  const customersTitle = getSection("values.customers.title", "العملاء")
  const customersDesc = getSection(
    "values.customers.description",
    "رضاكِ وسعادتكِ هما أولويتنا القصوى في كل ما نقدمه"
  )
  const innovationTitle = getSection("values.innovation.title", "الابتكار")
  const innovationDesc = getSection(
    "values.innovation.description",
    "نواكب أحدث صيحات الموضة مع الحفاظ على الأصالة"
  )
  const ctaTitle = getSection("cta.title", "ابدئي رحلتكِ معنا")
  const ctaSubtitle = getSection(
    "cta.subtitle",
    "اكتشفي مجموعتنا الحصرية من الأزياء الراقية"
  )
  const ctaButton = getSection("cta.button", "تسوقي الآن")

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ✅ Header ديناميك من admin/design */}
      <SiteHeader />

      {/* Hero Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            {heroTitleFinal}
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            {heroSubtitleFinal}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-border shadow-lg bg-card">
              <CardContent className="p-8 md:p-12">
                <h3 className="text-3xl font-bold mb-6 text-foreground text-center">
                  {storyTitle}
                </h3>
                <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
                  {storyParagraphs && storyParagraphs.length > 0 ? (
                    storyParagraphs.map((p, idx) => <p key={idx}>{p}</p>)
                  ) : (
                    <>
                      <p>{storyP1}</p>
                      <p>{storyP2}</p>
                      <p>{storyP3}</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background/30">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-16 text-foreground">
            {valuesTitle}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 border-border hover:border-primary transition-all hover:shadow-xl bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">{passionTitle}</h4>
                <p className="text-foreground/80 leading-relaxed">{passionDesc}</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-primary transition-all hover:shadow-xl bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">{qualityTitle}</h4>
                <p className="text-foreground/80 leading-relaxed">{qualityDesc}</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-primary transition-all hover:shadow-xl bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">{customersTitle}</h4>
                <p className="text-foreground/80 leading-relaxed">{customersDesc}</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-primary transition-all hover:shadow-xl bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">{innovationTitle}</h4>
                <p className="text-foreground/80 leading-relaxed">{innovationDesc}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-foreground mb-6">{ctaTitle}</h3>
          <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            {ctaSubtitle}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6"
          >
            <Link href="/">{ctaButton}</Link>
          </Button>
        </div>
      </section>

      {/* ✅ Footer ديناميك من admin/design */}
      <SiteFooter />
    </div>
  )
}
