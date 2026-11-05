import type { Metadata } from "next"
import { BLOG_CATEGORIES, type BlogCategory } from "./categories"
import { displayExcerpt, displayTitle, estimateReadingMinutes } from "./format"
import type { BlogLang, BlogPost, BlogPostListItem, LocalizedPost } from "./types"
import { siteConfig } from "@/lib/metadata"

export const BLOG_INDEX_DESCRIPTION =
  "Essays and notes by Gilbert Sibuea — tech, life, travel, and stories. Written in English and Bahasa Indonesia."

const BLOG_KEYWORDS = [
  "Gilbert Sibuea blog",
  "Gilbert Sibuea writing",
  "Gilbert Sibuea articles",
  "tech blog Indonesia",
  "software engineer blog",
  "full stack developer blog",
  ...BLOG_CATEGORIES.map((c) => `${c} Gilbert Sibuea`),
]

export function absoluteUrl(path: string): string {
  if (!path) return siteConfig.url
  if (path.startsWith("http")) return path
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`
}

export function blogPostUrl(slug: string, lang?: BlogLang): string {
  const base = absoluteUrl(`/blog/${slug}`)
  return lang ? `${base}?lang=${lang}` : base
}

export function blogIndexUrl(category?: BlogCategory | null): string {
  if (!category) return absoluteUrl("/blog")
  return absoluteUrl(`/blog?category=${encodeURIComponent(category)}`)
}

export function absoluteImage(url: string | null | undefined): string {
  if (!url) return absoluteUrl(siteConfig.ogImage)
  return absoluteUrl(url)
}

/** Meta description: prefer excerpt, else strip markdown body */
export function metaDescriptionFromPost(
  post: BlogPost,
  lang: BlogLang,
  max = 160
): string {
  const excerpt =
    lang === "id"
      ? post.excerptId || post.excerptSource || post.excerptEn
      : post.excerptEn || post.excerptSource || post.excerptId
  const body =
    lang === "id"
      ? post.bodyMdId || post.bodyMdSource || post.bodyMdEn
      : post.bodyMdEn || post.bodyMdSource || post.bodyMdId

  const raw = (excerpt || body || "").replace(/[#>*_`\[\]()!-]/g, " ").replace(/\s+/g, " ").trim()
  if (!raw) return BLOG_INDEX_DESCRIPTION
  if (raw.length <= max) return raw
  return `${raw.slice(0, max - 1).trimEnd()}…`
}

export function postKeywords(post: BlogPost): string[] {
  const titles = [post.titleEn, post.titleId, post.titleSource].filter(Boolean) as string[]
  const words = titles
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((w) => w.length > 3)
    .slice(0, 12)

  return Array.from(
    new Set([
      post.category,
      ...words,
      "Gilbert Sibuea",
      "gilbertsibuea.id",
      post.sourceLang === "id" ? "Bahasa Indonesia" : "English",
    ])
  )
}

export function availableLangs(post: BlogPost): BlogLang[] {
  const langs: BlogLang[] = []
  if (post.titleEn && post.bodyMdEn) langs.push("en")
  if (post.titleId && post.bodyMdId) langs.push("id")
  if (langs.length === 0) langs.push(post.sourceLang)
  return langs
}

export function buildBlogPostMetadata(post: BlogPost, lang?: BlogLang): Metadata {
  const useLang = lang || post.sourceLang
  const localizedTitle =
    useLang === "id"
      ? post.titleId || post.titleSource || post.titleEn || "Untitled"
      : post.titleEn || post.titleSource || post.titleId || "Untitled"
  const description = metaDescriptionFromPost(post, useLang)
  const url = blogPostUrl(post.slug)
  const image = absoluteImage(post.coverUrl)
  const langs = availableLangs(post)
  const published = post.publishedAt || post.createdAt
  const modified = post.updatedAt || published

  const languageAlternates: Record<string, string> = {
    "x-default": url,
  }
  for (const l of langs) {
    languageAlternates[l] = blogPostUrl(post.slug, l)
  }

  return {
    title: `${localizedTitle} | ${siteConfig.name}`,
    description,
    keywords: [...postKeywords(post), ...BLOG_KEYWORDS],
    authors: [{ name: siteConfig.creator, url: siteConfig.url }],
    creator: siteConfig.creator,
    publisher: siteConfig.creator,
    category: post.category,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: url,
      languages: languageAlternates,
      types: {
        "application/rss+xml": absoluteUrl("/blog/rss.xml"),
      },
    },
    openGraph: {
      type: "article",
      locale: useLang === "id" ? "id_ID" : "en_US",
      alternateLocale: langs
        .filter((l) => l !== useLang)
        .map((l) => (l === "id" ? "id_ID" : "en_US")),
      url,
      title: localizedTitle,
      description,
      siteName: siteConfig.name,
      publishedTime: published,
      modifiedTime: modified,
      section: post.category,
      tags: [post.category, ...postKeywords(post).slice(0, 6)],
      authors: [siteConfig.creator],
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: localizedTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: localizedTitle,
      description,
      images: [image],
      creator: "@gilbert_dev",
    },
  }
}

export function buildBlogIndexMetadata(category?: BlogCategory | null): Metadata {
  const url = blogIndexUrl(category)
  const title = category
    ? `${category} — Blog | ${siteConfig.name}`
    : `Blog | ${siteConfig.name}`
  const description = category
    ? `Posts in ${category} by Gilbert Sibuea — English & Bahasa Indonesia on gilbertsibuea.id.`
    : BLOG_INDEX_DESCRIPTION

  return {
    title,
    description,
    keywords: BLOG_KEYWORDS,
    authors: [{ name: siteConfig.creator, url: siteConfig.url }],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: url,
      types: {
        "application/rss+xml": absoluteUrl("/blog/rss.xml"),
      },
      languages: {
        en: `${absoluteUrl("/blog")}?lang=en`,
        id: `${absoluteUrl("/blog")}?lang=id`,
        "x-default": absoluteUrl("/blog"),
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: ["id_ID"],
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: absoluteUrl(siteConfig.ogImage),
          width: 1200,
          height: 630,
          alt: "Gilbert Sibuea Blog",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(siteConfig.ogImage)],
      creator: "@gilbert_dev",
    },
  }
}

export function blogPostingJsonLd(post: BlogPost, localized: LocalizedPost) {
  const url = blogPostUrl(post.slug)
  const image = absoluteImage(post.coverUrl)
  const published = post.publishedAt || post.createdAt
  const modified = post.updatedAt || published
  const wordCount = localized.bodyMd.trim().split(/\s+/).filter(Boolean).length
  const langs = availableLangs(post)

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: localized.title,
    name: localized.title,
    description: localized.excerpt || metaDescriptionFromPost(post, localized.lang),
    articleSection: post.category,
    keywords: postKeywords(post).join(", "),
    inLanguage: langs.length === 1 ? langs[0] : langs,
    isAccessibleForFree: true,
    datePublished: published,
    dateModified: modified,
    wordCount,
    timeRequired: `PT${estimateReadingMinutes(localized.bodyMd)}M`,
    image: [image],
    author: {
      "@type": "Person",
      name: siteConfig.creator,
      url: siteConfig.url,
      sameAs: [
        siteConfig.links.github,
        siteConfig.links.linkedin,
      ],
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.creator,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(siteConfig.ogImage),
      },
    },
    url,
  }
}

export function blogBreadcrumbJsonLd(post: LocalizedPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: absoluteUrl("/blog"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.category,
        item: blogIndexUrl(post.category),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: post.title,
        item: blogPostUrl(post.slug),
      },
    ],
  }
}

export function blogIndexJsonLd(posts: BlogPostListItem[], category?: BlogCategory | null) {
  const url = blogIndexUrl(category)
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${absoluteUrl("/blog")}#blog`,
    name: category ? `${category} — Gilbert Sibuea Blog` : "Gilbert Sibuea Blog",
    description: BLOG_INDEX_DESCRIPTION,
    url,
    inLanguage: ["en", "id"],
    author: {
      "@type": "Person",
      name: siteConfig.creator,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.creator,
      url: siteConfig.url,
    },
    blogPost: posts.slice(0, 50).map((post, i) => ({
      "@type": "BlogPosting",
      position: i + 1,
      headline: displayTitle(post, "en") || displayTitle(post, "id"),
      url: blogPostUrl(post.slug),
      datePublished: post.publishedAt || post.createdAt,
      dateModified: post.updatedAt || post.publishedAt || post.createdAt,
      articleSection: post.category,
      description: displayExcerpt(post, "en") || displayExcerpt(post, "id") || undefined,
      author: {
        "@type": "Person",
        name: siteConfig.creator,
      },
    })),
  }
}
