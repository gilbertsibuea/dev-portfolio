"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  displayExcerpt,
  displayTitle,
  estimateReadingMinutes,
} from "@/lib/blog/format"
import type { BlogLang, BlogPostListItem } from "@/lib/blog/types"
import { BlogCategoryTabs } from "./BlogCategoryTabs"
import { LangToggle } from "./LangToggle"

type Props = {
  posts: BlogPostListItem[]
  category: string | null
  initialLang: BlogLang
}

export function BlogIndex({ posts, category, initialLang }: Props) {
  const router = useRouter()
  const [lang, setLang] = useState<BlogLang>(initialLang)

  return (
    <div>
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
          Writing
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-[family-name:var(--font-blog-display)] text-4xl leading-tight text-white md:text-5xl">
            Blog
          </h1>
          <LangToggle
            lang={lang}
            available={["en", "id"]}
            onChange={(next) => {
              setLang(next)
              router.refresh()
            }}
          />
        </div>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/50">
          Notes on life, places, and building things — in English and Bahasa
          Indonesia.
        </p>
      </header>

      <div className="mb-8 border-b border-white/10 pb-1">
        <BlogCategoryTabs active={category} />
      </div>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-white/40">
          Nothing in this category yet. Check back soon.
        </p>
      ) : (
        <ul className="divide-y divide-white/[0.07]">
          {posts.map((post) => {
            const title = displayTitle(post, lang)
            const excerpt = displayExcerpt(post, lang)
            const date = post.publishedAt || post.createdAt
            const minutes = estimateReadingMinutes(
              // Approximate from excerpt length when body not in list
              excerpt + " " + title
            )
            return (
              <li key={post.id}>
                <article>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex gap-4 py-7 transition-colors md:gap-8"
                  >
                    <div className="hidden w-10 shrink-0 flex-col items-center pt-1 text-white/35 md:flex">
                      <span className="tabular-nums text-sm">{post.score}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-white/35">
                        <span>{post.category}</span>
                        <span className="text-white/15">·</span>
                        <time dateTime={date}>
                          {new Date(date).toLocaleDateString(
                            lang === "id" ? "id-ID" : "en-GB",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </time>
                        <span className="text-white/15">·</span>
                        <span>{minutes} min</span>
                        <span className="md:hidden">· {post.score}</span>
                      </div>
                      <h2 className="mt-2 font-[family-name:var(--font-blog-display)] text-2xl text-white transition-colors group-hover:text-violet-200 md:text-[1.65rem]">
                        {title}
                      </h2>
                      {excerpt && (
                        <p className="mt-2 line-clamp-2 max-w-2xl text-[15px] leading-relaxed text-white/45">
                          {excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
