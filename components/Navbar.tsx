'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import React, { useCallback, useEffect, useRef, useState } from "react"
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    useScroll,
    useSpring,
    type Transition,
} from "framer-motion"
import type { IconType } from "react-icons"
import {
    FiBookOpen,
    FiBriefcase,
    FiGrid,
    FiHome,
    FiLayers,
    FiMail,
    FiMenu,
    FiUser,
    FiX,
} from "react-icons/fi"

type NavItem = {
    id: string
    title: string
    path: string
    icon: IconType
}

const NAV_ITEMS: NavItem[] = [
    { id: "hero", title: "Home", path: "#hero", icon: FiHome },
    { id: "stack", title: "Skills", path: "#stack", icon: FiLayers },
    { id: "experience", title: "Experience", path: "#experience", icon: FiBriefcase },
    { id: "portfolio", title: "Portfolio", path: "#portfolio", icon: FiGrid },
    { id: "blog", title: "Blog", path: "/blog", icon: FiBookOpen },
    { id: "about", title: "About", path: "#about", icon: FiUser },
    { id: "contact", title: "Contact", path: "#contact", icon: FiMail },
]

const SECTION_IDS = NAV_ITEMS.filter((item) => item.path.startsWith("#")).map(
    (item) => item.id
)

const COLLAPSE_DELAY_MS = 280
/** Treat as Home while still within the first part of the hero */
const HERO_SCROLL_LOCK_PX = 120
/** Active section = the one whose top is nearest below this viewport ratio */
const ACTIVE_MARKER = 0.28
const RADIUS = 999

const islandSpring = { type: "spring", stiffness: 420, damping: 36, mass: 0.8 } as const
const popSpring = { type: "spring", stiffness: 600, damping: 24 } as const

/**
 * Resolve which section owns the viewport.
 * Explicit Home lock near the top so we never stick on Skills after scrolling up.
 */
function resolveActiveSection(): string {
    if (typeof window === "undefined") return "hero"

    if (window.scrollY <= HERO_SCROLL_LOCK_PX) return "hero"

    const marker = window.innerHeight * ACTIVE_MARKER
    let current = "hero"
    let bestTop = -Infinity

    for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        // Section covers the marker line
        if (rect.top <= marker && rect.bottom > marker) {
            if (rect.top >= bestTop) {
                bestTop = rect.top
                current = id
            }
        }
    }

    // Fallback: last section whose top has passed the marker
    if (current === "hero" && window.scrollY > HERO_SCROLL_LOCK_PX) {
        bestTop = -Infinity
        for (const id of SECTION_IDS) {
            if (id === "hero") continue
            const el = document.getElementById(id)
            if (!el) continue
            const top = el.getBoundingClientRect().top
            if (top <= marker && top > bestTop) {
                bestTop = top
                current = id
            }
        }
    }

    const doc = document.documentElement
    const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 8
    if (atBottom && document.getElementById("contact")) return "contact"

    return current
}

function useActiveSection(enabled: boolean): string {
    const [active, setActive] = useState("hero")

    useEffect(() => {
        if (!enabled) {
            setActive("hero")
            return
        }

        let frame = 0
        const measure = () => {
            frame = 0
            setActive(resolveActiveSection())
        }
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(measure)
        }

        measure()
        window.addEventListener("scroll", schedule, { passive: true })
        window.addEventListener("resize", schedule)
        return () => {
            window.removeEventListener("scroll", schedule)
            window.removeEventListener("resize", schedule)
            if (frame) cancelAnimationFrame(frame)
        }
    }, [enabled])

    return active
}

function useCanHover(): boolean {
    const [canHover, setCanHover] = useState(true)

    useEffect(() => {
        const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
        const update = () => setCanHover(mq.matches)
        update()
        mq.addEventListener("change", update)
        return () => mq.removeEventListener("change", update)
    }, [])

    return canHover
}

function hrefFor(item: NavItem, onHome: boolean) {
    if (item.path.startsWith("#") && !onHome) return `/${item.path}`
    return item.path
}

function CollapsedIsland({
    item,
    onHome,
    progress,
    onClick,
}: {
    item: NavItem
    onHome: boolean
    progress: ReturnType<typeof useSpring>
    onClick: (event: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => void
}) {
    const Icon = item.icon
    return (
        <div className="relative flex items-center px-2 py-2.5">
            <Link
                href={hrefFor(item, onHome)}
                prefetch={!item.path.startsWith("#")}
                onClick={(event) => onClick(event, item)}
                aria-label={item.title}
                aria-current="location"
                className="relative flex h-11 items-center gap-2.5 rounded-full pl-3.5 pr-4.5 text-white outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
                <Icon className="text-[20px]" aria-hidden />
                <span className="whitespace-nowrap text-sm font-medium">
                    {item.title}
                </span>
            </Link>
            <motion.span
                style={{ scaleX: progress }}
                className="pointer-events-none absolute inset-x-5 bottom-0 h-px origin-left bg-gradient-to-r from-white/0 via-white/80 to-white/90"
                aria-hidden
            />
        </div>
    )
}

export const Navbar = () => {
    const pathname = usePathname()
    const router = useRouter()
    const onHome = pathname === "/"
    const reduceMotion = useReducedMotion()
    const canHover = useCanHover()
    const active = useActiveSection(onHome)

    const [hovered, setHovered] = useState(false)
    const [keyboardFocus, setKeyboardFocus] = useState(false)
    const [hoverId, setHoverId] = useState<string | null>(null)
    const [mobileOpen, setMobileOpen] = useState(false)

    const navRef = useRef<HTMLElement>(null)
    const mobileMenuRef = useRef<HTMLDivElement>(null)
    const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const itemRefs = useRef<Map<string, HTMLElement>>(new Map())
    const [lens, setLens] = useState<{ x: number; width: number } | null>(null)

    const { scrollYProgress } = useScroll()
    const progress = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 30,
        restDelta: 0.001,
    })

    // Full bar on Home (or while hovering / keyboard); island elsewhere
    const inHomeZone = !onHome || active === "hero"
    const expanded = inHomeZone || hovered || keyboardFocus

    const island = (spring: Transition) => (reduceMotion ? { duration: 0 } : spring)

    const clearHoverChrome = useCallback(() => {
        setHoverId(null)
        setLens(null)
    }, [])

    // Measure hover lens from live DOM — never trust stale offset during layout anim
    const updateLens = useCallback((id: string | null) => {
        if (!id || !expanded) {
            setLens(null)
            return
        }
        const el = itemRefs.current.get(id)
        if (!el) {
            setLens(null)
            return
        }
        setLens({ x: el.offsetLeft, width: el.offsetWidth })
    }, [expanded])

    useEffect(() => {
        if (!expanded) clearHoverChrome()
    }, [expanded, clearHoverChrome])

    // While hovering, keep lens aligned if the bar resizes
    useEffect(() => {
        if (!expanded || !hoverId) return
        updateLens(hoverId)
        const nav = navRef.current
        if (!nav || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => updateLens(hoverId))
        ro.observe(nav)
        return () => ro.disconnect()
    }, [expanded, hoverId, updateLens])

    // Drop hover when user scrolls the page (avoids sticky hover after click-to-section)
    useEffect(() => {
        if (!hovered) return
        const onScroll = () => {
            if (leaveTimer.current) clearTimeout(leaveTimer.current)
            setHovered(false)
            clearHoverChrome()
        }
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [hovered, clearHoverChrome])

    useEffect(() => {
        return () => {
            if (leaveTimer.current) clearTimeout(leaveTimer.current)
        }
    }, [])

    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    useEffect(() => {
        if (!mobileOpen) return
        const onPointerDown = (event: PointerEvent) => {
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target as Node)
            ) {
                setMobileOpen(false)
            }
        }
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setMobileOpen(false)
        }
        document.addEventListener("pointerdown", onPointerDown)
        document.addEventListener("keydown", onKey)
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.removeEventListener("pointerdown", onPointerDown)
            document.removeEventListener("keydown", onKey)
            document.body.style.overflow = prev
        }
    }, [mobileOpen])

    const handleMouseEnter = () => {
        if (!canHover) return
        if (leaveTimer.current) clearTimeout(leaveTimer.current)
        setHovered(true)
    }

    const handleMouseLeave = () => {
        if (!canHover) return
        clearHoverChrome()
        if (leaveTimer.current) clearTimeout(leaveTimer.current)
        leaveTimer.current = setTimeout(() => setHovered(false), COLLAPSE_DELAY_MS)
    }

    const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
        const nav = navRef.current
        if (!nav) return
        const rect = nav.getBoundingClientRect()
        nav.style.setProperty("--mx", `${event.clientX - rect.left}px`)
        nav.style.setProperty("--my", `${event.clientY - rect.top}px`)
    }

    const handleFocus = (event: React.FocusEvent<HTMLElement>) => {
        if (event.target.matches(":focus-visible")) setKeyboardFocus(true)
    }

    const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setKeyboardFocus(false)
            clearHoverChrome()
        }
    }

    const setItemHover = (id: string) => {
        if (!expanded) return
        setHoverId(id)
        // Defer measure to after paint so widths are correct post-expand
        requestAnimationFrame(() => updateLens(id))
    }

    const navigateToItem = useCallback(
        (item: NavItem) => {
            setMobileOpen(false)
            setHovered(false)
            clearHoverChrome()
            if (!item.path.startsWith("#")) return false

            if (!onHome) {
                router.push(`/${item.path}`)
                return true
            }
            document.getElementById(item.id)?.scrollIntoView({
                behavior: reduceMotion ? "auto" : "smooth",
                block: "start",
            })
            return true
        },
        [onHome, reduceMotion, router, clearHoverChrome]
    )

    const handleDesktopClick = useCallback(
        (event: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
            if (!item.path.startsWith("#")) return
            event.preventDefault()
            navigateToItem(item)
        },
        [navigateToItem]
    )

    const handleMobileClick = (
        event: React.MouseEvent<HTMLAnchorElement>,
        item: NavItem
    ) => {
        if (!item.path.startsWith("#")) {
            setMobileOpen(false)
            return
        }
        event.preventDefault()
        navigateToItem(item)
    }

    const activeItem =
        NAV_ITEMS.find((item) => item.id === active) ?? NAV_ITEMS[0]
    const hoverItem = hoverId
        ? NAV_ITEMS.find((item) => item.id === hoverId)
        : null
    const showTooltip =
        expanded && !!lens && !!hoverItem && (canHover || keyboardFocus)

    return (
        <>
            {/* ── Mobile: classic burger ── */}
            <div className="pointer-events-none fixed inset-x-0 top-0 z-50 md:hidden">
                <div className="pointer-events-auto absolute right-4 top-4">
                    <button
                        type="button"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileOpen}
                        className="liquid-glass flex h-12 w-12 items-center justify-center rounded-xl text-white"
                    >
                        {mobileOpen ? (
                            <FiX className="text-xl" aria-hidden />
                        ) : (
                            <FiMenu className="text-xl" aria-hidden />
                        )}
                    </button>
                </div>

                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            key="mobile-nav-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: reduceMotion ? 0 : 0.25 }}
                            className="pointer-events-auto fixed inset-0 flex items-center justify-center bg-black/50 p-6 backdrop-blur-xl"
                        >
                            <motion.div
                                ref={mobileMenuRef}
                                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 12, scale: 0.97 }}
                                transition={{ duration: reduceMotion ? 0 : 0.28 }}
                                className="liquid-glass relative w-full max-w-sm overflow-hidden rounded-3xl p-8"
                            >
                                <button
                                    type="button"
                                    onClick={() => setMobileOpen(false)}
                                    className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                                    aria-label="Close menu"
                                >
                                    <FiX className="text-xl" />
                                </button>

                                <ul className="mt-6 flex flex-col items-stretch gap-2">
                                    {NAV_ITEMS.map((item) => {
                                        const Icon = item.icon
                                        const isActive = onHome && item.id === active
                                        return (
                                            <li key={item.id}>
                                                <Link
                                                    href={hrefFor(item, onHome)}
                                                    prefetch={!item.path.startsWith("#")}
                                                    onClick={(e) => handleMobileClick(e, item)}
                                                    aria-current={isActive ? "location" : undefined}
                                                    className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-lg font-medium transition ${
                                                        isActive
                                                            ? "bg-white/15 text-white"
                                                            : "text-white/75 hover:bg-white/10 hover:text-white"
                                                    }`}
                                                >
                                                    <Icon className="text-xl opacity-80" aria-hidden />
                                                    {item.title}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Desktop: liquid-glass island ── */}
            <div className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden justify-center px-3 pt-6 md:flex">
                <motion.nav
                    ref={navRef}
                    layout
                    aria-label="Primary"
                    transition={island(islandSpring)}
                    style={{ borderRadius: RADIUS }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="liquid-glass pointer-events-auto select-none text-white"
                >
                    <motion.div
                        layout
                        transition={island(islandSpring)}
                        style={{ borderRadius: RADIUS }}
                        className="relative overflow-hidden"
                    >
                        {expanded ? (
                            <ul className="relative flex items-center gap-5 px-4 py-2.5">
                                <AnimatePresence>
                                    {lens && (
                                        <motion.span
                                            key="hover-lens"
                                            aria-hidden
                                            initial={{ opacity: 0, scale: 0.85 }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                x: lens.x,
                                                width: lens.width,
                                            }}
                                            exit={{ opacity: 0, scale: 0.85 }}
                                            transition={island(islandSpring)}
                                            className="liquid-drop pointer-events-none absolute left-0 top-2.5 h-11 rounded-full"
                                        />
                                    )}
                                </AnimatePresence>

                                {NAV_ITEMS.map((item) => {
                                    const Icon = item.icon
                                    const isHovered = hoverId === item.id
                                    const isSelected = onHome && item.id === active
                                    const lit = isSelected || isHovered

                                    return (
                                        <li
                                            key={item.id}
                                            ref={(node) => {
                                                if (node) itemRefs.current.set(item.id, node)
                                                else itemRefs.current.delete(item.id)
                                            }}
                                            onMouseEnter={() => setItemHover(item.id)}
                                            className="relative"
                                        >
                                            <Link
                                                href={hrefFor(item, onHome)}
                                                prefetch={!item.path.startsWith("#")}
                                                onClick={(event) =>
                                                    handleDesktopClick(event, item)
                                                }
                                                onFocus={() => setItemHover(item.id)}
                                                aria-label={item.title}
                                                aria-current={
                                                    isSelected ? "location" : undefined
                                                }
                                                draggable={false}
                                                className={`relative flex h-11 w-11 items-center justify-center rounded-full outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white/50 ${
                                                    lit ? "text-white" : "text-white/55"
                                                }`}
                                            >
                                                {isSelected && (
                                                    <span
                                                        className="absolute inset-0 rounded-full bg-white/[0.13] shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.45),inset_0_-1px_1px_rgba(0,0,0,0.18)]"
                                                        aria-hidden
                                                    />
                                                )}
                                                <motion.span
                                                    animate={{
                                                        scale: isHovered ? 1.16 : 1,
                                                        y: isHovered ? -1 : 0,
                                                    }}
                                                    transition={island(popSpring)}
                                                    className="relative z-10 flex"
                                                >
                                                    <Icon className="text-[20px]" aria-hidden />
                                                </motion.span>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                            /* Collapsed island: single pill — no popLayout sibling anim (was sticking left) */
                            <CollapsedIsland
                                item={activeItem}
                                onHome={onHome}
                                progress={progress}
                                onClick={handleDesktopClick}
                            />
                        )}
                    </motion.div>

                    <AnimatePresence>
                        {showTooltip && hoverItem && lens && (
                            <motion.div
                                key="nav-tooltip"
                                aria-hidden
                                initial={{ opacity: 0, y: -6, scale: 0.9 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    x: lens.x + lens.width / 2,
                                }}
                                exit={{ opacity: 0, y: -4, scale: 0.92 }}
                                transition={island(islandSpring)}
                                className="pointer-events-none absolute left-0 top-full mt-2.5"
                            >
                                <div className="-translate-x-1/2">
                                    <div
                                        style={{ borderRadius: 14 }}
                                        className="liquid-glass overflow-hidden px-3 py-1.5 text-xs font-medium tracking-wide text-white"
                                    >
                                        <span className="block whitespace-nowrap">
                                            {hoverItem.title}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.nav>
            </div>
        </>
    )
}
