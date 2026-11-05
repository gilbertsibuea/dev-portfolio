import type { Metadata } from "next"
import { Suspense } from "react"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { initializeDatabase } from "@/lib/db"
import {
  getPublishedBlogPostBySlug,
  localizePost,
} from "@/lib/db/blog"
import { getBlogLangCookie, parseBlogLang } from "@/lib/blog/voter"
import type { BlogLang } from "@/lib/blog/types"
import { siteConfig } from "@/lib/metadata"
import { BlogArticle } from "@/components/blog/BlogArticle"
import { BlogArticleSkeleton } from "@/components/blog/BlogSkeletons"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ lang?: string }>
}

async function resolveLang(
  searchLang: string | undefined,
  fallback: BlogLang
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
  return fallback
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  // Lightweight metadata first so soft navigations aren't blocked on Turso.
  // Enrich when the post is already warm / available quickly.
  try {
    const post = await getPublishedBlogPostBySlug(slug)
    if (!post) {
      return { title: `Blog | ${siteConfig.name}` }
    }
    const localized = localizePost(post, post.sourceLang)
    const url = `${siteConfig.url}/blog/${post.slug}`
    return {
      title: `${localized.title} | ${siteConfig.name}`,
      description: localized.excerpt || localized.title,
      alternates: { canonical: url },
      openGraph: {
        title: localized.title,
        description: localized.excerpt || localized.title,
        url,
        siteName: siteConfig.name,
        type: "article",
        publishedTime: post.publishedAt || undefined,
      },
    }
  } catch {
    return {
      title: `Blog | ${siteConfig.name}`,
      alternates: { canonical: `${siteConfig.url}/blog/${slug}` },
    }
  }
}

async function BlogArticleContent({
  slug,
  langParam,
}: {
  slug: string
  langParam?: string
}) {
  await initializeDatabase()
  const post = await getPublishedBlogPostBySlug(slug)
  if (!post) notFound()

  const lang = await resolveLang(langParam, post.sourceLang)
  const localized = localizePost(post, lang)

  return <BlogArticle post={localized} initialLang={lang} />
}

export default async function BlogArticlePage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  return (
    <Suspense fallback={<BlogArticleSkeleton />} key={`${slug}:${sp.lang ?? ""}`}>
      <BlogArticleContent slug={slug} langParam={sp.lang} />
    </Suspense>
  )
}
