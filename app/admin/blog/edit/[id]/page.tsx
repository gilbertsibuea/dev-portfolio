"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BlogPostForm } from "@/components/admin/BlogPostForm"
import type { BlogPost } from "@/lib/blog/types"

export default function EditBlogPostPage() {
  const router = useRouter()
  const params = useParams()
  const id = String(params.id)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!localStorage.getItem("adminAuth")) {
      router.push("/admin")
      return
    }
    setReady(true)
    ;(async () => {
      const res = await fetch(`/api/blog/${id}?admin=1`, { cache: "no-store" })
      const data = await res.json()
      if (!data.success) {
        setLoadError(data.error || "Not found")
        return
      }
      setPost(data.post)
    })()
  }, [router, id])

  if (!ready || (!post && !loadError)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading…
      </div>
    )
  }

  if (loadError || !post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
        <p>{loadError || "Not found"}</p>
        <Link href="/admin/blog" className="text-violet-300">
          ← Blog
        </Link>
      </div>
    )
  }

  const saveDraft = async (payload: {
    slug: string
    category: BlogPost["category"]
    sourceLang: BlogPost["sourceLang"]
    titleSource: string
    excerptSource: string
    bodyMdSource: string
    coverUrl: string
  }) => {
    const res = await fetch(`/api/blog/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, status: "draft" }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || "Save failed")
    setPost(data.post)
  }

  const action = async (name: "publish" | "retranslate" | "unpublish") => {
    const res = await fetch(`/api/blog/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: name }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || `${name} failed`)
    setPost(data.post)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="mx-auto max-w-[1400px] px-4 py-4">
          <Link
            href="/admin/blog"
            className="text-sm text-gray-400 hover:text-white"
          >
            ← Blog
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Edit post</h1>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-8">
        <BlogPostForm
          key={post.id + post.updatedAt}
          initial={post}
          submitLabel="Save draft"
          onSubmit={saveDraft}
          onPublish={() => action("publish")}
          onRetranslate={() => action("retranslate")}
          onUnpublish={() => action("unpublish")}
        />
      </main>
    </div>
  )
}
