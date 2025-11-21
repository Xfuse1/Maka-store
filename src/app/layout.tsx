import "@/styles/globals.css";
import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import { Suspense } from "react"
import DesignProvider from "@/components/providers/design-provider"
import { DesignSyncProvider } from "@/components/design/design-sync-provider"

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
      <body className={`font-sans ${cairo.variable} antialiased text-foreground`} style={{ backgroundColor: 'var(--background-hex)' }}>
        <DesignProvider />
        <DesignSyncProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </DesignSyncProvider>
      </body>
    </html>
  )
}
