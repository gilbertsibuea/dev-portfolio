import { NextRequest, NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"
import {
  getPublishedBlogPostBySlug,
  getVote,
  upsertVote,
} from "@/lib/db/blog"
import {
  attachVoterCookie,
  getOrCreateVoterId,
} from "@/lib/blog/voter"
import type { BlogVoteValue } from "@/lib/blog/types"

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

    const { voterId, isNew } = await getOrCreateVoterId()
    const userVote = isNew ? null : await getVote(post.id, voterId)

    const res = NextResponse.json({
      success: true,
      score: post.score,
      userVote,
    })
    if (isNew) attachVoterCookie(res, voterId)
    return res
  } catch (error) {
    console.error("Error reading vote:", error)
    return NextResponse.json(
      { success: false, error: "Failed to read vote" },
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

    const body = await request.json().catch(() => ({}))
    const raw = Number(body.value)
    // 1 upvote, -1 downvote, 0 clear; same value clears via upsertVote
    if (raw !== 1 && raw !== -1 && raw !== 0) {
      return NextResponse.json(
        { success: false, error: "value must be 1, -1, or 0" },
        { status: 400 }
      )
    }

    const { voterId, isNew } = await getOrCreateVoterId()
    const result = await upsertVote(
      post.id,
      voterId,
      raw as BlogVoteValue | 0
    )

    const res = NextResponse.json({
      success: true,
      score: result.score,
      userVote: result.userVote,
    })
    if (isNew) attachVoterCookie(res, voterId)
    return res
  } catch (error) {
    console.error("Error casting vote:", error)
    return NextResponse.json(
      { success: false, error: "Failed to vote" },
      { status: 500 }
    )
  }
}
