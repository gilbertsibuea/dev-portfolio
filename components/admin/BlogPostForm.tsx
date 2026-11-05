"use client"

import { useRef, useState } from "react"
import { BLOG_CATEGORIES, type BlogCategory } from "@/lib/blog/categories"
import { estimateReadingMinutes } from "@/lib/blog/format"
import type { BlogLang, BlogPost } from "@/lib/blog/types"
import { MarkdownBody } from "@/components/blog/MarkdownBody"
import { BlogMarkdownEditor } from "@/components/admin/BlogMarkdownEditor"
import "@/app/blog/blog.css"

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
  const [uploadingCover, setUploadingCover] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const handleTitle = (v: string) => {
    setTitleSource(v)
    if (!slugTouched) setSlug(slugFromTitle(v))
  }

  const payload = (): BlogFormPayload => ({
    slug,
    category,
    sourceLang,
    titleSource,
    excerptSource,
    bodyMdSource,
    coverUrl,
  })

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

  const uploadCover = async (file: File) => {
    setUploadingCover(true)
    setError(null)
    try {
      const body = new FormData()
      body.append("file", file)
      body.append("folder", "blog")
      const res = await fetch("/api/upload", { method: "POST", body })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Cover upload failed")
      setCoverUrl(data.imageUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cover upload failed")
    } finally {
      setUploadingCover(false)
    }
  }

  const minutes = estimateReadingMinutes(bodyMdSource || titleSource)
  const previewDate = initial?.publishedAt || new Date().toISOString()

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        if (!bodyMdSource.trim()) {
          setError("Body content is required")
          return
        }
        run(async () => {
          await onSubmit(payload())
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

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ── Editor column ── */}
        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-sm text-gray-400">
              Title (source)
            </label>
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
                Cover image
              </label>
              <div className="flex gap-2">
                <input
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="/uploads/blog/…"
                  className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                />
                <button
                  type="button"
                  disabled={uploadingCover || busy}
                  onClick={() => coverInputRef.current?.click()}
                  className="shrink-0 rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 disabled:opacity-50"
                >
                  {uploadingCover ? "…" : "Upload"}
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void uploadCover(file)
                    e.target.value = ""
                  }}
                />
              </div>
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
            <div className="mb-1 flex items-center justify-between gap-3">
              <label className="block text-sm text-gray-400">Body</label>
              <span className="text-[11px] text-gray-500">
                Drag, paste, or use the image button · saved as Markdown
              </span>
            </div>
            <BlogMarkdownEditor
              value={bodyMdSource}
              onChange={setBodyMdSource}
              disabled={busy}
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
                    await onSubmit(payload())
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
                    await onSubmit(payload())
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
        </div>

        {/* ── Live preview column ── */}
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
              Live preview
            </p>
            <span className="text-[11px] text-gray-600">
              How it appears on /blog
            </span>
          </div>
          <div className="blog-shell max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl border border-white/10 scrollbar-modern">
            <div className="px-5 py-8 md:px-8 md:py-10">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-white/35">
                <span>{category}</span>
                <span className="text-white/15">·</span>
                <time dateTime={previewDate}>
                  {new Date(previewDate).toLocaleDateString(
                    sourceLang === "id" ? "id-ID" : "en-GB",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </time>
                <span className="text-white/15">·</span>
                <span>{minutes} min read</span>
              </div>

              <h1 className="mt-4 font-[family-name:var(--font-blog-display),Georgia,serif] text-[1.85rem] leading-[1.15] tracking-tight text-white md:text-4xl">
                {titleSource.trim() || "Untitled post"}
              </h1>

              <p className="mt-3 text-sm text-white/40">
                By{" "}
                <span className="text-white/60">Gilbert Sibuea</span>
              </p>

              {excerptSource.trim() && (
                <p className="mt-5 text-base leading-relaxed text-white/50 md:text-lg">
                  {excerptSource}
                </p>
              )}

              {coverUrl.trim() && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverUrl}
                  alt={titleSource || "Cover"}
                  className="mt-8 w-full border-y border-white/10 object-cover"
                />
              )}

              {bodyMdSource.trim() ? (
                <MarkdownBody markdown={bodyMdSource} className="mt-8" />
              ) : (
                <p className="mt-10 text-sm text-white/30">
                  Start writing on the left — the article preview updates live.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </form>
  )
}
