import React from 'react'
import Link from 'next/link'
import { Footer } from '@/components/Footer'
import ProjectsList from './ProjectsList'
import { getAllProjects } from '@/lib/db/projects'

/**
 * Full projects page (hidden from public routing for now).
 * Re-enable by wiring this back into `page.tsx` instead of redirect.
 */
async function getProjects() {
    try {
        return await getAllProjects()
    } catch (error) {
        console.error('Error fetching projects:', error)
        return []
    }
}

export default async function ProjectsPageFull() {
    const projects = await getProjects()
    const isDev = process.env.NODE_ENV === 'development'

    return (
        <>
            <div className="min-h-screen bg-black text-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <Link
                        href="/"
                        className="inline-flex items-center text-violet-500 hover:text-violet-400 mb-8"
                    >
                        ← Back to Home
                    </Link>

                    <h1 className="text-6xl font-bold mb-16 text-center">
                        My <span className="text-gray-500">Projects</span>
                    </h1>

                    {isDev && (
                        <div className="bg-gray-900 p-4 mb-8 rounded-lg">
                            <p className="text-sm text-gray-400">Debug info (dev only):</p>
                            <p className="text-sm text-gray-400">
                                Projects count: {projects.length}
                            </p>
                            <p className="text-sm text-gray-400">
                                NODE_ENV: {process.env.NODE_ENV}
                            </p>
                        </div>
                    )}

                    {projects.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p>
                                No projects found. Add some projects to showcase
                                your work!
                            </p>
                        </div>
                    ) : (
                        <ProjectsList projects={projects} />
                    )}
                </div>
            </div>
            <Footer />
        </>
    )
}
