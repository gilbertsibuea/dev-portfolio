import type { Metadata } from 'next'

/** Canonical live site (apex redirects to www) */
export const siteConfig = {
  name: 'Gilbert Sibuea',
  title: 'Gilbert Sibuea - Full Stack Developer & Software Engineer | gilbertsibuea.id',
  description:
    'Gilbert Sibuea (Gilbert Hasiholan Sibuea) — Full Stack Developer & Software Engineer from Bandung / Bandar Lampung, Indonesia. Portfolio of web & mobile work with React, Next.js, Node.js, and more. Hire Gilbert at gilbertsibuea.id.',
  url: 'https://www.gilbertsibuea.id',
  domain: 'gilbertsibuea.id',
  ogImage: '/gilbert-a.webp',
  links: {
    twitter: 'https://twitter.com/gilbert_dev',
    github: 'https://github.com/gilbertsibuea',
    linkedin: 'https://www.linkedin.com/in/gilbertsibuea/',
  },
  creator: 'Gilbert Sibuea',
  keywords: [
    'Gilbert Sibuea',
    'gilbert sibuea',
    'Gilbert Hasiholan Sibuea',
    'gilbertsibuea.id',
    'gilbertsibuea',
    'www.gilbertsibuea.id',
    'Gilbert Sibuea developer',
    'Gilbert Sibuea portfolio',
    'Gilbert Sibuea Full Stack Developer',
    'Gilbert Sibuea Software Engineer',
    'Gilbert Sibuea Bandung',
    'Gilbert Sibuea Lampung',
    'Full Stack Developer Indonesia',
    'Software Engineer Indonesia',
    'Web Developer Bandung',
    'Web Developer Bandar Lampung',
    'React Developer Indonesia',
    'Next.js Developer',
    'Node.js Developer',
    'TypeScript Developer',
    'Freelance Full Stack Developer',
    'Portfolio Gilbert Sibuea',
    'Gilbert Sibuea blog',
    'gilbertsibuea.id blog',
  ],
}

export function generateMetadata({
  title,
  description,
  image = siteConfig.ogImage,
  url = siteConfig.url,
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  url?: string
  noIndex?: boolean
} = {}): Metadata {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title
  const metaDescription = description || siteConfig.description
  const ogImageUrl = image.startsWith('http') ? image : `${siteConfig.url}${image}`

  return {
    metadataBase: new URL(siteConfig.url),
    title: metaTitle,
    description: metaDescription,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    publisher: siteConfig.creator,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Gilbert Sibuea — Full Stack Developer',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [ogImageUrl],
      creator: '@gilbert_dev',
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
  }
}

export const personStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Gilbert Sibuea',
  alternateName: [
    'Gilbert Hasiholan Sibuea',
    'Gilbert H. Sibuea',
    'gilbertsibuea',
    'gilbert sibuea',
  ],
  jobTitle: 'Full Stack Developer',
  description:
    'Gilbert Sibuea is a Full Stack Developer and Software Engineer based in Indonesia, specializing in React, Next.js, and Node.js.',
  url: siteConfig.url,
  image: `${siteConfig.url}${siteConfig.ogImage}`,
  email: 'gilbertsibuea8539@gmail.com',
  nationality: {
    '@type': 'Country',
    name: 'Indonesia',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bandung',
    addressRegion: 'West Java',
    addressCountry: 'ID',
  },
  sameAs: [
    siteConfig.url,
    'https://gilbertsibuea.id',
    siteConfig.links.github,
    siteConfig.links.linkedin,
  ],
  knowsAbout: [
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Full Stack Development',
    'Software Engineering',
    'Web Development',
  ],
  alumniOf: {
    '@type': 'Organization',
    name: 'Universitas Lampung',
  },
}

export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Gilbert Sibuea Portfolio',
  alternateName: ['gilbertsibuea.id', 'Gilbert Sibuea'],
  url: siteConfig.url,
  description: siteConfig.description,
  inLanguage: ['en', 'id'],
  author: {
    '@type': 'Person',
    name: siteConfig.creator,
  },
  publisher: {
    '@type': 'Person',
    name: siteConfig.creator,
  },
  hasPart: {
    '@type': 'Blog',
    name: 'Gilbert Sibuea Blog',
    url: `${siteConfig.url}/blog`,
  },
}
