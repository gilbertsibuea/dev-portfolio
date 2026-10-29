"use client"

import { motion } from "framer-motion"
import { FaWhatsapp, FaLinkedin } from "react-icons/fa"
import { FiArrowUpRight, FiMail } from "react-icons/fi"
import { SpotifyNowPlaying } from "./SpotifyNowPlaying"

const channels = [
    {
        label: "WhatsApp",
        value: "+62 851 1080 6407",
        href: "https://wa.me/6285110806407?text=Hi%20Gilbert!%20I'm%20interested%20in%20your%20programming%20services.",
        icon: FaWhatsapp,
        accent: "text-emerald-400",
    },
    {
        label: "Email",
        value: "gilbertsibuea8539@gmail.com",
        href: "mailto:gilbertsibuea8539@gmail.com",
        icon: FiMail,
        accent: "text-violet-300",
    },
    {
        label: "LinkedIn",
        value: "Gilbert Sibuea",
        href: "https://www.linkedin.com/in/gilbertsibuea/",
        icon: FaLinkedin,
        accent: "text-sky-400",
    },
]

export const Contact = () => {
    return (
        <section
            id="contact"
            className="relative overflow-hidden bg-[#1F1F1F] text-white py-20 md:py-28 rounded-t-3xl"
        >
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="max-w-3xl"
                >
                   
                    <h2 className="font-bold tracking-tight text-white leading-[0.95] text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
                        Let&apos;s work
                        <span className="block text-white/40">together</span>
                    </h2>
                    <p className="mt-6 max-w-lg text-white/50 text-base md:text-lg leading-relaxed">
                        Open to roles, collabs, or just good conversation
                    </p>
                </motion.div>

                <div className="mt-14 md:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start border-t border-white/10 pt-10 md:pt-12">
                    {/* Left — Spotify */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: 0.08 }}
                        className="lg:col-span-5"
                    >
                        <SpotifyNowPlaying />
                    </motion.div>

                    {/* Right — channels */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: 0.14 }}
                        className="lg:col-span-7"
                    >
                        <ul className="divide-y divide-white/10 border-t border-white/10 lg:border-t-0 lg:-mt-0">
                            {channels.map((channel, index) => {
                                const Icon = channel.icon
                                return (
                                    <motion.li
                                        key={channel.label}
                                        initial={{ opacity: 0, x: -12 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: 0.1 + index * 0.06 }}
                                    >
                                        <a
                                            href={channel.href}
                                            target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
                                            rel={
                                                channel.href.startsWith("mailto:")
                                                    ? undefined
                                                    : "noreferrer"
                                            }
                                            className="group flex items-center gap-4 sm:gap-6 py-5 sm:py-6 transition-colors"
                                        >
                                            <Icon className={`shrink-0 text-2xl ${channel.accent}`} />

                                            <span className="min-w-0 flex-1 text-left">
                                                <span className="block text-[10px] uppercase tracking-[0.18em] text-white/35 mb-1">
                                                    {channel.label}
                                                </span>
                                                <span className="block text-lg sm:text-xl font-semibold text-white/85 group-hover:text-white transition-colors truncate">
                                                    {channel.value}
                                                </span>
                                            </span>

                                            <FiArrowUpRight className="shrink-0 text-xl text-white/25 group-hover:text-violet-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                        </a>
                                    </motion.li>
                                )
                            })}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
