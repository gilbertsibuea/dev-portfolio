"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { FaReact, FaLaravel, FaPython, FaJava, FaPhp, FaDocker, FaGitAlt } from "react-icons/fa"
import { FaFlutter } from "react-icons/fa6"
import { SiJavascript, SiTypescript, SiMysql, SiTailwindcss, SiSqlite, SiExpress } from "react-icons/si"
import { TbBrandNextjs } from "react-icons/tb"
import { motion, useInView } from "framer-motion"

const stackItems = [
    { id: 1, name: "React", icon: FaReact, color: "#61DAFB" },
    { id: 2, name: "Laravel", icon: FaLaravel, color: "#FF2D20" },
    { id: 3, name: "Javascript", icon: SiJavascript, color: "#F7DF1E" },
    { id: 4, name: "Typescript", icon: SiTypescript, color: "#3178C6" },
    { id: 5, name: "MySQL", icon: SiMysql, color: "#4479A1" },
    { id: 6, name: "Next.js", icon: TbBrandNextjs, color: "#000000" },
    { id: 7, name: "Python", icon: FaPython, color: "#3776AB" },
    { id: 8, name: "Flutter", icon: FaFlutter, color: "#02569B" },
    { id: 9, name: "Java", icon: FaJava, color: "#FF0000" },
    { id: 10, name: "PHP", icon: FaPhp, color: "#777BB4" },
    { id: 11, name: "Docker", icon: FaDocker, color: "#2496ED" },
    { id: 12, name: "Tailwind", icon: SiTailwindcss, color: "#38BDF8" },
    { id: 13, name: "Git", icon: FaGitAlt, color: "#F05032" },
    { id: 14, name: "SQLite", icon: SiSqlite, color: "#003B57" },
    { id: 15, name: "Express", icon: SiExpress, color: "#000000" },
]

export const Stack = () => {
    const [hoveredIcon, setHoveredIcon] = useState<number | null>(null)
    const [isClient, setIsClient] = useState(false)
    const sectionRef = useRef<HTMLElement>(null)
    const sectionInView = useInView(sectionRef, { once: true, amount: 0.2, margin: "-80px 0px" })

    useEffect(() => {
        setIsClient(true)
    }, [])

    const backgroundParticles = useMemo(() => {
        if (!isClient) return []
        return Array.from({ length: 20 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2,
        }))
    }, [isClient])

    return (
        <section
            ref={sectionRef}
            className="glass relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-slate-900/50 py-16 backdrop-blur-sm"
            id="stack"
        >
            {isClient && sectionInView && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {backgroundParticles.map((particle) => (
                        <motion.div
                            key={particle.id}
                            className="absolute h-1 w-1 rounded-full bg-violet-400/30"
                            animate={{
                                x: [0, 100, 0],
                                y: [0, -100, 0],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: particle.duration,
                                repeat: Infinity,
                                delay: particle.delay,
                            }}
                            style={{
                                left: particle.left,
                                top: particle.top,
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center">
                <motion.h2
                    className="mb-10 text-3xl font-bold tracking-tight text-gray-200 sm:text-5xl"
                    initial={{ opacity: 0, y: 28 }}
                    animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
                    transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    My Tech Stack
                </motion.h2>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {stackItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 36 }}
                            animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
                            transition={{
                                delay: sectionInView ? 0.15 + index * 0.05 : 0,
                                duration: 0.4,
                                ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                            onHoverStart={() => setHoveredIcon(item.id)}
                            onHoverEnd={() => setHoveredIcon(null)}
                            className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-transparent bg-white/5 p-2 transition-all duration-300 hover:border-violet-500/50 hover:bg-white/15 sm:p-8"
                        >
                            <motion.div
                                className="absolute inset-0 rounded-xl opacity-0"
                                animate={{
                                    opacity: hoveredIcon === item.id ? 0.3 : 0,
                                    background: `radial-gradient(circle, ${item.color}40, transparent)`,
                                }}
                                transition={{ duration: 0.3 }}
                            />

                            <motion.div
                                className="relative z-10 mb-1 rounded-xl p-1 sm:mb-2 sm:p-2"
                                animate={hoveredIcon === item.id ? { scale: 1.06 } : { scale: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                {React.createElement(item.icon, {
                                    className:
                                        "h-8 w-8 transition-colors duration-200 sm:h-16 sm:w-16",
                                    style: { color: item.color },
                                })}
                            </motion.div>
                            <p className="relative z-10 text-center text-xs font-medium text-gray-400 transition-colors sm:text-sm">
                                {item.name}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
