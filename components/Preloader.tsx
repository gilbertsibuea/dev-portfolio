'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface PreloaderProps {
  onLoadComplete?: () => void
}

type Phase = 'intro' | 'ready' | 'zoom' | 'exit'

const Preloader = ({ onLoadComplete }: PreloaderProps) => {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('intro')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (reduceMotion) {
      setLoadingProgress(100)
      const done = setTimeout(() => {
        setVisible(false)
      }, 200)
      return () => clearTimeout(done)
    }

    const timers = [
      setTimeout(() => setLoadingProgress(35), 180),
      setTimeout(() => setLoadingProgress(70), 480),
      setTimeout(() => {
        setLoadingProgress(100)
        setPhase('ready')
      }, 780),
      setTimeout(() => setPhase('zoom'), 1180),
      setTimeout(() => setPhase('exit'), 2100),
      setTimeout(() => setVisible(false), 2550),
    ]

    return () => timers.forEach(clearTimeout)
  }, [reduceMotion])

  const isZooming = phase === 'zoom' || phase === 'exit'

  return (
    <AnimatePresence
      onExitComplete={() => {
        onLoadComplete?.()
      }}
    >
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black"
          initial={{ opacity: 1 }}
          animate={
            phase === 'exit'
              ? { opacity: 0, scale: 1.08 }
              : { opacity: 1, scale: 1 }
          }
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Soft radial atmosphere */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at center, rgba(124,58,237,0.28) 0%, rgba(0,0,0,0.2) 40%, #000 75%)',
            }}
            animate={
              isZooming
                ? { scale: 2.4, opacity: phase === 'exit' ? 0 : 0.9 }
                : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Expanding rings */}
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={ring}
              className="pointer-events-none absolute rounded-full border border-violet-400/30"
              style={{ width: 120 + ring * 90, height: 120 + ring * 90 }}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={
                isZooming
                  ? { scale: 4 + ring, opacity: 0 }
                  : {
                      scale: [0.85, 1.15, 0.85],
                      opacity: [0.15, 0.4, 0.15],
                    }
              }
              transition={
                isZooming
                  ? { duration: 0.8, delay: ring * 0.05, ease: 'easeOut' }
                  : {
                      duration: 2.4 + ring * 0.3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: ring * 0.2,
                    }
              }
            />
          ))}

          <div className="relative z-10 flex flex-col items-center justify-center px-6 w-full">
            {/*
              Logo row stays viewport-centered. On zoom, siblings leave the flow
              so only G remains — then G scales from its own center.
            */}
            <div className="relative flex items-center justify-center mb-10 h-[5.5rem] sm:h-[6.5rem] w-full">
              <div className="relative flex items-baseline justify-center">
                {/* G — zoom target, always centered in parent */}
                <motion.span
                  className="inline-block text-7xl sm:text-8xl font-bold text-violet-300 relative z-20 leading-none"
                  initial={{ opacity: 0, scale: 0.5, filter: 'blur(12px)' }}
                  animate={{
                    opacity: 1,
                    filter: 'blur(0px)',
                    scale: isZooming ? (phase === 'exit' ? 22 : 12) : 1,
                    textShadow: isZooming
                      ? '0 0 48px rgba(167,139,250,0.9)'
                      : '0 0 0px rgba(167,139,250,0)',
                  }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: 'center center' }}
                >
                  G
                </motion.span>

                {/* ibe — collapses out of layout while fading */}
                <motion.span
                  className="inline-block text-7xl sm:text-8xl font-bold text-gray-400 leading-none overflow-hidden"
                  initial={{ opacity: 0, x: -16, filter: 'blur(8px)' }}
                  animate={
                    isZooming
                      ? {
                          opacity: 0,
                          filter: 'blur(10px)',
                          maxWidth: 0,
                          marginLeft: 0,
                          scale: 0.8,
                        }
                      : {
                          opacity: 1,
                          x: 0,
                          filter: 'blur(0px)',
                          maxWidth: 200,
                          scale: 1,
                        }
                  }
                  transition={{
                    duration: isZooming ? 0.4 : 0.55,
                    delay: isZooming ? 0 : 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  ibe
                </motion.span>

                {/* Dev */}
                <motion.span
                  className="inline-block text-7xl sm:text-8xl font-bold text-white leading-none overflow-hidden"
                  initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
                  animate={
                    isZooming
                      ? {
                          opacity: 0,
                          filter: 'blur(12px)',
                          maxWidth: 0,
                          marginLeft: 0,
                          scale: 0.8,
                        }
                      : {
                          opacity: 1,
                          x: 0,
                          filter: 'blur(0px)',
                          maxWidth: 200,
                          marginLeft: 8,
                          scale: 1,
                        }
                  }
                  transition={{
                    duration: isZooming ? 0.35 : 0.55,
                    delay: isZooming ? 0 : 0.22,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  Dev
                </motion.span>
              </div>
            </div>

            {/* Progress — fades as zoom starts */}
            <motion.div
              className="w-56 sm:w-64"
              initial={{ opacity: 0, y: 12 }}
              animate={
                isZooming
                  ? { opacity: 0, y: 8, scale: 0.95 }
                  : { opacity: 1, y: 0, scale: 1 }
              }
              transition={{ duration: 0.35, delay: isZooming ? 0 : 0.35 }}
            >
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-violet-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>
              <motion.p
                className="mt-3 text-center text-xs tracking-[0.25em] uppercase text-gray-500"
                animate={{ opacity: phase === 'ready' ? 1 : 0.7 }}
              >
                {phase === 'ready' ? 'Ready' : 'Loading'}
              </motion.p>
            </motion.div>
          </div>

          {/* Flash veil on exit for cleaner cut into hero */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'exit' ? [0, 0.35, 0] : 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Preloader
