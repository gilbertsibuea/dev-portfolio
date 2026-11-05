import type { Metadata } from "next"
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

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  await initializeDatabase()
  const { slug } = await params
  const sp = await searchParams
  const post = await getPublishedBlogPostBySlug(slug)
  if (!post) return { title: "Not found" }

  const lang = await resolveLang(sp.lang, post.sourceLang)
  const localized = localizePost(post, lang)
  const url = `${siteConfig.url}/blog/${post.slug}`

  return {
    title: `${localized.title} | ${siteConfig.name}`,
    description: localized.excerpt || localized.title,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: localized.title,
      description: localized.excerpt || localized.title,
      url,
      siteName: siteConfig.name,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      images: post.coverUrl
        ? [{ url: post.coverUrl.startsWith("http") ? post.coverUrl : `${siteConfig.url}${post.coverUrl}` }]
        : undefined,
    },
  }
}

export default async function BlogArticlePage({ params, searchParams }: Props) {
  await initializeDatabase()
  const { slug } = await params
  const sp = await searchParams
  const post = await getPublishedBlogPostBySlug(slug)
  if (!post) notFound()

  const lang = await resolveLang(sp.lang, post.sourceLang)
  const localized = localizePost(post, lang)

  return <BlogArticle post={localized} initialLang={lang} />
}
