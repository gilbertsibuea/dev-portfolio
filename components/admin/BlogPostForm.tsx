"use client"

import { useState } from "react"
import { BLOG_CATEGORIES, type BlogCategory } from "@/lib/blog/categories"
import type { BlogLang, BlogPost } from "@/lib/blog/types"

export type BlogFormPayload = {
  slug: string
  category: BlogCategory
  sourceLang: BlogLang
  titleSource: string
  excerptSource: string
  bodyMdSource: string
  coverUrl: string
}

type Props = {
  initial?: BlogPost | null
  submitLabel: string
  onSubmit: (payload: BlogFormPayload) => Promise<void>
  onPublish?: () => Promise<void>
  onRetranslate?: () => Promise<void>
  onUnpublish?: () => Promise<void>
}

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
}

export function BlogPostForm({
  initial,
  submitLabel,
  onSubmit,
  onPublish,
  onRetranslate,
  onUnpublish,
}: Props) {
  const [titleSource, setTitleSource] = useState(initial?.titleSource ?? "")
  const [slug, setSlug] = useState(initial?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug))
  const [category, setCategory] = useState<BlogCategory>(
    initial?.category ?? "Tech"
  )
  const [sourceLang, setSourceLang] = useState<BlogLang>(
    initial?.sourceLang ?? "en"
  )
  const [excerptSource, setExcerptSource] = useState(
    initial?.excerptSource ?? ""
  )
  const [bodyMdSource, setBodyMdSource] = useState(initial?.bodyMdSource ?? "")
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  const handleTitle = (v: string) => {
    setTitleSource(v)
    if (!slugTouched) setSlug(slugFromTitle(v))
  }

  const run = async (fn: () => Promise<void>, okMsg?: string) => {
    setBusy(true)
    setError(null)
    setActionMsg(null)
    try {
      await fn()
      if (okMsg) setActionMsg(okMsg)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        run(async () => {
          await onSubmit({
            slug,
            category,
            sourceLang,
            titleSource,
            excerptSource,
            bodyMdSource,
            coverUrl,
          })
        }, "Saved as draft")
      }}
    >
      {error && (
        <p className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}
      {actionMsg && (
        <p className="rounded-lg border border-emerald-800 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
          {actionMsg}
        </p>
      )}

      {initial && (
        <p className="text-sm text-gray-400">
          Status:{" "}
          <span
            className={
              initial.status === "published"
                ? "text-emerald-400"
                : "text-amber-300"
            }
          >
            {initial.status}
          </span>
          {initial.publishedAt && (
            <> · Published {new Date(initial.publishedAt).toLocaleString()}</>
          )}
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm text-gray-400">Title (source)</label>
        <input
          required
          value={titleSource}
          onChange={(e) => handleTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-gray-400">Slug</label>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value)
            }}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 font-mono text-sm text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-400">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as BlogCategory)}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white"
          >
            {BLOG_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-gray-400">
            Source language
          </label>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value as BlogLang)}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white"
          >
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            On publish, the other language is generated via DeepL.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-400">
            Cover URL (optional)
          </label>
          <input
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="/blog/cover.jpg"
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-400">Excerpt</label>
        <textarea
          value={excerptSource}
          onChange={(e) => setExcerptSource(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-400">
          Body (Markdown)
        </label>
        <textarea
          required
          value={bodyMdSource}
          onChange={(e) => setBodyMdSource(e.target.value)}
          rows={18}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 font-mono text-sm leading-relaxed text-white"
        />
      </div>

      <div className="flex flex-wrap gap-3 border-t border-gray-800 pt-4">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-600 disabled:opacity-50"
        >
          {busy ? "Working…" : submitLabel}
        </button>

        {onPublish && (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              run(async () => {
                await onSubmit({
                  slug,
                  category,
                  sourceLang,
                  titleSource,
                  excerptSource,
                  bodyMdSource,
                  coverUrl,
                })
                await onPublish()
              }, "Published (translated)")
            }
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500 disabled:opacity-50"
          >
            Publish & translate
          </button>
        )}

        {onRetranslate && initial?.status === "published" && (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              run(async () => {
                await onSubmit({
                  slug,
                  category,
                  sourceLang,
                  titleSource,
                  excerptSource,
                  bodyMdSource,
                  coverUrl,
                })
                await onRetranslate()
              }, "Retranslated")
            }
            className="rounded-lg border border-violet-500/40 px-4 py-2 text-sm text-violet-200 hover:bg-violet-500/10 disabled:opacity-50"
          >
            Retranslate
          </button>
        )}

        {onUnpublish && initial?.status === "published" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(onUnpublish, "Unpublished (draft)")}
            className="rounded-lg border border-amber-500/40 px-4 py-2 text-sm text-amber-200 hover:bg-amber-500/10 disabled:opacity-50"
          >
            Unpublish
          </button>
        )}
      </div>
    </form>
  )
}
