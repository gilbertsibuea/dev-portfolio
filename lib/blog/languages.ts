/**
 * Blog language registry — add entries here to scale UI + cookies.
 * Storage / translation still use the code (en, id, …).
 */
export const BLOG_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "id", label: "Indonesia" },
] as const

export type BlogLangCode = (typeof BLOG_LANGUAGES)[number]["code"]

export function isBlogLangCode(value: unknown): value is BlogLangCode {
  return (
    typeof value === "string" &&
    BLOG_LANGUAGES.some((lang) => lang.code === value)
  )
}

export function blogLangLabel(code: string): string {
  return BLOG_LANGUAGES.find((lang) => lang.code === code)?.label ?? code
}
