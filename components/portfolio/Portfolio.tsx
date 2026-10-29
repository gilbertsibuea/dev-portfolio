"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import type { Project } from "./types"
import { fadeInUp } from "./constants"
import { getValidImageSrc } from "./utils"
import { useProjects, useProjectCategories, useResponsive } from "./hooks"
import { CategoryFilter } from "./CategoryFilter"
import { ProjectList } from "./ProjectList"
import { ProjectPreview } from "./ProjectPreview"
import { ProjectModal } from "./ProjectModal"
import { SectionMark } from "../SectionMark"

/** Soft motherboard / PCB circuit accent */
function CircuitBackdrop() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(34,197,94,0.06),transparent_45%),radial-gradient(ellipse_at_10%_90%,rgba(139,92,246,0.08),transparent_50%)]" />

            <svg
                className="absolute inset-0 h-full w-full opacity-[0.28]"
                viewBox="0 0 1200 700"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <pattern
                        id="pcb-pads"
                        width="56"
                        height="56"
                        patternUnits="userSpaceOnUse"
                    >
                        <circle cx="10" cy="10" r="1.6" fill="rgba(167,139,250,0.5)" />
                        <circle cx="42" cy="28" r="1.3" fill="rgba(110,231,183,0.35)" />
                        <circle cx="26" cy="44" r="1.2" fill="rgba(196,181,253,0.4)" />
                    </pattern>
                </defs>
                <rect width="1200" height="700" fill="url(#pcb-pads)" />

                {/* Traces — right */}
                <g fill="none" stroke="rgba(167,139,250,0.55)" strokeWidth="1.6" strokeLinecap="square">
                    <path d="M900 40 H1080 V140 H1000 V250" />
                    <path d="M1040 70 V180 H1140" />
                    <path d="M860 110 H980 V200 H910 V320 H1060" />
                    <path d="M1110 280 V390 H960 V480" />
                    <path d="M840 360 H1000 V440 H1160" />
                </g>
                <g fill="none" stroke="rgba(110,231,183,0.35)" strokeWidth="1.3" strokeLinecap="square">
                    <path d="M920 260 H1040 V340" />
                    <path d="M1090 220 H1165 V330 H1020" />
                </g>

                {/* Traces — left / bottom */}
                <g fill="none" stroke="rgba(167,139,250,0.45)" strokeWidth="1.6" strokeLinecap="square">
                    <path d="M40 480 H180 V390 H300 V520 H120" />
                    <path d="M70 600 H280 V660" />
                    <path d="M220 430 H380 V560 H520" />
                    <path d="M30 320 H140 V250 H70" />
                </g>

                {/* IC chips */}
                <g fill="rgba(139,92,246,0.1)" stroke="rgba(196,181,253,0.4)" strokeWidth="1.2">
                    <rect x="940" y="130" width="110" height="52" rx="3" />
                    <rect x="130" y="460" width="100" height="48" rx="3" />
                    <rect x="1000" y="390" width="90" height="42" rx="3" />
                </g>

                {/* Chip pins */}
                <g stroke="rgba(167,139,250,0.45)" strokeWidth="1.2">
                    <path d="M940 142 h-10 M940 155 h-10 M940 168 h-10" />
                    <path d="M1050 142 h10 M1050 155 h10 M1050 168 h10" />
                    <path d="M130 472 h-10 M130 484 h-10 M130 496 h-10" />
                    <path d="M230 472 h10 M230 484 h10 M230 496 h10" />
                </g>

                {/* Vias */}
                <g fill="none" stroke="rgba(196,181,253,0.45)" strokeWidth="1.2">
                    <circle cx="1000" cy="250" r="7" />
                    <circle cx="1000" cy="250" r="2.5" fill="rgba(167,139,250,0.4)" stroke="none" />
                    <circle cx="300" cy="520" r="6" />
                    <circle cx="300" cy="520" r="2.2" fill="rgba(110,231,183,0.35)" stroke="none" />
                    <circle cx="1080" cy="470" r="5.5" />
                    <circle cx="140" cy="250" r="5" />
                </g>
            </svg>

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(34,32,70,0.75)_100%)]" />
        </div>
    )
}

export function Portfolio() {
    const { projects, loading, error } = useProjects()
    const { isMobile } = useResponsive()
    const availableCategories = useProjectCategories(projects)

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [slideDirection, setSlideDirection] = useState(1)

    const filteredProjects = useMemo(() => {
        if (!selectedCategory) return []
        return projects.filter((p) => (p.category || "Others") === selectedCategory)
    }, [projects, selectedCategory])

    const currentIndex = useMemo(() => {
        if (!selectedProject) return 0
        const idx = filteredProjects.findIndex((p) => p.id === selectedProject.id)
        return idx >= 0 ? idx : 0
    }, [filteredProjects, selectedProject])

    useEffect(() => {
        if (availableCategories.length > 0 && !selectedCategory) {
            setSelectedCategory(availableCategories[0])
        }
    }, [availableCategories, selectedCategory])

    useEffect(() => {
        if (filteredProjects.length === 0) {
            setSelectedProject(null)
            return
        }
        const stillVisible =
            selectedProject && filteredProjects.some((p) => p.id === selectedProject.id)
        if (!stillVisible) {
            setSlideDirection(1)
            setSelectedProject(filteredProjects[0])
        }
        // Only re-sync when the filtered list / category changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredProjects])

    const goToIndex = useCallback(
        (nextIndex: number, direction: number) => {
            if (nextIndex < 0 || nextIndex >= filteredProjects.length) return
            setSlideDirection(direction)
            setSelectedProject(filteredProjects[nextIndex])
        },
        [filteredProjects]
    )

    const goPrev = useCallback(() => goToIndex(currentIndex - 1, -1), [currentIndex, goToIndex])
    const goNext = useCallback(() => goToIndex(currentIndex + 1, 1), [currentIndex, goToIndex])

    const handleSelectProject = useCallback(
        (project: Project, index: number) => {
            setSlideDirection(index >= currentIndex ? 1 : -1)
            setSelectedProject(project)
        },
        [currentIndex]
    )

    const handleSelectCategory = useCallback((cat: string) => {
        setSelectedCategory(cat)
    }, [])

    if (loading) {
        return (
            <section
                id="portfolio"
                className="relative flex items-center justify-center overflow-hidden bg-[#222046] py-16 text-white md:py-24"
            >
                <CircuitBackdrop />
                <div className="relative z-10 px-4 text-center">
                    <h2
                        className={`font-bold tracking-tight text-gray-200 ${
                            isMobile ? "text-3xl" : "text-5xl"
                        }`}
                    >
                        Selected Projects
                    </h2>
                    <div className="mt-8 w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            </section>
        )
    }

    if (error || projects.length === 0 || !selectedCategory) {
        return (
            <section
                id="portfolio"
                className="relative flex items-center justify-center overflow-hidden bg-[#222046] py-16 text-white md:py-24"
            >
                <CircuitBackdrop />
                <div className="relative z-10 px-4 text-center">
                    <h2
                        className={`font-bold tracking-tight text-gray-200 mb-4 ${
                            isMobile ? "text-3xl" : "text-5xl"
                        }`}
                    >
                        Selected Projects
                    </h2>
                    <p className="text-white/45">{error || "No projects found."}</p>
                </div>
            </section>
        )
    }

    return (
        <section
            id="portfolio"
            className="relative overflow-hidden bg-[#222046] py-8 text-white md:py-20"
        >
            <CircuitBackdrop />
            <SectionMark mode="index" index={3} label="Portfolio" placement="top-right" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
                <motion.div
                    className="mb-3 md:mb-10"
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                >
                    <h2
                        className={`font-bold tracking-tight text-gray-200 ${
                            isMobile ? "text-3xl" : "text-5xl"
                        }`}
                    >
                        Selected Projects
                    </h2>
                </motion.div>

                <motion.div
                    className="mb-4 md:mb-8 border-b border-white/10 pb-px"
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                >
                    <CategoryFilter
                        categories={availableCategories}
                        selectedCategory={selectedCategory}
                        onSelect={handleSelectCategory}
                    />
                </motion.div>

                <div
                    className={
                        isMobile
                            ? "flex flex-col"
                            : "grid grid-cols-12 gap-10 lg:gap-14 items-start"
                    }
                >
                    {!isMobile && (
                        <motion.div
                            className="col-span-12 lg:col-span-4"
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                        >
                            <ProjectList
                                projects={filteredProjects}
                                selectedId={selectedProject?.id ?? null}
                                onSelect={handleSelectProject}
                            />
                        </motion.div>
                    )}

                    <motion.div
                        className={isMobile ? "" : "col-span-12 lg:col-span-8"}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        {selectedProject ? (
                            <ProjectPreview
                                project={selectedProject}
                                imageSrc={getValidImageSrc(selectedProject)}
                                onMaximize={() => setShowModal(true)}
                                onPrev={goPrev}
                                onNext={goNext}
                                canPrev={currentIndex > 0}
                                canNext={currentIndex < filteredProjects.length - 1}
                                currentIndex={currentIndex}
                                total={filteredProjects.length}
                                isMobile={isMobile}
                                slideDirection={slideDirection}
                            />
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-white/35 text-sm border border-dashed border-white/10">
                                Select a project
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Full projects page temporarily hidden — restore link to /projects when ready */}
                {/* <motion.div
                    className="mt-6 md:mt-16"
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                >
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
                    >
                        <span className="font-medium border-b border-white/25 group-hover:border-white/60 pb-0.5">
                            All projects
                        </span>
                        <FiArrowUpRight className="text-lg transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                </motion.div> */}
            </div>

            {selectedProject && (
                <ProjectModal
                    project={selectedProject}
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    imageSrc={getValidImageSrc(selectedProject)}
                    isMobile={isMobile}
                    categories={availableCategories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleSelectCategory}
                    projects={filteredProjects}
                    onSelectProject={handleSelectProject}
                    onPrev={goPrev}
                    onNext={goNext}
                    canPrev={currentIndex > 0}
                    canNext={currentIndex < filteredProjects.length - 1}
                    currentIndex={currentIndex}
                    total={filteredProjects.length}
                    slideDirection={slideDirection}
                />
            )}
        </section>
    )
}
