export interface Project {
    id: number
    year: number
    title: string
    description: string
    image: { src: string } | string
    gifUrl?: string
    languages: string[]
    details?: string
    githubLink?: string
    liveLink?: string
    category?: string
}
