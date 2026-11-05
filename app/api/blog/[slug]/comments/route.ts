import { NextRequest, NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"
import {
  createComment,
  getCommentsForPost,
  getPublishedBlogPostBySlug,
} from "@/lib/db/blog"
import {
  attachVoterCookie,
  checkCommentRateLimit,
  getOrCreateVoterId,
  looksLikeCommentSpam,
} from "@/lib/blog/voter"

initializeDatabase()

type Ctx = { params: Promise<{ slug: string }> }

export async function GET(_request: NextRequest, context: Ctx) {
  try {
    const { slug } = await context.params
    const post = await getPublishedBlogPostBySlug(slug)
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      )
    }
    const comments = await getCommentsForPost(post.id)
    return NextResponse.json({ success: true, comments })
  } catch (error) {
    console.error("Error listing comments:", error)
    return NextResponse.json(
      { success: false, error: "Failed to list comments" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, context: Ctx) {
  try {
    const { slug } = await context.params
    const post = await getPublishedBlogPostBySlug(slug)
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      )
    }

    const data = await request.json()
    const authorName = String(data.authorName || "").trim()
    const body = String(data.body || "").trim()
    const parentId =
      data.parentId != null && Number.isFinite(Number(data.parentId))
        ? Number(data.parentId)
        : null

    if (authorName.length < 2 || authorName.length > 40) {
      return NextResponse.json(
        { success: false, error: "Display name must be 2–40 characters" },
        { status: 400 }
      )
    }
    if (body.length < 2 || body.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Comment must be 2–2000 characters" },
        { status: 400 }
      )
    }
    if (looksLikeCommentSpam(body)) {
      return NextResponse.json(
        { success: false, error: "Comment looks like spam" },
        { status: 400 }
      )
    }

    const { voterId, isNew } = await getOrCreateVoterId()
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    const rate = checkCommentRateLimit(`${voterId}:${ip}`)
    if (!rate.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${rate.retryAfterSec}s before commenting again`,
        },
        { status: 429 }
      )
    }

    const comment = await createComment({
      postId: post.id,
      parentId,
      authorName,
      body,
    })

    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not create comment (invalid reply target?)",
        },
        { status: 400 }
      )
    }

    const res = NextResponse.json({ success: true, comment })
    if (isNew) attachVoterCookie(res, voterId)
    return res
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create comment" },
      { status: 500 }
    )
  }
}
