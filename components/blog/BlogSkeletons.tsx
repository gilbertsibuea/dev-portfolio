import { BLOG_CATEGORIES } from "@/lib/blog/categories"

function Bone({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block animate-pulse rounded-md bg-white/[0.07] ${className}`}
      aria-hidden
    />
  )
}

export function BlogIndexSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading posts">
      <header className="mb-10">
        <Bone className="h-2.5 w-16" />
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <Bone className="h-11 w-36 md:h-12 md:w-44" />
          <Bone className="h-4 w-16" />
        </div>
        <Bone className="mt-4 h-4 w-full max-w-xl" />
        <Bone className="mt-2 h-4 w-2/3 max-w-md" />
      </header>

      <div className="mb-8 flex gap-1 overflow-hidden border-b border-white/10 pb-3">
        {["All", ...BLOG_CATEGORIES].map((tab) => (
          <Bone key={tab} className="h-7 w-20 shrink-0" />
        ))}
      </div>

      <ul className="divide-y divide-white/[0.07]">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex gap-4 py-7 md:gap-8">
            <Bone className="mt-1 hidden h-4 w-8 shrink-0 md:block" />
            <div className="min-w-0 flex-1 space-y-3">
              <Bone className="h-2.5 w-48" />
              <Bone className={i % 2 ? "h-7 w-4/5" : "h-7 w-3/5"} />
              <Bone className="h-4 w-full max-w-2xl" />
              <Bone className="h-4 w-2/3 max-w-xl" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function BlogArticleSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading article">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Bone className="h-3 w-16" />
        <Bone className="h-3 w-14" />
      </div>

      <div className="flex gap-6 md:gap-10">
        <div className="hidden w-10 shrink-0 flex-col items-center gap-2 md:flex">
          <Bone className="h-8 w-8 rounded-md" />
          <Bone className="h-4 w-6" />
          <Bone className="h-8 w-8 rounded-md" />
        </div>

        <div className="min-w-0 flex-1">
          <Bone className="h-2.5 w-56" />
          <Bone className="mt-5 h-12 w-full max-w-xl md:h-14" />
          <Bone className="mt-3 h-10 w-4/5 max-w-lg" />
          <Bone className="mt-6 h-5 w-full max-w-xl" />
          <Bone className="mt-2 h-5 w-5/6 max-w-lg" />

          <div className="mt-10 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Bone
                key={i}
                className={i % 3 === 2 ? "h-4 w-3/4" : "h-4 w-full"}
              />
            ))}
            <Bone className="mt-6 h-4 w-full" />
            <Bone className="h-4 w-5/6" />
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-2/3" />
          </div>

          <div className="mt-16 border-t border-white/10 pt-10">
            <Bone className="h-7 w-40" />
            <Bone className="mt-2 h-3 w-48" />
            <Bone className="mt-6 h-10 w-48" />
            <Bone className="mt-3 h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
