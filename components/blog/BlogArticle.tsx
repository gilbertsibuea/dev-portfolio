"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { estimateReadingMinutes } from "@/lib/blog/format"
import type { BlogLang, LocalizedPost } from "@/lib/blog/types"
import { CommentThread } from "./CommentThread"
import { LangToggle } from "./LangToggle"
import { MarkdownBody } from "./MarkdownBody"
import { ReadingProgress } from "./ReadingProgress"
import { ShareModal } from "./ShareModal"
import { VoteControls } from "./VoteControls"

type Props = {
  post: LocalizedPost
  initialLang: BlogLang
}

export function BlogArticle({ post, initialLang }: Props) {
  const router = useRouter()
  const minutes = estimateReadingMinutes(post.bodyMd)
  const date = post.publishedAt

  const switchLang = async (next: BlogLang) => {
    try {
      await fetch("/api/blog/lang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: next }),
      })
    } catch {
      // best-effort cookie
    }
    router.push(`/blog/${post.slug}?lang=${next}`)
    router.refresh()
  }

  return (
    <>
      <ReadingProgress />
      <article className="relative">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/blog"
            className="text-xs uppercase tracking-[0.16em] text-white/40 transition hover:text-white/70"
          >
            ← Blog
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <LangToggle
              lang={initialLang}
              available={post.availableLangs}
              onChange={switchLang}
            />
            <ShareModal
              slug={post.slug}
              title={post.title}
              initialShareCount={post.shareCount}
            />
          </div>
        </div>

        <div className="flex gap-6 md:gap-10">
          <aside className="sticky top-24 hidden h-fit shrink-0 md:block">
            <VoteControls slug={post.slug} initialScore={post.score} />
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-white/35">
              <Link
                href={`/blog?category=${encodeURIComponent(post.category)}`}
                className="hover:text-violet-300"
              >
                {post.category}
              </Link>
              {date && (
                <>
                  <span className="text-white/15">·</span>
                  <time dateTime={date}>
                    {new Date(date).toLocaleDateString(
                      post.lang === "id" ? "id-ID" : "en-GB",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </time>
                </>
              )}
              <span className="text-white/15">·</span>
              <span>{minutes} min read</span>
            </div>

            <h1 className="mt-4 font-[family-name:var(--font-blog-display)] text-[2.15rem] leading-[1.15] tracking-tight text-white md:text-5xl">
              {post.title}
            </h1>

            <p className="mt-3 text-sm text-white/40">
              By{" "}
              <a
                href="https://www.gilbertsibuea.id"
                className="text-white/60 transition hover:text-violet-300"
                rel="author"
              >
                Gilbert Sibuea
              </a>
            </p>

            {post.excerpt && (
              <p className="mt-5 max-w-[42rem] text-lg leading-relaxed text-white/50">
                {post.excerpt}
              </p>
            )}

            {post.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverUrl}
                alt={post.title}
                className="mt-10 w-full border-y border-white/10 object-cover"
              />
            )}

            <div className="mt-6 flex items-center gap-3 border-y border-white/10 py-3 md:hidden">
              <VoteControls
                slug={post.slug}
                initialScore={post.score}
                compact
              />
              <span className="text-xs text-white/35">Vote</span>
            </div>

            <MarkdownBody markdown={post.bodyMd} className="mt-10" />

            <CommentThread slug={post.slug} />
          </div>
        </div>
      </article>
    </>
  )
}
