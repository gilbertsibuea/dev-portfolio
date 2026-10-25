"use client"

import { memo, useMemo, type PointerEvent, type RefObject } from "react"
import { motion } from "framer-motion"
import {
    FiActivity,
    FiCloud,
    FiCode,
    FiCpu,
    FiDatabase,
    FiLayers,
    FiLayout,
    FiServer,
} from "react-icons/fi"
import { buildSectorGeometry, degToRad } from "./geometry"
import { SKILL_CATEGORIES } from "./skillCategories"
import type { RadialMenuMode } from "./types"

const VIEW = 200
const CX = 100
const CY = 100
export const WHEEL_INNER_R = 36
export const WHEEL_OUTER_R = 94
const LABEL_R = 66
const IDLE_R = 48

const ICONS = {
    server: FiServer,
    layout: FiLayout,
    database: FiDatabase,
    layers: FiLayers,
    activity: FiActivity,
    cloud: FiCloud,
    cpu: FiCpu,
    code: FiCode,
} as const

type RadialWheelProps = {
    mode: RadialMenuMode
    confirmedIndex: number
    highlightedIndex: number | null
    previewIndex: number
    reducedMotion: boolean
    wheelRef: RefObject<HTMLDivElement | null>
    onPointerDown: (e: PointerEvent) => void
    onPointerMove: (e: PointerEvent) => void
    onPointerUp: (e: PointerEvent) => void
    onPointerCancel: () => void
    onPointerLeave: () => void
}

function fillFor(state: "confirmed" | "highlighted" | "inactive") {
    switch (state) {
        case "confirmed":
            return "rgba(139, 92, 246, 0.42)"
        case "highlighted":
            return "rgba(167, 139, 250, 0.55)"
        default:
            return "rgba(255, 255, 255, 0.05)"
    }
}

function strokeFor(state: "confirmed" | "highlighted" | "inactive") {
    switch (state) {
        case "confirmed":
            return "rgba(196, 181, 253, 0.85)"
        case "highlighted":
            return "rgba(221, 214, 254, 0.95)"
        default:
            return "rgba(255, 255, 255, 0.12)"
    }
}

export const RadialWheel = memo(function RadialWheel({
    mode,
    confirmedIndex,
    highlightedIndex,
    previewIndex,
    reducedMotion,
    wheelRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onPointerLeave,
}: RadialWheelProps) {
    const sectors = useMemo(
        () =>
            buildSectorGeometry(
                SKILL_CATEGORIES.length,
                CX,
                CY,
                WHEEL_INNER_R,
                WHEEL_OUTER_R,
                LABEL_R
            ),
        []
    )

    const sectorsVisible =
        mode === "navigating" ||
        mode === "opening-sectors" ||
        mode === "closing-sectors"
    const sectorsExpanded =
        mode === "navigating" || mode === "opening-sectors"

    const preview = SKILL_CATEGORIES[previewIndex]
    const confirmed = SKILL_CATEGORIES[confirmedIndex]
    const hubLabel = sectorsVisible
        ? preview?.shortLabel ?? "Skills"
        : confirmed?.shortLabel ?? "Backend"
    const hubHint = sectorsExpanded ? "release" : "hold"

    const orbRadius = sectorsVisible ? WHEEL_INNER_R - 1 : IDLE_R

    return (
        <div
            ref={wheelRef}
            role="listbox"
            aria-label="Software engineering skills wheel"
            aria-activedescendant={
                sectorsVisible ? `skill-sector-${previewIndex}` : undefined
            }
            tabIndex={0}
            className="relative mx-auto aspect-square w-full max-w-[440px] touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0e1c] sm:max-w-[520px] lg:max-w-[560px]"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onPointerLeave={onPointerLeave}
        >
            <svg
                viewBox={`0 0 ${VIEW} ${VIEW}`}
                className="h-full w-full drop-shadow-[0_0_32px_rgba(139,92,246,0.18)]"
            >
                <defs>
                    <radialGradient id="stack-orb-fill" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(167,139,250,0.4)" />
                        <stop offset="55%" stopColor="rgba(22,20,46,0.95)" />
                        <stop offset="100%" stopColor="#120f24" />
                    </radialGradient>
                    <filter id="stack-wheel-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <motion.circle
                    cx={CX}
                    cy={CY}
                    r={WHEEL_OUTER_R + 2}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={1}
                    initial={false}
                    animate={{ opacity: sectorsVisible ? 1 : 0.35 }}
                    transition={{ duration: reducedMotion ? 0 : 0.25 }}
                />

                {sectors.map((sector) => {
                    const category = SKILL_CATEGORIES[sector.index]
                    const state =
                        highlightedIndex === sector.index
                            ? "highlighted"
                            : confirmedIndex === sector.index && sectorsExpanded
                              ? "confirmed"
                              : "inactive"
                    const active = state !== "inactive"

                    return (
                        <motion.path
                            key={category.id}
                            id={`skill-sector-${sector.index}`}
                            role="option"
                            aria-selected={confirmedIndex === sector.index}
                            aria-label={category.label}
                            d={sector.pathD}
                            fill={fillFor(state)}
                            stroke={strokeFor(state)}
                            strokeWidth={active ? 1.4 : 0.8}
                            filter={active ? "url(#stack-wheel-glow)" : undefined}
                            initial={false}
                            animate={{
                                opacity: sectorsVisible ? 1 : 0,
                                scale: sectorsExpanded
                                    ? 1
                                    : mode === "closing-sectors"
                                      ? 0.92
                                      : 0.72,
                            }}
                            style={{
                                transformOrigin: "100px 100px",
                                pointerEvents: sectorsExpanded ? "auto" : "none",
                            }}
                            transition={{
                                duration: reducedMotion ? 0 : 0.28,
                                delay:
                                    reducedMotion || !sectorsVisible
                                        ? 0
                                        : sector.index * 0.02,
                                ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                        />
                    )
                })}

                <motion.circle
                    cx={CX}
                    cy={CY}
                    fill="url(#stack-orb-fill)"
                    stroke="rgba(167, 139, 250, 0.45)"
                    strokeWidth={1.4}
                    initial={false}
                    animate={{ r: orbRadius }}
                    transition={{
                        type: reducedMotion ? "tween" : "spring",
                        stiffness: 260,
                        damping: 22,
                        duration: reducedMotion ? 0.15 : undefined,
                    }}
                    style={{ cursor: "pointer" }}
                />

                {!sectorsVisible && !reducedMotion && (
                    <motion.circle
                        cx={CX}
                        cy={CY}
                        r={IDLE_R}
                        fill="none"
                        stroke="rgba(167,139,250,0.35)"
                        strokeWidth={1}
                        animate={{ r: [IDLE_R, IDLE_R + 12], opacity: [0.45, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                        pointerEvents="none"
                    />
                )}

                <text
                    x={CX}
                    y={CY - 3}
                    textAnchor="middle"
                    fill="white"
                    style={{ fontSize: 7.5, fontWeight: 700 }}
                    pointerEvents="none"
                >
                    {hubLabel}
                </text>
                <text
                    x={CX}
                    y={CY + 9}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.4)"
                    style={{ fontSize: 4.5 }}
                    pointerEvents="none"
                >
                    {hubHint}
                </text>
            </svg>

            {sectors.map((sector) => {
                const category = SKILL_CATEGORIES[sector.index]
                const Icon = ICONS[category.icon as keyof typeof ICONS] ?? FiCode
                const active =
                    highlightedIndex === sector.index ||
                    (confirmedIndex === sector.index && sectorsExpanded)
                const rad = degToRad(sector.midAngleDeg)
                const left = 50 + (LABEL_R / VIEW) * 100 * Math.cos(rad)
                const top = 50 + (LABEL_R / VIEW) * 100 * Math.sin(rad)

                return (
                    <motion.div
                        key={`label-${category.id}`}
                        aria-hidden
                        className={`pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 ${
                            active ? "text-violet-100" : "text-white/60"
                        }`}
                        style={{ left: `${left}%`, top: `${top}%` }}
                        initial={false}
                        animate={{
                            opacity: sectorsExpanded ? 1 : 0,
                            scale: sectorsExpanded ? 1 : 0.85,
                        }}
                        transition={{
                            duration: reducedMotion ? 0 : 0.22,
                            delay:
                                reducedMotion || !sectorsExpanded
                                    ? 0
                                    : 0.05 + sector.index * 0.025,
                        }}
                    >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="max-w-[5rem] text-center text-[10px] font-semibold leading-tight tracking-wide sm:text-[11px]">
                            {category.shortLabel}
                        </span>
                    </motion.div>
                )
            })}
        </div>
    )
})
