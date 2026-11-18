import { del } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fileUrl = searchParams.get("url")

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: "No file URL provided" },
        { status: 400 }
      )
    }

    // Vercel Blob URLs
    if (
      fileUrl.includes("blob.vercel-storage.com") ||
      fileUrl.includes("public.blob.vercel-storage.com")
    ) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
          { success: false, error: "Blob storage not configured" },
          { status: 503 }
        )
      }
      await del(fileUrl)
      return NextResponse.json({
        success: true,
        message: "File deleted successfully",
      })
    }

    // Local filesystem (legacy /uploads/...)
    const relative = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl
    if (!relative.startsWith("uploads/")) {
      return NextResponse.json(
        { success: false, error: "Invalid file URL" },
        { status: 400 }
      )
    }

    const filePath = path.join(process.cwd(), "public", relative)
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      )
    }

    fs.unlinkSync(filePath)
    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 }
    )
  }
}
