/** Fixed blog categories — single-select, stored as exact text */

export const BLOG_CATEGORIES = [
  "Life & Routines",
  "Stories & Essays",
  "Travel & Places",
  "Tech",
  "Others",
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

export function isBlogCategory(value: unknown): value is BlogCategory {
  return (
    typeof value === "string" &&
    (BLOG_CATEGORIES as readonly string[]).includes(value)
  )
}

export function parseCategoryParam(
  value: string | null | undefined
): BlogCategory | null {
  if (!value || value === "All") return null
  const decoded = decodeURIComponent(value)
  return isBlogCategory(decoded) ? decoded : null
}
