export type ExperienceJobTag =
    | "Full Time"
    | "Contract"
    | "Freelance"
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
    mark: string
    markColor: string
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
