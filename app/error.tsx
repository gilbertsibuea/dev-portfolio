"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[app error]", error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center text-white">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="max-w-md text-sm text-white/60">
        A client error interrupted this page. You can try again — if it keeps happening, refresh the site.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm transition hover:bg-white/15"
      >
        Try again
      </button>
    </div>
  )
}
