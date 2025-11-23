import "@/styles/globals.css";
import type React from "react"
import Script from "next/script"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import { Suspense } from "react"
import DesignProvider from "@/components/providers/design-provider"
import { DesignSyncProvider } from "@/components/design/design-sync-provider"
import { WebVitals } from "@/components/web-vitals"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo", 
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
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
      <head>
        <link rel="dns-prefetch" href="https://bbzjxcjfmeoiojjnfvfa.supabase.co" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://bbzjxcjfmeoiojjnfvfa.supabase.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
      </head>
      <body className={`font-sans ${cairo.variable} antialiased text-foreground`} style={{ backgroundColor: 'var(--background-hex)' }}>
        <WebVitals />
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1184366213586091');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1184366213586091&ev=PageView&noscript=1"
          />
        </noscript>
        <DesignProvider />
        <DesignSyncProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </DesignSyncProvider>
      </body>
    </html>
  )
}
