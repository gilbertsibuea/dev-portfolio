"use client"

import { useState } from "react"
import type {
    ExperienceJob,
    ExperienceJobTag,
    ExperiencePanel,
} from "@/lib/experience-types"

const TAGS: ExperienceJobTag[] = [
    "Full Time",
    "Contract",
    "Freelance",
    "Project",
    "Education",
]

const emptyJob = (): ExperienceJob => ({
    org: "",
    role: "",
    tag: "Full Time",
    period: "",
    location: "",
    summary: "",
    highlights: [],
    mark: "",
    markColor: "#818cf8",
})

type ExperiencePanelFormProps = {
    initial?: ExperiencePanel | null
    onSubmit: (payload: {
        slug: string
        kind: "feature" | "stack"
        sortOrder: number
        jobs: ExperienceJob[]
    }) => Promise<void>
    submitLabel?: string
}

export function ExperiencePanelForm({
    initial,
    onSubmit,
    submitLabel = "Save",
}: ExperiencePanelFormProps) {
    const [slug, setSlug] = useState(initial?.slug ?? "")
    const [kind, setKind] = useState<"feature" | "stack">(initial?.kind ?? "feature")
    const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0)
    const [jobs, setJobs] = useState<ExperienceJob[]>(() => {
        if (initial?.jobs?.length) return initial.jobs.map((j) => ({ ...j }))
        return [emptyJob()]
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const updateJob = (index: number, patch: Partial<ExperienceJob>) => {
        setJobs((prev) =>
            prev.map((job, i) => (i === index ? { ...job, ...patch } : job))
        )
    }

    const handleKindChange = (next: "feature" | "stack") => {
        setKind(next)
        if (next === "feature") {
            setJobs((prev) => [prev[0] ?? emptyJob()])
        } else {
            setJobs((prev) => {
                if (prev.length >= 2) return prev.slice(0, 2)
                return [prev[0] ?? emptyJob(), emptyJob()]
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!slug.trim()) {
            setError("Slug is required")
            return
        }
        if (jobs.some((j) => !j.org.trim() || !j.role.trim() || !j.period.trim())) {
            setError("Each job needs org, role, and period")
            return
        }

        setSaving(true)
        try {
            await onSubmit({
                slug: slug.trim(),
                kind,
                sortOrder: Number(sortOrder) || 0,
                jobs: jobs.map((j) => ({
                    ...j,
                    org: j.org.trim(),
                    role: j.role.trim(),
                    period: j.period.trim(),
                    location: j.location?.trim() || undefined,
                    summary: j.summary?.trim() || undefined,
                    highlights: (j.highlights ?? [])
                        .map((h) => h.trim())
                        .filter(Boolean),
                    mark: j.mark.trim() || j.org.slice(0, 2).toUpperCase(),
                    markColor: j.markColor || "#818cf8",
                })),
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save")
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
                <label className="block sm:col-span-1">
                    <span className="mb-1.5 block text-sm text-gray-400">Slug</span>
                    <input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white"
                        placeholder="saidata"
                        required
                    />
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-sm text-gray-400">Kind</span>
                    <select
                        value={kind}
                        onChange={(e) =>
                            handleKindChange(e.target.value as "feature" | "stack")
                        }
                        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white"
                    >
                        <option value="feature">Feature (1 job)</option>
                        <option value="stack">Stack (2 jobs)</option>
                    </select>
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-sm text-gray-400">Sort order</span>
                    <input
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white"
                    />
                </label>
            </div>

            {jobs.map((job, index) => (
                <div
                    key={index}
                    className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/60 p-4"
                >
                    <h3 className="text-sm font-semibold text-violet-300">
                        Job {index + 1}
                        {kind === "feature" ? " (feature card)" : ""}
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-sm text-gray-400">Org</span>
                            <input
                                value={job.org}
                                onChange={(e) => updateJob(index, { org: e.target.value })}
                                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white"
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm text-gray-400">Role</span>
                            <input
                                value={job.role}
                                onChange={(e) => updateJob(index, { role: e.target.value })}
                                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white"
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm text-gray-400">Tag</span>
                            <select
                                value={job.tag}
                                onChange={(e) =>
                                    updateJob(index, {
                                        tag: e.target.value as ExperienceJobTag,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white"
                            >
                                {TAGS.map((tag) => (
                                    <option key={tag} value={tag}>
                                        {tag}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm text-gray-400">Period</span>
                            <input
                                value={job.period}
                                onChange={(e) =>
                                    updateJob(index, { period: e.target.value })
                                }
                                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white"
                                placeholder="Nov 2025 – Aug 2026"
                                required
                            />
                        </label>
                        <label className="block sm:col-span-2">
                            <span className="mb-1.5 block text-sm text-gray-400">
                                Location
                            </span>
                            <input
                                value={job.location ?? ""}
                                onChange={(e) =>
                                    updateJob(index, { location: e.target.value })
                                }
                                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white"
                            />
                        </label>
                        <label className="block sm:col-span-2">
                            <span className="mb-1.5 block text-sm text-gray-400">
                                Summary
                            </span>
                            <textarea
                                value={job.summary ?? ""}
                                onChange={(e) =>
                                    updateJob(index, { summary: e.target.value })
                                }
                                rows={3}
                                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white"
                            />
                        </label>
                        <label className="block sm:col-span-2">
                            <span className="mb-1.5 block text-sm text-gray-400">
                                Highlights (one per line)
                            </span>
                            <textarea
                                value={(job.highlights ?? []).join("\n")}
                                onChange={(e) =>
                                    updateJob(index, {
                                        highlights: e.target.value.split("\n"),
                                    })
                                }
                                rows={3}
                                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white"
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm text-gray-400">
                                Mark (2 letters)
                            </span>
                            <input
                                value={job.mark}
                                onChange={(e) =>
                                    updateJob(index, { mark: e.target.value })
                                }
                                maxLength={3}
                                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white"
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm text-gray-400">
                                Mark color
                            </span>
                            <input
                                type="color"
                                value={job.markColor || "#818cf8"}
                                onChange={(e) =>
                                    updateJob(index, { markColor: e.target.value })
                                }
                                className="h-10 w-full cursor-pointer rounded-lg border border-gray-700 bg-gray-950"
                            />
                        </label>
                    </div>
                </div>
            ))}

            <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-violet-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
            >
                {saving ? "Saving…" : submitLabel}
            </button>
        </form>
    )
}
