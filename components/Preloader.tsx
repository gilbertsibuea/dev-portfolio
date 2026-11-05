'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from 'framer-motion'

interface PreloaderProps {
  onLoadComplete?: () => void
}

const EASE = [0.76, 0, 0.24, 1] as const
const MIN_DURATION = 1.6 // detik, supaya tidak berkedip di koneksi cepat

const Preloader = ({ onLoadComplete }: PreloaderProps) => {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(true)
  const counterRef = useRef<HTMLSpanElement>(null)

  const progress = useMotionValue(0)
  const pathLength = useTransform(progress, [0, 100], [0, 1])

  // Update angka lewat ref, tanpa re-render
  useMotionValueEvent(progress, 'change', (v) => {
    if (counterRef.current) {
      counterRef.current.textContent = String(Math.round(v)).padStart(3, '0')
    }
  })

  // Kunci scroll selama preloader tampil
  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [visible])

  useEffect(() => {
    if (reduceMotion) {
      progress.set(100)
      const t = setTimeout(() => setVisible(false), 200)
      return () => clearTimeout(t)
    }

    let cancelled = false

    const loaded = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') resolve()
      else window.addEventListener('load', () => resolve(), { once: true })
    })

    // Merayap sampai 90%, sisanya menunggu load asli
    const crawl = animate(progress, 90, {
      duration: MIN_DURATION,
      ease: 'easeOut',
    })

    const run = async () => {
      await Promise.all([crawl, loaded])
      if (cancelled) return
      await animate(progress, 100, { duration: 0.4, ease: EASE })
      if (cancelled) return
      await new Promise((r) => setTimeout(r, 350))
      if (!cancelled) setVisible(false)
    }
    run()

    return () => {
      cancelled = true
      crawl.stop()
    }
  }, [reduceMotion, progress])

  return (
    <AnimatePresence onExitComplete={() => onLoadComplete?.()}>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-50 bg-black text-violet-300"
          exit={reduceMotion ? { opacity: 0 } : { y: '-120%' }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          {/* Tepi bawah melengkung, ikut terangkat bersama layar */}
          <div
            className="absolute left-0 top-full h-[15vh] w-full bg-black"
            style={{ borderRadius: '0 0 50% 50% / 0 0 100% 100%' }}
          />

          {/* Logo */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { y: -60, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <svg
              viewBox="0 0 100 100"
              className="h-28 w-28 sm:h-36 sm:w-36"
              fill="none"
              stroke="currentColor"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {/* Cincin panduan tipis */}
              <circle cx="50" cy="50" r="38" strokeOpacity={0.12} />
              {/* G, digambar mengikuti progress */}
              <motion.path
                d="M81.13 28.2 A38 38 0 1 0 88 50 L54 50"
                style={{ pathLength }}
              />
            </svg>
          </motion.div>

          {/* Info pojok */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 sm:p-10">
            <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">
              Gilbert&apos;s Portfolio
            </span>
            <span
              ref={counterRef}
              className="font-mono text-5xl tabular-nums leading-none text-white sm:text-7xl"
            >
              000
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Preloader