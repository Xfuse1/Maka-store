"use client"

import { useEffect } from "react"
import { useDesignStore } from "@/lib/design-store"

export default function DesignProvider() {
  const { colors, fonts, layout } = useDesignStore()

  useEffect(() => {
    const root = document.documentElement
    // ألوان
    root.style.setProperty("--primary", colors.primary)
    root.style.setProperty("--background", colors.background)
    root.style.setProperty("--foreground", colors.foreground)
    // خطوط
    root.style.setProperty("--font-heading", fonts.heading)
    root.style.setProperty("--font-body", fonts.body)
    // تخطيط
    root.style.setProperty("--container-width", layout.containerWidth)
    root.style.setProperty("--radius", layout.radius)
  }, [colors, fonts, layout])

  return null
}
