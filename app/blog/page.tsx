import type { Metadata } from "next"
import { Suspense } from "react"
import { headers } from "next/headers"
import { initializeDatabase } from "@/lib/db"
import { getPublishedBlogPosts } from "@/lib/db/blog"
import { parseCategoryParam } from "@/lib/blog/categories"
import {
  blogIndexJsonLd,
  buildBlogIndexMetadata,
} from "@/lib/blog/seo"
import { getBlogLangCookie, parseBlogLang } from "@/lib/blog/voter"
import type { BlogLang } from "@/lib/blog/types"
import { BlogIndex } from "@/components/blog/BlogIndex"
import { BlogIndexSkeleton } from "@/components/blog/BlogSkeletons"
import { JsonLd } from "@/components/blog/JsonLd"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; lang?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  const category = parseCategoryParam(params.category ?? null)
  return buildBlogIndexMetadata(category)
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
    <>
      <JsonLd data={blogIndexJsonLd(posts, category)} />
      <BlogIndex posts={posts} category={category} initialLang={initialLang} />
    </>
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
