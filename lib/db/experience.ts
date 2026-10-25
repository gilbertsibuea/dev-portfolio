import { turso } from "./turso"
import type {
    ExperienceJob,
    ExperiencePanel,
    ExperiencePanelInput,
} from "@/lib/experience-types"

export type {
    ExperienceJob,
    ExperienceJobTag,
    ExperiencePanel,
    ExperiencePanelInput,
    ExperiencePanelKind,
} from "@/lib/experience-types"

type ExperienceRow = {
    id: number
    slug: string
    kind: string
    sort_order: number
    jobs_json: string
    created_at: string
    updated_at: string
}

/** Current Professional Journey content — used for first-time seed */
export const EXPERIENCE_SEED: Omit<ExperiencePanelInput, "sortOrder">[] = [
    {
        slug: "saidata",
        kind: "feature",
        jobs: [
            {
                org: "SAIDATA · Universitas Lampung",
                role: "Full Stack Developer",
                tag: "Full Time",
                period: "Nov 2025 – Aug 2026",
                location: "Bandar Lampung · On-site",
                summary:
                    "Built and shipped SAIDATA — a production digital-admin platform for faculties across Unila. Configurable service menus, multi-stage approval workflows, document generation with QR verification, JWT/SSO, Redis, and Docker.",
                highlights: [
                    "Laravel 12 + React 19 SPA + PostgreSQL",
                    "Workflow engine, form builder, campus SSO integrations",
                    "Presented the system to faculty admins at BPKHM Unila",
                ],
                mark: "SU",
                markColor: "#2dd4bf",
            },
        ],
    },
    {
        slug: "wium",
        kind: "stack",
        jobs: [
            {
                org: "WIUM Indonesia",
                role: "Full Stack · E-Retirement",
                tag: "Contract",
                period: "Apr 2024 – Apr 2025",
                location: "Remote",
                summary:
                    "Multi-level pension & retirement workflows with RBAC, PDF exports, audit trails, and real-time notifications.",
                mark: "ER",
                markColor: "#818cf8",
            },
            {
                org: "WIUM Indonesia",
                role: "Full Stack · AdGenda",
                tag: "Contract",
                period: "May 2025 – Aug 2025",
                location: "Remote",
                summary:
                    "Committee meetings, live voting Presentation Mode, decision letters, and calendar-driven agenda workflows.",
                mark: "AG",
                markColor: "#c084fc",
            },
        ],
    },
    {
        slug: "client",
        kind: "stack",
        jobs: [
            {
                org: "SPMB Prestasi Prima",
                role: "Full Stack Developer",
                tag: "Project",
                period: "Oct 2025 – Jan 2026",
                location: "Remote",
                summary:
                    "SMA/SMK admission & payment platform — registration wizard, BRI BRIVA VAs, validator queues, and cycle reporting.",
                mark: "SP",
                markColor: "#38bdf8",
            },
            {
                org: "Independent",
                role: "Freelance Full Stack",
                tag: "Freelance",
                period: "2024 – Present",
                location: "Bandung · Remote",
                summary:
                    "Client web & mobile apps — Laravel, Next.js, React Native — from scope to ship with clean handoff.",
                mark: "FS",
                markColor: "#34d399",
            },
        ],
    },
    {
        slug: "education",
        kind: "stack",
        jobs: [
            {
                org: "Universitas Lampung",
                role: "B.Sc. Computer Science",
                tag: "Education",
                period: "2022 – 2026",
                location: "Bandar Lampung · GPA 3.68 / 4.00",
                summary:
                    "Software engineering focus; production fullstack work through campus digital-transformation projects.",
                mark: "UL",
                markColor: "#22c55e",
            },
            {
                org: "SMA BPK PENABUR Bandarlampung",
                role: "Natural Sciences",
                tag: "Education",
                period: "2019 – 2022",
                location: "Bandar Lampung",
                mark: "PB",
                markColor: "#f59e0b",
            },
        ],
    },
]

function rowToPanel(row: ExperienceRow): ExperiencePanel {
    let jobs: ExperienceJob[] = []
    try {
        const parsed = JSON.parse(row.jobs_json)
        jobs = Array.isArray(parsed) ? parsed : []
    } catch {
        jobs = []
    }

    return {
        id: row.id,
        slug: row.slug,
        kind: row.kind === "stack" ? "stack" : "feature",
        sortOrder: row.sort_order,
        jobs,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

function normalizeJobs(kind: "feature" | "stack", jobs: ExperienceJob[]): ExperienceJob[] {
    if (kind === "feature") {
        return jobs.slice(0, 1)
    }
    return jobs.slice(0, 2)
}

export async function getAllExperiencePanels(): Promise<ExperiencePanel[]> {
    try {
        const result = await turso.execute(
            "SELECT * FROM experience_panels ORDER BY sort_order ASC, id ASC"
        )
        return result.rows.map((row) => rowToPanel(row as unknown as ExperienceRow))
    } catch (error) {
        console.error("Error getting experience panels:", error)
        return []
    }
}

export async function getExperiencePanelById(id: number): Promise<ExperiencePanel | null> {
    try {
        const result = await turso.execute({
            sql: "SELECT * FROM experience_panels WHERE id = ?",
            args: [id],
        })
        if (result.rows.length === 0) return null
        return rowToPanel(result.rows[0] as unknown as ExperienceRow)
    } catch (error) {
        console.error(`Error getting experience panel ${id}:`, error)
        return null
    }
}

export async function createExperiencePanel(
    input: ExperiencePanelInput
): Promise<ExperiencePanel | null> {
    try {
        const jobs = normalizeJobs(input.kind, input.jobs)
        let sortOrder = input.sortOrder
        if (sortOrder === undefined) {
            const max = await turso.execute(
                "SELECT COALESCE(MAX(sort_order), -1) as max_order FROM experience_panels"
            )
            sortOrder = Number(max.rows[0]?.max_order ?? -1) + 1
        }

        const result = await turso.execute({
            sql: `
        INSERT INTO experience_panels (slug, kind, sort_order, jobs_json)
        VALUES (?, ?, ?, ?)
        RETURNING *
      `,
            args: [input.slug, input.kind, sortOrder, JSON.stringify(jobs)],
        })

        if (result.rows.length === 0) return null
        return rowToPanel(result.rows[0] as unknown as ExperienceRow)
    } catch (error) {
        console.error("Error creating experience panel:", error)
        return null
    }
}

export async function updateExperiencePanel(
    id: number,
    input: ExperiencePanelInput
): Promise<ExperiencePanel | null> {
    try {
        const jobs = normalizeJobs(input.kind, input.jobs)
        const sortOrder = input.sortOrder ?? 0

        await turso.execute({
            sql: `
        UPDATE experience_panels
        SET slug = ?, kind = ?, sort_order = ?, jobs_json = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
            args: [input.slug, input.kind, sortOrder, JSON.stringify(jobs), id],
        })

        return getExperiencePanelById(id)
    } catch (error) {
        console.error(`Error updating experience panel ${id}:`, error)
        return null
    }
}

export async function deleteExperiencePanel(id: number): Promise<boolean> {
    try {
        await turso.execute({
            sql: "DELETE FROM experience_panels WHERE id = ?",
            args: [id],
        })
        return true
    } catch (error) {
        console.error(`Error deleting experience panel ${id}:`, error)
        return false
    }
}

export async function reorderExperiencePanels(orderedIds: number[]): Promise<boolean> {
    try {
        for (let i = 0; i < orderedIds.length; i++) {
            await turso.execute({
                sql: "UPDATE experience_panels SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                args: [i, orderedIds[i]],
            })
        }
        return true
    } catch (error) {
        console.error("Error reordering experience panels:", error)
        return false
    }
}

export async function countExperiencePanels(): Promise<number> {
    try {
        const result = await turso.execute(
            "SELECT COUNT(*) as count FROM experience_panels"
        )
        return Number(result.rows[0]?.count ?? 0)
    } catch {
        return 0
    }
}

/** Insert seed panels if table is empty. Returns number inserted. */
export async function seedExperiencePanels(force = false): Promise<number> {
    try {
        const count = await countExperiencePanels()
        if (count > 0 && !force) return 0

        if (force && count > 0) {
            await turso.execute("DELETE FROM experience_panels")
        }

        let inserted = 0
        for (let i = 0; i < EXPERIENCE_SEED.length; i++) {
            const panel = EXPERIENCE_SEED[i]
            const created = await createExperiencePanel({
                ...panel,
                sortOrder: i,
            })
            if (created) inserted++
        }
        return inserted
    } catch (error) {
        console.error("Error seeding experience panels:", error)
        return 0
    }
}
