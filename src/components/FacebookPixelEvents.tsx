"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

// Extend window interface for Facebook Pixel
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export const FacebookPixelEvents = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Ref to track if it's the first load (to avoid duplicate with layout script)
  const firstLoad = useRef(true);

  useEffect(() => {
    // Skip the first execution because the script in layout.tsx already tracks the initial PageView
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }

    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname, searchParams]);

  return null;
};
