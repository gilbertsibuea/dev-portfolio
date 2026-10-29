"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { FaLinkedin } from "react-icons/fa"
import { FiArrowUpRight, FiMapPin } from "react-icons/fi"
import GitHubContributions from "./GitHubContributions"

const LINKEDIN_URL =
    "https://www.linkedin.com/in/gilbertsibuea/"

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
            className="relative z-10 -mt-4 overflow-hidden rounded-t-3xl bg-[#0f0e1a] text-white px-4 py-16 sm:-mt-6 md:-mt-8 md:pb-8 md:pt-24"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(139,92,246,0.12),transparent_50%)]" />

            <div className="relative z-10 max-w-6xl mx-auto">
                <motion.div
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    variants={stagger}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start"
                >
                    {/* Portrait */}
                    <motion.div variants={fadeUp} className="lg:col-span-5">
                        <div className="relative aspect-[3/4] w-full max-w-md mx-auto overflow-hidden bg-[#0f0e1a] lg:mx-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/gilbert-a.webp?v=2"
                                alt="Gilbert Hasiholan Sibuea"
                                className="absolute inset-0 h-full w-full object-cover object-[center_18%]"
                                draggable={false}
                            />
                            {/* Soft edge blend only — keep subject bright */}
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_32%,transparent_55%,#0f0e1a_92%)]"
                            />
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0f0e1a] via-[#0f0e1a]/70 to-transparent"
                            />
                        </div>
                        <p className="mt-3 flex items-center gap-2 text-sm text-white/40 font-mono">
                            <FiMapPin className="text-violet-300/80" />
                            Bandung, Indonesia
                        </p>
                    </motion.div>

                    {/* Copy */}
                    <motion.div variants={fadeUp} className="lg:col-span-7 lg:pt-2">
                      
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

                        <a
                            href={LINKEDIN_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group mt-7 inline-flex items-center gap-3 border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white/85 transition-[border-color,background-color,color] duration-200 hover:border-[#0A66C2]/55 hover:bg-[#0A66C2]/10 hover:text-white"
                        >
                            <FaLinkedin className="text-lg text-[#0A66C2] transition-transform duration-200 group-hover:scale-110" />
                            <span className="font-medium tracking-wide">
                                LinkedIn
                            </span>
                        </a>

                        {/* Fact strip — not cards */}
                        <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm border-t border-white/10 pt-6">
                            <div>
                                <dt className="text-white/35 font-mono text-xs uppercase tracking-wider">
                                    Focus
                                </dt>
                                <dd className="mt-1 text-white/85">Software Engineering</dd>
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
