"use client"

import { CATEGORY_ICONS } from "./constants"
import { FiLayers } from "react-icons/fi"

type CategoryFilterProps = {
    categories: string[]
    selectedCategory: string | null
    onSelect: (cat: string) => void
    vertical?: boolean
}

export function CategoryFilter({
    categories,
    selectedCategory,
    onSelect,
    vertical = false,
}: CategoryFilterProps) {
    if (vertical) {
        return (
            <nav aria-label="Project categories" className="flex flex-col gap-0.5">
                {categories.map((category) => {
                    const Icon = CATEGORY_ICONS[category] ?? FiLayers
                    const active = selectedCategory === category

                    return (
                        <button
                            key={category}
                            type="button"
                            onClick={() => onSelect(category)}
                            className={`
                                group inline-flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
                                border-l-2
                                ${active
                                    ? "border-violet-400 text-white bg-white/[0.04]"
                                    : "border-transparent text-white/45 hover:text-white/80 hover:bg-white/[0.02]"
                                }
                            `}
                        >
                            <Icon
                                className={`text-base shrink-0 ${
                                    active ? "text-violet-300" : "text-white/35 group-hover:text-white/60"
                                }`}
                            />
                            <span className="font-medium tracking-wide">{category}</span>
                        </button>
                    )
                })}
            </nav>
        )
    }

    return (
        <nav
            aria-label="Project categories"
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide overscroll-x-contain -mx-1 px-1"
        >
            {categories.map((category) => {
                const Icon = CATEGORY_ICONS[category] ?? FiLayers
                const active = selectedCategory === category

                return (
                    <button
                        key={category}
                        type="button"
                        onClick={() => onSelect(category)}
                        className={`
                            group inline-flex items-center gap-2 px-3 py-2 text-sm transition-colors
                            border-b-2 -mb-px whitespace-nowrap shrink-0
                            ${active
                                ? "border-violet-400 text-white"
                                : "border-transparent text-white/45 hover:text-white/80"
                            }
                        `}
                    >
                        <Icon
                            className={`text-base ${
                                active ? "text-violet-300" : "text-white/40 group-hover:text-white/70"
                            }`}
                        />
                        <span className="font-medium tracking-wide">{category}</span>
                    </button>
                )
            })}
        </nav>
    )
}
