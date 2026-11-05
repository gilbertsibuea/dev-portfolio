import { NextRequest, NextResponse } from "next/server"
import { BLOG_LANG_COOKIE, parseBlogLang } from "@/lib/blog/voter"

export async function POST(request: NextRequest) {
  const data = await request.json().catch(() => ({}))
  const lang = parseBlogLang(data.lang)
  if (!lang) {
    return NextResponse.json(
      { success: false, error: "lang must be en or id" },
      { status: 400 }
    )
  }

  const res = NextResponse.json({ success: true, lang })
  res.cookies.set(BLOG_LANG_COOKIE, lang, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
  return res
}
