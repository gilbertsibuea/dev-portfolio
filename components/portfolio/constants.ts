import type { ComponentType } from "react"
import {
    FiCpu,
    FiDatabase,
    FiGlobe,
    FiLayers,
    FiSmartphone,
} from "react-icons/fi"

export const CATEGORY_LABELS = ["Web", "ML & AI", "Data", "Mobile", "Others"] as const

export type CategoryLabel = (typeof CATEGORY_LABELS)[number]

export const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
    Web: FiGlobe,
    "ML & AI": FiCpu,
    Data: FiDatabase,
    Mobile: FiSmartphone,
    Others: FiLayers,
}

export const fadeInUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

export const slideVariants = {
    enter: (dir: number) => ({
        x: dir > 0 ? "55%" : "-55%",
        opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
        x: dir > 0 ? "-55%" : "55%",
        opacity: 0,
    }),
}
