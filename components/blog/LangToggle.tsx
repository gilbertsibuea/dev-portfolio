"use client"

import type { BlogLang } from "@/lib/blog/types"

type Props = {
  lang: BlogLang
  available: BlogLang[]
  onChange: (lang: BlogLang) => void
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
      className="inline-flex items-center gap-0 text-xs tracking-[0.18em] uppercase text-white/45"
      role="group"
      aria-label="Language"
    >
      {(["en", "id"] as BlogLang[]).map((code, i) => {
        const enabled = available.includes(code)
        const active = lang === code
        return (
          <span key={code} className="inline-flex items-center">
            {i > 0 && <span className="mx-1.5 text-white/20">|</span>}
            <button
              type="button"
              disabled={!enabled}
              onClick={() => setLang(code)}
              className={`transition-colors ${
                active
                  ? "text-violet-300"
                  : enabled
                    ? "hover:text-white/80"
                    : "cursor-not-allowed opacity-30"
              }`}
            >
              {code}
            </button>
          </span>
        )
      })}
    </div>
  )
}
