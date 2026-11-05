"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import type { BlogComment } from "@/lib/blog/types"

type Props = {
  slug: string
}

export function CommentThread({ slug }: Props) {
  const [comments, setComments] = useState<BlogComment[]>([])
  const [authorName, setAuthorName] = useState("")
  const [body, setBody] = useState("")
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch(`/api/blog/${slug}/comments`, { cache: "no-store" })
    const data = await res.json()
    if (data.success) setComments(data.comments)
  }, [slug])

  useEffect(() => {
    load()
    const stored = localStorage.getItem("blog_display_name")
    if (stored) setAuthorName(stored)
  }, [load])

  const roots = useMemo(
    () => comments.filter((c) => c.parentId == null),
    [comments]
  )
  const repliesOf = useCallback(
    (id: number) => comments.filter((c) => c.parentId === id),
    [comments]
  )

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      localStorage.setItem("blog_display_name", authorName.trim())
      const res = await fetch(`/api/blog/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName,
          body,
          parentId: replyTo,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || "Failed to post")
        return
      }
      setBody("")
      setReplyTo(null)
      await load()
    } catch {
      setError("Failed to post")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mt-16 border-t border-white/10 pt-10" id="comments">
      <h2 className="font-[family-name:var(--font-blog-display)] text-2xl text-white">
        Comments
      </h2>
      <p className="mt-1 text-sm text-white/40">
        No account needed. Keep it civil.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        {replyTo != null && (
          <p className="text-xs text-violet-300/80">
            Replying to comment #{replyTo}{" "}
            <button
              type="button"
              className="underline"
              onClick={() => setReplyTo(null)}
            >
              cancel
            </button>
          </p>
        )}
        <input
          required
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Display name"
          maxLength={40}
          className="w-full max-w-xs rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none"
        />
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment…"
          rows={3}
          maxLength={2000}
          className="w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm leading-relaxed text-white placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none"
        />
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded-md border border-violet-400/30 bg-violet-500/15 px-4 py-2 text-sm text-violet-100 transition hover:bg-violet-500/25 disabled:opacity-50"
        >
          {busy ? "Posting…" : "Post comment"}
        </button>
      </form>

      <ul className="mt-10 space-y-6">
        {roots.length === 0 && (
          <li className="text-sm text-white/35">No comments yet.</li>
        )}
        {roots.map((c) => (
          <li key={c.id} className="border-t border-white/[0.06] pt-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-white/85">
                {c.authorName}
              </span>
              <time className="text-[11px] text-white/30">
                {new Date(c.createdAt).toLocaleString()}
              </time>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-white/70">
              {c.body}
            </p>
            <button
              type="button"
              onClick={() => setReplyTo(c.id)}
              className="mt-2 text-xs text-white/35 hover:text-violet-300"
            >
              Reply
            </button>
            <ul className="mt-4 space-y-4 border-l border-white/10 pl-4">
              {repliesOf(c.id).map((r) => (
                <li key={r.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-white/80">
                      {r.authorName}
                    </span>
                    <time className="text-[11px] text-white/30">
                      {new Date(r.createdAt).toLocaleString()}
                    </time>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed text-white/65">
                    {r.body}
                  </p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}
