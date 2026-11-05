import type { Metadata } from "next"
import { Suspense } from "react"
import { headers } from "next/headers"
import { initializeDatabase } from "@/lib/db"
import { getPublishedBlogPosts } from "@/lib/db/blog"
import { parseCategoryParam } from "@/lib/blog/categories"
import { getBlogLangCookie, parseBlogLang } from "@/lib/blog/voter"
import type { BlogLang } from "@/lib/blog/types"
import { siteConfig } from "@/lib/metadata"
import { BlogIndex } from "@/components/blog/BlogIndex"
import { BlogIndexSkeleton } from "@/components/blog/BlogSkeletons"

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

async function BlogIndexContent({
  categoryParam,
  langParam,
}: {
  categoryParam?: string
  langParam?: string
}) {
  await initializeDatabase()
  const category = parseCategoryParam(categoryParam ?? null)
  const [posts, initialLang] = await Promise.all([
    getPublishedBlogPosts({ category }),
    resolveInitialLang(langParam),
  ])

  return (
    <BlogIndex posts={posts} category={category} initialLang={initialLang} />
  )
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; lang?: string }>
}) {
  const params = await searchParams

  return (
    <Suspense fallback={<BlogIndexSkeleton />} key={params.category ?? "all"}>
      <BlogIndexContent
        categoryParam={params.category}
        langParam={params.lang}
      />
    </Suspense>
  )
}
