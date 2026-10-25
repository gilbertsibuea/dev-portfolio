"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ExperiencePanelForm } from "@/components/admin/ExperiencePanelForm"
import type { ExperiencePanel } from "@/lib/experience-types"

export default function EditExperiencePanelPage() {
    const router = useRouter()
    const params = useParams()
    const id = Number(params.id)
    const [panel, setPanel] = useState<ExperiencePanel | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!localStorage.getItem("adminAuth")) {
            router.push("/admin")
            return
        }

        const load = async () => {
            try {
                const res = await fetch(`/api/experience/${id}`, { cache: "no-store" })
                const data = await res.json()
                if (data.success) setPanel(data.panel)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id, router])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                Loading…
            </div>
        )
    }

    if (!panel) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-black text-white">
                <p>Panel not found</p>
                <Link href="/admin/experience" className="text-violet-400 underline">
                    Back
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="border-b border-gray-800 bg-gray-900">
                <div className="mx-auto max-w-3xl px-4 py-4">
                    <Link
                        href="/admin/experience"
                        className="text-sm text-gray-400 hover:text-white"
                    >
                        ← Experience
                    </Link>
                    <h1 className="mt-1 text-2xl font-bold">
                        Edit <span className="text-violet-400">{panel.slug}</span>
                    </h1>
                </div>
            </header>
            <main className="mx-auto max-w-3xl px-4 py-8">
                <ExperiencePanelForm
                    initial={panel}
                    submitLabel="Update panel"
                    onSubmit={async (payload) => {
                        const res = await fetch(`/api/experience/${panel.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                        })
                        const data = await res.json()
                        if (!data.success) {
                            throw new Error(data.error || "Update failed")
                        }
                        router.push("/admin/experience")
                    }}
                />
            </main>
        </div>
    )
}
