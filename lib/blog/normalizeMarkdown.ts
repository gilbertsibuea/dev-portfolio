/**
 * Stabilize TipTap ↔ Markdown ↔ marked round-trips.
 * Fixes: headings after images becoming literal "## …",
 * hard-breaks collapsing preview spacing, etc.
 */
export function normalizeBlogMarkdown(md: string): string {
  if (!md) return ""

  let out = md.replace(/\r\n/g, "\n")

  // TipTap hardBreak serializes as "\\\n" — treat as paragraph break
  out = out.replace(/\\\n/g, "\n\n")

  // Blank line after markdown images (required for reliable ATX headings after)
  out = out.replace(/(!\[[^\]]*\]\([^)\n]*\))[ \t]*\n(?!\n)/g, "$1\n\n")
  out = out.replace(/(!\[[^\]]*\]\([^)\n]*\))[ \t]*$/gm, "$1\n")

  // Blank line before ATX headings when glued to previous content
  out = out.replace(/([^\n])[ \t]*\n(#{1,6}[ \t]+)/g, "$1\n\n$2")

  // Headings accidentally written mid-line after an image on same line
  out = out.replace(/(!\[[^\]]*\]\([^)\n]*\))[ \t]*(#{1,6}[ \t]+)/g, "$1\n\n$2")

  // Collapse excess blank lines
  out = out.replace(/\n{3,}/g, "\n\n")

  return out.trim()
}
