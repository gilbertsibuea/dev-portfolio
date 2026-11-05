import { MetadataRoute } from "next"
import { siteConfig } from "@/lib/metadata"
import { initializeDatabase } from "@/lib/db"
import { getPublishedBlogPosts } from "@/lib/db/blog"
import { BLOG_CATEGORIES } from "@/lib/blog/categories"
import { blogIndexUrl, blogPostUrl } from "@/lib/blog/seo"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          en: `${siteConfig.url}/blog?lang=en`,
          id: `${siteConfig.url}/blog?lang=id`,
        },
      },
    },
  ]

  for (const category of BLOG_CATEGORIES) {
    entries.push({
      url: blogIndexUrl(category),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    })
  }

  try {
    await initializeDatabase()
    const posts = await getPublishedBlogPosts({ limit: 1000 })

    if (posts[0]) {
      const blogEntry = entries.find((e) => e.url === `${siteConfig.url}/blog`)
      if (blogEntry) {
        blogEntry.lastModified = new Date(
          posts[0].updatedAt || posts[0].publishedAt || now
        )
      }
    }

    for (const post of posts) {
      const langs = {
        // list item doesn't have full locale fields; derive from titles
        en: Boolean(post.titleEn),
        id: Boolean(post.titleId),
      }
      const languageAlternates: Record<string, string> = {}
      if (langs.en) languageAlternates.en = blogPostUrl(post.slug, "en")
      if (langs.id) languageAlternates.id = blogPostUrl(post.slug, "id")

      const published = post.publishedAt ? new Date(post.publishedAt) : now
      const ageDays =
        (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24)

      entries.push({
        url: blogPostUrl(post.slug),
        lastModified: post.updatedAt
          ? new Date(post.updatedAt)
          : published,
        changeFrequency: ageDays < 30 ? "weekly" : "monthly",
        priority: ageDays < 14 ? 0.8 : 0.65,
        ...(Object.keys(languageAlternates).length > 0
          ? { alternates: { languages: languageAlternates } }
          : {}),
      })
    }
  } catch {
    // DB unavailable — still return core URLs
  }

  return entries
}
