import type { BlogLang, BlogPostListItem } from "./types"

export function displayTitle(post: BlogPostListItem, lang: BlogLang): string {
  if (lang === "id") return post.titleId || post.titleSource || post.titleEn || ""
  return post.titleEn || post.titleSource || post.titleId || ""
}

export function displayExcerpt(post: BlogPostListItem, lang: BlogLang): string {
  if (lang === "id")
    return post.excerptId || post.excerptSource || post.excerptEn || ""
  return post.excerptEn || post.excerptSource || post.excerptId || ""
}

export function estimateReadingMinutes(bodyMd: string): number {
  const words = bodyMd.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}
