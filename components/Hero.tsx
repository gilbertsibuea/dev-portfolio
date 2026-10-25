"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FiArrowRight, FiMail, FiRefreshCw } from "react-icons/fi"
import { usePreloader } from "./PreloaderContext"

type FloatingDraggableTextProps = {
    text: string
    className?: string
    letterClassName?: string
    resetKey?: number
    onLetterMoved?: () => void
}

/** Each letter floats gently and can be dragged. Words stay intact (no mid-word wrap). */
function FloatingDraggableText({
    text,
    className = "",
    letterClassName = "",
    resetKey = 0,
    onLetterMoved,
}: FloatingDraggableTextProps) {
    const words = text.split(" ")
    let letterIndex = 0

    return (
        <motion.h1
            variants={{
                hidden: { opacity: 0, y: 48, scale: 0.94 },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                        duration: 0.8,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    },
                },
            }}
            className={`flex flex-wrap justify-center items-baseline gap-x-[0.28em] gap-y-1 ${className}`}
            aria-label={text}
        >
            {words.map((word, wordIndex) => (
                <span
                    key={`${word}-${wordIndex}-${resetKey}`}
                    className="inline-flex whitespace-nowrap items-baseline"
                >
                    {word.split("").map((char) => {
                        const index = letterIndex++
                        // Soft, slow drift — mostly vertical, tiny horizontal
                        const floatDuration = 5.5 + (index % 4) * 0.6
                        const floatDelay = (index % 6) * 0.2

                        return (
                            <motion.span
                                key={`${word}-${index}-${char}-${resetKey}`}
                                drag
                                dragMomentum={false}
                                dragElastic={0.12}
                                onDragStart={() => onLetterMoved?.()}
                                whileDrag={{
                                    scale: 1.15,
                                    zIndex: 60,
                                    cursor: "grabbing",
                                    filter: "drop-shadow(0 0 10px rgba(172, 158, 227, 0.5))",
                                }}
                                whileHover={{ scale: 1.05 }}
                                className="relative inline-block cursor-grab active:cursor-grabbing touch-none select-none leading-none"
                                style={{ zIndex: 10 }}
                            >
                                <motion.span
                                    className={`inline-block will-change-transform ${letterClassName}`}
                                    animate={{
                                        y: [0, -3, -1.5, -3.5, 0],
                                        x: [0, 0.8, 0, -0.8, 0],
                                        rotate: [0, 0.4, 0, -0.4, 0],
                                    }}
                                    transition={{
                                        duration: floatDuration,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: floatDelay,
                                    }}
                                >
                                    {char}
                                </motion.span>
                            </motion.span>
                        )
                    })}
                </span>
            ))}
        </motion.h1>
    )
}

export const Hero = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { isComplete: isPreloaderComplete } = usePreloader()
    const [lettersMoved, setLettersMoved] = useState(false)
    const [resetKey, setResetKey] = useState(0)

    const handleLetterMoved = () => {
        if (!lettersMoved) setLettersMoved(true)
    }

    const handleResetLetters = () => {
        setResetKey((key) => key + 1)
        setLettersMoved(false)
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        // Fewer particles on mobile to reduce CPU load
        const isMobile = window.innerWidth < 768
        const particleCount = isMobile ? 20 : 50

        const particles: Array<{
            x: number
            y: number
            vx: number
            vy: number
            alpha: number
        }> = []

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                alpha: Math.random() * 0.5 + 0.2
            })
        }

        let rafId: number

        // Animation loop — skips frames when tab is hidden
        const animate = () => {
            if (document.hidden) {
                rafId = requestAnimationFrame(animate)
                return
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.forEach((particle, i) => {
                particle.x += particle.vx
                particle.y += particle.vy

                if (particle.x < 0) particle.x = canvas.width
                if (particle.x > canvas.width) particle.x = 0
                if (particle.y < 0) particle.y = canvas.height
                if (particle.y > canvas.height) particle.y = 0

                ctx.beginPath()
                ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(172, 158, 227, ${particle.alpha})`
                ctx.fill()

                // Connection distance is shorter on mobile (fewer checks)
                const connectionDist = isMobile ? 70 : 100
                particles.slice(i + 1).forEach(other => {
                    const dx = particle.x - other.x
                    const dy = particle.y - other.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < connectionDist) {
                        ctx.beginPath()
                        ctx.moveTo(particle.x, particle.y)
                        ctx.lineTo(other.x, other.y)
                        ctx.strokeStyle = `rgba(172, 158, 227, ${0.1 * (1 - distance / connectionDist)})`
                        ctx.stroke()
                    }
                })
            })

            rafId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            cancelAnimationFrame(rafId)
        }
    }, [])

    const scrollToContact = () => {
        const contactSection = document.querySelector('#contact')
        contactSection?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
    }

    const easeOut: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

    // Staggered entrance — starts only after preloader zoom finishes
    const containerVariants = {
        hidden: { opacity: 0, scale: 1.06 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.55,
                ease: easeOut,
                staggerChildren: 0.18,
                delayChildren: 0.05,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 36 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: easeOut,
            },
        },
    }

    const socialContainerVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: easeOut,
                staggerChildren: 0.08,
                delayChildren: 0.2,
            },
        },
    }

    const socialItemVariants = {
        hidden: { opacity: 0, y: 16, scale: 0.8 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: easeOut,
            },
        },
    }

    return(
        <section id="hero" className="relative grid min-h-screen place-content-center overflow-visible px-4 py-24 text-gray-200">
            {/* Lightweight canvas background */}
            <canvas 
                ref={canvasRef}
                className="absolute inset-0 w-full h-full -z-10"
                style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)' }}
            />
            
            {/* Simplified overlay */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="pointer-events-none absolute inset-0 w-full h-full -z-5 bg-black/10" 
            />
            
            <motion.div 
                className="z-10 flex w-full max-w-4xl flex-col items-center text-center"
                variants={containerVariants}
                initial="hidden"
                animate={isPreloaderComplete ? "visible" : "hidden"}
            >
                <div className="relative w-full flex flex-col items-center">
                    <div className="h-10 mb-2 flex items-center justify-center">
                        <AnimatePresence>
                            {lettersMoved && (
                                <motion.button
                                    type="button"
                                    onClick={handleResetLetters}
                                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 4, scale: 0.9 }}
                                    transition={{ duration: 0.25 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.96 }}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-gray-200 backdrop-blur-md shadow-lg hover:bg-white/15 hover:border-white/30 transition-colors"
                                    aria-label="Reset letter positions"
                                >
                                    <FiRefreshCw className="text-base" />
                                    Reset
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    <FloatingDraggableText
                        text="Hi, I am"
                        resetKey={resetKey}
                        onLetterMoved={handleLetterMoved}
                        className="text-5xl sm:text-6xl md:text-7xl font-black text-center"
                        letterClassName="text-white/40"
                    />

                    <FloatingDraggableText
                        text="Gilbert Hasiholan Sibuea"
                        resetKey={resetKey}
                        onLetterMoved={handleLetterMoved}
                        className="w-full max-w-3xl font-black leading-tight text-5xl sm:text-6xl md:text-7xl text-center"
                        letterClassName="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent"
                    />
                </div>

                <motion.p 
                    variants={itemVariants}
                    className="my-6 max-w-xl text-center"
                > 
                    Fullstack Developer based in Bandung with over 2 years of experience, 
                    specializing in building end-to-end web applications.
                </motion.p>

                <motion.div 
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 items-center"
                >
                    <motion.button
                        onClick={() => window.open('https://www.canva.com/design/DAGhsbBQGPo/Cq0wE9ktnUkrnOQnH4F9KA/view?utm_content=DAGhsbBQGPo&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h6f3875e230', '_blank')}
                        whileHover={{ 
                            scale: 1.05,
                            boxShadow: "0 10px 25px rgba(255,255,255,0.1)"
                        }}
                        whileTap={{ scale: 0.985 }}
                        className="flex w-fit items-center gap-2 rounded-full px-4 py-2 border border-gray-300 shadow-md transition-all duration-200"
                    >
                        Download CV
                        <motion.div
                            whileHover={{ x: 4 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <FiArrowRight className="ml-1"/>   
                        </motion.div>
                    </motion.button>

                    <motion.button
                        onClick={scrollToContact}
                        whileHover={{ 
                            scale: 1.05,
                            boxShadow: "0 10px 25px rgba(255,255,255,0.1)"
                        }}
                        whileTap={{ scale: 0.985 }}
                        className="flex w-fit items-center gap-2 rounded-full px-4 py-2 border border-gray-300 shadow-md transition-all duration-200"
                    >
                        Contact Me!
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut"
                            }}
                        >
                            <FiMail className="ml-1"/>   
                        </motion.div>
                    </motion.button>
                </motion.div>

                {/* Social Links Container */}
                <motion.div
                    variants={socialContainerVariants}
                    whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.2 }
                    }}
                    className="mt-12 md:mt-16 flex flex-col items-center w-full group"
                >
                    <motion.div
                        className="relative rounded-2xl px-6 py-4 shadow-2xl flex flex-col items-center w-full max-w-xl border border-white/10 overflow-hidden"
                        style={{
                            background: "rgba(20, 30, 40, 0.65)",
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                        }}
                        whileHover={{
                            borderColor: "rgba(255,255,255,0.2)",
                            transition: { duration: 0.3 }
                        }}
                    >
                        {/* Shine effect */}
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.12)_50%,transparent_75%)] bg-[length:250%_250%] group-hover:bg-[position:100%_100%] transition-[background-position] duration-500 z-10" />
                        
                        <motion.span 
                            variants={itemVariants}
                            className="mb-3 text-gray-300 font-semibold tracking-wide text-sm relative z-40"
                        >
                            Find me on
                        </motion.span>
                        
                        <motion.ul 
                            className="flex gap-5 flex-wrap justify-center relative z-40"
                            variants={socialContainerVariants}
                        >
                            {[
                                {
                                    href: "https://github.com/gilbertsibuea",
                                    label: "GitHub",
                                    color: "#13FFAA",
                                    icon: "M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0 1 38.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z",
                                    rotate: -8,
                                    viewBox: "0 0 1024 1024"
                                },
                                {
                                    href: "https://www.linkedin.com/in/gilberthasiholan/",
                                    label: "LinkedIn",
                                    color: "#1E67C6",
                                    icon: "M100.28 448H7.4V148.6h92.88zm-46.44-339.2c-29.9 0-54.1-24.2-54.1-54.1S24.94 0 54.84 0c29.9 0 54.1 24.2 54.1 54.1s-24.2 54.1-54.1 54.1zM447.6 448h-92.8V302c0-34.5-.7-78.8-47.9-78.8-47.9 0-55 .7-55 .7v224h-92.8V148.6h89v40h1c12.4-23.5 42.7-48 87.8-48 94 0 111 .6 111 .6v91z",
                                    rotate: 8,
                                    viewBox: "0 0 448 512"
                                },
                                {
                                    href: "https://instagram.com/gilberths__",
                                    label: "Instagram",
                                    color: "#CE84CF",
                                    icon: "M512 378.7c-73.4 0-133.3 59.9-133.3 133.3S438.6 645.3 512 645.3 645.3 585.4 645.3 512 585.4 378.7 512 378.7zM911.8 512c0-55.2.5-109.9-2.6-165-3.1-64-17.7-120.8-64.5-167.6-46.9-46.9-103.6-61.4-167.6-64.5-55.2-3.1-109.9-2.6-165-2.6-55.2 0-109.9-.5-165 2.6-64 3.1-120.8 17.7-167.6 64.5C132.6 226.3 118.1 283 115 347c-3.1 55.2-2.6 109.9-2.6 165s-.5 109.9 2.6 165c3.1 64 17.7 120.8 64.5 167.6 46.9 46.9 103.6 61.4 167.6 64.5 55.2 3.1 109.9 2.6 165 2.6 55.2 0 109.9.5 165-2.6 64-3.1 120.8-17.7 167.6-64.5 46.9-46.9 61.4-103.6 64.5-167.6 3.2-55.1 2.6-109.8 2.6-165zM512 717.1c-113.5 0-205.1-91.6-205.1-205.1S398.5 306.9 512 306.9 717.1 398.5 717.1 512 625.5 717.1 512 717.1zm213.5-370.7c-26.5 0-47.9-21.4-47.9-47.9s21.4-47.9 47.9-47.9 47.9 21.4 47.9 47.9a47.84 47.84 0 0 1-47.9 47.9z",
                                    rotate: -8,
                                    viewBox: "0 0 1024 1024"
                                },
                                {
                                    href: "https://telegram.org",
                                    label: "Telegram",
                                    color: "#DD335C",
                                    icon: "M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z",
                                    rotate: 8,
                                    viewBox: "0 0 448 512"
                                }
                            ].map((social) => (
                                <motion.li
                                    key={social.label}
                                    variants={socialItemVariants}
                                >
                                    <motion.a
                                        href={social.href}
                                        aria-label={social.label}
                                        className="text-gray-200 flex items-center justify-center w-10 h-10 rounded-full transition-colors bg-white/5 hover:bg-white/10"
                                        style={{ color: 'rgb(229, 231, 235)' }}
                                        whileHover={{ 
                                            scale: 1.2, 
                                            rotate: social.rotate,
                                            color: social.color,
                                            transition: { duration: 0.2 }
                                        }}
                                        whileTap={{ scale: 0.9 }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <svg
                                            stroke="currentColor"
                                            fill="currentColor"
                                            strokeWidth="0"
                                            viewBox={social.viewBox}
                                            height="28"
                                            width="28"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d={social.icon} />
                                        </svg>
                                    </motion.a>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    )
}