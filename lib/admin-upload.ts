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
  // Some browsers leave type empty for .mov / odd containers — infer from extension
  const type =
    file.type ||
    (/\.webm$/i.test(file.name)
      ? "video/webm"
      : /\.mp4$/i.test(file.name)
        ? "video/mp4"
        : /\.mov$/i.test(file.name)
          ? "video/quicktime"
          : /\.gif$/i.test(file.name)
            ? "image/gif"
            : "")

  if (!type || !ALLOWED_TYPES.includes(type as (typeof ALLOWED_TYPES)[number])) {
    throw new Error(
      "Invalid file type. Only JPG, PNG, GIF, WebP, WebM, MP4, and MOV are allowed."
    )
  }

  let maxSize = 5 * 1024 * 1024
  if (type.startsWith("video/")) maxSize = 50 * 1024 * 1024
  else if (type === "image/gif") maxSize = 10 * 1024 * 1024

  if (file.size > maxSize) {
    const label = type.startsWith("video/")
      ? "50MB"
      : type === "image/gif"
        ? "10MB"
        : "5MB"
    throw new Error(`File size exceeds ${label} limit`)
  }

  return type
}

function safeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_")
}

async function getUploadStatus(): Promise<{
  blobConfigured: boolean
  vercel: boolean
}> {
  try {
    const res = await fetch("/api/upload", { method: "GET", cache: "no-store" })
    if (!res.ok) return { blobConfigured: false, vercel: false }
    return (await res.json()) as { blobConfigured: boolean; vercel: boolean }
  } catch {
    return { blobConfigured: false, vercel: false }
  }
}

async function uploadViaFormData(
  file: File,
  folder: UploadFolder,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)

    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return
      onProgress?.(Math.max(1, Math.round((event.loaded / event.total) * 100)))
    })

    xhr.addEventListener("load", () => {
      let data: { success?: boolean; imageUrl?: string; error?: string } = {}
      try {
        data = JSON.parse(xhr.responseText)
      } catch {
        /* ignore */
      }

      if (xhr.status >= 200 && xhr.status < 300 && data.success && data.imageUrl) {
        onProgress?.(100)
        resolve(data.imageUrl)
        return
      }

      reject(
        new Error(
          data.error ||
            (xhr.status === 413
              ? "File too large for direct upload on Vercel. Configure Vercel Blob (BLOB_READ_WRITE_TOKEN)."
              : `Upload failed (${xhr.status})`)
        )
      )
    })

    xhr.addEventListener("error", () => reject(new Error("Upload network error")))
    xhr.open("POST", "/api/upload")
    xhr.send(formData)
  })
}

/**
 * Upload media for admin forms.
 *
 * On Vercel, Function bodies are hard-capped at 4.5MB — large videos must go
 * browser → Vercel Blob (client upload). Older project videos worked because they
 * were saved under public/uploads and committed to git, then served as static files.
 */
export async function uploadAdminFile(
  file: File,
  options: UploadAdminFileOptions = {}
): Promise<string> {
  const contentType = assertAllowed(file)
  const folder = options.folder ?? "projects"
  const pathname = `${folder}/${safeFileName(file.name)}`
  const onProgress = options.onProgress

  onProgress?.(1)

  const status = await getUploadStatus()

  // Large files on Vercel require Blob — fail fast with a clear message
  if (status.vercel && file.size > 4.5 * 1024 * 1024 && !status.blobConfigured) {
    throw new Error(
      "Vercel Blob is not configured. Open Vercel → Storage → Create Blob, add BLOB_READ_WRITE_TOKEN, redeploy, then try again."
    )
  }

  if (status.blobConfigured) {
    onProgress?.(5)
    try {
      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        // Multipart only helps very large files; keep simple PUT for ≤50MB
        multipart: file.size > 100 * 1024 * 1024,
        contentType,
        clientPayload: JSON.stringify({ folder }),
        onUploadProgress: ({ percentage }) => {
          // Map 0–100 blob progress into 5–100 so the bar moves off 0 immediately
          onProgress?.(Math.max(5, Math.min(99, Math.round(percentage))))
        },
      })
      onProgress?.(100)
      return blob.url
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (/Failed to\s+retrieve the client token/i.test(message)) {
        throw new Error(
          "Could not start Blob upload (token failed). Check BLOB_READ_WRITE_TOKEN in Vercel env and redeploy."
        )
      }
      throw err instanceof Error ? err : new Error(message)
    }
  }

  // Local / small-file path
  return uploadViaFormData(file, folder, onProgress)
}
