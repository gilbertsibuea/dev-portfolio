"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { BlogPost } from "@/lib/blog/types"

export default function AdminBlogPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState(false)

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/blog?admin=1", { cache: "no-store" })
      const data = await res.json()
      if (data.success) setPosts(data.posts)
    } catch {
      setMessage("Failed to load posts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!localStorage.getItem("adminAuth")) {
      router.push("/admin")
      return
    }
    setAuthenticated(true)
    fetchPosts()
  }, [router, fetchPosts])

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this post permanently?")) return
    const res = await fetch(`/api/blog/${id}`, { method: "DELETE" })
    const data = await res.json()
    if (data.success) {
      setMessage("Post deleted")
      fetchPosts()
    } else {
      setMessage(data.error || "Delete failed")
    }
  }

  if (!authenticated || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <Link
              href="/admin/dashboard"
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Dashboard
            </Link>
            <h1 className="mt-1 text-2xl font-bold">Blog</h1>
          </div>
          <Link
            href="/admin/blog/new"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm hover:bg-violet-500"
          >
            New post
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {message && (
          <p className="mb-4 text-sm text-gray-300">{message}</p>
        )}

        {posts.length === 0 ? (
          <p className="text-gray-400">No posts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-800 text-gray-400">
                <tr>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Lang</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-gray-900">
                    <td className="py-3 pr-4">
                      <div className="font-medium">{post.titleSource}</div>
                      <div className="font-mono text-xs text-gray-500">
                        /blog/{post.slug}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-300">{post.category}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          post.status === "published"
                            ? "text-emerald-400"
                            : "text-amber-300"
                        }
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 uppercase text-gray-400">
                      {post.sourceLang}
                    </td>
                    <td className="py-3 pr-4 tabular-nums">{post.score}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/blog/edit/${post.id}`}
                          className="text-violet-300 hover:underline"
                        >
                          Edit
                        </Link>
                        {post.status === "published" && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="text-gray-400 hover:underline"
                          >
                            View
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(post.id)}
                          className="text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
