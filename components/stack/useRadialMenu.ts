"use client"

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
    type RefObject,
} from "react"
import { ACTIVATION_KEY, SKILL_CATEGORIES } from "./skillCategories"
import { pointerToSectorIndex } from "./geometry"
import type { RadialMenuMode } from "./types"

const CATEGORY_COUNT = SKILL_CATEGORIES.length
/** Backend Engineering — first category */
const DEFAULT_INDEX = 0

type UseRadialMenuArgs = {
    wheelRef: RefObject<HTMLElement | null>
    innerR: number
    outerR: number
    reducedMotion: boolean
}

export function useRadialMenu({
    wheelRef,
    innerR,
    outerR,
    reducedMotion,
}: UseRadialMenuArgs) {
    const [mode, setMode] = useState<RadialMenuMode>("idle")
    const [confirmedIndex, setConfirmedIndex] = useState(DEFAULT_INDEX)
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)

    const modeRef = useRef(mode)
    const confirmedRef = useRef(confirmedIndex)
    const highlightedRef = useRef(highlightedIndex)
    const activationHeldRef = useRef(false)
    const pointerActiveRef = useRef(false)
    const pointerIdRef = useRef<number | null>(null)
    const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    modeRef.current = mode
    confirmedRef.current = confirmedIndex
    highlightedRef.current = highlightedIndex

    const clearAnimTimer = () => {
        if (animTimerRef.current) {
            clearTimeout(animTimerRef.current)
            animTimerRef.current = null
        }
    }

    const showSectors = useCallback(
        (initial: number | null = confirmedRef.current) => {
            clearAnimTimer()
            setHighlightedIndex(initial ?? DEFAULT_INDEX)
            if (reducedMotion) {
                setMode("navigating")
                return
            }
            setMode("opening-sectors")
            animTimerRef.current = setTimeout(() => {
                setMode("navigating")
                animTimerRef.current = null
            }, 220)
        },
        [reducedMotion]
    )

    const hideSectors = useCallback(
        (confirm: boolean) => {
            activationHeldRef.current = false
            pointerActiveRef.current = false
            pointerIdRef.current = null

            if (confirm && highlightedRef.current !== null) {
                setConfirmedIndex(highlightedRef.current)
            }
            setHighlightedIndex(null)

            if (reducedMotion) {
                setMode("idle")
                return
            }

            setMode("closing-sectors")
            clearAnimTimer()
            animTimerRef.current = setTimeout(() => {
                setMode("idle")
                animTimerRef.current = null
            }, 200)
        },
        [reducedMotion]
    )

    const cancelSectors = useCallback(() => hideSectors(false), [hideSectors])
    const confirmSectors = useCallback(() => hideSectors(true), [hideSectors])

    const getLocalPoint = useCallback(
        (clientX: number, clientY: number) => {
            const el = wheelRef.current
            if (!el) return null
            const rect = el.getBoundingClientRect()
            const cx = rect.left + rect.width / 2
            const cy = rect.top + rect.height / 2
            const scale = 200 / Math.min(rect.width, rect.height)
            return {
                dx: (clientX - cx) * scale,
                dy: (clientY - cy) * scale,
            }
        },
        [wheelRef]
    )

    const updateHighlightFromPointer = useCallback(
        (clientX: number, clientY: number) => {
            const pt = getLocalPoint(clientX, clientY)
            if (!pt) return
            const next = pointerToSectorIndex(pt.dx, pt.dy, CATEGORY_COUNT, innerR, outerR)
            if (next !== null) setHighlightedIndex(next)
        },
        [getLocalPoint, innerR, outerR]
    )

    const isSectorsVisible = (m: RadialMenuMode) =>
        m === "navigating" || m === "opening-sectors" || m === "closing-sectors"

    useEffect(() => {
        const isTypingTarget = (target: EventTarget | null) => {
            if (!(target instanceof HTMLElement)) return false
            const tag = target.tagName
            return (
                tag === "INPUT" ||
                tag === "TEXTAREA" ||
                tag === "SELECT" ||
                target.isContentEditable
            )
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (isTypingTarget(e.target)) return
            const m = modeRef.current

            if (e.code === ACTIVATION_KEY) {
                if (e.repeat) return
                e.preventDefault()
                activationHeldRef.current = true
                if (m === "idle" || m === "closing-sectors") {
                    showSectors(confirmedRef.current)
                }
                return
            }

            if (e.key === "Escape") {
                if (isSectorsVisible(m) || activationHeldRef.current) {
                    e.preventDefault()
                    cancelSectors()
                }
                return
            }

            const navigating = m === "navigating" || m === "opening-sectors"
            if (!navigating) return

            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault()
                setHighlightedIndex((prev) => {
                    const base = prev ?? confirmedRef.current
                    return (base + 1) % CATEGORY_COUNT
                })
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault()
                setHighlightedIndex((prev) => {
                    const base = prev ?? confirmedRef.current
                    return (base - 1 + CATEGORY_COUNT) % CATEGORY_COUNT
                })
            } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                confirmSectors()
            }
        }

        const onKeyUp = (e: KeyboardEvent) => {
            if (e.code !== ACTIVATION_KEY) return
            if (!activationHeldRef.current) return
            e.preventDefault()
            activationHeldRef.current = false
            if (isSectorsVisible(modeRef.current)) {
                if (highlightedRef.current !== null) confirmSectors()
                else cancelSectors()
            }
        }

        const onBlur = () => {
            if (activationHeldRef.current || pointerActiveRef.current) {
                cancelSectors()
            }
        }

        const onVisibility = () => {
            if (document.hidden) cancelSectors()
        }

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)
        window.addEventListener("blur", onBlur)
        document.addEventListener("visibilitychange", onVisibility)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
            window.removeEventListener("blur", onBlur)
            document.removeEventListener("visibilitychange", onVisibility)
            clearAnimTimer()
        }
    }, [cancelSectors, confirmSectors, showSectors])

    const onPointerDown = (e: ReactPointerEvent) => {
        if (e.button !== 0 && e.pointerType === "mouse") return
        const el = wheelRef.current
        if (!el) return

        e.preventDefault()
        pointerActiveRef.current = true
        pointerIdRef.current = e.pointerId
        try {
            el.setPointerCapture(e.pointerId)
        } catch {
            // ignore
        }

        const pt = getLocalPoint(e.clientX, e.clientY)
        const sector =
            pt && pointerToSectorIndex(pt.dx, pt.dy, CATEGORY_COUNT, innerR, outerR)
        showSectors(sector ?? confirmedRef.current)
    }

    const onPointerMove = (e: ReactPointerEvent) => {
        if (!pointerActiveRef.current) return
        if (isSectorsVisible(modeRef.current)) {
            updateHighlightFromPointer(e.clientX, e.clientY)
        }
    }

    const onPointerUp = (e: ReactPointerEvent) => {
        if (!pointerActiveRef.current) return
        if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return

        const pt = getLocalPoint(e.clientX, e.clientY)
        const sector =
            pt && pointerToSectorIndex(pt.dx, pt.dy, CATEGORY_COUNT, innerR, outerR)

        if (sector === null || sector === undefined) {
            cancelSectors()
            return
        }

        setHighlightedIndex(sector)
        highlightedRef.current = sector
        confirmSectors()
    }

    const onPointerCancel = () => {
        if (pointerActiveRef.current || activationHeldRef.current) {
            cancelSectors()
        }
    }

    const onPointerLeave = () => {
        // captured pointer continues via capture
    }

    const sectorsOpen = isSectorsVisible(mode)

    const previewIndex =
        sectorsOpen && highlightedIndex !== null
            ? highlightedIndex
            : confirmedIndex

    const isPreview =
        sectorsOpen &&
        highlightedIndex !== null &&
        highlightedIndex !== confirmedIndex

    return {
        mode,
        sectorsOpen,
        isPreview,
        confirmedIndex,
        highlightedIndex,
        previewIndex,
        cancelSectors,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        onPointerLeave,
    }
}
