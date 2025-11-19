"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useDesignStore } from "@/store/design-store"
import { getLogoUrl } from "@/lib/supabase/design"

const DEFAULT_LOGO = "/placeholder-logo.svg"

export function SiteLogo({ width = 80, height = 80, className = "" }: { width?: number; height?: number; className?: string }) {
  const { logoUrl } = useDesignStore()
  const [currentLogo, setCurrentLogo] = useState<string>(logoUrl || DEFAULT_LOGO)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    // Load logo from database on mount
    loadLogo()
  }, [])

  useEffect(() => {
    // Update when store changes
    if (logoUrl) {
      setCurrentLogo(logoUrl)
      setImageError(false)
    }
  }, [logoUrl])

  const loadLogo = async () => {
    try {
      const url = await getLogoUrl()
      if (url && url !== DEFAULT_LOGO) {
        setCurrentLogo(url)
      }
    } catch (error) {
      console.error("Error loading logo:", error)
      setCurrentLogo(DEFAULT_LOGO)
    }
  }

  const handleError = () => {
    if (!imageError) {
      setImageError(true)
      setCurrentLogo(DEFAULT_LOGO)
    }
  }

  return (
    <Image 
      src={currentLogo} 
      alt="مكة" 
      width={width} 
      height={height} 
      priority
      className={className}
      style={{ width: 'auto', height: 'auto', maxWidth: width, maxHeight: height }}
      onError={handleError}
    />
  )
}
