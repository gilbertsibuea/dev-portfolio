"use client"

import { motion } from "framer-motion"
import { FaWhatsapp, FaLinkedin } from "react-icons/fa"
import { FiArrowUpRight, FiMail } from "react-icons/fi"

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
        href: "https://www.linkedin.com/in/gilbert-sibuea-93b524246/",
        icon: FaLinkedin,
        accent: "text-sky-400",
    },
]

export const Contact = () => {
    return (
        <section
            id="contact"
            className="relative overflow-hidden bg-[#14122a] text-white py-20 md:py-28 rounded-t-3xl"
        >
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="max-w-3xl"
                >
                    <p className="text-xs uppercase tracking-[0.22em] text-violet-300/70 mb-5">
                        Contact
                    </p>
                    <h2 className="font-bold tracking-tight text-white leading-[0.95] text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
                        Let&apos;s work
                        <span className="block text-white/40">together</span>
                    </h2>
                    <p className="mt-6 max-w-lg text-white/50 text-base md:text-lg leading-relaxed">
                        Open to freelance projects and full-time roles. If you have something
                        interesting in mind — say hello.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: 0.12 }}
                    className="mt-14 md:mt-20 border-t border-white/10"
                >
                    <ul className="divide-y divide-white/10">
                        {channels.map((channel, index) => {
                            const Icon = channel.icon
                            return (
                                <motion.li
                                    key={channel.label}
                                    initial={{ opacity: 0, x: -12 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: 0.08 + index * 0.06 }}
                                >
                                    <a
                                        href={channel.href}
                                        target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
                                        rel={channel.href.startsWith("mailto:") ? undefined : "noreferrer"}
                                        className="group flex items-center gap-4 sm:gap-6 py-6 sm:py-7 transition-colors"
                                    >
                                        <span
                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] ${channel.accent} group-hover:border-white/25 transition-colors`}
                                        >
                                            <Icon className="text-xl" />
                                        </span>

                                        <span className="min-w-0 flex-1 text-left">
                                            <span className="block text-[10px] uppercase tracking-[0.18em] text-white/35 mb-1">
                                                {channel.label}
                                            </span>
                                            <span className="block text-lg sm:text-xl md:text-2xl font-semibold text-white/85 group-hover:text-white transition-colors truncate">
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
        </section>
    )
}
