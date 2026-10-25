"use client"

import { AnimatePresence, motion } from "framer-motion"
import { FiArrowUpRight } from "react-icons/fi"
import type { EvidenceType, SkillCategory } from "./types"

const EVIDENCE_LABEL: Record<EvidenceType, string> = {
    professional: "Professional",
    "personal-project": "Personal",
    academic: "Academic",
    certification: "Certification",
}

type SkillDetailsPanelProps = {
    category: SkillCategory
    index: number
    total: number
    isPreview: boolean
    reducedMotion: boolean
}

export function SkillDetailsPanel({
    category,
    index,
    total,
    isPreview,
    reducedMotion,
}: SkillDetailsPanelProps) {
    return (
        <div className="relative min-h-[320px] sm:min-h-[380px]">
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={category.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute inset-0 flex flex-col"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-violet-300/70">
                                {isPreview ? "Preview" : "Selected"}
                            </p>
                            <h3 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                                {category.label}
                            </h3>
                        </div>
                        <span className="shrink-0 font-mono text-[10px] tabular-nums text-white/30">
                            {String(index + 1).padStart(2, "0")} /{" "}
                            {String(total).padStart(2, "0")}
                        </span>
                    </div>

                    <p className="mt-3 max-w-prose text-sm leading-relaxed text-white/55">
                        {category.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-1.5">
                        {category.skills.map((skill) => (
                            <span
                                key={skill.id}
                                title={
                                    skill.relatedProject
                                        ? `${skill.name} · ${skill.relatedProject}`
                                        : skill.evidenceType
                                          ? `${skill.name} · ${EVIDENCE_LABEL[skill.evidenceType]}`
                                          : skill.name
                                }
                                className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-white/75 sm:text-xs"
                            >
                                {skill.name}
                            </span>
                        ))}
                    </div>

                    {category.projects.length > 0 && (
                        <div className="mt-auto border-t border-white/10 pt-5">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                                Evidence
                            </p>
                            <ul className="mt-2 space-y-1.5">
                                {category.projects.map((project) => (
                                    <li key={project.id}>
                                        {project.href ? (
                                            <a
                                                href={project.href}
                                                className="group inline-flex items-center gap-1.5 text-sm text-violet-200/90 transition-colors hover:text-white"
                                            >
                                                <span className="border-b border-violet-400/25 group-hover:border-violet-300/60">
                                                    {project.label}
                                                </span>
                                                <FiArrowUpRight className="text-xs opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                                <span className="ml-1 text-[10px] uppercase tracking-wider text-white/30">
                                                    {EVIDENCE_LABEL[project.evidenceType]}
                                                </span>
                                            </a>
                                        ) : (
                                            <span className="text-sm text-white/60">
                                                {project.label}
                                                <span className="ml-2 text-[10px] uppercase tracking-wider text-white/30">
                                                    {EVIDENCE_LABEL[project.evidenceType]}
                                                </span>
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
