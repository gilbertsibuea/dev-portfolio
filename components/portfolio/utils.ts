import type { Project } from "./types"

export const isVideoFile = (url: string): boolean =>
    url.includes(".webm") || url.includes(".mp4") || url.includes(".mov")

export const getValidImageSrc = (project: Project): string => {
    const fallbackImage = "/proj1.gif"
    try {
        if (!project?.image) return fallbackImage

        const resolveSrc = (src: string): string => {
            if (!src || src.includes("[object Object]")) return fallbackImage
            if (src.startsWith("blob:")) return fallbackImage
            if (src.includes("uploads/")) return src.startsWith("/") ? src : "/" + src
            return src
        }

        if (project.gifUrl && project.gifUrl.trim()) {
            const resolved = resolveSrc(project.gifUrl.trim())
            if (resolved !== fallbackImage) return resolved
        }

        if (typeof project.image === "object" && project.image?.src) {
            return resolveSrc(project.image.src)
        }
        if (typeof project.image === "string") {
            return resolveSrc(project.image.trim())
        }
        return fallbackImage
    } catch {
        return fallbackImage
    }
}
