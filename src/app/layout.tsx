import "@/styles/globals.css";
import type React from "react"
import Script from "next/script"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import { getStoreSettingsServer } from "@/lib/store-settings"
import { Suspense } from "react"
import DesignProvider from "@/components/providers/design-provider"
import { DesignSyncProvider } from "@/components/design/design-sync-provider"
import { WebVitals } from "@/components/web-vitals"
import { FacebookPixelEvents } from "@/components/FacebookPixelEvents"
import { StoreInitializer } from "@/components/store-initializer"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo", 
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettingsServer()
  return {
    title: settings?.store_name || "مكة - متجر الأزياء النسائية الراقية",
    description: settings?.store_description || "اكتشفي مجموعتنا الحصرية من العبايات والكارديجان والبدل والفساتين",
    generator: "v0.app",
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
    },
    themeColor: '#FFB6C1',
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getStoreSettingsServer()

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Preconnect to critical origins for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://bbzjxcjfmeoiojjnfvfa.supabase.co" />
        <link rel="preconnect" href="https://bbzjxcjfmeoiojjnfvfa.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://i.postimg.cc" />
      </head>
      <body className={`font-sans ${cairo.variable} antialiased text-foreground bg-background`}>
        <WebVitals />
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1370339511313553');
            fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1370339511313553&ev=PageView&noscript=1"
          />
        </noscript>
        <Suspense fallback={null}>
          <FacebookPixelEvents />
        </Suspense>
        <DesignProvider />
        <DesignSyncProvider>
          <StoreInitializer settings={settings} />
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </DesignSyncProvider>
      </body>
    </html>
  )
}
