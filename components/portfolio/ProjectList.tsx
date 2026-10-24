"use client"

import type { Project } from "./types"
import { ProjectRow } from "./ProjectRow"

type ProjectListProps = {
    projects: Project[]
    selectedId: number | null
    onSelect: (project: Project, index: number) => void
    compact?: boolean
    emptyMessage?: string
}

export function ProjectList({
    projects,
    selectedId,
    onSelect,
    compact = false,
    emptyMessage = "No projects in this category.",
}: ProjectListProps) {
    if (projects.length === 0) {
        return <p className="text-white/40 py-6 text-sm px-1">{emptyMessage}</p>
    }

    return (
        <div>
            {projects.map((project, index) => (
                <ProjectRow
                    key={project.id}
                    project={project}
                    index={index}
                    isSelected={selectedId === project.id}
                    onClick={() => onSelect(project, index)}
                    compact={compact}
                />
            ))}
        </div>
    )
}
