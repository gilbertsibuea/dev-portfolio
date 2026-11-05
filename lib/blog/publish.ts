import {
  applySourceToLocaleFields,
  getBlogPostById,
  updateBlogPost,
} from "@/lib/db/blog"
import { translatePostContent, targetLang } from "./translate"
import type { BlogPost } from "./types"

/**
 * Fill source locale from source fields, translate into the other locale,
 * then mark published. On translate failure, leaves status as draft and throws.
 */
export async function publishBlogPost(
  id: number,
  options?: { retranslateOnly?: boolean }
): Promise<BlogPost> {
  const post = await getBlogPostById(id)
  if (!post) throw new Error("Post not found")

  const sourceFields = applySourceToLocaleFields(post)
  // Always refresh source-locale columns from current source
  const baseUpdate = {
    titleEn:
      post.sourceLang === "en" ? post.titleSource : sourceFields.titleEn,
    excerptEn:
      post.sourceLang === "en" ? post.excerptSource : sourceFields.excerptEn,
    bodyMdEn:
      post.sourceLang === "en" ? post.bodyMdSource : sourceFields.bodyMdEn,
    titleId:
      post.sourceLang === "id" ? post.titleSource : sourceFields.titleId,
    excerptId:
      post.sourceLang === "id" ? post.excerptSource : sourceFields.excerptId,
    bodyMdId:
      post.sourceLang === "id" ? post.bodyMdSource : sourceFields.bodyMdId,
  }

  let translated
  try {
    translated = await translatePostContent(post.sourceLang, {
      title: post.titleSource,
      excerpt: post.excerptSource,
      bodyMd: post.bodyMdSource,
    })
  } catch (err) {
    // Ensure we do not half-publish
    await updateBlogPost(id, {
      ...baseUpdate,
      status: "draft",
    })
    throw err
  }

  const target = targetLang(post.sourceLang)
  const localeUpdate =
    target === "id"
      ? {
          ...baseUpdate,
          titleId: translated.title,
          excerptId: translated.excerpt,
          bodyMdId: translated.bodyMd,
        }
      : {
          ...baseUpdate,
          titleEn: translated.title,
          excerptEn: translated.excerpt,
          bodyMdEn: translated.bodyMd,
        }

  const publishedAt =
    options?.retranslateOnly && post.publishedAt
      ? post.publishedAt
      : post.publishedAt || new Date().toISOString()

  const updated = await updateBlogPost(id, {
    ...localeUpdate,
    status: "published",
    publishedAt,
  })

  if (!updated) throw new Error("Failed to update post after translate")
  return updated
}

export async function saveAsDraft(
  id: number,
  fields?: Parameters<typeof updateBlogPost>[1]
): Promise<BlogPost | null> {
  return updateBlogPost(id, {
    ...fields,
    status: "draft",
  })
}
