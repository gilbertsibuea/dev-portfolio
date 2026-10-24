'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface PreloaderProps {
  onLoadComplete?: () => void
}

const Preloader = ({ onLoadComplete }: PreloaderProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    // Quick visual cue capped at 800ms before exit fade
    const steps = [20, 50, 80, 100]
    const delays = [100, 250, 450, 650]

    const timers = steps.map((val, i) =>
      setTimeout(() => setLoadingProgress(val), delays[i])
    )

    const dismiss = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(dismiss)
    }
  }, [])

  return (
    <AnimatePresence
      onExitComplete={() => {
        onLoadComplete?.()
      }}
    >
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          <div className="relative flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center mb-8">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-7xl font-bold text-gray-500 mr-2"
              >
                Gibe
              </motion.div>

              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                className="text-7xl font-bold text-white"
              >
                Dev
              </motion.div>
            </div>

            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-violet-600"
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Preloader
