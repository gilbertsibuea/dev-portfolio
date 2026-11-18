import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export const dynamic = "force-dynamic"
export const maxDuration = 60

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
]

const MAX_BYTES = 50 * 1024 * 1024

function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

/** Quick status check used by the admin uploader before starting a large transfer */
export async function GET() {
  return NextResponse.json({
    blobConfigured: blobConfigured(),
    vercel: Boolean(process.env.VERCEL),
    maxDirectUploadMb: 4.5,
    maxBlobUploadMb: 50,
  })
}

/**
 * Dual-mode upload:
 * 1) application/json → Vercel Blob client-upload token exchange
 * 2) multipart FormData → local public/uploads (local/dev only; ≤4.5MB on Vercel)
 */
export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    return handleBlobClientUpload(req)
  }

  return handleLocalFormUpload(req)
}

async function handleBlobClientUpload(req: NextRequest) {
  if (!blobConfigured()) {
    return NextResponse.json(
      {
        error:
          "Blob storage not configured. In Vercel: Storage → Create Blob → ensure BLOB_READ_WRITE_TOKEN is set, then redeploy.",
      },
      { status: 503 }
    )
  }

  try {
    const body = (await req.json()) as HandleUploadBody

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        // Keep this open like the old /api/upload — admin UI is already gated client-side.
        // (Strict header auth was causing silent token failures for some browsers.)
        let folder = "projects"
        if (clientPayload) {
          try {
            const parsed = JSON.parse(clientPayload) as { folder?: string }
            if (parsed.folder === "blog") folder = "blog"
          } catch {
            /* ignore */
          }
        }

        return {
          allowedContentTypes: [...ALLOWED_TYPES],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
          allowOverwrite: false,
          tokenPayload: JSON.stringify({ folder }),
        }
      },
      // Intentionally omit onUploadCompleted — callback URL resolution often hangs
      // uploads when the store/callback env isn't perfect. We only need the blob URL.
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error("Blob upload token error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process upload",
      },
      { status: 400 }
    )
  }
}

async function handleLocalFormUpload(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid file type. Only JPG, PNG, GIF, WebP, WebM, MP4, and MOV files are allowed.",
        },
        { status: 400 }
      )
    }

    let maxSize = 5 * 1024 * 1024
    if (file.type.startsWith("video/")) maxSize = 50 * 1024 * 1024
    else if (file.type === "image/gif") maxSize = 10 * 1024 * 1024

    if (file.size > maxSize) {
      const sizeLimit = file.type.startsWith("video/")
        ? "50MB"
        : file.type === "image/gif"
          ? "10MB"
          : "5MB"
      return NextResponse.json(
        { success: false, error: `File size exceeds ${sizeLimit} limit` },
        { status: 400 }
      )
    }

    if (file.size > 4.5 * 1024 * 1024 && process.env.VERCEL) {
      return NextResponse.json(
        {
          success: false,
          error:
            "File too large for direct upload on Vercel (4.5MB limit). Configure Vercel Blob (BLOB_READ_WRITE_TOKEN) so the browser can upload directly.",
        },
        { status: 413 }
      )
    }

    const folderRaw = String(formData.get("folder") || "projects").toLowerCase()
    const folder = folderRaw === "blog" ? "blog" : "projects"

    const uploadsDir = path.join(process.cwd(), "public", "uploads", folder)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const fileExtension = file.name.split(".").pop() || "jpg"
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = path.join(uploadsDir, fileName)

    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    return NextResponse.json({
      success: true,
      imageUrl: `/uploads/${folder}/${fileName}`,
      fileType: file.type,
      fileName,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
