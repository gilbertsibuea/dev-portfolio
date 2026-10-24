import type { Metadata } from 'next'

export const siteConfig = {
  name: 'Gilbert Sibuea',
  title: 'Gilbert Sibuea - Full Stack Developer & Software Engineer | gilbertsibuea.com',
  description: 'Gilbert Sibuea (Gilbert Hasiholan Sibuea) is a passionate Full Stack Developer and Software Engineer based in Bandar Lampung, Indonesia. Specializing in React, Next.js, Node.js, and modern web technologies. Visit gilbertsibuea.com to explore projects and get in touch.',
  url: 'https://gilbertsibuea.com',
  ogImage: '/profile.png',
  links: {
    twitter: 'https://twitter.com/gilbert_dev', // Update with actual handle
    github: 'https://github.com/gilbertsibuea',
    linkedin: 'https://www.linkedin.com/in/gilbert-sibuea-93b524246/',
  },
  creator: 'Gilbert Sibuea',
  keywords: [
    'Gilbert Sibuea',
    'Gilbert Hasiholan Sibuea',
    'gilbertsibuea.com',
    'Gilbert Sibuea developer',
    'Gilbert Sibuea portfolio',
    'Gilbert Sibuea Full Stack Developer',
    'Gilbert Sibuea Software Engineer',
    'Full Stack Developer',
    'Software Engineer',
    'Web Developer Indonesia',
    'React Developer',
    'Next.js Developer',
    'Node.js Developer',
    'JavaScript',
    'TypeScript',
    'Frontend Developer',
    'Backend Developer',
    'Portfolio',
    'Software Development',
    'Web Applications',
    'Mobile Development',
    'API Development',
    'Database Design',
    'UI/UX Implementation',
    'Responsive Design',
    'Bandar Lampung developer',
    'Indonesia developer'
  ]
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

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: url,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [image],
      creator: '@gilbert_dev', // Update with actual Twitter handle
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

// Structured data for the homepage
export const personStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Gilbert Sibuea',
  alternateName: [
    'Gilbert Hasiholan Sibuea',
    'Gilbert H. Sibuea',
    'gilbertsibuea'
  ],
  jobTitle: 'Full Stack Developer',
  description: 'Gilbert Sibuea is a passionate Full Stack Developer and Software Engineer based in Bandar Lampung, Indonesia, specializing in modern web technologies including React, Next.js, and Node.js.',
  url: siteConfig.url,
  image: `${siteConfig.url}${siteConfig.ogImage}`,
  email: 'contact@gilbertsibuea.com',
  nationality: {
    '@type': 'Country',
    name: 'Indonesia'
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bandar Lampung',
    addressCountry: 'ID'
  },
  sameAs: [
    siteConfig.url,
    siteConfig.links.github,
    siteConfig.links.linkedin,
    siteConfig.links.twitter,
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
    'Mobile Development',
    'API Development',
    'Database Design',
    'UI/UX Implementation'
  ],
  alumniOf: {
    '@type': 'Organization',
    name: 'Universitas Lampung'
  },
  worksFor: {
    '@type': 'Organization',
    name: 'Freelance Developer'
  }
}

// Website structured data
export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  author: {
    '@type': 'Person',
    name: siteConfig.creator
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteConfig.url}/projects?search={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
}
