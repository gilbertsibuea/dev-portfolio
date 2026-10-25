"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ExperiencePanelForm } from "@/components/admin/ExperiencePanelForm"

export default function NewExperiencePanelPage() {
    const router = useRouter()
    const [ready, setReady] = useState(false)

    useEffect(() => {
        if (!localStorage.getItem("adminAuth")) {
            router.push("/admin")
            return
        }
        setReady(true)
    }, [router])

    if (!ready) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                Loading…
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
                    <h1 className="mt-1 text-2xl font-bold">Add experience panel</h1>
                </div>
            </header>
            <main className="mx-auto max-w-3xl px-4 py-8">
                <ExperiencePanelForm
                    submitLabel="Create panel"
                    onSubmit={async (payload) => {
                        const res = await fetch("/api/experience", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                        })
                        const data = await res.json()
                        if (!data.success) {
                            throw new Error(data.error || "Create failed")
                        }
                        router.push("/admin/experience")
                    }}
                />
            </main>
        </div>
    )
}
