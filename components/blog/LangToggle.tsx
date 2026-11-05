"use client"

import { BLOG_LANGUAGES } from "@/lib/blog/languages"
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

  const options = BLOG_LANGUAGES.filter((entry) =>
    available.includes(entry.code)
  )

  // Keep current value selectable even if temporarily unavailable
  const value = options.some((o) => o.code === lang)
    ? lang
    : options[0]?.code ?? lang

  return (
    <label className="inline-flex items-center gap-2 text-xs text-white/40">
      <span className="sr-only">Language</span>
      <select
        value={value}
        aria-label="Language"
        onChange={(e) => setLang(e.target.value as BlogLang)}
        className="appearance-none rounded-md border border-white/15 bg-white/[0.04] py-1.5 pl-2.5 pr-7 text-xs font-medium tracking-wide text-white/80 outline-none transition hover:border-white/25 hover:text-white focus:border-violet-400/40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.45)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.5rem center",
        }}
      >
        {options.map((entry) => (
          <option
            key={entry.code}
            value={entry.code}
            className="bg-[#14122a] text-white"
          >
            {entry.label}
          </option>
        ))}
      </select>
    </label>
  )
}
