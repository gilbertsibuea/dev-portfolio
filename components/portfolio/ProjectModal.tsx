"use client"

import { Fragment, useEffect, useState } from "react"
import Link from "next/link"
import { Dialog, Transition } from "@headlessui/react"
import { AnimatePresence, motion } from "framer-motion"
import {
    FiChevronLeft,
    FiChevronRight,
    FiExternalLink,
    FiMenu,
    FiX,
} from "react-icons/fi"
import { FaGithub } from "react-icons/fa"
import type { Project } from "./types"
import { slideVariants } from "./constants"
import { ProjectMedia } from "./ProjectMedia"
import { CategoryFilter } from "./CategoryFilter"
import { ProjectList } from "./ProjectList"

type ProjectModalProps = {
    project: Project
    isOpen: boolean
    onClose: () => void
    imageSrc: string
    isMobile: boolean
    categories: string[]
    selectedCategory: string | null
    onSelectCategory: (cat: string) => void
    projects: Project[]
    onSelectProject: (project: Project, index: number) => void
    onPrev: () => void
    onNext: () => void
    canPrev: boolean
    canNext: boolean
    currentIndex: number
    total: number
    slideDirection: number
}

export function ProjectModal({
    project,
    isOpen,
    onClose,
    imageSrc,
    isMobile,
    categories,
    selectedCategory,
    onSelectCategory,
    projects,
    onSelectProject,
    onPrev,
    onNext,
    canPrev,
    canNext,
    currentIndex,
    total,
    slideDirection,
}: ProjectModalProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        if (!isOpen) setSidebarOpen(false)
    }, [isOpen])

    // Lock page scroll while modal is open (prevents background scroll on mobile)
    useEffect(() => {
        if (!isOpen) return
        const { body, documentElement } = document
        const prevBody = body.style.overflow
        const prevHtml = documentElement.style.overflow
        body.style.overflow = "hidden"
        documentElement.style.overflow = "hidden"
        return () => {
            body.style.overflow = prevBody
            documentElement.style.overflow = prevHtml
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") onPrev()
            if (e.key === "ArrowRight") onNext()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [isOpen, onPrev, onNext])

    const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
        const swipe = info.offset.x + info.velocity.x * 0.35
        if (swipe < -60 && canNext) onNext()
        else if (swipe > 60 && canPrev) onPrev()
    }

    const sidebar = (
        <div className="flex flex-col h-full min-h-0">
            <div className="px-4 pt-5 pb-3 border-b border-white/10 shrink-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/35 mb-3">
                    Categories
                </p>
                <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelect={(cat) => {
                        onSelectCategory(cat)
                        if (isMobile) setSidebarOpen(false)
                    }}
                    vertical
                />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-modern px-2 pb-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/35 px-2 pt-4 pb-2">
                    Projects
                </p>
                <ProjectList
                    projects={projects}
                    selectedId={project.id}
                    compact
                    onSelect={(p, i) => {
                        onSelectProject(p, i)
                        if (isMobile) setSidebarOpen(false)
                    }}
                />
            </div>
        </div>
    )

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/95" />
                </Transition.Child>

                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <div className="fixed inset-0 flex h-dvh max-h-dvh overflow-hidden overscroll-none">
                        {/* Desktop sidebar */}
                        {!isMobile && (
                            <aside className="w-72 shrink-0 border-r border-white/10 bg-[#14132a] flex flex-col z-10">
                                {sidebar}
                            </aside>
                        )}

                        {/* Mobile sidebar drawer */}
                        {isMobile && (
                            <AnimatePresence>
                                {sidebarOpen && (
                                    <>
                                        <motion.button
                                            type="button"
                                            aria-label="Close menu"
                                            className="absolute inset-0 z-30 bg-black/60"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setSidebarOpen(false)}
                                        />
                                        <motion.aside
                                            className="absolute left-0 top-0 bottom-0 z-40 w-[min(18rem,85vw)] bg-[#14132a] border-r border-white/10 flex flex-col"
                                            initial={{ x: "-100%" }}
                                            animate={{ x: 0 }}
                                            exit={{ x: "-100%" }}
                                            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                                        >
                                            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                                                <span className="text-sm font-medium text-white/70">
                                                    Browse
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSidebarOpen(false)}
                                                    aria-label="Close sidebar"
                                                    className="p-2 text-white/60 hover:text-white"
                                                >
                                                    <FiX className="text-lg" />
                                                </button>
                                            </div>
                                            {sidebar}
                                        </motion.aside>
                                    </>
                                )}
                            </AnimatePresence>
                        )}

                        {/* Main stage */}
                        <div className="relative flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
                            {/* Toolbar */}
                            <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
                                <div className="flex items-center gap-1 pointer-events-auto">
                                    {isMobile && (
                                        <button
                                            type="button"
                                            onClick={() => setSidebarOpen(true)}
                                            aria-label="Open project menu"
                                            className="p-2.5 text-white/80 bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <FiMenu className="text-lg" />
                                        </button>
                                    )}
                                    {total > 1 && (
                                        <span className="hidden sm:inline text-xs font-mono text-white/40 px-2">
                                            {currentIndex + 1} / {total}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 pointer-events-auto">
                                    {project.githubLink && (
                                        <Link
                                            href={project.githubLink}
                                            target="_blank"
                                            aria-label="View code"
                                            className="p-2.5 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <FaGithub className="text-lg" />
                                        </Link>
                                    )}
                                    {project.liveLink && (
                                        <Link
                                            href={project.liveLink}
                                            target="_blank"
                                            aria-label="Live demo"
                                            className="p-2.5 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <FiExternalLink className="text-lg" />
                                        </Link>
                                    )}
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        aria-label="Close"
                                        className="p-2.5 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <FiX className="text-xl" />
                                    </button>
                                </div>
                            </div>

                            {/* Media + description */}
                            <div className="relative flex-1 min-h-0 overflow-hidden">
                                <AnimatePresence mode="wait" custom={slideDirection} initial={false}>
                                    <motion.div
                                        key={project.id}
                                        className="absolute inset-0 flex flex-col min-h-0"
                                        custom={slideDirection}
                                        variants={slideVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{
                                            duration: 0.28,
                                            ease: [0.25, 0.46, 0.45, 0.94],
                                        }}
                                    >
                                        {/* Preview — swipe only here, not on description */}
                                        <motion.div
                                            className={`relative min-h-0 bg-black/40 shrink-0 ${
                                                isMobile ? "h-[42dvh]" : "flex-1"
                                            }`}
                                            drag="x"
                                            dragConstraints={{ left: 0, right: 0 }}
                                            dragElastic={0.18}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <ProjectMedia
                                                src={imageSrc}
                                                title={project.title}
                                                contain
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#14132a] to-transparent pointer-events-none" />
                                        </motion.div>

                                        {/* Description — independent vertical scroll */}
                                        <div
                                            className={`
                                                bg-[#14132a] border-t border-white/10
                                                flex-1 min-h-0
                                                overflow-y-auto overscroll-contain touch-pan-y scrollbar-modern
                                                ${isMobile ? "p-4 pb-8 max-h-[58dvh]" : "px-10 py-5 max-h-[28vh]"}
                                            `}
                                            onTouchMove={(e) => e.stopPropagation()}
                                        >
                                            <div className="max-w-4xl">
                                                <p className="text-xs uppercase tracking-[0.18em] text-violet-300/70 mb-2">
                                                    {project.category || "Project"}
                                                    {project.year ? ` · ${project.year}` : ""}
                                                </p>
                                                <h2
                                                    className={`font-bold text-white tracking-tight ${
                                                        isMobile ? "text-xl" : "text-2xl lg:text-3xl"
                                                    }`}
                                                >
                                                    {project.title}
                                                </h2>
                                                <p
                                                    className={`mt-3 text-white/70 leading-relaxed ${
                                                        isMobile ? "text-sm" : "text-base"
                                                    }`}
                                                >
                                                    {project.description}
                                                </p>
                                                {project.details && (
                                                    <>
                                                        <div className="h-px bg-white/10 my-3" />
                                                        <p className="text-white/50 whitespace-pre-line text-sm leading-relaxed">
                                                            {project.details}
                                                        </p>
                                                    </>
                                                )}
                                                {project.languages && project.languages.length > 0 && (
                                                    <p className="mt-4 mb-1 text-xs text-white/35 font-mono">
                                                        {project.languages.join("  ·  ")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {total > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={onPrev}
                                            disabled={!canPrev}
                                            aria-label="Previous project"
                                            className="absolute left-2 md:left-4 top-[38%] -translate-y-1/2 z-20 p-2.5 md:p-3 text-white/80 bg-black/40 hover:bg-black/60 transition-opacity disabled:opacity-20 disabled:pointer-events-none"
                                        >
                                            <FiChevronLeft className="text-2xl" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onNext}
                                            disabled={!canNext}
                                            aria-label="Next project"
                                            className="absolute right-2 md:right-4 top-[38%] -translate-y-1/2 z-20 p-2.5 md:p-3 text-white/80 bg-black/40 hover:bg-black/60 transition-opacity disabled:opacity-20 disabled:pointer-events-none"
                                        >
                                            <FiChevronRight className="text-2xl" />
                                        </button>
                                    </>
                                )}

                                {total > 1 && (
                                    <div className="absolute top-14 left-0 right-0 z-20 flex justify-center gap-1.5 pointer-events-none">
                                        {Array.from({ length: total }).map((_, i) => (
                                            <span
                                                key={i}
                                                className={`h-0.5 rounded-full transition-all ${
                                                    i === currentIndex
                                                        ? "w-6 bg-white"
                                                        : "w-4 bg-white/30"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Transition.Child>
            </Dialog>
        </Transition>
    )
}
