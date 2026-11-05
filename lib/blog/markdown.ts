import { marked, type Tokens } from "marked"

/** Escape HTML entities */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function safeHref(href: string | null | undefined): string | null {
  if (!href) return null
  const trimmed = href.trim()
  if (/^(https?:|mailto:|\/|#)/i.test(trimmed)) return trimmed
  return null
}

/**
 * Render markdown to HTML with a tight allowlist:
 * headings, paragraphs, lists, code, links, images, blockquotes, hr, strong/em.
 */
export function renderBlogMarkdown(md: string): string {
  const renderer = new marked.Renderer()

  renderer.heading = ({ tokens, depth }: Tokens.Heading) => {
    const text = renderer.parser.parseInline(tokens)
    const level = Math.min(Math.max(depth, 1), 4)
    return `<h${level}>${text}</h${level}>`
  }

  renderer.paragraph = ({ tokens }: Tokens.Paragraph) => {
    return `<p>${renderer.parser.parseInline(tokens)}</p>`
  }

  renderer.list = (token: Tokens.List) => {
    const tag = token.ordered ? "ol" : "ul"
    const body = token.items
      .map((item) => {
        const inner = renderer.parser.parse(item.tokens)
        return `<li>${inner}</li>`
      })
      .join("")
    return `<${tag}>${body}</${tag}>`
  }

  renderer.listitem = (item: Tokens.ListItem) => {
    return renderer.parser.parse(item.tokens)
  }

  renderer.code = ({ text, lang }: Tokens.Code) => {
    const cls = lang ? ` class="language-${esc(lang)}"` : ""
    return `<pre><code${cls}>${esc(text)}</code></pre>`
  }

  renderer.codespan = ({ text }: Tokens.Codespan) => {
    return `<code>${esc(text)}</code>`
  }

  renderer.link = ({ href, title, tokens }: Tokens.Link) => {
    const safe = safeHref(href)
    const text = renderer.parser.parseInline(tokens)
    if (!safe) return text
    const t = title ? ` title="${esc(title)}"` : ""
    return `<a href="${esc(safe)}"${t} rel="noopener noreferrer" target="_blank">${text}</a>`
  }

  renderer.image = ({ href, title, text }: Tokens.Image) => {
    const safe = safeHref(href)
    if (!safe) return ""
    const t = title ? ` title="${esc(title)}"` : ""
    const alt = esc(text || "")
    return `<img src="${esc(safe)}" alt="${alt}"${t} loading="lazy" />`
  }

  renderer.blockquote = ({ tokens }: Tokens.Blockquote) => {
    return `<blockquote>${renderer.parser.parse(tokens)}</blockquote>`
  }

  renderer.hr = () => `<hr />`

  renderer.strong = ({ tokens }: Tokens.Strong) => {
    return `<strong>${renderer.parser.parseInline(tokens)}</strong>`
  }

  renderer.em = ({ tokens }: Tokens.Em) => {
    return `<em>${renderer.parser.parseInline(tokens)}</em>`
  }

  // Disallow raw HTML
  renderer.html = () => ""

  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  return marked.parse(md || "", { renderer }) as string
}
