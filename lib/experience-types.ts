export type ExperienceJobTag =
    | "Full Time"
    | "Contract"
    | "Freelance"
    | "Internship"
    | "Project"
    | "Education"

export type ExperienceJob = {
    org: string
    role: string
    tag: ExperienceJobTag
    period: string
    location?: string
    summary?: string
    highlights?: string[]
    /** Fallback initials when no iconUrl */
    mark: string
    markColor: string
    /** Optional logo/icon image URL (upload or external) */
    iconUrl?: string
}

export type ExperiencePanelKind = "feature" | "stack"

export type ExperiencePanel = {
    id: number
    slug: string
    kind: ExperiencePanelKind
    sortOrder: number
    jobs: ExperienceJob[]
    createdAt?: string
    updatedAt?: string
}

export type ExperiencePanelInput = {
    slug: string
    kind: ExperiencePanelKind
    sortOrder?: number
    jobs: ExperienceJob[]
}
