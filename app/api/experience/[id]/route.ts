import { NextRequest, NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"
import {
    deleteExperiencePanel,
    getExperiencePanelById,
    updateExperiencePanel,
    type ExperienceJob,
} from "@/lib/db/experience"

initializeDatabase()

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
    try {
        const { id: idParam } = await context.params
        const id = parseInt(idParam, 10)
        if (Number.isNaN(id)) {
            return NextResponse.json(
                { success: false, error: "Invalid id" },
                { status: 400 }
            )
        }

        const panel = await getExperiencePanelById(id)
        if (!panel) {
            return NextResponse.json(
                { success: false, error: "Panel not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, panel })
    } catch (error) {
        console.error("Error fetching experience panel:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch panel" },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { id: idParam } = await context.params
        const id = parseInt(idParam, 10)
        if (Number.isNaN(id)) {
            return NextResponse.json(
                { success: false, error: "Invalid id" },
                { status: 400 }
            )
        }

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

        const panel = await updateExperiencePanel(id, {
            slug: String(data.slug).trim(),
            kind: data.kind,
            sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
            jobs: data.jobs as ExperienceJob[],
        })

        if (!panel) {
            return NextResponse.json(
                { success: false, error: "Failed to update panel" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "Experience panel updated",
            panel,
        })
    } catch (error) {
        console.error("Error updating experience panel:", error)
        return NextResponse.json(
            { success: false, error: "Failed to update panel" },
            { status: 500 }
        )
    }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
    try {
        const { id: idParam } = await context.params
        const id = parseInt(idParam, 10)
        if (Number.isNaN(id)) {
            return NextResponse.json(
                { success: false, error: "Invalid id" },
                { status: 400 }
            )
        }

        const ok = await deleteExperiencePanel(id)
        if (!ok) {
            return NextResponse.json(
                { success: false, error: "Failed to delete panel" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "Experience panel deleted",
        })
    } catch (error) {
        console.error("Error deleting experience panel:", error)
        return NextResponse.json(
            { success: false, error: "Failed to delete panel" },
            { status: 500 }
        )
    }
}
