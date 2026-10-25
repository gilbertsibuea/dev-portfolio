export type EvidenceType =
    | "professional"
    | "personal-project"
    | "academic"
    | "certification"

export type Skill = {
    id: string
    name: string
    description?: string
    relatedProject?: string
    evidenceType?: EvidenceType
}

export type RelatedProject = {
    id: string
    label: string
    href?: string
    evidenceType: EvidenceType
}

export type SkillCategory = {
    id: string
    label: string
    shortLabel: string
    description: string
    icon: string
    skills: Skill[]
    projects: RelatedProject[]
}

/** Idle orb → hold → sectors */
export type RadialMenuMode =
    | "idle"
    | "opening-sectors"
    | "navigating"
    | "closing-sectors"
