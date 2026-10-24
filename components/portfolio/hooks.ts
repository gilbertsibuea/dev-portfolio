"use client"

import { useState, useEffect, useMemo } from "react"
import type { Project } from "./types"
import { CATEGORY_LABELS, type CategoryLabel } from "./constants"

export const useResponsive = () => {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener("resize", check)
        return () => window.removeEventListener("resize", check)
    }, [])

    return { isMobile }
}

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch(`${window.location.origin}/api/projects/selected`)
                const contentType = res.headers.get("content-type") || ""

                if (!res.ok || !contentType.includes("application/json")) {
                    throw new Error("Failed to fetch projects")
                }

                const data = await res.json()

                if (data.success && data.projects?.length > 0) {
                    setProjects(data.projects)
                } else {
                    setError("No projects found")
                }
            } catch (err) {
                setError("Failed to fetch projects")
                console.error("Error fetching projects:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [])

    return { projects, loading, error }
}

export const useProjectCategories = (projects: Project[]) => {
    return useMemo(() => {
        const cats = projects
            .map((p) => p.category || "Others")
            .filter((v, i, arr) => arr.indexOf(v) === i && v)

        const known = CATEGORY_LABELS.filter((label) => cats.includes(label))
        const extra = cats.filter(
            (cat) => !CATEGORY_LABELS.includes(cat as CategoryLabel)
        )
        return [...known, ...extra]
    }, [projects])
}
