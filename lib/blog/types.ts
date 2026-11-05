import type { BlogCategory } from "./categories"
import type { BlogLangCode } from "./languages"

/** Alias of the language registry — extend via `lib/blog/languages.ts` */
export type BlogLang = BlogLangCode
export type BlogStatus = "draft" | "published"

export type BlogPost = {
  id: number
  slug: string
  status: BlogStatus
  category: BlogCategory
  sourceLang: BlogLang
  titleSource: string
  excerptSource: string
  bodyMdSource: string
  titleEn: string | null
  titleId: string | null
  excerptEn: string | null
  excerptId: string | null
  bodyMdEn: string | null
  bodyMdId: string | null
  coverUrl: string | null
  score: number
  shareCount: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

/** Fields needed for index / SideRail lists */
export type BlogPostListItem = {
  id: number
  slug: string
  status: BlogStatus
  category: BlogCategory
  sourceLang: BlogLang
  titleEn: string | null
  titleId: string | null
  titleSource: string
  excerptEn: string | null
  excerptId: string | null
  excerptSource: string
  score: number
  shareCount: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type BlogComment = {
  id: number
  postId: number
  parentId: number | null
  authorName: string
  body: string
  status: string
  createdAt: string
}

export type BlogVoteValue = 1 | -1

export type BlogPostInput = {
  slug: string
  category: BlogCategory
  sourceLang: BlogLang
  titleSource: string
  excerptSource: string
  bodyMdSource: string
  coverUrl?: string | null
  status?: BlogStatus
}

/** Localized view of a post for the reader */
export type LocalizedPost = {
  id: number
  slug: string
  category: BlogCategory
  lang: BlogLang
  title: string
  excerpt: string
  bodyMd: string
  coverUrl: string | null
  score: number
  shareCount: number
  publishedAt: string | null
  sourceLang: BlogLang
  availableLangs: BlogLang[]
}
