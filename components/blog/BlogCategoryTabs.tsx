"use client"

import Link from "next/link"
import { BLOG_CATEGORIES } from "@/lib/blog/categories"

type Props = {
  active: string | null
}

const TABS = ["All", ...BLOG_CATEGORIES] as const

export function BlogCategoryTabs({ active }: Props) {
  const current = active || "All"

  return (
    <nav
      className="blog-category-tabs -mx-1 flex gap-1 overflow-x-auto pb-1 scrollbar-hide"
      aria-label="Filter by category"
    >
      {TABS.map((tab) => {
        const isActive = current === tab
        const href =
          tab === "All"
            ? "/blog"
            : `/blog?category=${encodeURIComponent(tab)}`
        return (
          <Link
            key={tab}
            href={href}
            scroll={false}
            className={`relative shrink-0 px-3 py-2 text-sm transition-colors ${
              isActive
                ? "text-white"
                : "text-white/45 hover:text-white/75"
            }`}
          >
            {tab}
            {isActive && (
              <span
                className="absolute inset-x-2 bottom-0 h-px bg-violet-400/80"
                aria-hidden
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
