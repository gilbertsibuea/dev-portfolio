"use client"

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react"
import {
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiMapPin,
} from "react-icons/fi"
import type {
    ExperienceJob,
    ExperienceJobTag,
    ExperiencePanel,
} from "@/lib/experience-types"

type Job = ExperienceJob
type JobTag = ExperienceJobTag

type Panel =
    | { id: string; kind: "feature"; job: Job }
    | { id: string; kind: "stack"; jobs: [Job, Job] }

const TAG_STYLE: Record<JobTag, string> = {
    "Full Time": "bg-sky-500/20 text-sky-300 border-sky-400/30",
    Contract: "bg-amber-500/20 text-amber-200 border-amber-400/30",
    Freelance: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    Internship: "bg-orange-500/20 text-orange-200 border-orange-400/30",
    Project: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/30",
    Education: "bg-teal-500/20 text-teal-300 border-teal-400/30",
}

function mapApiPanels(panels: ExperiencePanel[]): Panel[] {
    const mapped: Panel[] = []
    for (const panel of panels) {
        if (panel.kind === "feature" && panel.jobs[0]) {
            mapped.push({
                id: panel.slug || String(panel.id),
                kind: "feature",
                job: panel.jobs[0],
            })
            continue
        }
        if (panel.jobs.length >= 2) {
            mapped.push({
                id: panel.slug || String(panel.id),
                kind: "stack",
                jobs: [panel.jobs[0], panel.jobs[1]],
            })
        } else if (panel.jobs[0]) {
            // Fallback: single job shown as feature
            mapped.push({
                id: panel.slug || String(panel.id),
                kind: "feature",
                job: panel.jobs[0],
            })
        }
    }
    return mapped
}

function Mark({
    mark,
    color,
    iconUrl,
    size = "md",
}: {
    mark: string
    color: string
    iconUrl?: string
    size?: "sm" | "md"
}) {
    const box =
        size === "sm"
            ? "h-9 w-9 sm:h-9 sm:w-9"
            : "h-9 w-9 sm:h-10 sm:w-10"

    if (iconUrl) {
        return (
            <span
                className={`relative flex ${box} shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5`}
                aria-hidden
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={iconUrl}
                    alt=""
                    className="h-full w-full object-contain p-1"
                />
            </span>
        )
    }

    return (
        <span
            className={`flex ${box} shrink-0 items-center justify-center rounded-lg text-sm font-bold tracking-tight text-[#0c0a1a]`}
            style={{ backgroundColor: color }}
            aria-hidden
        >
            {mark}
        </span>
    )
}

type StripePlacement =
    | "bottom-right"
    | "bottom-left"
    | "top-right"
    | "top-left"
    | "mid-right"
    | "mid-left"

const STRIPE_PLACEMENTS: StripePlacement[] = [
    "bottom-right",
    "top-left",
    "mid-right",
    "bottom-left",
    "top-right",
    "mid-left",
]

function hashSeed(input: string) {
    let h = 0
    for (let i = 0; i < input.length; i++) {
        h = (h * 31 + input.charCodeAt(i)) | 0
    }
    return Math.abs(h)
}

function stripeForJob(job: Job): StripePlacement {
    const seed = hashSeed(`${job.org}|${job.role}|${job.period}|${job.mark}`)
    return STRIPE_PLACEMENTS[seed % STRIPE_PLACEMENTS.length]
}

const STRIPE_POS: Record<StripePlacement, string> = {
    "bottom-right": "-bottom-10 -right-6",
    "bottom-left": "-bottom-10 -left-6",
    "top-right": "-top-10 -right-6",
    "top-left": "-top-10 -left-6",
    "mid-right": "top-1/2 -right-8 -translate-y-1/2",
    "mid-left": "top-1/2 -left-8 -translate-y-1/2",
}

const STRIPE_ANGLE: Record<StripePlacement, string> = {
    "bottom-right": "-35deg",
    "bottom-left": "35deg",
    "top-right": "35deg",
    "top-left": "-35deg",
    "mid-right": "-55deg",
    "mid-left": "55deg",
}

/** Stripe decoration — placement varies per job so cards don’t feel identical */
function CardStripe({
    color,
    placement,
}: {
    color: string
    placement: StripePlacement
}) {
    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute h-44 w-44 opacity-[0.12] ${STRIPE_POS[placement]}`}
            style={{
                backgroundImage: `repeating-linear-gradient(${STRIPE_ANGLE[placement]}, ${color} 0 10px, transparent 10px 22px)`,
            }}
        />
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
        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-white/45 sm:mt-3 sm:gap-x-4 sm:text-xs">
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
        <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1c1a36] p-5 sm:p-7">
            <CardStripe color={job.markColor} placement={stripeForJob(job)} />
            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                <div className="flex items-start gap-3">
                    <Mark
                        mark={job.mark}
                        color={job.markColor}
                        iconUrl={job.iconUrl}
                    />
                    <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold leading-snug text-white sm:text-lg">
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
                    <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-white/60 sm:mt-5 sm:line-clamp-none">
                        {job.summary}
                    </p>
                )}
                {job.highlights && job.highlights.length > 0 && (
                    <ul className="mt-auto hidden space-y-2 border-t border-white/10 pt-5 text-sm text-white/55 sm:block">
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
        <article className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1c1a36] p-4 sm:p-5">
            <CardStripe color={job.markColor} placement={stripeForJob(job)} />
            <div className="relative z-10">
                <div className="flex items-start gap-3">
                    <Mark
                        mark={job.mark}
                        color={job.markColor}
                        iconUrl={job.iconUrl}
                        size="sm"
                    />
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
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-white/55 sm:line-clamp-3 sm:text-[13px]">
                        {job.summary}
                    </p>
                )}
            </div>
        </article>
    )
}

function PanelView({ panel }: { panel: Panel }) {
    if (panel.kind === "feature") return <FeatureCard job={panel.job} />
    return (
        <div className="flex h-full flex-col gap-2.5 sm:gap-3">
            {panel.jobs.map((job) => (
                <CompactCard key={`${job.org}-${job.role}-${job.period}`} job={job} />
            ))}
        </div>
    )
}

function useIsMobile(breakpoint = 768) {
    const [mobile, setMobile] = useState(false)
    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
        const update = () => setMobile(mq.matches)
        update()
        mq.addEventListener("change", update)
        return () => mq.removeEventListener("change", update)
    }, [breakpoint])
    return mobile
}

export const Experience = () => {
    const sectionRef = useRef<HTMLElement>(null)
    const scrollerRef = useRef<HTMLDivElement>(null)
    const firstCardRef = useRef<HTMLDivElement>(null)
    const isMobile = useIsMobile()
    const [index, setIndex] = useState(0)
    /** On mobile: whether card 1 (not just the title) is the focused view of step 1 */
    const [card1Focused, setCard1Focused] = useState(false)
    const [panels, setPanels] = useState<Panel[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const res = await fetch("/api/experience", { cache: "no-store" })
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const data = await res.json()
                if (cancelled) return
                if (data.success && Array.isArray(data.panels)) {
                    setPanels(mapApiPanels(data.panels as ExperiencePanel[]))
                } else {
                    setPanels([])
                }
            } catch (err) {
                console.error("[Experience] failed to load panels:", err)
                if (!cancelled) setPanels([])
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [])

    const total = panels.length
    const [firstPanel, ...restPanels] = panels

    const measureCard1Focus = useCallback(() => {
        const el = scrollerRef.current
        const card = firstCardRef.current
        if (!el || !card) {
            setCard1Focused(false)
            return
        }
        if (!window.matchMedia("(max-width: 767px)").matches) {
            // Desktop sees title + card together — treat card as focused for step 1
            setCard1Focused(true)
            return
        }

        const scrollerRect = el.getBoundingClientRect()
        const cardRect = card.getBoundingClientRect()
        const scrollerCenter = scrollerRect.left + scrollerRect.width / 2
        const cardCenter = cardRect.left + cardRect.width / 2
        const dist = Math.abs(cardCenter - scrollerCenter)
        // Card is focused when its center is near the viewport center
        const focused = dist < scrollerRect.width * 0.42 && cardRect.right > scrollerRect.left + 48
        setCard1Focused(focused)
    }, [])

    const scrollToStart = useCallback(() => {
        scrollerRef.current?.scrollTo({ left: 0, behavior: "smooth" })
    }, [])

    const scrollToFirstCard = useCallback(() => {
        const el = scrollerRef.current
        const card = firstCardRef.current
        if (!el || !card) return
        const scrollerRect = el.getBoundingClientRect()
        const cardRect = card.getBoundingClientRect()
        // Bring card into view with a little left inset
        const delta = cardRect.left - scrollerRect.left - 16
        el.scrollTo({ left: el.scrollLeft + delta, behavior: "smooth" })
    }, [])

    const scrollToIndex = useCallback(
        (i: number) => {
            const el = scrollerRef.current
            if (!el) return

            if (i === 0) {
                // Mobile step 1 target = card 1 highlighted; desktop = full start
                if (window.matchMedia("(max-width: 767px)").matches) {
                    scrollToFirstCard()
                } else {
                    scrollToStart()
                }
                return
            }

            const child = el.children[i] as HTMLElement | undefined
            if (!child) return
            const left = child.offsetLeft - (el.clientWidth - child.clientWidth) / 2
            el.scrollTo({ left: Math.max(0, left), behavior: "smooth" })
        },
        [scrollToFirstCard, scrollToStart]
    )

    const goPrev = () => {
        if (isMobile && index === 0 && card1Focused) {
            scrollToStart()
            return
        }
        const next = Math.max(0, index - 1)
        setIndex(next)
        scrollToIndex(next)
    }

    const goNext = () => {
        // Mobile: stay on step 1 until card 1 is highlighted
        if (isMobile && index === 0 && !card1Focused) {
            scrollToFirstCard()
            return
        }
        const next = Math.min(total - 1, index + 1)
        setIndex(next)
        scrollToIndex(next)
    }

    useEffect(() => {
        const el = scrollerRef.current
        if (!el) return

        const onScroll = () => {
            measureCard1Focus()

            const children = Array.from(el.children) as HTMLElement[]
            if (children.length === 0) return

            const scrollerLeft = el.getBoundingClientRect().left
            const center = el.scrollLeft + el.clientWidth / 2
            let best = 0
            let bestDist = Infinity

            children.forEach((node, i) => {
                const target =
                    i === 0
                        ? ((node.lastElementChild as HTMLElement | null) ?? node)
                        : node
                const rect = target.getBoundingClientRect()
                const mid =
                    el.scrollLeft + (rect.left - scrollerLeft) + rect.width / 2
                const dist = Math.abs(mid - center)
                if (dist < bestDist) {
                    bestDist = dist
                    best = i
                }
            })

            // Still in the first group (title or card 1) → index 0
            if (best === 0 || el.scrollLeft < (children[0]?.clientWidth ?? 0) * 0.55) {
                // Prefer index 0 while the first group's card is the nearest target
                const firstCard = firstCardRef.current
                if (firstCard) {
                    const cardRect = firstCard.getBoundingClientRect()
                    const scrollerRect = el.getBoundingClientRect()
                    const stillInGroup =
                        cardRect.left < scrollerRect.right &&
                        cardRect.right > scrollerRect.left
                    if (stillInGroup && best <= 1) {
                        // If second slide is clearly closer, allow index 1+
                        if (best === 0) {
                            setIndex(0)
                            return
                        }
                    }
                }
            }

            setIndex(best)
        }

        onScroll()
        el.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll)
        return () => {
            el.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onScroll)
        }
        // Re-bind when panels mount the scroller into the DOM
    }, [measureCard1Focus, panels.length])

    const prevDisabled = index === 0 && (!isMobile || !card1Focused)
    const canGoNext =
        (isMobile && index === 0 && !card1Focused) || index < total - 1

    const titleBright = index === 0 && (!isMobile || !card1Focused)
    const card1Bright = index === 0 && (!isMobile || card1Focused)

    return (
        <section
            ref={sectionRef}
            id="experience"
            className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#0f0e1c] py-14 text-white sm:py-16 md:py-20"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(139,92,246,0.10),transparent_55%)]" />

            {loading ? (
                <div className="relative z-10 mx-auto max-w-6xl px-4 text-white/40">
                    Loading experience…
                </div>
            ) : panels.length === 0 ? (
                <div className="relative z-10 mx-auto max-w-6xl px-4">
                    <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
                        Professional Journey
                    </h2>
                    <p className="mt-4 text-white/45">
                        Experience panels will appear here once added in admin.
                    </p>
                </div>
            ) : (
                <div className="relative z-10 w-full">
                    <div
                        ref={scrollerRef}
                        className="flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-smooth pr-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-5 sm:pr-[max(1rem,calc((100vw-26rem)/2))] [&::-webkit-scrollbar]:hidden"
                    >
                        {/* Slide 0 — title position unchanged + first card */}
                        <div className="flex h-[min(52vh,420px)] shrink-0 snap-start items-center gap-8 pl-5 sm:h-[min(56vh,480px)] sm:gap-16 sm:pl-10 md:gap-20 md:pl-14">
                            <div
                                className={`flex w-fit shrink-0 flex-col justify-center transition-opacity duration-300 ${
                                    titleBright ? "opacity-100" : "opacity-40"
                                }`}
                            >
                                <h2 className="font-bold tracking-tight text-white leading-[0.95] text-4xl sm:text-6xl md:text-7xl">
                                    <span className="block whitespace-nowrap">
                                        Professional
                                    </span>
                                    <span className="mt-1.5 block whitespace-nowrap sm:mt-2">
                                        Journey
                                    </span>
                                </h2>
                                <p className="mt-5 max-w-[16rem] text-sm text-white/70 sm:mt-10 sm:max-w-sm sm:text-lg">
                                    Swipe through my professional journey
                                </p>
                            </div>

                            {firstPanel && (
                                <div
                                    ref={firstCardRef}
                                    className={`h-full w-[min(85vw,22rem)] shrink-0 transition-opacity duration-300 sm:w-[26rem] ${
                                        card1Bright ? "opacity-100" : "opacity-55"
                                    }`}
                                >
                                    <PanelView panel={firstPanel} />
                                </div>
                            )}
                        </div>

                        {restPanels.map((panel, i) => (
                            <PanelShell key={panel.id} active={i + 1 === index}>
                                <PanelView panel={panel} />
                            </PanelShell>
                        ))}
                    </div>

                    <div className="mx-auto mt-6 flex max-w-6xl items-center justify-between gap-3 px-4 sm:mt-8 sm:gap-4 sm:px-6">
                        <button
                            type="button"
                            onClick={goPrev}
                            disabled={prevDisabled}
                            aria-label="Previous experience"
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/40 bg-[#1c1a36] text-violet-200 transition-colors hover:border-violet-300 hover:bg-violet-500/15 hover:text-white disabled:pointer-events-none disabled:opacity-30 sm:h-11 sm:w-11"
                        >
                            <FiChevronLeft className="text-xl" />
                        </button>

                        <div className="flex items-center gap-2">
                            {panels.map((panel, i) => (
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
                            disabled={!canGoNext}
                            aria-label="Next experience"
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/40 bg-[#1c1a36] text-violet-200 transition-colors hover:border-violet-300 hover:bg-violet-500/15 hover:text-white disabled:pointer-events-none disabled:opacity-30 sm:h-11 sm:w-11"
                        >
                            <FiChevronRight className="text-xl" />
                        </button>
                    </div>
                </div>
            )}
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
            className={`h-[min(52vh,420px)] w-[min(85vw,22rem)] shrink-0 snap-center transition-opacity duration-300 sm:h-[min(56vh,480px)] sm:w-[26rem] ${
                active ? "opacity-100" : "opacity-55"
            }`}
        >
            {children}
        </div>
    )
}

export default Experience
