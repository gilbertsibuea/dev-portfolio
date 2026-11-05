import type { Metadata } from "next"
import { Suspense } from "react"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { initializeDatabase } from "@/lib/db"
import {
  getPublishedBlogPostBySlug,
  localizePost,
} from "@/lib/db/blog"
import {
  blogBreadcrumbJsonLd,
  blogPostingJsonLd,
  buildBlogPostMetadata,
} from "@/lib/blog/seo"
import { getBlogLangCookie, parseBlogLang } from "@/lib/blog/voter"
import type { BlogLang } from "@/lib/blog/types"
import { siteConfig } from "@/lib/metadata"
import { BlogArticle } from "@/components/blog/BlogArticle"
import { BlogArticleSkeleton } from "@/components/blog/BlogSkeletons"
import { JsonLd } from "@/components/blog/JsonLd"

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
  const { slug } = await params
  const sp = await searchParams
  try {
    await initializeDatabase()
    const post = await getPublishedBlogPostBySlug(slug)
    if (!post) {
      return {
        title: `Not found | ${siteConfig.name}`,
        robots: { index: false, follow: false },
      }
    }
    const lang = parseBlogLang(sp.lang) || post.sourceLang
    return buildBlogPostMetadata(post, lang)
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

  return (
    <>
      <JsonLd data={blogPostingJsonLd(post, localized)} />
      <JsonLd data={blogBreadcrumbJsonLd(localized)} />
      <BlogArticle post={localized} initialLang={lang} />
    </>
  )
}

export default async function BlogArticlePage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  return (
    <Suspense
      fallback={<BlogArticleSkeleton />}
      key={`${slug}:${sp.lang ?? ""}`}
    >
      <BlogArticleContent slug={slug} langParam={sp.lang} />
    </Suspense>
  )
}
