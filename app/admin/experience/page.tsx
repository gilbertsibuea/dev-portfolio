"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ExperiencePanel } from "@/lib/experience-types"

export default function AdminExperiencePage() {
    const router = useRouter()
    const [panels, setPanels] = useState<ExperiencePanel[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState<string | null>(null)
    const [authenticated, setAuthenticated] = useState(false)

    const fetchPanels = useCallback(async () => {
        try {
            const res = await fetch("/api/experience", { cache: "no-store" })
            const data = await res.json()
            if (data.success) setPanels(data.panels)
        } catch {
            setMessage("Failed to load experience panels")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const adminAuth = localStorage.getItem("adminAuth")
        if (!adminAuth) {
            router.push("/admin")
            return
        }
        setAuthenticated(true)
        fetchPanels()
    }, [router, fetchPanels])

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this experience panel?")) return
        const res = await fetch(`/api/experience/${id}`, { method: "DELETE" })
        const data = await res.json()
        if (data.success) {
            setMessage("Panel deleted")
            fetchPanels()
        } else {
            setMessage(data.error || "Delete failed")
        }
    }

    const handleSeed = async (force: boolean) => {
        if (
            force &&
            !confirm(
                "Replace ALL experience panels with the default seed data?"
            )
        ) {
            return
        }
        const res = await fetch("/api/experience/seed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ force }),
        })
        const data = await res.json()
        setMessage(data.message || (data.success ? "Done" : "Seed failed"))
        fetchPanels()
    }

    const move = async (index: number, direction: -1 | 1) => {
        const next = index + direction
        if (next < 0 || next >= panels.length) return
        const ordered = [...panels]
        const [item] = ordered.splice(index, 1)
        ordered.splice(next, 0, item)

        // Persist new sort orders
        await Promise.all(
            ordered.map((panel, i) =>
                fetch(`/api/experience/${panel.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        slug: panel.slug,
                        kind: panel.kind,
                        sortOrder: i,
                        jobs: panel.jobs,
                    }),
                })
            )
        )
        fetchPanels()
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
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                    <div>
                        <Link
                            href="/admin/dashboard"
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            ← Dashboard
                        </Link>
                        <h1 className="mt-1 text-2xl font-bold">
                            Professional <span className="text-violet-500">Journey</span>
                        </h1>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => handleSeed(false)}
                            className="rounded-lg border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800"
                        >
                            Seed if empty
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSeed(true)}
                            className="rounded-lg border border-amber-600/50 px-3 py-2 text-sm text-amber-200 hover:bg-amber-950/40"
                        >
                            Re-seed (replace)
                        </button>
                        <Link
                            href="/admin/experience/new"
                            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-700"
                        >
                            Add panel
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8">
                {message && (
                    <p className="mb-4 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
                        {message}
                    </p>
                )}

                {panels.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-700 p-10 text-center text-gray-400">
                        No experience panels yet.{" "}
                        <button
                            type="button"
                            onClick={() => handleSeed(false)}
                            className="text-violet-400 underline"
                        >
                            Seed default data
                        </button>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {panels.map((panel, index) => (
                            <li
                                key={panel.id}
                                className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-xs text-gray-500">
                                            #{panel.sortOrder}
                                        </span>
                                        <span className="font-semibold text-white">
                                            {panel.slug}
                                        </span>
                                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gray-400">
                                            {panel.kind}
                                        </span>
                                    </div>
                                    <p className="mt-1 truncate text-sm text-gray-400">
                                        {panel.jobs
                                            .map((j) => `${j.org} — ${j.role}`)
                                            .join(" · ")}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => move(index, -1)}
                                        disabled={index === 0}
                                        className="rounded-lg border border-gray-700 px-2 py-1 text-sm disabled:opacity-30"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => move(index, 1)}
                                        disabled={index === panels.length - 1}
                                        className="rounded-lg border border-gray-700 px-2 py-1 text-sm disabled:opacity-30"
                                    >
                                        ↓
                                    </button>
                                    <Link
                                        href={`/admin/experience/edit/${panel.id}`}
                                        className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm hover:bg-gray-700"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(panel.id)}
                                        className="rounded-lg bg-red-600/80 px-3 py-1.5 text-sm hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    )
}
