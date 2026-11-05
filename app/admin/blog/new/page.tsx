"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BlogPostForm } from "@/components/admin/BlogPostForm"

export default function NewBlogPostPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("adminAuth")) {
      router.push("/admin")
      return
    }
    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link
            href="/admin/blog"
            className="text-sm text-gray-400 hover:text-white"
          >
            ← Blog
          </Link>
          <h1 className="mt-1 text-2xl font-bold">New post</h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <BlogPostForm
          submitLabel="Save draft"
          onSubmit={async (payload) => {
            const res = await fetch("/api/blog", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!data.success) throw new Error(data.error || "Create failed")
            router.push(`/admin/blog/edit/${data.post.id}`)
          }}
        />
      </main>
    </div>
  )
}
