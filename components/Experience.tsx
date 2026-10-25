"use client"

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react"
import { motion, useInView } from "framer-motion"
import {
    FiBriefcase,
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiMapPin,
} from "react-icons/fi"

type JobTag = "Full Time" | "Contract" | "Freelance" | "Project" | "Education"

type Job = {
    org: string
    role: string
    tag: JobTag
    period: string
    location?: string
    summary?: string
    highlights?: string[]
    mark: string
    markColor: string
}

type Panel =
    | { id: string; kind: "feature"; job: Job }
    | { id: string; kind: "stack"; jobs: [Job, Job] }
    | { id: string; kind: "academic"; title: string; jobs: Job[] }

const TAG_STYLE: Record<JobTag, string> = {
    "Full Time": "bg-sky-500/20 text-sky-300 border-sky-400/30",
    Contract: "bg-amber-500/20 text-amber-200 border-amber-400/30",
    Freelance: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    Project: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/30",
    Education: "bg-teal-500/20 text-teal-300 border-teal-400/30",
}

const PANELS: Panel[] = [
    {
        id: "saidata",
        kind: "feature",
        job: {
            org: "SAIDATA · Universitas Lampung",
            role: "Full Stack Developer",
            tag: "Full Time",
            period: "Nov 2025 – Aug 2026",
            location: "Bandar Lampung · On-site",
            summary:
                "Built and shipped SAIDATA — a production digital-admin platform for faculties across Unila. Configurable service menus, multi-stage approval workflows, document generation with QR verification, JWT/SSO, Redis, and Docker.",
            highlights: [
                "Laravel 12 + React 19 SPA + PostgreSQL",
                "Workflow engine, form builder, campus SSO integrations",
                "Presented the system to faculty admins at BPKHM Unila",
            ],
            mark: "SU",
            markColor: "#2dd4bf",
        },
    },
    {
        id: "wium",
        kind: "stack",
        jobs: [
            {
                org: "WIUM Indonesia",
                role: "Full Stack · E-Retirement",
                tag: "Contract",
                period: "Apr 2024 – Apr 2025",
                location: "Remote",
                summary:
                    "Multi-level pension & retirement workflows with RBAC, PDF exports, audit trails, and real-time notifications.",
                mark: "ER",
                markColor: "#818cf8",
            },
            {
                org: "WIUM Indonesia",
                role: "Full Stack · AdGenda",
                tag: "Contract",
                period: "May 2025 – Aug 2025",
                location: "Remote",
                summary:
                    "Committee meetings, live voting Presentation Mode, decision letters, and calendar-driven agenda workflows.",
                mark: "AG",
                markColor: "#c084fc",
            },
        ],
    },
    {
        id: "client",
        kind: "stack",
        jobs: [
            {
                org: "SPMB Prestasi Prima",
                role: "Full Stack Developer",
                tag: "Project",
                period: "Oct 2025 – Jan 2026",
                location: "Remote",
                summary:
                    "SMA/SMK admission & payment platform — registration wizard, BRI BRIVA VAs, validator queues, and cycle reporting.",
                mark: "SP",
                markColor: "#38bdf8",
            },
            {
                org: "Independent",
                role: "Freelance Full Stack",
                tag: "Freelance",
                period: "2024 – Present",
                location: "Bandung · Remote",
                summary:
                    "Client web & mobile apps — Laravel, Next.js, React Native — from scope to ship with clean handoff.",
                mark: "FS",
                markColor: "#34d399",
            },
        ],
    },
    {
        id: "academic",
        kind: "academic",
        title: "Academic",
        jobs: [
            {
                org: "Universitas Lampung",
                role: "B.Sc. Computer Science",
                tag: "Education",
                period: "2022 – 2026",
                location: "Bandar Lampung · GPA 3.68 / 4.00",
                summary:
                    "Software engineering focus; production fullstack work through campus digital-transformation projects.",
                mark: "UL",
                markColor: "#22c55e",
            },
            {
                org: "SMA BPK PENABUR Bandarlampung",
                role: "Natural Sciences",
                tag: "Education",
                period: "2019 – 2022",
                location: "Bandar Lampung",
                mark: "PB",
                markColor: "#f59e0b",
            },
        ],
    },
]

function Mark({ mark, color }: { mark: string; color: string }) {
    return (
        <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold tracking-tight text-[#0c0a1a]"
            style={{ backgroundColor: color }}
            aria-hidden
        >
            {mark}
        </span>
    )
}

function Tag({ tag }: { tag: JobTag }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${TAG_STYLE[tag]}`}
        >
            {tag}
        </span>
    )
}

function Meta({ period, location }: { period: string; location?: string }) {
    return (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/45">
            <span className="inline-flex items-center gap-1.5">
                <FiCalendar className="opacity-70" />
                {period}
            </span>
            {location && (
                <span className="inline-flex items-center gap-1.5">
                    <FiMapPin className="opacity-70" />
                    {location}
                </span>
            )}
        </div>
    )
}

function FeatureCard({ job }: { job: Job }) {
    return (
        <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1c1a36] p-6 sm:p-7">
            <div
                aria-hidden
                className="pointer-events-none absolute -bottom-10 -right-6 h-44 w-44 opacity-[0.12]"
                style={{
                    backgroundImage: `repeating-linear-gradient(-35deg, ${job.markColor} 0 10px, transparent 10px 22px)`,
                }}
            />
            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                <div className="flex items-start gap-3">
                    <Mark mark={job.mark} color={job.markColor} />
                    <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold leading-snug text-white sm:text-lg">
                            {job.org}
                            <span className="text-white/35"> — </span>
                            <span className="text-violet-300">{job.role}</span>
                        </p>
                        <div className="mt-2">
                            <Tag tag={job.tag} />
                        </div>
                    </div>
                </div>
                <Meta period={job.period} location={job.location} />
                {job.summary && (
                    <p className="mt-5 text-sm leading-relaxed text-white/60">
                        {job.summary}
                    </p>
                )}
                {job.highlights && job.highlights.length > 0 && (
                    <ul className="mt-auto space-y-2 border-t border-white/10 pt-5 text-sm text-white/55">
                        {job.highlights.map((line) => (
                            <li key={line} className="flex gap-2">
                                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-400/80" />
                                <span>{line}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </article>
    )
}

function CompactCard({ job }: { job: Job }) {
    return (
        <article className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1c1a36] p-5">
            <div
                aria-hidden
                className="pointer-events-none absolute bottom-2 right-3 h-14 w-14 opacity-[0.16]"
                style={{
                    background: `radial-gradient(circle at 30% 30%, ${job.markColor}, transparent 65%)`,
                }}
            />
            <div className="relative z-10">
                <div className="flex items-start gap-3">
                    <Mark mark={job.mark} color={job.markColor} />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold leading-snug text-white">
                            {job.org}
                            <span className="text-white/35"> — </span>
                            <span className="text-violet-300">{job.role}</span>
                        </p>
                        <div className="mt-2">
                            <Tag tag={job.tag} />
                        </div>
                    </div>
                </div>
                <Meta period={job.period} location={job.location} />
                {job.summary && (
                    <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-white/55 sm:text-[13px]">
                        {job.summary}
                    </p>
                )}
            </div>
        </article>
    )
}

function AcademicPanel({ title, jobs }: { title: string; jobs: Job[] }) {
    return (
        <div className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-[#16142e]/80 p-3 sm:p-4">
            <p className="px-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                {title}
            </p>
            <div className="flex min-h-0 flex-1 flex-col gap-3">
                {jobs.map((job) => (
                    <CompactCard key={`${job.org}-${job.period}`} job={job} />
                ))}
            </div>
        </div>
    )
}

function PanelView({ panel }: { panel: Panel }) {
    if (panel.kind === "feature") return <FeatureCard job={panel.job} />
    if (panel.kind === "stack") {
        return (
            <div className="flex h-full flex-col gap-3">
                {panel.jobs.map((job) => (
                    <CompactCard key={`${job.org}-${job.role}-${job.period}`} job={job} />
                ))}
            </div>
        )
    }
    return <AcademicPanel title={panel.title} jobs={panel.jobs} />
}

export const Experience = () => {
    const sectionRef = useRef<HTMLElement>(null)
    const scrollerRef = useRef<HTMLDivElement>(null)
    const inView = useInView(sectionRef, { once: true, margin: "-80px" })
    const [index, setIndex] = useState(0)
    const total = PANELS.length

    const scrollToIndex = useCallback((i: number) => {
        const el = scrollerRef.current
        if (!el) return
        const child = el.children[i] as HTMLElement | undefined
        if (!child) return
        const left = child.offsetLeft - (el.clientWidth - child.clientWidth) / 2
        el.scrollTo({ left, behavior: "smooth" })
    }, [])

    const goPrev = () => {
        const next = Math.max(0, index - 1)
        setIndex(next)
        scrollToIndex(next)
    }

    const goNext = () => {
        const next = Math.min(total - 1, index + 1)
        setIndex(next)
        scrollToIndex(next)
    }

    useEffect(() => {
        const el = scrollerRef.current
        if (!el) return

        const onScroll = () => {
            const center = el.scrollLeft + el.clientWidth / 2
            let best = 0
            let bestDist = Infinity
            Array.from(el.children).forEach((child, i) => {
                const node = child as HTMLElement
                const mid = node.offsetLeft + node.clientWidth / 2
                const dist = Math.abs(mid - center)
                if (dist < bestDist) {
                    bestDist = dist
                    best = i
                }
            })
            setIndex(best)
        }

        el.addEventListener("scroll", onScroll, { passive: true })
        return () => el.removeEventListener("scroll", onScroll)
    }, [])

    return (
        <section
            ref={sectionRef}
            id="experience"
            className="relative overflow-hidden bg-[#0f0e1c] text-white py-16 md:py-24"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(139,92,246,0.10),transparent_55%)]" />

            <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="flex flex-col items-center text-center"
                >
                    <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/35 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-200">
                        <FiBriefcase className="text-violet-300" />
                        Experience
                    </span>
                    <p className="mt-4 max-w-md text-sm text-white/45 sm:text-base">
                        Swipe through my professional journey
                    </p>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative z-10 mt-10 md:mt-14"
            >
                <div
                    ref={scrollerRef}
                    className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[max(1rem,calc((100vw-42rem)/2))] pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
                >
                    {PANELS.map((panel, i) => (
                        <PanelShell key={panel.id} active={i === index}>
                            <PanelView panel={panel} />
                        </PanelShell>
                    ))}
                </div>

                <div className="mx-auto mt-8 flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                    <button
                        type="button"
                        onClick={goPrev}
                        disabled={index === 0}
                        aria-label="Previous experience"
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-violet-400/40 bg-[#1c1a36] text-violet-200 transition-colors hover:border-violet-300 hover:bg-violet-500/15 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                    >
                        <FiChevronLeft className="text-xl" />
                    </button>

                    <div className="flex items-center gap-2">
                        {PANELS.map((panel, i) => (
                            <button
                                key={panel.id}
                                type="button"
                                aria-label={`Go to slide ${i + 1}`}
                                aria-current={i === index}
                                onClick={() => {
                                    setIndex(i)
                                    scrollToIndex(i)
                                }}
                                className={`h-2.5 rounded-full transition-all ${
                                    i === index
                                        ? "w-7 bg-violet-400"
                                        : "w-2.5 bg-white/20 hover:bg-white/40"
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={goNext}
                        disabled={index === total - 1}
                        aria-label="Next experience"
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-violet-400/40 bg-[#1c1a36] text-violet-200 transition-colors hover:border-violet-300 hover:bg-violet-500/15 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                    >
                        <FiChevronRight className="text-xl" />
                    </button>
                </div>
            </motion.div>
        </section>
    )
}

function PanelShell({
    children,
    active,
}: {
    children: ReactNode
    active: boolean
}) {
    return (
        <div
            className={`h-[440px] w-[min(88vw,26rem)] shrink-0 snap-center transition-opacity duration-300 sm:h-[460px] sm:w-[26rem] ${
                active ? "opacity-100" : "opacity-55"
            }`}
        >
            {children}
        </div>
    )
}
