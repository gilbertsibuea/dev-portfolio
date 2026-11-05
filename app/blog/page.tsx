import type { Metadata } from "next"
import { headers } from "next/headers"
import { initializeDatabase } from "@/lib/db"
import { getPublishedBlogPosts } from "@/lib/db/blog"
import { parseCategoryParam } from "@/lib/blog/categories"
import { getBlogLangCookie, parseBlogLang } from "@/lib/blog/voter"
import type { BlogLang } from "@/lib/blog/types"
import { siteConfig } from "@/lib/metadata"
import { BlogIndex } from "@/components/blog/BlogIndex"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: `Blog | ${siteConfig.name}`,
  description:
    "Essays and notes by Gilbert Sibuea — life, travel, and tech, in English and Bahasa Indonesia.",
  alternates: {
    canonical: `${siteConfig.url}/blog`,
  },
  openGraph: {
    title: `Blog | ${siteConfig.name}`,
    description:
      "Essays and notes by Gilbert Sibuea — life, travel, and tech.",
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.name,
    type: "website",
  },
}

async function resolveInitialLang(
  searchLang: string | undefined
): Promise<BlogLang> {
  const fromQuery = parseBlogLang(searchLang ?? null)
  if (fromQuery) return fromQuery
  const fromCookie = await getBlogLangCookie()
  if (fromCookie) return fromCookie
  try {
    const h = await headers()
    const accept = h.get("accept-language") || ""
    if (/\bid\b/i.test(accept.split(",")[0] || "")) return "id"
  } catch {
    // ignore
  }
  return "en"
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; lang?: string }>
}) {
  await initializeDatabase()
  const params = await searchParams
  const category = parseCategoryParam(params.category ?? null)
  const posts = await getPublishedBlogPosts({
    category,
  })
  const initialLang = await resolveInitialLang(params.lang)

  return (
    <BlogIndex
      posts={posts}
      category={category}
      initialLang={initialLang}
    />
  )
}
