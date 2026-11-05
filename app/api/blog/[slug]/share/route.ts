import { NextRequest, NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"
import {
  getPublishedBlogPostBySlug,
  incrementShareCount,
} from "@/lib/db/blog"
import {
  attachVoterCookie,
  checkShareRateLimit,
  getOrCreateVoterId,
} from "@/lib/blog/voter"

initializeDatabase()

type Ctx = { params: Promise<{ slug: string }> }

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

    const body = await request.json().catch(() => ({}))
    const channel = String(body.channel || "copy")
    if (!["copy", "whatsapp", "email"].includes(channel)) {
      return NextResponse.json(
        { success: false, error: "Invalid channel" },
        { status: 400 }
      )
    }

    const { voterId, isNew } = await getOrCreateVoterId()
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"

    // Soft rate limit — still return current count if too fast
    let shareCount = post.shareCount
    if (checkShareRateLimit(`${voterId}:${ip}:${slug}`)) {
      shareCount = await incrementShareCount(post.id)
    }

    const res = NextResponse.json({
      success: true,
      shareCount,
      channel,
    })
    if (isNew) attachVoterCookie(res, voterId)
    return res
  } catch (error) {
    console.error("Error recording share:", error)
    return NextResponse.json(
      { success: false, error: "Failed to record share" },
      { status: 500 }
    )
  }
}
