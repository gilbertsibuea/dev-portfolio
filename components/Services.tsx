"use client"

import {
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentType,
} from "react"
import Link from "next/link"
import { AnimatePresence, motion, useInView } from "framer-motion"
import {
    FiArrowUpRight,
    FiCheckCircle,
    FiClipboard,
    FiCode,
    FiCompass,
    FiLayers,
    FiLifeBuoy,
    FiSend,
} from "react-icons/fi"
import { SectionMark } from "./SectionMark"

type Step = {
    id: number
    short: string
    title: string
    detail: string
    output: string
    Icon: ComponentType<{ className?: string }>
}

const STEPS: Step[] = [
    {
        id: 1,
        short: "Discover",
        title: "Discovery & Qualification",
        detail:
            "Understand the client’s needs, business problem, goals, budget, stakeholders, and whether the project is a good fit.",
        output: "Initial brief, business problem, opportunity assessment",
        Icon: FiCompass,
    },
    {
        id: 2,
        short: "Requirements",
        title: "Requirements & Analysis",
        detail:
            "Run stakeholder workshops, map as-is / to-be processes, and capture functional, non-functional, integration, and constraint needs.",
        output: "BRD/PRD, user stories, acceptance criteria, scope",
        Icon: FiClipboard,
    },
    {
        id: 3,
        short: "Design",
        title: "Solution Design & Proposal",
        detail:
            "Design architecture, tech stack, security, UX, cost estimate, timeline, and the implementation approach.",
        output: "Solution architecture, proposal/SOW, estimate, project plan",
        Icon: FiLayers,
    },
    {
        id: 4,
        short: "Build",
        title: "Development & Iteration",
        detail:
            "Build in planned sprints, review code, demo regularly, and manage scope changes as they come up.",
        output: "Working software, tested increments, sprint demos",
        Icon: FiCode,
    },
    {
        id: 5,
        short: "Testing",
        title: "Testing & Client Acceptance",
        detail:
            "QA, integration, and security/performance testing as needed — then UAT with the client and defect resolution.",
        output: "Test evidence, UAT sign-off, release approval",
        Icon: FiCheckCircle,
    },
    {
        id: 6,
        short: "Deploy",
        title: "Deployment & Handover",
        detail:
            "Ship to production, migrate data if needed, monitor early health, document, train, and transfer knowledge.",
        output: "Production release, runbook, handover documentation",
        Icon: FiSend,
    },
    {
        id: 7,
        short: "Support",
        title: "Support & Continuous Improvement",
        detail:
            "Handle incidents, SLA, bug fixes, KPI review, system optimization, and ongoing product development.",
        output: "SLA reports, incident records, improvement roadmap",
        Icon: FiLifeBuoy,
    },
]

/**
 * Snake in a tall left column (viewBox 520×700):
 * 1 → 2
 *     ↓
 * 4 ← 3
 * ↓
 * 5 → 6
 *     ↓
 *     7
 */
const VIEW_W = 520
const VIEW_H = 700
const NODE_POINTS: { x: number; y: number }[] = [
    { x: 110, y: 70 },
    { x: 400, y: 70 },
    { x: 400, y: 250 },
    { x: 110, y: 250 },
    { x: 110, y: 430 },
    { x: 400, y: 430 },
    { x: 400, y: 610 },
]

const LINE_WIDTH = 10

function buildSnakePath(points: { x: number; y: number }[]) {
    if (points.length < 2) return ""
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        if (prev.y === curr.y) {
            const midX = (prev.x + curr.x) / 2
            const bump = prev.x < curr.x ? -20 : 20
            d += ` C ${midX} ${prev.y + bump}, ${midX} ${curr.y + bump}, ${curr.x} ${curr.y}`
        } else {
            const midY = (prev.y + curr.y) / 2
            const bump = prev.y < curr.y ? 20 : -20
            d += ` C ${prev.x + bump} ${midY}, ${curr.x + bump} ${midY}, ${curr.x} ${curr.y}`
        }
    }
    return d
}

function easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Find distance along path closest to each node (so traveler lands on checkpoints) */
function measureNodeDistances(
    path: SVGPathElement,
    nodes: { x: number; y: number }[],
    samples = 400
) {
    const total = path.getTotalLength() || 1
    return nodes.map((node) => {
        let bestD = 0
        let bestScore = Infinity
        for (let i = 0; i <= samples; i++) {
            const d = (i / samples) * total
            const p = path.getPointAtLength(d)
            const score = (p.x - node.x) ** 2 + (p.y - node.y) ** 2
            if (score < bestScore) {
                bestScore = score
                bestD = d
            }
        }
        return bestD
    })
}

export const Services = () => {
    const sectionRef = useRef<HTMLElement>(null)
    const measurePathRef = useRef<SVGPathElement>(null)
    const inView = useInView(sectionRef, { once: true, margin: "-60px" })
    const gradientId = useId().replace(/:/g, "")
    const [active, setActive] = useState(0)
    const [paused, setPaused] = useState(false)
    const [pathLength, setPathLength] = useState(1)
    const [drawnLength, setDrawnLength] = useState(0)
    const [traveler, setTraveler] = useState({ x: NODE_POINTS[0].x, y: NODE_POINTS[0].y })

    const distRef = useRef(0)
    const rafRef = useRef<number | null>(null)
    const activeRef = useRef(0)
    const nodeDistRef = useRef<number[]>(NODE_POINTS.map((_, i) => i))

    const snakePath = useMemo(() => buildSnakePath(NODE_POINTS), [])

    const distanceForIndex = useCallback((index: number) => {
        const distances = nodeDistRef.current
        return distances[index] ?? 0
    }, [])

    /** Animate traveler + stroke along the path (never shortcuts) */
    const animateToIndex = useCallback(
        (toIndex: number) => {
            const path = measurePathRef.current
            if (!path || pathLength <= 1) {
                setActive(toIndex)
                activeRef.current = toIndex
                return
            }

            if (rafRef.current != null) cancelAnimationFrame(rafRef.current)

            const from = distRef.current
            const to = distanceForIndex(toIndex)
            const delta = Math.abs(to - from)
            const duration = Math.min(1600, Math.max(500, (delta / pathLength) * 1800 || 500))
            const start = performance.now()

            setActive(toIndex)
            activeRef.current = toIndex

            const tick = (now: number) => {
                const t = Math.min(1, (now - start) / duration)
                const eased = easeInOutCubic(t)
                const d = from + (to - from) * eased
                distRef.current = d
                setDrawnLength(d)
                // Snap exactly onto the node at the end
                if (t >= 1) {
                    const node = NODE_POINTS[toIndex]
                    setTraveler({ x: node.x, y: node.y })
                    distRef.current = to
                    setDrawnLength(to)
                    rafRef.current = null
                    return
                }
                const point = path.getPointAtLength(Math.max(0, Math.min(pathLength, d)))
                setTraveler({ x: point.x, y: point.y })
                rafRef.current = requestAnimationFrame(tick)
            }

            rafRef.current = requestAnimationFrame(tick)
        },
        [distanceForIndex, pathLength]
    )

    useLayoutEffect(() => {
        const path = measurePathRef.current
        if (!path) return
        const len = path.getTotalLength() || 1
        const distances = measureNodeDistances(path, NODE_POINTS)
        // Force first/last exact
        distances[0] = 0
        distances[distances.length - 1] = len
        nodeDistRef.current = distances
        setPathLength(len)
        const d0 = distances[0] ?? 0
        distRef.current = d0
        setDrawnLength(d0)
        setTraveler({ x: NODE_POINTS[0].x, y: NODE_POINTS[0].y })
    }, [snakePath, inView])

    useEffect(() => {
        return () => {
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
        }
    }, [])

    useEffect(() => {
        if (!inView || paused || pathLength <= 1) return
        const id = window.setInterval(() => {
            const next = (activeRef.current + 1) % STEPS.length
            animateToIndex(next)
        }, 4000)
        return () => window.clearInterval(id)
    }, [inView, paused, pathLength, animateToIndex])

    const selectStep = useCallback(
        (index: number) => {
            setPaused(true)
            animateToIndex(index)
        },
        [animateToIndex]
    )

    const step = STEPS[active]
    const StepIcon = step.Icon

    return (
        <section
            ref={sectionRef}
            id="process"
            className="relative overflow-hidden bg-[#0f0e1a] text-white px-4 pb-16 pt-8 md:pb-24 md:pt-10"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(139,92,246,0.10),transparent_55%)]" />
            <SectionMark mode="ticks" side="both" />

            <div className="relative z-10 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="mb-10 md:mb-14"
                >
                  
                    <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-200">
                        How I work
                    </h2>
                    <p className="mt-4 max-w-2xl text-white/50 text-base md:text-lg leading-relaxed">
                        From discovery to continuous improvement, follow the checkpoint path.
                        Click any stop to see what happens there.
                    </p>
                </motion.div>

                {/* Split: track left · details right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                    {/* LEFT — track */}
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.55, delay: 0.08 }}
                        className="lg:col-span-6 xl:col-span-5"
                        onMouseEnter={() => setPaused(true)}
                        onTouchStart={() => setPaused(true)}
                    >
                        {/* Desktop / tablet snake in left column */}
                        <div className="hidden sm:block relative w-full max-w-md mx-auto lg:mx-0">
                            <div
                                className="relative w-full"
                                style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
                            >
                                <svg
                                    viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                                    className="absolute inset-0 h-full w-full overflow-visible"
                                    aria-hidden
                                >
                                    <defs>
                                        <linearGradient
                                            id={gradientId}
                                            x1="0%"
                                            y1="0%"
                                            x2="0%"
                                            y2="100%"
                                        >
                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
                                            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.6" />
                                        </linearGradient>
                                    </defs>

                                    <path
                                        ref={measurePathRef}
                                        d={snakePath}
                                        fill="none"
                                        stroke="transparent"
                                        strokeWidth={LINE_WIDTH}
                                    />
                                    <path
                                        d={snakePath}
                                        fill="none"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth={LINE_WIDTH}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d={snakePath}
                                        fill="none"
                                        stroke={`url(#${gradientId})`}
                                        strokeWidth={LINE_WIDTH}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeDasharray={pathLength}
                                        strokeDashoffset={Math.max(0, pathLength - drawnLength)}
                                    />
                                    <g transform={`translate(${traveler.x}, ${traveler.y})`}>
                                        <circle r="14" fill="#a78bfa" opacity="0.35" />
                                        <circle r="8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2.5" />
                                        <circle r="3" fill="#8b5cf6" />
                                    </g>
                                </svg>

                                {STEPS.map((s, index) => {
                                    const pt = NODE_POINTS[index]
                                    const isActive = active === index
                                    const isDone = index < active
                                    const Icon = s.Icon

                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => selectStep(index)}
                                            aria-pressed={isActive}
                                            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 w-14 h-14 outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 rounded-full"
                                            style={{
                                                left: `${(pt.x / VIEW_W) * 100}%`,
                                                top: `${(pt.y / VIEW_H) * 100}%`,
                                            }}
                                        >
                                            <motion.span
                                                className={`
                                                    relative flex h-14 w-14 items-center justify-center
                                                    rounded-full border-2 transition-colors duration-300
                                                    ${isActive
                                                        ? "border-violet-200 bg-violet-600 text-white shadow-[0_0_28px_rgba(139,92,246,0.55)]"
                                                        : isDone
                                                          ? "border-violet-300 bg-violet-600 text-white"
                                                          : "border-white/25 bg-[#16142a] text-white/55 hover:border-white/45 hover:text-white/85"
                                                    }
                                                `}
                                                animate={
                                                    isActive
                                                        ? { scale: [1, 1.08, 1], y: [0, -3, 0] }
                                                        : { scale: 1, y: 0 }
                                                }
                                                transition={
                                                    isActive
                                                        ? {
                                                              duration: 2,
                                                              repeat: Infinity,
                                                              ease: "easeInOut",
                                                          }
                                                        : { duration: 0.25 }
                                                }
                                            >
                                                <Icon className="text-lg" />
                                            </motion.span>
                                            {/* Labels below circle — don't shift path alignment */}
                                            <span className="pointer-events-none absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 flex flex-col items-center w-28">
                                                <span
                                                    className={`text-[10px] uppercase tracking-[0.14em] ${
                                                        isActive || isDone
                                                            ? "text-violet-200"
                                                            : "text-white/35"
                                                    }`}
                                                >
                                                    0{s.id}
                                                </span>
                                                <span
                                                    className={`text-[11px] font-medium leading-tight text-center ${
                                                        isActive || isDone
                                                            ? "text-white"
                                                            : "text-white/45"
                                                    }`}
                                                >
                                                    {s.short}
                                                </span>
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Mobile compact list (same left column on small screens) */}
                        <div className="sm:hidden relative pl-1">
                            <div className="absolute left-[31px] top-4 bottom-4 w-[3px] rounded-full bg-white/10" />
                            <motion.div
                                className="absolute left-[31px] top-4 w-[3px] origin-top rounded-full bg-violet-400"
                                style={{ height: "calc(100% - 32px)" }}
                                animate={{ scaleY: (active + 1) / STEPS.length }}
                                transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                            />
                            <div className="flex flex-col gap-4">
                                {STEPS.map((s, index) => {
                                    const isActive = active === index
                                    const isDone = index < active
                                    const Icon = s.Icon
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => selectStep(index)}
                                            className="flex items-center gap-4 text-left"
                                            aria-pressed={isActive}
                                        >
                                            <motion.span
                                                className={`
                                                    relative z-10 flex h-14 w-14 shrink-0 items-center justify-center
                                                    rounded-full border-2
                                                    ${isActive
                                                        ? "border-violet-200 bg-violet-600 text-white"
                                                        : isDone
                                                          ? "border-violet-300 bg-violet-600 text-white"
                                                          : "border-white/20 bg-[#16142a] text-white/45"
                                                    }
                                                `}
                                                animate={isActive ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                                                transition={
                                                    isActive
                                                        ? { duration: 1.6, repeat: Infinity }
                                                        : { duration: 0.2 }
                                                }
                                            >
                                                <Icon className="text-base" />
                                            </motion.span>
                                            <span>
                                                <span
                                                    className={`block text-[10px] uppercase tracking-[0.14em] ${
                                                        isActive || isDone
                                                            ? "text-violet-200"
                                                            : "text-white/35"
                                                    }`}
                                                >
                                                    0{s.id} · {s.short}
                                                </span>
                                                <span
                                                    className={`block mt-0.5 text-sm font-medium ${
                                                        isActive || isDone
                                                            ? "text-white"
                                                            : "text-white/50"
                                                    }`}
                                                >
                                                    {s.title}
                                                </span>
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT — details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="lg:col-span-6 xl:col-span-7 lg:sticky lg:top-28"
                    >
                        <div className="border border-white/10 bg-white/[0.03] p-6 sm:p-8 md:p-10 min-h-[280px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                                >
                                    <div className="mb-6 flex items-start gap-4 sm:gap-5">
                                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-violet-300 bg-violet-600 text-white sm:h-16 sm:w-16">
                                            <StepIcon className="text-2xl sm:text-3xl" />
                                        </span>
                                        <h3 className="pt-0.5 text-2xl font-bold leading-tight tracking-tight text-white sm:pt-1 sm:text-3xl md:text-4xl">
                                            {step.title}
                                        </h3>
                                    </div>
                                    <p className="mt-4 text-white/65 leading-relaxed text-base md:text-lg">
                                        {step.detail}
                                    </p>

                                    <div className="mt-8 pt-6 border-t border-white/10">
                                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-2">
                                            Output
                                        </p>
                                        <p className="text-sm sm:text-base text-white/85 leading-relaxed border-l-2 border-violet-400 pl-4">
                                            {step.output}
                                        </p>
                                    </div>

                                    <div className="mt-8 flex flex-wrap gap-1.5">
                                        {STEPS.map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                aria-label={`Go to stage ${i + 1}`}
                                                onClick={() => selectStep(i)}
                                                className={`h-1.5 rounded-full transition-all ${
                                                    i === active
                                                        ? "w-7 bg-violet-400"
                                                        : i < active
                                                          ? "w-3.5 bg-violet-500"
                                                          : "w-3.5 bg-white/20"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.3, duration: 0.45 }}
                    className="mt-12 md:mt-16"
                >
                    <Link
                        href="#contact"
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
                    >
                        <span className="font-medium border-b border-white/25 group-hover:border-white/60 pb-0.5">
                            Ready to start with Discovery?
                        </span>
                        <FiArrowUpRight className="text-lg transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
