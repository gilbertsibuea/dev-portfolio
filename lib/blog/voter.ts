import { cookies } from "next/headers"
import { createHash, randomBytes, timingSafeEqual } from "crypto"
import type { NextResponse } from "next/server"
import type { BlogLang } from "./types"

export const VOTER_COOKIE = "voter_id"
export const BLOG_LANG_COOKIE = "blog_lang"
const VOTER_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

function signingSecret(): string {
  return (
    process.env.BLOG_VOTER_SECRET ||
    process.env.TURSO_AUTH_TOKEN ||
    "dev-blog-voter-secret"
  )
}

function sign(id: string): string {
  return createHash("sha256")
    .update(`${id}.${signingSecret()}`)
    .digest("hex")
    .slice(0, 24)
}

/** Format: rawId.signature */
export function mintVoterId(): string {
  const raw = randomBytes(16).toString("hex")
  return `${raw}.${sign(raw)}`
}

export function verifyVoterId(token: string | undefined | null): string | null {
  if (!token || !token.includes(".")) return null
  const [raw, sig] = token.split(".")
  if (!raw || !sig || raw.length < 16) return null
  const expected = sign(raw)
  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return null
    if (!timingSafeEqual(a, b)) return null
    return token
  } catch {
    return null
  }
}

export async function getOrCreateVoterId(): Promise<{
  voterId: string
  isNew: boolean
}> {
  const jar = await cookies()
  const existing = verifyVoterId(jar.get(VOTER_COOKIE)?.value)
  if (existing) return { voterId: existing, isNew: false }
  return { voterId: mintVoterId(), isNew: true }
}

export function attachVoterCookie(
  response: NextResponse,
  voterId: string
): void {
  response.cookies.set(VOTER_COOKIE, voterId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: VOTER_MAX_AGE,
  })
}

export function parseBlogLang(
  value: string | undefined | null
): BlogLang | null {
  if (value === "en" || value === "id") return value
  return null
}

export async function getBlogLangCookie(): Promise<BlogLang | null> {
  const jar = await cookies()
  return parseBlogLang(jar.get(BLOG_LANG_COOKIE)?.value)
}

/** In-memory comment rate limit: voterId -> last comment timestamp */
const commentTimestamps = new Map<string, number>()
const COMMENT_INTERVAL_MS = 20_000

export function checkCommentRateLimit(key: string): {
  ok: boolean
  retryAfterSec: number
} {
  const now = Date.now()
  const last = commentTimestamps.get(key) ?? 0
  const elapsed = now - last
  if (elapsed < COMMENT_INTERVAL_MS) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((COMMENT_INTERVAL_MS - elapsed) / 1000),
    }
  }
  commentTimestamps.set(key, now)
  // Prevent unbounded growth
  if (commentTimestamps.size > 5000) {
    const cutoff = now - COMMENT_INTERVAL_MS * 2
    for (const [k, t] of commentTimestamps) {
      if (t < cutoff) commentTimestamps.delete(k)
    }
  }
  return { ok: true, retryAfterSec: 0 }
}

const URL_RE = /https?:\/\/|www\.|\.com\b|\.id\b|\.net\b/i

export function looksLikeCommentSpam(body: string): boolean {
  const links = body.match(/https?:\/\//gi)
  if (links && links.length >= 2) return true
  if (URL_RE.test(body) && body.length < 40) return true
  return false
}

/** Light share-counter rate limit (~4s between counted shares per key) */
const shareTimestamps = new Map<string, number>()
const SHARE_INTERVAL_MS = 4_000

export function checkShareRateLimit(key: string): boolean {
  const now = Date.now()
  const last = shareTimestamps.get(key) ?? 0
  if (now - last < SHARE_INTERVAL_MS) return false
  shareTimestamps.set(key, now)
  if (shareTimestamps.size > 5000) {
    const cutoff = now - SHARE_INTERVAL_MS * 2
    for (const [k, t] of shareTimestamps) {
      if (t < cutoff) shareTimestamps.delete(k)
    }
  }
  return true
}
