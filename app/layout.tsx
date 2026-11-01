import { Poppins } from "next/font/google"
import "./globals.css"
import ClientWrapper from '@/components/ClientWrapper'
import Providers from '@/components/Providers'
import { siteConfig, personStructuredData, websiteStructuredData } from "@/lib/metadata"
import { metadata as rootMetadata } from "./metadata"

export const metadata = rootMetadata

// Only load the 2 weights actually used across the site
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Google needs a square PNG ≥48px; 16x16 .ico alone is often ignored */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-chrome-192x192.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f0e1c" />
        <link rel="canonical" href={siteConfig.url} />
        <link
          rel="alternate"
          href="https://gilbertsibuea.id"
          hrefLang="x-default"
        />
        <link
          rel="alternate"
          href={siteConfig.url}
          hrefLang="en"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personStructuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
      </head>
      <body className={`${poppins.className} antialiased`}>
        <Providers>
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </Providers>
      </body>
    </html>
  )
}
