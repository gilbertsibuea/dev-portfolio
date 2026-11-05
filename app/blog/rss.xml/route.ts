import { initializeDatabase } from "@/lib/db"
import { getPublishedBlogPosts } from "@/lib/db/blog"
import { displayExcerpt, displayTitle } from "@/lib/blog/format"
import {
  absoluteUrl,
  blogPostUrl,
  BLOG_INDEX_DESCRIPTION,
} from "@/lib/blog/seo"
import { siteConfig } from "@/lib/metadata"

export const dynamic = "force-dynamic"
export const revalidate = 0

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  await initializeDatabase()
  const posts = await getPublishedBlogPosts({ limit: 50 })
  const lastBuild =
    posts[0]?.updatedAt || posts[0]?.publishedAt || new Date().toISOString()

  const items = posts
    .map((post) => {
      const title = displayTitle(post, "en") || displayTitle(post, "id")
      const description =
        displayExcerpt(post, "en") || displayExcerpt(post, "id") || title
      const link = blogPostUrl(post.slug)
      const pubDate = new Date(
        post.publishedAt || post.createdAt
      ).toUTCString()
      const categories = `<category>${escapeXml(post.category)}</category>`

      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
      ${categories}
      <author>noreply@${siteConfig.domain} (${escapeXml(siteConfig.creator)})</author>
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${siteConfig.name} Blog`)}</title>
    <link>${escapeXml(absoluteUrl("/blog"))}</link>
    <atom:link href="${escapeXml(absoluteUrl("/blog/rss.xml"))}" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(BLOG_INDEX_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date(lastBuild).toUTCString()}</lastBuildDate>
    <managingEditor>noreply@${siteConfig.domain} (${escapeXml(siteConfig.creator)})</managingEditor>
    <webMaster>noreply@${siteConfig.domain} (${escapeXml(siteConfig.creator)})</webMaster>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  })
}
