import { NextRequest, NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"
import {
    createExperiencePanel,
    getAllExperiencePanels,
    type ExperienceJob,
} from "@/lib/db/experience"

initializeDatabase()

export async function GET() {
    try {
        const panels = await getAllExperiencePanels()
        return NextResponse.json({
            success: true,
            panels,
            count: panels.length,
        })
    } catch (error) {
        console.error("Error fetching experience panels:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch experience panels" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        if (!data.slug || !data.kind || !Array.isArray(data.jobs) || data.jobs.length === 0) {
            return NextResponse.json(
                { success: false, error: "Missing required fields: slug, kind, jobs" },
                { status: 400 }
            )
        }

        if (data.kind !== "feature" && data.kind !== "stack") {
            return NextResponse.json(
                { success: false, error: "kind must be 'feature' or 'stack'" },
                { status: 400 }
            )
        }

        const jobs = data.jobs as ExperienceJob[]
        const panel = await createExperiencePanel({
            slug: String(data.slug).trim(),
            kind: data.kind,
            sortOrder:
                typeof data.sortOrder === "number" ? data.sortOrder : undefined,
            jobs,
        })

        if (!panel) {
            return NextResponse.json(
                { success: false, error: "Failed to create experience panel" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "Experience panel created",
            panel,
        })
    } catch (error) {
        console.error("Error creating experience panel:", error)
        return NextResponse.json(
            { success: false, error: "Failed to create experience panel" },
            { status: 500 }
        )
    }
}
