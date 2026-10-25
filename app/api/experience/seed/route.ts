import { NextRequest, NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"
import { seedExperiencePanels } from "@/lib/db/experience"

initializeDatabase()

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}))
        const force = Boolean(body?.force)
        const inserted = await seedExperiencePanels(force)

        return NextResponse.json({
            success: true,
            inserted,
            message: force
                ? `Re-seeded ${inserted} experience panels`
                : inserted > 0
                  ? `Seeded ${inserted} experience panels`
                  : "Experience panels already present (use force: true to replace)",
        })
    } catch (error) {
        console.error("Error seeding experience panels:", error)
        return NextResponse.json(
            { success: false, error: "Failed to seed experience panels" },
            { status: 500 }
        )
    }
}
