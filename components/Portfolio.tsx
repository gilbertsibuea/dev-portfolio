"use client"

import React, { Fragment, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, Transition } from "@headlessui/react"

// Types
interface Project {
    id: number
    year: number
    title: string
    description: string
    image: { src: string } | string
    gifUrl?: string
    languages: string[]
    details?: string
    githubLink?: string
    liveLink?: string
    category?: string
}

// Theme constants
const THEME = {
    colors: {
        primary: '#222046',
        secondary: '#7875A2',
        accent: '#8B5CF6',
        text: '#FFFFFF',
        textSecondary: 'rgba(255, 255, 255, 0.8)',
    },
    spacing: {
        xs: '0.5rem',
        sm: '1rem', 
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
    },
    borderRadius: {
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
    }
}

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

// Custom hooks
const useResponsive = () => {
    const [isMobile, setIsMobile] = useState(false)
    const [isTablet, setIsTablet] = useState(false)

    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.innerWidth < 768)
            setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
        }
        
        checkDevice()
        window.addEventListener('resize', checkDevice)
        return () => window.removeEventListener('resize', checkDevice)
    }, [])

    return { isMobile, isTablet, isDesktop: !isMobile && !isTablet }
}

const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const baseUrl = window.location.origin
                const res = await fetch(`${baseUrl}/api/projects/selected`)
                const contentType = res.headers.get('content-type') || ''

                if (!res.ok || !contentType.includes('application/json')) {
                    throw new Error('Failed to fetch projects')
                }

                const data = await res.json()
                
                if (data.success && data.projects?.length > 0) {
                    setProjects(data.projects)
                } else {
                    setError('No projects found')
                }
            } catch (err) {
                setError('Failed to fetch projects')
                console.error('Error fetching projects:', err)
            } finally {
                setLoading(false)
            }
        }
        
        fetchProjects()
    }, [])

    return { projects, loading, error }
}

// Sub-components
const ProjectCard: React.FC<{
    project: Project
    isSelected: boolean
    onClick: () => void
    isMobile: boolean
}> = ({ project, isSelected, onClick, isMobile }) => (
    <motion.div
        onClick={onClick}
        className={`
            p-4 md:p-6 rounded-xl cursor-pointer transition-all duration-300 select-none
            ${isSelected 
                ? 'bg-[#7875A2] shadow-lg transform scale-[1.02]' 
                : 'bg-gray-700/60 hover:bg-gray-600/60'
            }
            ${isMobile ? 'min-h-[120px]' : 'min-h-[140px]'}
        `}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
    >
        <h3 className={`font-bold text-white mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
            {project.title}
        </h3>
        <p className={`text-white/80 leading-relaxed mb-3 ${isMobile ? 'text-sm' : 'text-sm'} line-clamp-2`}>
            {project.description}
        </p>
        
        {project.languages && project.languages.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
                {project.languages.slice(0, isMobile ? 2 : 3).map((lang, idx) => (
                    <span 
                        key={idx} 
                        className={`px-2.5 py-1 rounded-lg text-white ${isMobile ? 'text-xs' : 'text-sm'}`}
                        style={{ background: THEME.colors.primary }}
                    >
                        {lang}
                    </span>
                ))}
                {project.languages.length > (isMobile ? 2 : 3) && (
                    <span 
                        className={`px-2.5 py-1 rounded-lg text-white ${isMobile ? 'text-xs' : 'text-sm'}`}
                        style={{ background: THEME.colors.primary }}
                    >
                        +{project.languages.length - (isMobile ? 2 : 3)}
                    </span>
                )}
            </div>
        )}
    </motion.div>
)

const CATEGORY_LABELS = ['Web', 'ML & AI', 'Data', 'Mobile', 'Others'];

const CategoryFilter: React.FC<{
    isMobile: boolean,
    categories: string[],
    selectedCategory: string | null,
    onSelect: (cat: string) => void
}> = ({ isMobile, categories, selectedCategory, onSelect }) => (
    <motion.div 
        className="p-3 md:p-4 rounded-xl bg-gray-700/60 mb-4 md:mb-6"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
    >
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onSelect(category)}
                    className={`
                        px-3 md:px-4 py-2 rounded-lg transition-all duration-300
                        ${isMobile ? 'text-sm' : 'text-base'}
                        ${selectedCategory === category 
                            ? 'bg-violet-600 text-white font-bold' 
                            : 'bg-gray-800 text-white/80 hover:bg-violet-700/30'}
                    `}
                >
                    {category}
                </button>
            ))}
        </div>
        {isMobile && (
            <p className="text-center text-xs text-white/60 mt-2">
                {categories.length === 0 ? "No categories available" : "Tap category to filter"}
            </p>
        )}
    </motion.div>
)


// Helper function to check if file is a video
const isVideoFile = (url: string): boolean => {
    return url.includes('.webm') || url.includes('.mp4') || url.includes('.mov');
};

const ProjectDisplay: React.FC<{
    project: Project
    showDetails: boolean
    onToggleDetails: () => void
    onMaximize: () => void
    getValidImageSrc: (project: Project) => string
    isMobile: boolean
}> = ({ project, showDetails, onToggleDetails, onMaximize, getValidImageSrc, isMobile }) => (
    <div className={`bg-gray-700/60 rounded-xl overflow-hidden relative ${isMobile ? 'h-[55vh]' : 'h-[500px]'}`}>
        {/* Control Buttons */}
        <div className="absolute top-2 md:top-4 right-2 md:right-4 z-20 flex gap-2">
            <button
                onClick={onToggleDetails}
                className={`
                    bg-black/60 hover:bg-black/80 text-white rounded-lg shadow-lg 
                    transition-all duration-200 font-medium
                    ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'}
                `}
            >
                {showDetails ? "Hide" : "Show"}
            </button>
            <button
                onClick={onMaximize}
                className={`
                    bg-violet-600/80 hover:bg-violet-700 text-white rounded-lg shadow-lg 
                    transition-all duration-200 font-medium
                    ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'}
                `}
            >
                {isMobile ? "Full" : "Maximize"}
            </button>
        </div>

        <div className="h-full w-full relative overflow-hidden">
            {isVideoFile(getValidImageSrc(project)) ? (
                <video
                    src={getValidImageSrc(project)}
                    className="w-full h-full object-cover transition-all duration-500"
                    autoPlay
                    loop
                    muted
                    playsInline
                    // onLoadedData={() => {
                    //     console.log(`✅ Video loaded for ${project.title}:`, getValidImageSrc(project));
                    // }}
                    onError={(e) => {
                        // console.error(`❌ Video failed for ${project.title}:`, getValidImageSrc(project));
                        // Optionally set a fallback here
                        e.currentTarget.style.display = 'none'; // Hide the video element
                    }}
                />
            ) : (
                <img
                    src={getValidImageSrc(project)}
                    alt={project.title}
                    className="w-full h-full object-cover transition-all duration-500"
                    loading="lazy"
                    onError={(e) => {
                        if (!e.currentTarget.src.endsWith('/proj1.gif')) {
                            e.currentTarget.src = '/proj1.gif';
                        }
                    }}
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            
            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute bottom-0 left-0 right-0 ${isMobile ? 'p-4' : 'p-6 md:p-8'}`}
                    >
                        <div className="space-y-3 md:space-y-4 text-left max-w-4xl">
                            <div>
                                <h3 className={`font-bold text-white mb-2 ${isMobile ? 'text-lg' : 'text-xl md:text-2xl'}`}>
                                    {project.title}
                                </h3>
                                <p className={`text-white/90 leading-relaxed ${isMobile ? 'text-xs' : 'text-sm'} max-w-2xl`}>
                                    {project.description}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 md:gap-4">
                                {project.languages && project.languages.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {project.languages.map((lang, idx) => (
                                            <span 
                                                key={idx} 
                                                className={`px-2.5 py-1 rounded-lg text-white backdrop-blur-sm ${isMobile ? 'text-xs' : 'text-xs'}`}
                                                style={{ background: 'rgba(34, 32, 70, 0.8)' }}
                                            >
                                                {lang}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2 md:gap-3">
                                    {project.liveLink && (
                                        <Link href={project.liveLink} target="_blank">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`
                                                    bg-violet-500/90 backdrop-blur-sm text-white rounded-lg 
                                                    font-semibold hover:bg-violet-600 transition-colors
                                                    ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-base'}
                                                `}
                                            >
                                                {isMobile ? 'Demo' : 'Live Demo'}
                                            </motion.button>
                                        </Link>
                                    )}
                                    {project.githubLink && (
                                        <Link href={project.githubLink} target="_blank">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`
                                                    bg-black/50 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg 
                                                    font-semibold hover:bg-black/70 hover:border-white/50 transition-colors
                                                    ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-base'}
                                                `}
                                            >
                                                {isMobile ? 'Code' : 'View Code'}
                                            </motion.button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
)

const ProjectModal: React.FC<{
    project: Project
    isOpen: boolean
    onClose: () => void
    getValidImageSrc: (project: Project) => string
    isMobile: boolean
}> = ({ project, isOpen, onClose, getValidImageSrc, isMobile }) => (
    <Transition show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
            {/* Full Screen Modal */}
            <div className="min-h-screen">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm" />
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
                    <div className="fixed inset-0 flex flex-col">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className={`
                                absolute top-4 right-4 z-10 
                                bg-black/80 hover:bg-black/90 text-white rounded-xl shadow-lg 
                                transition-all duration-200 font-semibold
                                ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'}
                            `}
                        >
                            ✕ Close
                        </button>
                        
                        {/* Full Project Image - Takes most of the screen */}
                        <div className={`flex-1 relative ${isMobile ? 'min-h-[50vh]' : 'min-h-[70vh]'}`}>
                            {isVideoFile(getValidImageSrc(project)) ? (
                                <video
                                    src={getValidImageSrc(project)}
                                    className="w-full h-full object-contain bg-gray-900"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    // onLoadedData={() => {
                                    //     console.log(`✅ Video loaded for ${project.title}:`, getValidImageSrc(project));
                                    // }}
                                    onError={(e) => {
                                        // console.error(`❌ Video failed for ${project.title}:`, getValidImageSrc(project));
                                        // Optionally set a fallback here
                                        e.currentTarget.style.display = 'none'; // Hide the video element
                                    }}
                                />
                            ) : (
                                <img
                                    src={getValidImageSrc(project)}
                                    alt={project.title}
                                    className="w-full h-full object-contain bg-gray-900"
                                />
                            )}
                            {/* Gradient overlay for text readability */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent h-32" />
                            
                            {/* Technology overlay - bottom left */}
                            {project.languages && project.languages.length > 0 && (
                                <div className={`absolute bottom-4 left-4 z-10 ${isMobile ? 'max-w-[70%]' : 'max-w-[50%]'}`}>
                                    <div className="flex flex-wrap gap-2">
                                        {project.languages.map((lang, idx) => (
                                            <span 
                                                key={idx} 
                                                className={`
                                                    px-3 py-1.5 rounded-lg text-white/95 bg-black/60 backdrop-blur-md
                                                    border border-white/20 shadow-lg
                                                    ${isMobile ? 'text-xs' : 'text-sm'}
                                                `}
                                            >
                                                {lang}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Compact Info Section */}
                        <div className={`
                            bg-gray-900/95 backdrop-blur-md border-t border-white/10
                            ${isMobile ? 'p-4' : 'p-6'}
                        `}>
                            <div className="max-w-7xl mx-auto">
                                <div className={`
                                    flex flex-col gap-4
                                    ${isMobile ? '' : 'lg:flex-row lg:items-center lg:justify-between'}
                                `}>
                                    {/* Project Info */}
                                    <div className="flex-1 max-h-[40vh] overflow-y-auto pr-2">
                                        <h2 className={`
                                            font-bold text-white mb-2
                                            ${isMobile ? 'text-xl' : 'text-2xl lg:text-3xl'}
                                        `}>
                                            {project.title}
                                        </h2>
                                        
                                        {/* Description - Short summary */}
                                        <p className={`
                                            text-white/90 leading-relaxed mb-3 font-medium
                                            ${isMobile ? 'text-sm' : 'text-base'}
                                        `}>
                                            {project.description}
                                        </p>
                                        
                                        {/* Details - Full explanation with scroll */}
                                        {project.details && (
                                            <div className="border-t border-white/20 pt-3 mt-3">
                                                <h4 className="text-sm font-semibold mb-2 text-violet-400">Details</h4>
                                                <p className={`
                                                    text-white/70 leading-relaxed whitespace-pre-line
                                                    ${isMobile ? 'text-xs' : 'text-sm'}
                                                `}>
                                                    {project.details}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* Technologies - Compact display */}
                                        {project.languages && project.languages.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {project.languages.slice(0, isMobile ? 3 : 6).map((lang, idx) => (
                                                    <span 
                                                        key={idx} 
                                                        className={`
                                                            px-2.5 py-1 rounded-lg text-white/90 bg-white/10 backdrop-blur-sm
                                                            ${isMobile ? 'text-xs' : 'text-sm'}
                                                        `}
                                                    >
                                                        {lang}
                                                    </span>
                                                ))}
                                                {project.languages.length > (isMobile ? 3 : 6) && (
                                                    <span className={`
                                                        px-2.5 py-1 rounded-lg text-violet-300 bg-violet-500/20 backdrop-blur-sm
                                                        ${isMobile ? 'text-xs' : 'text-sm'}
                                                    `}>
                                                        +{project.languages.length - (isMobile ? 3 : 6)} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className={`
                                        flex gap-3 
                                        ${isMobile ? 'flex-col' : 'lg:flex-col xl:flex-row'}
                                    `}>
                                        {project.liveLink && (
                                            <Link href={project.liveLink} target="_blank">
                                                <button className={`
                                                    bg-violet-500/90 hover:bg-violet-600 text-white rounded-lg font-semibold 
                                                    transition-colors w-full lg:w-auto
                                                    ${isMobile ? 'px-6 py-3 text-sm' : 'px-8 py-3 text-base'}
                                                `}>
                                                    {isMobile ? 'Demo' : 'Live Demo'}
                                                </button>
                                            </Link>
                                        )}
                                        {project.githubLink && (
                                            <Link href={project.githubLink} target="_blank">
                                                <button className={`
                                                    bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-white/50 
                                                    text-white rounded-lg font-semibold transition-colors w-full lg:w-auto
                                                    ${isMobile ? 'px-6 py-3 text-sm' : 'px-8 py-3 text-base'}
                                                `}>
                                                    {isMobile ? 'Code' : 'View Code'}
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition.Child>
            </div>
        </Dialog>
    </Transition>
)

// Main Component
export const Portfolio = () => {
    const { projects, loading, error } = useProjects();
    const { isMobile } = useResponsive();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showDetails, setShowDetails] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Get available categories from projects
    const availableCategories = React.useMemo(() => {
        const cats = projects
            .map(p => p.category || "Others")
            .filter((v, i, arr) => arr.indexOf(v) === i && v); // unique and not null
        // Keep order as in CATEGORY_LABELS
        return CATEGORY_LABELS.filter(label => cats.includes(label)).concat(
            cats.filter(cat => !CATEGORY_LABELS.includes(cat))
        );
    }, [projects]);

    // Filter projects by selected category
    const filteredProjects = React.useMemo(() => {
        if (!selectedCategory) return [];
        return projects.filter(p => (p.category || "Others") === selectedCategory);
    }, [projects, selectedCategory]);

    // Auto-select first category and project when projects load
    useEffect(() => {
        if (availableCategories.length > 0 && !selectedCategory) {
            setSelectedCategory(availableCategories[0]);
        }
    }, [availableCategories, selectedCategory]);

    // Auto-select first project when category changes
    useEffect(() => {
        if (filteredProjects.length > 0) {
            setSelectedProject(filteredProjects[0]);
        } else {
            setSelectedProject(null);
        }
    }, [filteredProjects]);

    // Auto-hide details on mobile initially
    // useEffect(() => {
    //     if (isMobile) {
    //         setShowDetails(false);
    //     }
    // }, [isMobile]);

    const getValidImageSrc = useCallback((project: Project): string => {
        const fallbackImage = '/proj1.gif';
        try {
            if (!project?.image) return fallbackImage;

            const resolveSrc = (src: string): string => {
                if (!src || src.includes('[object Object]')) return fallbackImage;
                // Blob URLs are temporary (created during upload sessions) and invalid outside that session
                if (src.startsWith('blob:')) return fallbackImage;
                if (src.includes('uploads/'))
                    return src.startsWith('/') ? src : '/' + src;
                return src;
            };

            // Prefer gifUrl over the main image for portfolio display
            if (project.gifUrl && project.gifUrl.trim()) {
                const resolved = resolveSrc(project.gifUrl.trim());
                if (resolved !== fallbackImage) return resolved;
            }

            if (typeof project.image === 'object' && project.image?.src) {
                return resolveSrc(project.image.src);
            }
            if (typeof project.image === 'string') {
                return resolveSrc(project.image.trim());
            }
            return fallbackImage;
        } catch {
            return fallbackImage;
        }
    }, []);

    if (loading) {
        return (
            <section 
                id="portfolio" 
                className="min-h-screen flex items-center justify-center text-white"
                style={{ background: THEME.colors.primary }}
            >
                <div className="text-center px-4">
                    <h2 className={`font-bold mb-6 text-white ${isMobile ? 'text-3xl' : 'text-6xl'}`}>
                        Selected <span className="text-gray-200">Projects</span>
                    </h2>
                    <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            </section>
        );
    }

    if (error || projects.length === 0 || !selectedCategory) {
        return (
            <section 
                id="portfolio" 
                className="min-h-screen flex items-center justify-center text-white"
                style={{ background: THEME.colors.primary }}
            >
                <div className="text-center px-4">
                    <h2 className={`font-bold mb-6 text-white ${isMobile ? 'text-3xl' : 'text-6xl'}`}>
                        Selected <span className="text-gray-200">Projects</span>
                    </h2>
                    <p className="text-gray-400 text-lg">{error || 'No projects found. Check back later!'}</p>
                </div>
            </section>
        );
    }

    return (
        <section 
            className="min-h-screen py-8 md:py-16 relative overflow-visible md:overflow-hidden text-white" 
            style={{ background: THEME.colors.primary }} 
            id="portfolio"
        >
            <div className="relative z-10 max-w-7xl mx-auto px-4 h-full">
                {/* Header */}
                <motion.div 
                    className="text-center mb-8 md:mb-16"
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                >
                    <h2 className={`font-bold text-white ${isMobile ? 'text-3xl md:text-4xl' : 'text-6xl'}`}>
                        Selected Projects
                    </h2>
                    <p className={`mt-4 text-white/80 ${isMobile ? 'text-sm md:text-base' : 'text-lg'}`}>
                        A curated showcase of my best work across various domains.
                    </p>
                </motion.div>

                {/* Main Layout */}
                <div className={`
                    ${isMobile 
                        ? 'flex flex-col gap-6' 
                        : 'flex flex-col lg:flex-row gap-6 min-h-[800px]'
                    }
                `}>
                    {/* Project List */}
                    <motion.div 
                        className={`
                            ${isMobile 
                                ? 'order-2' 
                                : 'lg:w-2/5 shrink-0 pr-4 pl-2 ml-[-8px] max-h-[700px] overflow-y-auto'
                            }
                        `}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className={`space-y-3 md:space-y-4 ${isMobile ? 'max-h-64 overflow-visible' : ''}`}>
                            {filteredProjects.length === 0 ? (
                                <div className="text-gray-400 text-center py-8">No projects in this category.</div>
                            ) : (
                                filteredProjects.map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        isSelected={selectedProject?.id === project.id}
                                        onClick={() => setSelectedProject(project)}
                                        isMobile={isMobile}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Main Display */}
                    <motion.div 
                        className={`${isMobile ? 'order-1' : 'lg:flex-1 min-w-0'}`}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        {isMobile ? (
                            <div className="sticky top-24 z-20 bg-gray-700/60 backdrop-blur-md rounded-xl px-2 py-2 border border-white/5">
                                <CategoryFilter 
                                    isMobile={isMobile}
                                    categories={availableCategories}
                                    selectedCategory={selectedCategory}
                                    onSelect={cat => setSelectedCategory(cat)}
                                />
                            </div>
                        ) : (
                            <CategoryFilter 
                                isMobile={isMobile}
                                categories={availableCategories}
                                selectedCategory={selectedCategory}
                                onSelect={cat => setSelectedCategory(cat)}
                            />
                        )}
                        
                        {selectedProject ? (
                            <ProjectDisplay
                                project={selectedProject}
                                showDetails={showDetails}
                                onToggleDetails={() => setShowDetails(!showDetails)}
                                onMaximize={() => setShowModal(true)}
                                getValidImageSrc={getValidImageSrc}
                                isMobile={isMobile}
                            />
                        ) : (
                            <div className="bg-gray-700/60 rounded-xl flex items-center justify-center h-[300px] text-gray-400">
                                No project selected in this category.
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* CTA */}
                <motion.div 
                    className="text-center pt-12 md:pt-2 pb-8 md:pb-0 relative z-10"
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                >
                    <Link href="/projects">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                                bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl 
                                font-semibold shadow-lg transition-all duration-300
                                ${isMobile ? 'px-8 py-3 text-base' : 'px-12 py-5 text-lg'}
                            `}
                        >
                            Explore All Projects
                        </motion.button>
                    </Link>
                </motion.div>
            </div>

            {/* Modal */}
            {selectedProject && (
                <ProjectModal
                    project={selectedProject}
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    getValidImageSrc={getValidImageSrc}
                    isMobile={isMobile}
                />
            )}
        </section>
    );
}