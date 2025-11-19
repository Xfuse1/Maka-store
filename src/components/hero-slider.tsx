"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { getAllHomepageSections, type HomepageSection } from "@/lib/supabase/homepage"

export function HeroSlider() {
  const [slides, setSlides] = useState<HomepageSection[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHeroSections() {
      try {
        const sections = await getAllHomepageSections()
        const heroSections = sections.filter((s) => s.section_type === "hero")
        setSlides(heroSections)
      } catch (error) {
        console.error("[v0] Error fetching hero sections:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHeroSections()
  }, [])

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  if (loading || slides.length === 0) {
    return null
  }

  return (
    <div className="relative w-full h-[600px] md:h-[700px] overflow-hidden bg-primary">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="relative w-full h-full">
            <Image
              src={slide.image_url || "/placeholder.svg"}
              alt={slide.title_ar || ""}
              fill
              className="object-cover"
              priority={index === 0 && !!slide.image_url}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl text-white">
                <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in">{slide.title_ar}</h2>
                {slide.subtitle_ar && (
                  <p className="text-xl md:text-2xl mb-4 leading-relaxed animate-fade-in-delay-1">
                    {slide.subtitle_ar}
                  </p>
                )}
                {slide.description_ar && (
                  <p className="text-lg md:text-xl mb-8 leading-relaxed animate-fade-in-delay-2">
                    {slide.description_ar}
                  </p>
                )}
                {slide.button_text_ar && slide.button_link && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-white hover:bg-white/90 text-primary text-lg px-8 py-6 animate-fade-in-delay-3"
                  >
                    <Link href={slide.button_link}>{slide.button_text_ar}</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
