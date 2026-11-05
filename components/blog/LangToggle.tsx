"use client"

import type { BlogLang } from "@/lib/blog/types"

type Props = {
  lang: BlogLang
  available: BlogLang[]
  onChange: (lang: BlogLang) => void
}

function FlagEN({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" strokeWidth="8" />
      <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" strokeWidth="5" />
      <path d="M30 0 V40 M0 20 H60" stroke="#fff" strokeWidth="12" />
      <path d="M30 0 V40 M0 20 H60" stroke="#C8102E" strokeWidth="7" />
    </svg>
  )
}

function FlagID({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="60" height="20" fill="#CE1126" />
      <rect y="20" width="60" height="20" fill="#fff" />
    </svg>
  )
}

const FLAGS: Record<
  BlogLang,
  { label: string; Flag: typeof FlagEN }
> = {
  en: { label: "English", Flag: FlagEN },
  id: { label: "Bahasa Indonesia", Flag: FlagID },
}

export function LangToggle({ lang, available, onChange }: Props) {
  const setLang = async (next: BlogLang) => {
    if (next === lang) return
    onChange(next)
    try {
      await fetch("/api/blog/lang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: next }),
      })
    } catch {
      // Cookie set is best-effort
    }
  }

  return (
    <div
      className="inline-flex items-center gap-1.5"
      role="group"
      aria-label="Language"
    >
      {(["en", "id"] as BlogLang[]).map((code) => {
        const enabled = available.includes(code)
        const active = lang === code
        const { label, Flag } = FLAGS[code]
        return (
          <button
            key={code}
            type="button"
            disabled={!enabled}
            onClick={() => setLang(code)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className={`relative overflow-hidden rounded-md border transition ${
              active
                ? "border-violet-300/70 ring-2 ring-violet-400/40"
                : enabled
                  ? "border-white/15 opacity-70 hover:opacity-100 hover:border-white/30"
                  : "cursor-not-allowed border-white/10 opacity-25"
            }`}
          >
            <Flag className="h-5 w-[30px] block" />
          </button>
        )
      })}
    </div>
  )
}
