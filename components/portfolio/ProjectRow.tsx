"use client"

import React from "react"
import { FiChevronRight } from "react-icons/fi"
import type { Project } from "./types"

type ProjectRowProps = {
    project: Project
    index: number
    isSelected: boolean
    onClick: () => void
    compact?: boolean
}

export function ProjectRow({
    project,
    index,
    isSelected,
    onClick,
    compact = false,
}: ProjectRowProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                relative w-full text-left group flex items-start gap-3 border-b border-white/10
                transition-all duration-200
                ${compact ? "py-3 pl-3" : "py-4 pl-4 gap-4"}
                ${isSelected
                    ? "border-violet-400/30 bg-violet-500/[0.08]"
                    : "hover:border-white/25 hover:bg-white/[0.02]"
                }
            `}
            style={
                isSelected
                    ? {
                          boxShadow:
                              "inset 3px 0 0 0 #a78bfa, -4px 0 24px -8px rgba(139, 92, 246, 0.45)",
                      }
                    : undefined
            }
        >
            <span
                aria-hidden
                className={`
                    absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-opacity duration-200
                    ${isSelected
                        ? "opacity-100 bg-violet-400 shadow-[0_0_12px_2px_rgba(167,139,250,0.7)]"
                        : "opacity-0"
                    }
                `}
            />

            <span
                className={`
                    font-mono text-xs tabular-nums pt-0.5 shrink-0 w-6
                    ${isSelected ? "text-violet-300" : "text-white/30"}
                `}
            >
                {String(index + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <h3
                        className={`
                            font-semibold truncate transition-colors
                            ${compact ? "text-sm" : ""}
                            ${isSelected ? "text-white" : "text-white/75 group-hover:text-white"}
                        `}
                    >
                        {project.title}
                    </h3>
                    <FiChevronRight
                        className={`
                            shrink-0 text-sm transition-all
                            ${isSelected
                                ? "text-violet-300 opacity-100 translate-x-0"
                                : "text-white/20 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                            }
                        `}
                    />
                </div>

                {!compact && (
                    <>
                        <p
                            className={`mt-1 text-sm line-clamp-1 ${
                                isSelected ? "text-white/55" : "text-white/40"
                            }`}
                        >
                            {project.description}
                        </p>
                        <div
                            className={`mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${
                                isSelected ? "text-violet-200/50" : "text-white/35"
                            }`}
                        >
                            {project.year ? (
                                <span className="tabular-nums">{project.year}</span>
                            ) : null}
                            {project.year && project.languages?.length > 0 ? (
                                <span className="text-white/20">·</span>
                            ) : null}
                            {project.languages?.slice(0, 3).map((lang, i) => (
                                <React.Fragment key={lang}>
                                    {i > 0 && <span className="text-white/20">/</span>}
                                    <span>{lang}</span>
                                </React.Fragment>
                            ))}
                        </div>
                    </>
                )}

                {compact && project.year ? (
                    <p className="mt-0.5 text-xs text-white/35 tabular-nums">{project.year}</p>
                ) : null}
            </div>
        </button>
    )
}
