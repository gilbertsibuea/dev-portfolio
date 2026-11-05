import { turso } from "./turso"
import { isBlogCategory } from "@/lib/blog/categories"
import type {
  BlogComment,
  BlogLang,
  BlogPost,
  BlogPostInput,
  BlogPostListItem,
  BlogStatus,
  BlogVoteValue,
  LocalizedPost,
} from "@/lib/blog/types"

type BlogPostRow = {
  id: number
  slug: string
  status: string
  category: string
  source_lang: string
  title_source: string
  excerpt_source: string
  body_md_source: string
  title_en: string | null
  title_id: string | null
  excerpt_en: string | null
  excerpt_id: string | null
  body_md_en: string | null
  body_md_id: string | null
  cover_url: string | null
  score: number
  published_at: string | null
  created_at: string
  updated_at: string
}

type BlogCommentRow = {
  id: number
  post_id: number
  parent_id: number | null
  author_name: string
  body: string
  status: string
  created_at: string
}

function str(v: unknown): string {
  return v == null ? "" : String(v)
}

function strOrNull(v: unknown): string | null {
  if (v == null || v === "") return null
  return String(v)
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function rowToPost(row: BlogPostRow): BlogPost {
  const category = isBlogCategory(row.category) ? row.category : "Others"
  return {
    id: num(row.id),
    slug: str(row.slug),
    status: (row.status === "published" ? "published" : "draft") as BlogStatus,
    category,
    sourceLang: (row.source_lang === "id" ? "id" : "en") as BlogLang,
    titleSource: str(row.title_source),
    excerptSource: str(row.excerpt_source),
    bodyMdSource: str(row.body_md_source),
    titleEn: strOrNull(row.title_en),
    titleId: strOrNull(row.title_id),
    excerptEn: strOrNull(row.excerpt_en),
    excerptId: strOrNull(row.excerpt_id),
    bodyMdEn: strOrNull(row.body_md_en),
    bodyMdId: strOrNull(row.body_md_id),
    coverUrl: strOrNull(row.cover_url),
    score: num(row.score),
    publishedAt: strOrNull(row.published_at),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  }
}

function toListItem(post: BlogPost): BlogPostListItem {
  return {
    id: post.id,
    slug: post.slug,
    status: post.status,
    category: post.category,
    sourceLang: post.sourceLang,
    titleEn: post.titleEn,
    titleId: post.titleId,
    titleSource: post.titleSource,
    excerptEn: post.excerptEn,
    excerptId: post.excerptId,
    excerptSource: post.excerptSource,
    score: post.score,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }
}

export function localizePost(post: BlogPost, lang: BlogLang): LocalizedPost {
  const enReady = Boolean(post.titleEn && post.bodyMdEn)
  const idReady = Boolean(post.titleId && post.bodyMdId)
  const availableLangs: BlogLang[] = []
  if (enReady) availableLangs.push("en")
  if (idReady) availableLangs.push("id")

  const useLang: BlogLang =
    lang === "id" && idReady
      ? "id"
      : lang === "en" && enReady
        ? "en"
        : enReady
          ? "en"
          : idReady
            ? "id"
            : post.sourceLang

  if (useLang === "id") {
    return {
      id: post.id,
      slug: post.slug,
      category: post.category,
      lang: "id",
      title: post.titleId || post.titleSource,
      excerpt: post.excerptId || post.excerptSource,
      bodyMd: post.bodyMdId || post.bodyMdSource,
      coverUrl: post.coverUrl,
      score: post.score,
      publishedAt: post.publishedAt,
      sourceLang: post.sourceLang,
      availableLangs:
        availableLangs.length > 0 ? availableLangs : [post.sourceLang],
    }
  }

  return {
    id: post.id,
    slug: post.slug,
    category: post.category,
    lang: "en",
    title: post.titleEn || post.titleSource,
    excerpt: post.excerptEn || post.excerptSource,
    bodyMd: post.bodyMdEn || post.bodyMdSource,
    coverUrl: post.coverUrl,
    score: post.score,
    publishedAt: post.publishedAt,
    sourceLang: post.sourceLang,
    availableLangs:
      availableLangs.length > 0 ? availableLangs : [post.sourceLang],
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const result = await turso.execute(
    `SELECT * FROM blog_posts ORDER BY
      CASE WHEN published_at IS NOT NULL THEN published_at ELSE created_at END DESC,
      id DESC`
  )
  return (result.rows as unknown as BlogPostRow[]).map(rowToPost)
}

export async function getPublishedBlogPosts(options?: {
  category?: string | null
  limit?: number
}): Promise<BlogPostListItem[]> {
  const args: (string | number)[] = []
  let sql = `SELECT * FROM blog_posts WHERE status = 'published'`

  if (options?.category) {
    sql += ` AND category = ?`
    args.push(options.category)
  }

  sql += ` ORDER BY COALESCE(published_at, created_at) DESC, id DESC`

  if (options?.limit && options.limit > 0) {
    sql += ` LIMIT ?`
    args.push(options.limit)
  }

  const result = await turso.execute({ sql, args })
  return (result.rows as unknown as BlogPostRow[])
    .map(rowToPost)
    .map(toListItem)
}

export async function getBlogPostById(id: number): Promise<BlogPost | null> {
  const result = await turso.execute({
    sql: `SELECT * FROM blog_posts WHERE id = ?`,
    args: [id],
  })
  if (!result.rows.length) return null
  return rowToPost(result.rows[0] as unknown as BlogPostRow)
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  const result = await turso.execute({
    sql: `SELECT * FROM blog_posts WHERE slug = ?`,
    args: [slug],
  })
  if (!result.rows.length) return null
  return rowToPost(result.rows[0] as unknown as BlogPostRow)
}

export async function getPublishedBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  const post = await getBlogPostBySlug(slug)
  if (!post || post.status !== "published") return null
  return post
}

export async function createBlogPost(
  input: BlogPostInput
): Promise<BlogPost | null> {
  const slug = slugify(input.slug) || `post-${Date.now()}`
  if (!isBlogCategory(input.category)) return null
  if (input.sourceLang !== "en" && input.sourceLang !== "id") return null

  const status: BlogStatus = input.status === "published" ? "published" : "draft"

  await turso.execute({
    sql: `INSERT INTO blog_posts (
      slug, status, category, source_lang,
      title_source, excerpt_source, body_md_source, cover_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      slug,
      status,
      input.category,
      input.sourceLang,
      input.titleSource.trim(),
      (input.excerptSource || "").trim(),
      input.bodyMdSource,
      input.coverUrl ?? null,
    ],
  })

  return getBlogPostBySlug(slug)
}

export async function updateBlogPost(
  id: number,
  input: Partial<BlogPostInput> & {
    titleEn?: string | null
    titleId?: string | null
    excerptEn?: string | null
    excerptId?: string | null
    bodyMdEn?: string | null
    bodyMdId?: string | null
    score?: number
    publishedAt?: string | null
    status?: BlogStatus
  }
): Promise<BlogPost | null> {
  const existing = await getBlogPostById(id)
  if (!existing) return null

  const slug = input.slug != null ? slugify(input.slug) || existing.slug : existing.slug
  const category =
    input.category != null && isBlogCategory(input.category)
      ? input.category
      : existing.category
  const sourceLang =
    input.sourceLang === "en" || input.sourceLang === "id"
      ? input.sourceLang
      : existing.sourceLang
  const status =
    input.status === "published" || input.status === "draft"
      ? input.status
      : existing.status

  await turso.execute({
    sql: `UPDATE blog_posts SET
      slug = ?,
      status = ?,
      category = ?,
      source_lang = ?,
      title_source = ?,
      excerpt_source = ?,
      body_md_source = ?,
      title_en = ?,
      title_id = ?,
      excerpt_en = ?,
      excerpt_id = ?,
      body_md_en = ?,
      body_md_id = ?,
      cover_url = ?,
      score = ?,
      published_at = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    args: [
      slug,
      status,
      category,
      sourceLang,
      input.titleSource != null ? input.titleSource.trim() : existing.titleSource,
      input.excerptSource != null
        ? input.excerptSource.trim()
        : existing.excerptSource,
      input.bodyMdSource != null ? input.bodyMdSource : existing.bodyMdSource,
      input.titleEn !== undefined ? input.titleEn : existing.titleEn,
      input.titleId !== undefined ? input.titleId : existing.titleId,
      input.excerptEn !== undefined ? input.excerptEn : existing.excerptEn,
      input.excerptId !== undefined ? input.excerptId : existing.excerptId,
      input.bodyMdEn !== undefined ? input.bodyMdEn : existing.bodyMdEn,
      input.bodyMdId !== undefined ? input.bodyMdId : existing.bodyMdId,
      input.coverUrl !== undefined ? input.coverUrl : existing.coverUrl,
      input.score !== undefined ? input.score : existing.score,
      input.publishedAt !== undefined ? input.publishedAt : existing.publishedAt,
      id,
    ],
  })

  return getBlogPostById(id)
}

export async function deleteBlogPost(id: number): Promise<boolean> {
  try {
    await turso.execute({
      sql: `DELETE FROM blog_votes WHERE post_id = ?`,
      args: [id],
    })
    await turso.execute({
      sql: `DELETE FROM blog_comments WHERE post_id = ?`,
      args: [id],
    })
    await turso.execute({
      sql: `DELETE FROM blog_posts WHERE id = ?`,
      args: [id],
    })
    return true
  } catch {
    return false
  }
}

/** Copy source fields into source locale columns, leave target for translate step */
export function applySourceToLocaleFields(post: BlogPost): {
  titleEn: string | null
  titleId: string | null
  excerptEn: string | null
  excerptId: string | null
  bodyMdEn: string | null
  bodyMdId: string | null
} {
  if (post.sourceLang === "en") {
    return {
      titleEn: post.titleSource,
      excerptEn: post.excerptSource,
      bodyMdEn: post.bodyMdSource,
      titleId: post.titleId,
      excerptId: post.excerptId,
      bodyMdId: post.bodyMdId,
    }
  }
  return {
    titleId: post.titleSource,
    excerptId: post.excerptSource,
    bodyMdId: post.bodyMdSource,
    titleEn: post.titleEn,
    excerptEn: post.excerptEn,
    bodyMdEn: post.bodyMdEn,
  }
}

export async function getVote(
  postId: number,
  voterId: string
): Promise<BlogVoteValue | null> {
  const result = await turso.execute({
    sql: `SELECT value FROM blog_votes WHERE post_id = ? AND voter_id = ?`,
    args: [postId, voterId],
  })
  if (!result.rows.length) return null
  const v = num(result.rows[0].value)
  return v === 1 || v === -1 ? (v as BlogVoteValue) : null
}

export async function upsertVote(
  postId: number,
  voterId: string,
  value: BlogVoteValue | 0
): Promise<{ score: number; userVote: BlogVoteValue | null }> {
  const existing = await getVote(postId, voterId)

  if (value === 0 || (existing !== null && existing === value)) {
    // Clear vote (Reddit-style toggle off)
    if (existing !== null) {
      await turso.execute({
        sql: `DELETE FROM blog_votes WHERE post_id = ? AND voter_id = ?`,
        args: [postId, voterId],
      })
    }
  } else if (existing !== null) {
    await turso.execute({
      sql: `UPDATE blog_votes SET value = ? WHERE post_id = ? AND voter_id = ?`,
      args: [value, postId, voterId],
    })
  } else {
    await turso.execute({
      sql: `INSERT INTO blog_votes (post_id, voter_id, value) VALUES (?, ?, ?)`,
      args: [postId, voterId, value],
    })
  }

  const sumResult = await turso.execute({
    sql: `SELECT COALESCE(SUM(value), 0) AS score FROM blog_votes WHERE post_id = ?`,
    args: [postId],
  })
  const score = num(sumResult.rows[0]?.score)
  await turso.execute({
    sql: `UPDATE blog_posts SET score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    args: [score, postId],
  })

  const userVote = await getVote(postId, voterId)
  return { score, userVote }
}

export async function getCommentsForPost(
  postId: number
): Promise<BlogComment[]> {
  const result = await turso.execute({
    sql: `SELECT * FROM blog_comments
          WHERE post_id = ? AND status = 'visible'
          ORDER BY created_at ASC, id ASC`,
    args: [postId],
  })
  return (result.rows as unknown as BlogCommentRow[]).map((row) => ({
    id: num(row.id),
    postId: num(row.post_id),
    parentId: row.parent_id == null ? null : num(row.parent_id),
    authorName: str(row.author_name),
    body: str(row.body),
    status: str(row.status),
    createdAt: str(row.created_at),
  }))
}

export async function createComment(input: {
  postId: number
  parentId?: number | null
  authorName: string
  body: string
}): Promise<BlogComment | null> {
  if (input.parentId != null) {
    const parent = await turso.execute({
      sql: `SELECT id, parent_id FROM blog_comments WHERE id = ? AND post_id = ?`,
      args: [input.parentId, input.postId],
    })
    if (!parent.rows.length) return null
    // Only one reply level
    if (parent.rows[0].parent_id != null) return null
  }

  const result = await turso.execute({
    sql: `INSERT INTO blog_comments (post_id, parent_id, author_name, body)
          VALUES (?, ?, ?, ?)
          RETURNING *`,
    args: [
      input.postId,
      input.parentId ?? null,
      input.authorName.trim().slice(0, 40),
      input.body.trim().slice(0, 2000),
    ],
  })

  if (!result.rows.length) {
    // Fallback without RETURNING
    const listed = await getCommentsForPost(input.postId)
    return listed[listed.length - 1] ?? null
  }

  const row = result.rows[0] as unknown as BlogCommentRow
  return {
    id: num(row.id),
    postId: num(row.post_id),
    parentId: row.parent_id == null ? null : num(row.parent_id),
    authorName: str(row.author_name),
    body: str(row.body),
    status: str(row.status),
    createdAt: str(row.created_at),
  }
}

export async function countBlogPosts(): Promise<number> {
  const result = await turso.execute(
    `SELECT COUNT(*) as count FROM blog_posts`
  )
  return num(result.rows[0]?.count)
}
