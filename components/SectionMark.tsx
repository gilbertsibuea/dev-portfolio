"use client"

type Placement =
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"

type SectionMarkProps =
    | {
          mode: "hatch"
          /** One or more corners */
          placement?: Placement | Placement[]
          color?: string
          /** Individual bars with mixed lengths instead of a flat hatch fill */
          varied?: boolean
          className?: string
      }
    | {
          /** Soft radial bloom / light flare in a corner */
          mode: "radiance"
          placement?: Placement
          className?: string
      }
    | {
          /** Concentric orbit rings in a corner */
          mode: "rings"
          placement?: Placement
          className?: string
      }
    | {
          mode: "ticks"
          side?: "left" | "right" | "both"
          className?: string
      }
    | {
          mode: "index"
          index: number
          label: string
          placement?: Extract<Placement, "top-left" | "top-right">
          className?: string
      }

const CORNER_POS: Record<Placement, string> = {
    "top-left": "-top-24 -left-24",
    "top-right": "-top-24 -right-24",
    "bottom-left": "-bottom-24 -left-24",
    "bottom-right": "-bottom-24 -right-24",
}

/** Keep varied stripes inside the section (overflow-hidden friendly) */
const VARIED_CORNER_POS: Record<Placement, string> = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
}

const HATCH_ANGLE: Record<Placement, string> = {
    "top-left": "-35deg",
    "top-right": "35deg",
    "bottom-left": "35deg",
    "bottom-right": "-35deg",
}

const INDEX_POS: Record<"top-left" | "top-right", string> = {
    "top-left": "top-5 left-4 sm:top-7 sm:left-6",
    "top-right": "top-5 right-4 sm:top-7 sm:right-6",
}

/** Mix of short / medium / long bars — all grow from the corner edge */
const VARIED_STRIPE_LENGTHS = [
    72, 128, 96, 168, 110, 148, 84, 190, 118, 156, 90, 172, 102, 160, 78, 184,
]

function HatchCorner({
    placement,
    color,
    varied,
}: {
    placement: Placement
    color: string
    varied: boolean
}) {
    const angle = HATCH_ANGLE[placement]
    const fromRight = placement.includes("right")
    const fromBottom = placement.includes("bottom")

    if (!varied) {
        return (
            <div
                aria-hidden
                className={`pointer-events-none absolute z-[1] h-56 w-56 opacity-[0.14] sm:h-72 sm:w-72 ${VARIED_CORNER_POS[placement]}`}
                style={{
                    backgroundImage: `repeating-linear-gradient(${angle}, ${color} 0 11px, transparent 11px 24px)`,
                }}
            />
        )
    }

    // Clipped to the corner — bars flush with the outer edges (attached, not floating)
    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute z-[1] h-56 w-56 overflow-hidden sm:h-72 sm:w-72 ${VARIED_CORNER_POS[placement]}`}
        >
            <div
                className="absolute flex flex-col gap-[10px] sm:gap-[12px]"
                style={{
                    width: "220%",
                    top: fromBottom ? undefined : 0,
                    bottom: fromBottom ? 0 : undefined,
                    left: fromRight ? undefined : 0,
                    right: fromRight ? 0 : undefined,
                    transform: `rotate(${angle})`,
                    transformOrigin: `${fromRight ? "100%" : "0%"} ${fromBottom ? "100%" : "0%"}`,
                }}
            >
                {VARIED_STRIPE_LENGTHS.map((len, i) => (
                    <span
                        key={`${placement}-${i}`}
                        className="block h-[2.5px] shrink-0 sm:h-[3px]"
                        style={{
                            width: `${len}px`,
                            backgroundColor: color,
                            opacity: 0.32 + ((i * 11) % 30) / 100,
                            // Outer end square against corner; inner tip soft
                            borderRadius: fromRight
                                ? "999px 0 0 999px"
                                : "0 999px 999px 0",
                            alignSelf: fromRight ? "flex-end" : "flex-start",
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

function HatchMark({
    placement = "top-right",
    color = "#a78bfa",
    varied = false,
    className = "",
}: {
    placement?: Placement | Placement[]
    color?: string
    varied?: boolean
    className?: string
}) {
    const placements = Array.isArray(placement) ? placement : [placement]
    return (
        <div aria-hidden className={`pointer-events-none absolute inset-0 z-[1] ${className}`}>
            {placements.map((p) => (
                <HatchCorner
                    key={p}
                    placement={p}
                    color={color}
                    varied={varied}
                />
            ))}
        </div>
    )
}

function RadianceMark({
    placement = "top-right",
    className = "",
}: {
    placement?: Placement
    className?: string
}) {
    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute z-[1] h-[28rem] w-[28rem] sm:h-[34rem] sm:w-[34rem] ${CORNER_POS[placement]} ${className}`}
        >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.22)_0%,rgba(139,92,246,0.08)_38%,transparent_68%)]" />
            <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_55%)] blur-[2px]" />
            <div className="absolute inset-[34%] rounded-full border border-violet-300/15" />
            <div className="absolute inset-[46%] rounded-full border border-violet-200/10" />
        </div>
    )
}

function RingsMark({
    placement = "top-left",
    className = "",
}: {
    placement?: Placement
    className?: string
}) {
    const rings = [12, 24, 36, 48, 60, 72]
    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute z-[1] h-[26rem] w-[26rem] sm:h-[32rem] sm:w-[32rem] ${CORNER_POS[placement]} ${className}`}
        >
            <div className="absolute inset-0 flex items-center justify-center">
                {rings.map((inset, i) => (
                    <span
                        key={inset}
                        className="absolute rounded-full border border-violet-300/20"
                        style={{
                            inset: `${inset}%`,
                            opacity: 0.35 + i * 0.08,
                        }}
                    />
                ))}
                {/* faint orbit dots */}
                <span className="absolute left-[18%] top-[42%] h-1 w-1 rounded-full bg-violet-200/50" />
                <span className="absolute right-[22%] top-[28%] h-1.5 w-1.5 rounded-full bg-violet-300/40" />
                <span className="absolute bottom-[30%] left-[38%] h-1 w-1 rounded-full bg-white/30" />
            </div>
        </div>
    )
}

function TickRail({ side }: { side: "left" | "right" }) {
    const ticks = Array.from({ length: 11 }, (_, i) => i)
    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute top-1/2 z-[1] flex h-[min(70%,28rem)] -translate-y-1/2 flex-col justify-between ${
                side === "left" ? "left-2 sm:left-4" : "right-2 sm:right-4"
            }`}
        >
            {ticks.map((i) => {
                const major = i % 5 === 0
                return (
                    <span
                        key={`${side}-${i}`}
                        className={`block bg-violet-300/35 ${
                            major
                                ? side === "left"
                                    ? "h-px w-4 sm:w-5"
                                    : "ml-auto h-px w-4 sm:w-5"
                                : side === "left"
                                  ? "h-px w-2 opacity-60 sm:w-2.5"
                                  : "ml-auto h-px w-2 opacity-60 sm:w-2.5"
                        }`}
                    />
                )
            })}
        </div>
    )
}

function TicksMark({
    side = "both",
    className = "",
}: {
    side?: "left" | "right" | "both"
    className?: string
}) {
    return (
        <div aria-hidden className={`pointer-events-none absolute inset-0 z-[1] ${className}`}>
            {(side === "left" || side === "both") && <TickRail side="left" />}
            {(side === "right" || side === "both") && <TickRail side="right" />}
        </div>
    )
}

function IndexMark({
    index,
    label,
    placement = "top-left",
    className = "",
}: {
    index: number
    label: string
    placement?: "top-left" | "top-right"
    className?: string
}) {
    const n = String(index).padStart(2, "0")
    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute z-[1] font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300/55 sm:text-[11px] ${INDEX_POS[placement]} ${className}`}
        >
            <span className="text-violet-200/70">{n}</span>
            <span className="mx-2 text-white/20">·</span>
            <span>{label}</span>
        </div>
    )
}

/**
 * Shared section accent system:
 * - hatch     → diagonal stripes
 * - radiance  → soft circular bloom
 * - rings     → concentric orbit rings
 * - ticks     → scale marks
 * - index     → mono chapter label `0N · NAME`
 */
export function SectionMark(props: SectionMarkProps) {
    if (props.mode === "hatch") {
        return (
            <HatchMark
                placement={props.placement}
                color={props.color}
                varied={props.varied}
                className={props.className}
            />
        )
    }
    if (props.mode === "radiance") {
        return (
            <RadianceMark
                placement={props.placement}
                className={props.className}
            />
        )
    }
    if (props.mode === "rings") {
        return (
            <RingsMark placement={props.placement} className={props.className} />
        )
    }
    if (props.mode === "ticks") {
        return <TicksMark side={props.side} className={props.className} />
    }
    return (
        <IndexMark
            index={props.index}
            label={props.label}
            placement={props.placement}
            className={props.className}
        />
    )
}
