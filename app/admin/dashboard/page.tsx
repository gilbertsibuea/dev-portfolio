'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import HealthSummaryCard from '@/components/admin/HealthSummaryCard'

// Dashboard components
const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [projectCount, setProjectCount] = useState<number | null>(null)
  const [experienceCount, setExperienceCount] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const adminAuth = localStorage.getItem('adminAuth')
    if (!adminAuth) {
      router.push('/admin')
      return
    }
    setIsAuthenticated(true)
    setIsLoading(false)

    const fetchCounts = async () => {
      try {
        const [projectsRes, experienceRes] = await Promise.all([
          fetch('/api/projects', { cache: 'no-store' }),
          fetch('/api/experience', { cache: 'no-store' }),
        ])
        const projectsData = await projectsRes.json()
        const experienceData = await experienceRes.json()
        setProjectCount(
          projectsData.success && Array.isArray(projectsData.projects)
            ? projectsData.projects.length
            : 0
        )
        setExperienceCount(
          experienceData.success && Array.isArray(experienceData.panels)
            ? experienceData.panels.length
            : 0
        )
      } catch {
        setProjectCount(0)
        setExperienceCount(0)
      }
    }
    fetchCounts()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    router.push('/admin')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // This should never render as the useEffect will redirect
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Admin Header/Navigation */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin <span className="text-violet-500">Dashboard</span></h1>
          
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              View Site
            </Link>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Card - Projects */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900 p-6 rounded-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Projects</h2>
              <span className="text-2xl font-bold text-violet-500">
                {projectCount !== null ? projectCount : '...'}
              </span>
            </div>
            <p className="text-gray-400 mb-4">Manage your portfolio projects</p>
            <Link 
              href="/admin/projects"
              className="inline-block px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
            >
              Manage Projects
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="bg-gray-900 p-6 rounded-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Experience</h2>
              <span className="text-2xl font-bold text-violet-500">
                {experienceCount !== null ? experienceCount : '...'}
              </span>
            </div>
            <p className="text-gray-400 mb-4">Professional Journey carousel panels</p>
            <Link
              href="/admin/experience"
              className="inline-block px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
            >
              Manage Experience
            </Link>
          </motion.div>

          {/* Stats Card - Health */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gray-900 p-6 rounded-xl"
          >
            <HealthSummaryCard />
          </motion.div>
        </div>

        {/* Quick Actions Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/projects/new">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-900 p-4 rounded-xl text-center hover:bg-gray-800 transition-colors"
              >
                <span className="block text-2xl mb-2">➕</span>
                <span>Add Project</span>
              </motion.div>
            </Link>
            
            <Link href="/admin/projects">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-900 p-4 rounded-xl text-center hover:bg-gray-800 transition-colors"
              >
                <span className="block text-2xl mb-2">📋</span>
                <span>View Projects</span>
              </motion.div>
            </Link>
            
            <Link href="/admin/projects/selected">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-900 p-4 rounded-xl text-center hover:bg-gray-800 transition-colors"
              >
                <span className="block text-2xl mb-2">⭐</span>
                <span>Selected Projects</span>
              </motion.div>
            </Link>

            <Link href="/admin/experience">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-900 p-4 rounded-xl text-center hover:bg-gray-800 transition-colors"
              >
                <span className="block text-2xl mb-2">🧭</span>
                <span>Experience</span>
              </motion.div>
            </Link>

            <Link href="/admin/health">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-900 p-4 rounded-xl text-center hover:bg-gray-800 transition-colors"
              >
                <span className="block text-2xl mb-2">💚</span>
                <span>System Health</span>
              </motion.div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard