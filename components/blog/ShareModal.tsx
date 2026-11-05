"use client"

import { useCallback, useEffect, useId, useState } from "react"
import { FiCheck, FiCopy, FiMail, FiShare2, FiX } from "react-icons/fi"
import { FaWhatsapp } from "react-icons/fa"
import { blogPostUrl } from "@/lib/blog/seo"

type Props = {
  slug: string
  title: string
  initialShareCount: number
}

export function ShareModal({ slug, title, initialShareCount }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareCount, setShareCount] = useState(initialShareCount)
  const titleId = useId()

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/blog/${slug}`
      : blogPostUrl(slug)

  useEffect(() => {
    setShareCount(initialShareCount)
  }, [initialShareCount])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  const recordShare = useCallback(
    async (channel: "copy" | "whatsapp" | "email") => {
      try {
        const res = await fetch(`/api/blog/${slug}/share`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel }),
        })
        const data = await res.json()
        if (data.success && typeof data.shareCount === "number") {
          setShareCount(data.shareCount)
        }
      } catch {
        // counter is best-effort
      }
    },
    [slug]
  )

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      void recordShare("copy")
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // fallback
      window.prompt("Copy this link:", shareUrl)
    }
  }

  const shareWhatsApp = () => {
    void recordShare("whatsapp")
    const text = `${title}\n${shareUrl}`
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  const shareEmail = () => {
    void recordShare("email")
    const subject = title
    const body = `I thought you might like this:\n\n${title}\n${shareUrl}\n`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/60 transition hover:border-violet-400/30 hover:text-violet-200"
      >
        <FiShare2 className="text-sm" aria-hidden />
        Share
        {shareCount > 0 && (
          <span className="tabular-nums text-white/35">{shareCount}</span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            aria-label="Close share dialog"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#14122a] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.8)]">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <h2
                  id={titleId}
                  className="text-base font-medium text-white"
                >
                  Share this post
                </h2>
                <p className="mt-0.5 line-clamp-2 text-sm text-white/45">
                  {title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-white/40 transition hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-white/35">
                  Link
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    onFocus={(e) => e.currentTarget.select()}
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-white/80 outline-none focus:border-violet-400/40"
                  />
                  <button
                    type="button"
                    onClick={() => void copyLink()}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-400/30 bg-violet-500/15 px-3 py-2 text-sm text-violet-100 transition hover:bg-violet-500/25"
                  >
                    {copied ? <FiCheck /> : <FiCopy />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-5 pt-1">
                <button
                  type="button"
                  onClick={shareWhatsApp}
                  aria-label="Share on WhatsApp"
                  title="WhatsApp"
                  className="text-[#25D366] transition hover:scale-110 hover:brightness-110 active:scale-95"
                >
                  <FaWhatsapp className="text-[2rem]" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={shareEmail}
                  aria-label="Share by email"
                  title="Email"
                  className="text-[#EA4335] transition hover:scale-110 hover:brightness-110 active:scale-95"
                >
                  <FiMail className="text-[1.85rem]" aria-hidden />
                </button>
              </div>

              <p className="text-center text-[11px] text-white/30">
                Shared {shareCount} {shareCount === 1 ? "time" : "times"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
