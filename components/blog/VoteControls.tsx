"use client"

import { useCallback, useEffect, useState } from "react"
import type { BlogVoteValue } from "@/lib/blog/types"

type Props = {
  slug: string
  initialScore: number
  compact?: boolean
}

export function VoteControls({ slug, initialScore, compact }: Props) {
  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState<BlogVoteValue | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/blog/${slug}/vote`, { cache: "no-store" })
        const data = await res.json()
        if (!cancelled && data.success) {
          setScore(data.score)
          setUserVote(data.userVote)
        }
      } catch {
        // ignore
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  const cast = useCallback(
    async (value: BlogVoteValue) => {
      if (busy) return
      setBusy(true)
      const next = userVote === value ? 0 : value
      try {
        const res = await fetch(`/api/blog/${slug}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: next }),
        })
        const data = await res.json()
        if (data.success) {
          setScore(data.score)
          setUserVote(data.userVote)
        }
      } finally {
        setBusy(false)
      }
    },
    [busy, slug, userVote]
  )

  const shell = compact
    ? "inline-flex items-center gap-1.5"
    : "flex flex-col items-center gap-1"

  return (
    <div className={shell} aria-label="Vote">
      <button
        type="button"
        disabled={busy}
        onClick={() => cast(1)}
        aria-label="Upvote"
        aria-pressed={userVote === 1}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
          userVote === 1
            ? "bg-violet-500/25 text-violet-200"
            : "text-white/40 hover:bg-white/5 hover:text-white/80"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
          <path d="M7 2.5L12 9.5H2L7 2.5Z" />
        </svg>
      </button>
      <span
        className={`min-w-[1.5rem] text-center tabular-nums text-sm ${
          score > 0
            ? "text-violet-200"
            : score < 0
              ? "text-rose-300/80"
              : "text-white/50"
        }`}
      >
        {score}
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={() => cast(-1)}
        aria-label="Downvote"
        aria-pressed={userVote === -1}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
          userVote === -1
            ? "bg-rose-500/20 text-rose-200"
            : "text-white/40 hover:bg-white/5 hover:text-white/80"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
          <path d="M7 11.5L2 4.5H12L7 11.5Z" />
        </svg>
      </button>
    </div>
  )
}
