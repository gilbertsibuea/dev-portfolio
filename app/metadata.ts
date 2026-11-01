import type { Metadata } from "next"
import { siteConfig } from "@/lib/metadata"

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  manifest: '/manifest.json',
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.creator, url: siteConfig.url }],
  creator: siteConfig.creator,
  publisher: siteConfig.creator,
  applicationName: 'Gilbert Sibuea Portfolio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'Gilbert Sibuea - Full Stack Developer & Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@gilbert_dev',
    site: '@gilbert_dev',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'c2dd06541e4a304b',
  },
  other: {
    author: 'Gilbert Sibuea',
    designer: 'Gilbert Sibuea',
    owner: 'Gilbert Sibuea',
    copyright: 'Gilbert Sibuea',
    'reply-to': 'gilbertsibuea8539@gmail.com',
    language: 'en',
    'revisit-after': '3 days',
    category: 'Portfolio, Web Development, Software Engineering',
    classification: 'Personal Portfolio',
  },
}
