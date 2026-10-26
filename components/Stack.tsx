"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { RadialWheel, WHEEL_INNER_R, WHEEL_OUTER_R } from "./stack/RadialWheel"
import { SkillDetailsPanel } from "./stack/SkillDetailsPanel"
import { SKILL_CATEGORIES } from "./stack/skillCategories"
import { useRadialMenu } from "./stack/useRadialMenu"

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false)
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const update = () => setReduced(mq.matches)
        update()
        mq.addEventListener("change", update)
        return () => mq.removeEventListener("change", update)
    }, [])
    return reduced
}

export const Stack = () => {
    const sectionRef = useRef<HTMLElement>(null)
    const wheelRef = useRef<HTMLDivElement>(null)
    const sectionInView = useInView(sectionRef, {
        once: true,
        amount: 0.15,
        margin: "-60px 0px",
    })
    const reducedMotion = usePrefersReducedMotion()

    const menu = useRadialMenu({
        wheelRef,
        innerR: WHEEL_INNER_R,
        outerR: WHEEL_OUTER_R,
        reducedMotion,
    })

    const previewCategory = SKILL_CATEGORIES[menu.previewIndex]

    return (
        <section
            ref={sectionRef}
            id="stack"
            className="relative z-10 -mt-4 overflow-hidden rounded-t-3xl bg-[#1F1F1F] text-white py-20 sm:-mt-6 md:-mt-8 md:py-28"
        >
            {/* Soft grain texture — subtle, not material-literal */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
                        `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
                          <filter id='n'>
                            <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/>
                            <feColorMatrix values='0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 0 0.9  0 0 0 0.55 0'/>
                          </filter>
                          <rect width='100%' height='100%' filter='url(#n)'/>
                        </svg>`
                    )}")`,
                    backgroundRepeat: "repeat",
                    backgroundSize: "160px 160px",
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.07),transparent_55%)]"
            />

            <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    animate={sectionInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="mx-auto max-w-2xl text-center"
                >
                    <p className="text-xs uppercase tracking-[0.22em] text-violet-300/70">
                        Stack
                    </p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                        Skills wheel
                    </h2>
                    <p className="mt-3 text-sm text-white/50 sm:text-base">
                        Explore the categories that shape how I build. Pick one
                        to see the tools and focus behind it.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={sectionInView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                        duration: 0.55,
                        delay: 0.08,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="mt-8 grid grid-cols-1 items-center gap-8 sm:mt-10 sm:gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-10"
                >
                    <div className="flex justify-center lg:col-span-6">
                        <RadialWheel
                            mode={menu.mode}
                            confirmedIndex={menu.confirmedIndex}
                            highlightedIndex={menu.highlightedIndex}
                            previewIndex={menu.previewIndex}
                            reducedMotion={reducedMotion}
                            wheelRef={wheelRef}
                            onPointerDown={menu.onPointerDown}
                            onPointerMove={menu.onPointerMove}
                            onPointerUp={menu.onPointerUp}
                            onPointerCancel={menu.onPointerCancel}
                            onPointerLeave={menu.onPointerLeave}
                        />
                    </div>

                    <div className="lg:col-span-6">
                        {previewCategory && (
                            <div
                                className={
                                    reducedMotion
                                        ? undefined
                                        : "stack-float-card"
                                }
                            >
                                <div
                                    className={`rounded-2xl border bg-[#1a1832]/90 p-5 shadow-[0_22px_55px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-md transition-[border-color] duration-300 sm:p-7 ${
                                        menu.isPreview
                                            ? "border-violet-400/40"
                                            : "border-white/10"
                                    }`}
                                >
                                    <SkillDetailsPanel
                                        category={previewCategory}
                                        reducedMotion={reducedMotion}
                                        isPreview={menu.isPreview}
                                        sectorsOpen={menu.sectorsOpen}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default Stack
