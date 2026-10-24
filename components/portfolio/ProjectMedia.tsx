"use client"

import { isVideoFile } from "./utils"

type ProjectMediaProps = {
    src: string
    title: string
    className?: string
    contain?: boolean
}

export function ProjectMedia({ src, title, className = "", contain = false }: ProjectMediaProps) {
    const fit = contain ? "object-contain bg-black/40" : "object-cover"

    if (isVideoFile(src)) {
        return (
            <video
                src={src}
                className={`w-full h-full ${fit} ${className}`}
                autoPlay
                loop
                muted
                playsInline
                onError={(e) => {
                    e.currentTarget.style.display = "none"
                }}
            />
        )
    }

    return (
        <img
            src={src}
            alt={title}
            className={`w-full h-full ${fit} ${className}`}
            loading="lazy"
            onError={(e) => {
                if (!e.currentTarget.src.endsWith("/proj1.gif")) {
                    e.currentTarget.src = "/proj1.gif"
                }
            }}
        />
    )
}
