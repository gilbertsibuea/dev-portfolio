"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import {
    FiActivity,
    FiCloud,
    FiCode,
    FiCpu,
    FiDatabase,
    FiLayers,
    FiLayout,
    FiServer,
} from "react-icons/fi"
import type { EvidenceType, Skill, SkillCategory } from "./types"

const ICONS = {
    server: FiServer,
    layout: FiLayout,
    database: FiDatabase,
    layers: FiLayers,
    activity: FiActivity,
    cloud: FiCloud,
    cpu: FiCpu,
    code: FiCode,
} as const

const EVIDENCE_LABEL: Record<EvidenceType, string> = {
    professional: "Professional",
    "personal-project": "Personal",
    academic: "Academic",
    certification: "Certification",
}

const ease = [0.25, 0.46, 0.45, 0.94] as const

type SkillDetailsPanelProps = {
    category: SkillCategory
    reducedMotion: boolean
    isPreview?: boolean
    sectorsOpen?: boolean
}

export function SkillDetailsPanel({
    category,
    reducedMotion,
    isPreview = false,
    sectorsOpen = false,
}: SkillDetailsPanelProps) {
    const Icon = ICONS[category.icon as keyof typeof ICONS] ?? FiCode
    const [activeSkillId, setActiveSkillId] = useState<string | null>(null)
    const activeSkill =
        category.skills.find((s) => s.id === activeSkillId) ?? null

    // Reset focused chip when category changes
    useEffect(() => {
        setActiveSkillId(null)
    }, [category.id])

    const stagger = reducedMotion
        ? undefined
        : {
              animate: {
                  transition: { staggerChildren: 0.028, delayChildren: 0.06 },
              },
          }

    const chipVariants = reducedMotion
        ? undefined
        : {
              initial: { opacity: 0, y: 10, scale: 0.94 },
              animate: { opacity: 1, y: 0, scale: 1 },
          }

    return (
        <LayoutGroup>
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={category.id}
                    layout
                    initial={reducedMotion ? false : { opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, x: -10 }}
                    transition={{ duration: 0.28, ease }}
                    className="relative flex flex-col"
                >
                    {/* Accent bar — reacts to aim vs settled */}
                    <motion.div
                        aria-hidden
                        className="absolute -left-5 top-1 bottom-1 w-0.5 rounded-full sm:-left-7"
                        initial={false}
                        animate={{
                            backgroundColor: isPreview
                                ? "rgba(167,139,250,0.85)"
                                : "rgba(139,92,246,0.45)",
                            scaleY: sectorsOpen ? 1 : 0.72,
                            opacity: sectorsOpen ? 1 : 0.55,
                        }}
                        transition={{ duration: 0.3, ease }}
                        style={{ originY: 0 }}
                    />

                    <div className="flex items-start gap-3.5 sm:gap-4">
                        <motion.span
                            layout
                            className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-violet-400/25 bg-violet-500/10 text-violet-200 sm:h-14 sm:w-14"
                            animate={
                                reducedMotion
                                    ? undefined
                                    : isPreview
                                      ? {
                                            scale: [1, 1.06, 1],
                                            borderColor: [
                                                "rgba(167,139,250,0.25)",
                                                "rgba(196,181,253,0.55)",
                                                "rgba(167,139,250,0.25)",
                                            ],
                                        }
                                      : { scale: 1 }
                            }
                            transition={
                                isPreview && !reducedMotion
                                    ? {
                                          duration: 1.4,
                                          repeat: Infinity,
                                          ease: "easeInOut",
                                      }
                                    : { duration: 0.25 }
                            }
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.span
                                    key={category.id}
                                    initial={
                                        reducedMotion
                                            ? false
                                            : { opacity: 0, rotate: -12, scale: 0.8 }
                                    }
                                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                    exit={
                                        reducedMotion
                                            ? undefined
                                            : { opacity: 0, rotate: 10, scale: 0.85 }
                                    }
                                    transition={{ duration: 0.22 }}
                                    className="flex"
                                >
                                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                                </motion.span>
                            </AnimatePresence>
                        </motion.span>

                        <div className="min-w-0 flex-1 pt-0.5">
                            <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-[2.1rem] md:leading-tight">
                                {category.label}
                            </h3>
                        </div>
                    </div>

                    <motion.p
                        layout
                        className="mt-3 max-w-prose text-sm leading-relaxed text-white/55 sm:mt-4 sm:text-base"
                    >
                        {category.description}
                    </motion.p>

                    <motion.div
                        className="mt-5 flex flex-wrap gap-1.5 sm:mt-6"
                        variants={stagger}
                        initial="initial"
                        animate="animate"
                    >
                        {category.skills.map((skill) => {
                            const selected = activeSkillId === skill.id
                            return (
                                <motion.button
                                    key={skill.id}
                                    type="button"
                                    variants={chipVariants}
                                    transition={{ duration: 0.22, ease }}
                                    whileHover={
                                        reducedMotion
                                            ? undefined
                                            : { y: -2, scale: 1.03 }
                                    }
                                    whileTap={
                                        reducedMotion ? undefined : { scale: 0.97 }
                                    }
                                    onClick={() =>
                                        setActiveSkillId((prev) =>
                                            prev === skill.id ? null : skill.id
                                        )
                                    }
                                    aria-pressed={selected}
                                    className={`rounded-md border px-2.5 py-1 text-left text-[11px] transition-colors sm:text-xs ${
                                        selected
                                            ? "border-violet-400/50 bg-violet-500/20 text-white"
                                            : "border-white/10 bg-white/[0.04] text-white/75 hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
                                    }`}
                                >
                                    {skill.name}
                                </motion.button>
                            )
                        })}
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {activeSkill && (
                            <motion.div
                                key={activeSkill.id}
                                layout
                                initial={
                                    reducedMotion
                                        ? false
                                        : { opacity: 0, height: 0, y: 6 }
                                }
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={
                                    reducedMotion
                                        ? undefined
                                        : { opacity: 0, height: 0, y: -4 }
                                }
                                transition={{ duration: 0.22, ease }}
                                className="overflow-hidden"
                            >
                                <SkillFocus skill={activeSkill} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!activeSkill && (
                        <p className="mt-4 text-[11px] text-white/30 sm:text-xs">
                            Tap a skill for context
                        </p>
                    )}
                </motion.div>
            </AnimatePresence>
        </LayoutGroup>
    )
}

function SkillFocus({ skill }: { skill: Skill }) {
    const evidence = skill.evidenceType
        ? EVIDENCE_LABEL[skill.evidenceType]
        : null

    return (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 sm:px-4">
            <p className="text-sm font-medium text-white">{skill.name}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/45 sm:text-xs">
                {evidence && <span>{evidence}</span>}
                {skill.relatedProject && (
                    <>
                        {evidence && (
                            <span className="text-white/20" aria-hidden>
                                ·
                            </span>
                        )}
                        <span className="text-violet-200/80">
                            {skill.relatedProject}
                        </span>
                    </>
                )}
                {!evidence && !skill.relatedProject && (
                    <span>Part of this focus area</span>
                )}
            </div>
        </div>
    )
}
