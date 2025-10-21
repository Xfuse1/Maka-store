import "@/styles/globals.css";
import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo", 
  display: "swap",
})

export const metadata: Metadata = {
  title: "مكة - متجر الأزياء النسائية الراقية",
  description: "اكتشفي مجموعتنا الحصرية من العبايات والكارديجان والبدل والفساتين",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`font-sans ${cairo.variable} antialiased bg-background text-foreground`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
