"use client"

import { useRef } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
    FiChevronLeft,
    FiChevronRight,
    FiCode,
    FiExternalLink,
    FiMaximize2,
} from "react-icons/fi"
import { FaGithub } from "react-icons/fa"
import type { Project } from "./types"
import { slideVariants } from "./constants"
import { ProjectMedia } from "./ProjectMedia"

type ProjectPreviewProps = {
    project: Project
    imageSrc: string
    onMaximize: () => void
    onPrev: () => void
    onNext: () => void
    canPrev: boolean
    canNext: boolean
    currentIndex: number
    total: number
    isMobile: boolean
    slideDirection: number
}

export function ProjectPreview({
    project,
    imageSrc,
    onMaximize,
    onPrev,
    onNext,
    canPrev,
    canNext,
    currentIndex,
    total,
    isMobile,
    slideDirection,
}: ProjectPreviewProps) {
    const dragMoved = useRef(false)

    const handleDragStart = () => {
        dragMoved.current = false
    }

    const handleDrag = (_: unknown, info: { offset: { x: number; y: number } }) => {
        if (Math.abs(info.offset.x) > 8 || Math.abs(info.offset.y) > 8) {
            dragMoved.current = true
        }
    }

    const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
        if (!isMobile) return
        const swipe = info.offset.x + info.velocity.x * 0.35
        if (swipe < -60 && canNext) onNext()
        else if (swipe > 60 && canPrev) onPrev()
    }

    const handleOpenMaximize = () => {
        if (dragMoved.current) return
        onMaximize()
    }

    return (
        <div
            className={`relative overflow-hidden touch-pan-y bg-black/20 cursor-pointer ${
                isMobile ? "aspect-[4/5] max-h-[70vh]" : "h-[520px]"
            }`}
        >
            <AnimatePresence mode="wait" custom={slideDirection} initial={false}>
                <motion.div
                    key={project.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${project.title} fullscreen`}
                    className="absolute inset-0 outline-none"
                    custom={slideDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                    drag={isMobile ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onPointerDown={() => {
                        dragMoved.current = false
                    }}
                    onDragStart={handleDragStart}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    onClick={handleOpenMaximize}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            onMaximize()
                        }
                    }}
                >
                    <ProjectMedia src={imageSrc} title={project.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#222046] via-[#222046]/40 to-transparent pointer-events-none" />

                    <div
                        className={`absolute bottom-0 left-0 right-0 z-10 ${
                            isMobile ? "p-4 px-12" : "p-6 md:p-8"
                        }`}
                    >
                        <p className="text-xs uppercase tracking-[0.18em] text-violet-300/80 mb-2 flex items-center gap-2">
                            <FiCode className="text-sm" />
                            {project.category || "Project"}
                            {project.year ? (
                                <span className="text-white/30 normal-case tracking-normal">
                                    · {project.year}
                                </span>
                            ) : null}
                        </p>
                        <h3
                            className={`font-bold text-white tracking-tight ${
                                isMobile ? "text-xl" : "text-2xl md:text-3xl"
                            }`}
                        >
                            {project.title}
                        </h3>
                        <p
                            className={`mt-2 text-white/65 leading-relaxed max-w-xl ${
                                isMobile
                                    ? "text-sm line-clamp-2"
                                    : "text-sm md:text-base line-clamp-3"
                            }`}
                        >
                            {project.description}
                        </p>
                        {project.languages && project.languages.length > 0 && (
                            <p className="mt-3 text-xs text-white/40 font-mono">
                                {project.languages.join("  ·  ")}
                            </p>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div
                className="absolute top-3 right-3 z-20 flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
            >
                {project.githubLink && (
                    <Link
                        href={project.githubLink}
                        target="_blank"
                        aria-label="View code on GitHub"
                        className="p-2.5 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FaGithub className="text-lg" />
                    </Link>
                )}
                {project.liveLink && (
                    <Link
                        href={project.liveLink}
                        target="_blank"
                        aria-label="Open live demo"
                        className="p-2.5 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FiExternalLink className="text-lg" />
                    </Link>
                )}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        onMaximize()
                    }}
                    aria-label="Expand project"
                    className="p-2.5 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors"
                >
                    <FiMaximize2 className="text-lg" />
                </button>
            </div>

            {total > 1 && (
                <>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            onPrev()
                        }}
                        disabled={!canPrev}
                        aria-label="Previous project"
                        className={`
                            absolute left-2 top-1/2 -translate-y-1/2 z-20
                            text-white/80 bg-black/35 hover:bg-black/55 backdrop-blur-sm
                            transition-opacity disabled:opacity-25 disabled:pointer-events-none
                            ${isMobile ? "p-2.5" : "p-3"}
                        `}
                    >
                        <FiChevronLeft className={isMobile ? "text-xl" : "text-2xl"} />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            onNext()
                        }}
                        disabled={!canNext}
                        aria-label="Next project"
                        className={`
                            absolute right-2 top-1/2 -translate-y-1/2 z-20
                            text-white/80 bg-black/35 hover:bg-black/55 backdrop-blur-sm
                            transition-opacity disabled:opacity-25 disabled:pointer-events-none
                            ${isMobile ? "p-2.5" : "p-3"}
                        `}
                    >
                        <FiChevronRight className={isMobile ? "text-xl" : "text-2xl"} />
                    </button>
                </>
            )}

            {total > 1 && (
                <div className="absolute top-3 left-0 right-0 z-20 flex justify-center gap-1.5 pointer-events-none">
                    {Array.from({ length: total }).map((_, i) => (
                        <span
                            key={i}
                            className={`h-0.5 rounded-full transition-all ${
                                i === currentIndex ? "w-6 bg-white" : "w-4 bg-white/35"
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
