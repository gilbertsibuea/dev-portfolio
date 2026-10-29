"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FiDownload } from "react-icons/fi"
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa"
import { SiThreads } from "react-icons/si"

const CV_URL = "https://canva.link/2mju5fhef5q8f39"
const IDLE_MS = 1400
const OPACITY_IDLE = 0.28
const OPACITY_ACTIVE = 1

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
 */
export function SideRails() {
    const [visible, setVisible] = useState(false)
    const [scrolling, setScrolling] = useState(false)
    const [hoverSocial, setHoverSocial] = useState(false)
    const [hoverCv, setHoverCv] = useState(false)
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

    const socialActive = scrolling || hoverSocial
    const cvActive = scrolling || hoverCv

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

                    {/* Right — Download CV */}
                    <motion.div
                        key="side-rail-cv"
                        initial={{ opacity: 0, x: 28, y: "-50%", scale: 1 }}
                        animate={{
                            opacity: cvActive ? OPACITY_ACTIVE : OPACITY_IDLE,
                            x: 0,
                            y: "-50%",
                            scale: hoverCv ? 1.14 : 1,
                        }}
                        exit={{ opacity: 0, x: 24, y: "-50%", scale: 1 }}
                        transition={{ duration: 0.35, ease: railEase }}
                        style={{ transformOrigin: "right center" }}
                        className="pointer-events-auto fixed right-0 top-1/2 z-40 hidden md:block"
                        aria-label="Download CV"
                        onMouseEnter={() => setHoverCv(true)}
                        onMouseLeave={() => setHoverCv(false)}
                    >
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
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
