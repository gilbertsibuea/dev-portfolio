import { NextRequest, NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"
import {
  deleteBlogPost,
  getBlogPostById,
  getBlogPostBySlug,
  getPublishedBlogPostBySlug,
  localizePost,
  updateBlogPost,
} from "@/lib/db/blog"
import { isBlogCategory } from "@/lib/blog/categories"
import { publishBlogPost } from "@/lib/blog/publish"
import { getBlogLangCookie, parseBlogLang } from "@/lib/blog/voter"
import type { BlogLang, BlogStatus } from "@/lib/blog/types"

initializeDatabase()

type Ctx = { params: Promise<{ slug: string }> }

export async function GET(request: NextRequest, context: Ctx) {
  try {
    const { slug } = await context.params
    const { searchParams } = new URL(request.url)
    const admin = searchParams.get("admin") === "1"
    const langParam = parseBlogLang(searchParams.get("lang"))

    if (admin) {
      // slug may be numeric id for admin edit
      const byId = /^\d+$/.test(slug)
        ? await getBlogPostById(Number(slug))
        : null
      const post = byId || (await getBlogPostBySlug(slug))
      if (!post) {
        return NextResponse.json(
          { success: false, error: "Not found" },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, post })
    }

    const post = await getPublishedBlogPostBySlug(slug)
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      )
    }

    const cookieLang = await getBlogLangCookie()
    const lang: BlogLang =
      langParam || cookieLang || post.sourceLang || "en"
    const localized = localizePost(post, lang)

    return NextResponse.json({
      success: true,
      post: localized,
      raw: {
        score: post.score,
        sourceLang: post.sourceLang,
        category: post.category,
        publishedAt: post.publishedAt,
      },
    })
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch post" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: Ctx) {
  try {
    const { slug } = await context.params
    const data = await request.json()

    const byId = /^\d+$/.test(slug)
      ? await getBlogPostById(Number(slug))
      : null
    const existing = byId || (await getBlogPostBySlug(slug))
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      )
    }

    const action = data.action as string | undefined

    if (action === "publish" || action === "retranslate") {
      try {
        const post = await publishBlogPost(existing.id, {
          retranslateOnly: action === "retranslate",
        })
        return NextResponse.json({ success: true, post })
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Translation / publish failed"
        return NextResponse.json(
          { success: false, error: message },
          { status: 502 }
        )
      }
    }

    if (action === "unpublish") {
      const post = await updateBlogPost(existing.id, { status: "draft" })
      return NextResponse.json({ success: true, post })
    }

    if (data.category != null && !isBlogCategory(data.category)) {
      return NextResponse.json(
        { success: false, error: "Invalid category" },
        { status: 400 }
      )
    }

    const status: BlogStatus | undefined =
      data.status === "draft" || data.status === "published"
        ? data.status
        : undefined

    // Saving content always stays draft unless publish action is used
    const post = await updateBlogPost(existing.id, {
      slug: data.slug,
      category: data.category,
      sourceLang: data.sourceLang,
      titleSource: data.titleSource,
      excerptSource: data.excerptSource,
      bodyMdSource: data.bodyMdSource,
      coverUrl: data.coverUrl,
      status: status === "published" ? undefined : status || "draft",
    })

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error("Error updating blog post:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update post" },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, context: Ctx) {
  try {
    const { slug } = await context.params
    const byId = /^\d+$/.test(slug)
      ? await getBlogPostById(Number(slug))
      : null
    const existing = byId || (await getBlogPostBySlug(slug))
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      )
    }
    const ok = await deleteBlogPost(existing.id)
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Delete failed" },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting blog post:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete post" },
      { status: 500 }
    )
  }
}
