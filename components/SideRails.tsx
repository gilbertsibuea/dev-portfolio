"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FiBookOpen, FiDownload } from "react-icons/fi"
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa"
import { SiThreads } from "react-icons/si"
import { displayTitle } from "@/lib/blog/format"
import type { BlogPostListItem } from "@/lib/blog/types"

const CV_URL = "https://canva.link/2mju5fhef5q8f39"
const IDLE_MS = 1400
const OPACITY_IDLE = 0.28
const OPACITY_ACTIVE = 1
const SEEN_BLOG_KEY = "blog_seen_slug"

const SOCIALS = [
    {
        href: "https://github.com/gilbertsibuea",
        label: "GitHub",
        icon: FaGithub,
        hover: "hover:text-[#13FFAA]",
    },
    {
        href: "https://www.linkedin.com/in/gilbertsibuea/",
        label: "LinkedIn",
        icon: FaLinkedin,
        hover: "hover:text-[#1E67C6]",
    },
    {
        href: "https://www.threads.net/@gilberths__",
        label: "Threads",
        icon: SiThreads,
        hover: "hover:text-white",
    },
    {
        href: "https://instagram.com/gilberths__",
        label: "Instagram",
        icon: FaInstagram,
        hover: "hover:text-[#CE84CF]",
    },
] as const

const railEase = [0.25, 0.46, 0.45, 0.94] as const

/**
 * Fixed side rails that appear after the Hero section leaves view.
 * Dim when idle; brighten on scroll or hover; enlarge on hover for easier clicks.
 * Blog rail always shows; a short “new post” note appears only for unread titles.
 */
export function SideRails() {
    const [visible, setVisible] = useState(false)
    const [scrolling, setScrolling] = useState(false)
    const [hoverSocial, setHoverSocial] = useState(false)
    const [hoverCv, setHoverCv] = useState(false)
    const [newest, setNewest] = useState<BlogPostListItem | null>(null)
    const [showNewNote, setShowNewNote] = useState(false)
    const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        const hero = document.getElementById("hero")
        if (!hero) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                setVisible(!entry.isIntersecting)
            },
            {
                threshold: 0,
                rootMargin: "-12% 0px -12% 0px",
            }
        )

        observer.observe(hero)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (!visible) return

        const bump = () => {
            setScrolling(true)
            if (idleTimer.current) clearTimeout(idleTimer.current)
            idleTimer.current = setTimeout(() => setScrolling(false), IDLE_MS)
        }

        window.addEventListener("scroll", bump, { passive: true })
        bump()

        return () => {
            window.removeEventListener("scroll", bump)
            if (idleTimer.current) clearTimeout(idleTimer.current)
        }
    }, [visible])

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const res = await fetch("/api/blog?limit=1", { cache: "no-store" })
                const data = await res.json()
                if (cancelled || !data.success || !Array.isArray(data.posts)) return
                const post = (data.posts[0] as BlogPostListItem | undefined) ?? null
                setNewest(post)
                if (!post) {
                    setShowNewNote(false)
                    return
                }
                const seen = localStorage.getItem(SEEN_BLOG_KEY)
                setShowNewNote(seen !== post.slug)
            } catch {
                // silent
            }
        })()
        return () => {
            cancelled = true
        }
    }, [])

    const markSeen = () => {
        if (!newest) return
        localStorage.setItem(SEEN_BLOG_KEY, newest.slug)
        setShowNewNote(false)
    }

    const socialActive = scrolling || hoverSocial
    const cvActive = scrolling || hoverCv
    const newTitle = newest ? displayTitle(newest, "en") : ""

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Left — Find me on */}
                    <motion.div
                        key="side-rail-social"
                        initial={{ opacity: 0, x: -28, y: "-50%", scale: 1 }}
                        animate={{
                            opacity: socialActive ? OPACITY_ACTIVE : OPACITY_IDLE,
                            x: 0,
                            y: "-50%",
                            scale: hoverSocial ? 1.14 : 1,
                        }}
                        exit={{ opacity: 0, x: -24, y: "-50%", scale: 1 }}
                        transition={{ duration: 0.35, ease: railEase }}
                        style={{ transformOrigin: "left center" }}
                        className="pointer-events-auto fixed left-0 top-1/2 z-40 hidden md:block"
                        aria-label="Social links"
                        onMouseEnter={() => setHoverSocial(true)}
                        onMouseLeave={() => setHoverSocial(false)}
                    >
                        <div className="flex items-center gap-3 rounded-r-2xl border border-l-0 border-white/10 bg-[#14122a]/85 py-4 pl-2.5 pr-3 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.65)] backdrop-blur-md">
                            <span className="select-none text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 [writing-mode:vertical-rl] rotate-180">
                                Find me on
                            </span>
                            <ul className="flex flex-col gap-3">
                                {SOCIALS.map(({ href, label, icon: Icon, hover }) => (
                                    <li key={label}>
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={label}
                                            className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/75 transition-transform duration-200 ${hover} hover:scale-125 hover:bg-white/10`}
                                        >
                                            <Icon className="text-xl" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* Right — Download CV + Blog */}
                    <motion.div
                        key="side-rail-cv"
                        initial={{ opacity: 0, x: 28, y: "-50%", scale: 1 }}
                        animate={{
                            opacity: cvActive ? OPACITY_ACTIVE : OPACITY_IDLE,
                            x: 0,
                            y: "-50%",
                            scale: hoverCv ? 1.08 : 1,
                        }}
                        exit={{ opacity: 0, x: 24, y: "-50%", scale: 1 }}
                        transition={{ duration: 0.35, ease: railEase }}
                        style={{ transformOrigin: "right center" }}
                        className="pointer-events-auto fixed right-0 top-1/2 z-40 hidden md:block"
                        aria-label="CV and blog"
                        onMouseEnter={() => setHoverCv(true)}
                        onMouseLeave={() => setHoverCv(false)}
                    >
                        <div className="flex flex-col items-end gap-2">
                            <a
                                href={CV_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-3 rounded-l-2xl border border-r-0 border-white/10 bg-[#14122a]/85 py-4 pl-3 pr-2.5 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.65)] backdrop-blur-md transition-colors hover:border-violet-400/30 hover:bg-[#1a1832]/90"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/15 text-violet-200 transition-transform duration-200 group-hover:scale-125">
                                    <FiDownload className="text-xl" />
                                </span>
                                <span className="select-none text-[10px] font-medium uppercase tracking-[0.2em] text-white/70 [writing-mode:vertical-rl]">
                                    Download CV
                                </span>
                            </a>

                            {/* Blog always present */}
                            <div className="relative flex flex-col items-end">
                                <AnimatePresence>
                                    {showNewNote && newest && (
                                        <motion.div
                                            key={newest.slug}
                                            initial={{ opacity: 0, x: 12, y: 4 }}
                                            animate={{ opacity: 1, x: 0, y: 0 }}
                                            exit={{ opacity: 0, x: 8 }}
                                            transition={{ duration: 0.3, ease: railEase }}
                                            className="mb-2 w-[12.5rem] rounded-l-xl border border-r-0 border-violet-400/25 bg-[#1a1832]/95 px-3 py-2.5 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.65)] backdrop-blur-md"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-violet-300/80">
                                                    New post
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={markSeen}
                                                    className="text-[10px] leading-none text-white/30 hover:text-white/60"
                                                    aria-label="Dismiss"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <Link
                                                href={`/blog/${newest.slug}`}
                                                onClick={markSeen}
                                                className="mt-1 block text-[12px] leading-snug text-white/80 transition-colors hover:text-violet-200"
                                                title={newTitle}
                                            >
                                                <span className="line-clamp-2">{newTitle}</span>
                                            </Link>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Link
                                    href="/blog"
                                    onClick={markSeen}
                                    className="group relative flex items-center gap-3 rounded-l-2xl border border-r-0 border-white/10 bg-[#14122a]/85 py-4 pl-3 pr-2.5 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.65)] backdrop-blur-md transition-colors hover:border-violet-400/30 hover:bg-[#1a1832]/90"
                                    aria-label="Blog"
                                >
                                    {showNewNote && (
                                        <span
                                            className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-400"
                                            aria-hidden
                                        />
                                    )}
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/15 text-violet-200 transition-transform duration-200 group-hover:scale-110">
                                        <FiBookOpen className="text-lg" />
                                    </span>
                                    <span className="select-none text-[10px] font-medium uppercase tracking-[0.2em] text-white/70 [writing-mode:vertical-rl]">
                                        Blog
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
