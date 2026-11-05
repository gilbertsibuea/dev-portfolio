import { NextRequest, NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"
import {
  createBlogPost,
  getAllBlogPosts,
  getPublishedBlogPosts,
} from "@/lib/db/blog"
import { isBlogCategory } from "@/lib/blog/categories"
import type { BlogLang } from "@/lib/blog/types"

initializeDatabase()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const admin = searchParams.get("admin") === "1"
    const category = searchParams.get("category")
    const limitRaw = searchParams.get("limit")
    const limit = limitRaw ? Math.min(50, Math.max(1, Number(limitRaw))) : undefined

    if (admin) {
      const posts = await getAllBlogPosts()
      return NextResponse.json({ success: true, posts, count: posts.length })
    }

    const posts = await getPublishedBlogPosts({
      category: category && isBlogCategory(category) ? category : null,
      limit,
    })
    return NextResponse.json({ success: true, posts, count: posts.length })
  } catch (error) {
    console.error("Error listing blog posts:", error)
    return NextResponse.json(
      { success: false, error: "Failed to list posts" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const sourceLang: BlogLang =
      data.sourceLang === "id" ? "id" : data.sourceLang === "en" ? "en" : "en"

    if (!data.titleSource || !data.bodyMdSource) {
      return NextResponse.json(
        { success: false, error: "titleSource and bodyMdSource are required" },
        { status: 400 }
      )
    }
    if (!isBlogCategory(data.category)) {
      return NextResponse.json(
        { success: false, error: "Invalid category" },
        { status: 400 }
      )
    }

    const slug =
      typeof data.slug === "string" && data.slug.trim()
        ? data.slug.trim()
        : String(data.titleSource)

    const post = await createBlogPost({
      slug,
      category: data.category,
      sourceLang,
      titleSource: String(data.titleSource),
      excerptSource: String(data.excerptSource || ""),
      bodyMdSource: String(data.bodyMdSource),
      coverUrl: data.coverUrl ? String(data.coverUrl) : null,
      status: "draft",
    })

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Failed to create post" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error("Error creating blog post:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create post" },
      { status: 500 }
    )
  }
}
