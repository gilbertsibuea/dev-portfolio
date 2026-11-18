"use client"

import { upload } from "@vercel/blob/client"

export type UploadFolder = "projects" | "blog"

type UploadAdminFileOptions = {
  folder?: UploadFolder
  onProgress?: (percent: number) => void
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/webm",
  "video/mp4",
  "video/mov",
  "video/quicktime",
] as const

function assertAllowed(file: File) {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    throw new Error(
      "Invalid file type. Only JPG, PNG, GIF, WebP, WebM, MP4, and MOV are allowed."
    )
  }

  let maxSize = 5 * 1024 * 1024
  if (file.type.startsWith("video/")) maxSize = 50 * 1024 * 1024
  else if (file.type === "image/gif") maxSize = 10 * 1024 * 1024

  if (file.size > maxSize) {
    const label = file.type.startsWith("video/")
      ? "50MB"
      : file.type === "image/gif"
        ? "10MB"
        : "5MB"
    throw new Error(`File size exceeds ${label} limit`)
  }
}

function safeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_")
}

/**
 * Upload media for admin forms.
 * Uses Vercel Blob client uploads so large videos bypass the 4.5MB
 * Vercel Function body limit (which caused HTTP 413).
 * Falls back to local /api/upload FormData when Blob is not configured (local dev).
 */
export async function uploadAdminFile(
  file: File,
  options: UploadAdminFileOptions = {}
): Promise<string> {
  assertAllowed(file)

  const folder = options.folder ?? "projects"
  const pathname = `${folder}/${safeFileName(file.name)}`
  const adminAuth =
    typeof window !== "undefined" ? localStorage.getItem("adminAuth") : null

  try {
    const blob = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      multipart: file.size > 4 * 1024 * 1024,
      contentType: file.type || undefined,
      clientPayload: JSON.stringify({ folder }),
      headers: {
        "x-admin-auth": adminAuth === "true" ? "true" : "",
      },
      onUploadProgress: ({ percentage }) => {
        options.onProgress?.(Math.round(percentage))
      },
    })
    options.onProgress?.(100)
    return blob.url
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const blobMissing =
      /not configured|BLOB_READ_WRITE_TOKEN|No token|blob store/i.test(message)

    if (!blobMissing) throw err

    // Local/dev filesystem fallback (works under next start locally; not for large files on Vercel)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)

    const res = await fetch("/api/upload", { method: "POST", body: formData })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.success || !data.imageUrl) {
      throw new Error(
        (data && data.error) ||
          "Upload failed. Create a Vercel Blob store and set BLOB_READ_WRITE_TOKEN."
      )
    }
    options.onProgress?.(100)
    return data.imageUrl as string
  }
}
