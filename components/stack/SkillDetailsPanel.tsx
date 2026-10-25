"use client"

import { AnimatePresence, motion } from "framer-motion"
import type { SkillCategory } from "./types"

type SkillDetailsPanelProps = {
    category: SkillCategory
    reducedMotion: boolean
}

export function SkillDetailsPanel({
    category,
    reducedMotion,
}: SkillDetailsPanelProps) {
    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={category.id}
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex flex-col"
            >
                <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                    {category.label}
                </h3>

                <p className="mt-3 max-w-prose text-sm leading-relaxed text-white/55 sm:mt-4 sm:text-base">
                    {category.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-1.5 sm:mt-6">
                    {category.skills.map((skill) => (
                        <span
                            key={skill.id}
                            title={skill.name}
                            className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-white/75 sm:text-xs"
                        >
                            {skill.name}
                        </span>
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
