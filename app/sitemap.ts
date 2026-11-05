import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/metadata'
import { initializeDatabase } from '@/lib/db'
import { getPublishedBlogPosts } from '@/lib/db/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  try {
    await initializeDatabase()
    const posts = await getPublishedBlogPosts({ limit: 200 })
    for (const post of posts) {
      entries.push({
        url: `${siteConfig.url}/blog/${post.slug}`,
        lastModified: post.updatedAt
          ? new Date(post.updatedAt)
          : post.publishedAt
            ? new Date(post.publishedAt)
            : new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  } catch {
    // DB unavailable at build time — still return core URLs
  }

  return entries
}
