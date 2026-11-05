"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { FiArrowUp } from "react-icons/fi"

const SHOW_AFTER_PX = 420

export function BackToTop() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)

  // Skip admin surfaces
  const enabled = !pathname?.startsWith("/admin")

  useEffect(() => {
    if (!enabled) {
      setVisible(false)
      return
    }

    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [enabled])

  if (!enabled) return null

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="back-to-top"
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.92 }}
          transition={{ duration: reduceMotion ? 0 : 0.22 }}
          // Outer wrapper owns fixed positioning — .liquid-glass sets position:relative
          className="pointer-events-none fixed bottom-5 right-4 z-[45] md:bottom-7 md:right-6"
        >
          <button
            type="button"
            onClick={scrollTop}
            aria-label="Back to top"
            title="Back to top"
            className="liquid-glass pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full text-white/85 transition hover:text-white"
          >
            <FiArrowUp className="text-lg" aria-hidden />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
