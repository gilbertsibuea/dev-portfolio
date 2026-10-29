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
                className="py-16 md:py-24 flex items-center justify-center bg-[#222046] text-white"
            >
                <div className="text-center px-4">
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
                className="py-16 md:py-24 flex items-center justify-center bg-[#222046] text-white"
            >
                <div className="text-center px-4">
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
            className="py-8 md:py-20 bg-[#222046] text-white relative"
        >
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
