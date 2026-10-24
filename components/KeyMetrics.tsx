"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { FiArrowUpRight, FiMapPin } from "react-icons/fi"
import GitHubContributions from "./GitHubContributions"

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
}

const stagger = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.1, delayChildren: 0.08 },
    },
}

export const KeyMetrics = () => {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: "-80px" })

    return (
        <section
            ref={ref}
            id="about"
            className="relative overflow-hidden bg-[#1a1838] text-white px-4 py-16 md:py-24"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(139,92,246,0.12),transparent_50%)]" />

            <div className="relative z-10 max-w-6xl mx-auto">
                <motion.div
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    variants={stagger}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start"
                >
                    {/* Portrait */}
                    <motion.div variants={fadeUp} className="lg:col-span-5">
                        <div className="relative aspect-[3/4] w-full max-w-md mx-auto lg:mx-0 overflow-hidden ">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/gilbert-a.webp?v=2"
                                alt="Gilbert Hasiholan Sibuea"
                                className="absolute inset-0 h-full w-full object-cover object-[center_18%]"
                                draggable={false}
                            />
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#1a1838] via-[#1a1838]/80 to-transparent"
                            />
                        </div>
                        <p className="mt-3 flex items-center gap-2 text-sm text-white/40 font-mono">
                            <FiMapPin className="text-violet-300/80" />
                            Bandung, Indonesia
                        </p>
                    </motion.div>

                    {/* Copy */}
                    <motion.div variants={fadeUp} className="lg:col-span-7 lg:pt-2">
                        <p className="text-xs uppercase tracking-[0.22em] text-violet-300/70 mb-4">
                            About
                        </p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.15]">
                            Hey, I&apos;m Gilbert.
                            <span className="block text-white/45 font-semibold mt-2 text-xl sm:text-2xl md:text-3xl">
                                I like turning ideas into things people can actually use.
                            </span>
                        </h2>

                        <div className="mt-8 space-y-4 text-white/65 leading-relaxed text-base md:text-lg max-w-xl">
                            <p>
                                I work across the frontend and backend, from making interfaces
                                look right to figuring out why an API suddenly decides not to
                                cooperate. I enjoy building useful stuff, solving problems, and
                                occasionally spending way too much time fixing something that was
                                supposed to take five minutes.
                            </p>
                            <p>
                                When I&apos;m not working on client projects, I&apos;m usually
                                building little side projects, experimenting with new tech, or
                                adding random things to this website just because I can.
                            </p>
                            <p>
                                I&apos;m currently open to freelance projects and full-time
                                opportunities. If you have something interesting in mind,
                                let&apos;s talk.
                            </p>
                        </div>

                        {/* Fact strip — not cards */}
                        <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm border-t border-white/10 pt-6">
                            <div>
                                <dt className="text-white/35 font-mono text-xs uppercase tracking-wider">
                                    Focus
                                </dt>
                                <dd className="mt-1 text-white/85">Fullstack Developing</dd>
                            </div>
                           
                            <div>
                                <dt className="text-white/35 font-mono text-xs uppercase tracking-wider">
                                    Experience
                                </dt>
                                <dd className="mt-1 text-white/85">2+ years</dd>
                            </div>
                        </dl>

                        <div className="mt-8 flex flex-wrap items-center gap-5">
                            <Link
                                href="#contact"
                                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                            >
                                <span className="font-medium border-b border-white/25 group-hover:border-white/60 pb-0.5">
                                    Get in touch
                                </span>
                                <FiArrowUpRight className="text-lg transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                          
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.35, duration: 0.55 }}
                    className="mt-16 md:mt-20"
                >
                    <GitHubContributions username="gilbertsibuea" />
                </motion.div>
            </div>
        </section>
    )
}
