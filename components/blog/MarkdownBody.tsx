import { renderBlogMarkdown } from "@/lib/blog/markdown"

type Props = {
  markdown: string
  className?: string
}

export function MarkdownBody({ markdown, className = "" }: Props) {
  const html = renderBlogMarkdown(markdown)
  return (
    <div
      className={`blog-prose ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
