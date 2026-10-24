"use client"

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
    FaBolt, 
    FaRocket, 
    FaTools, 
    FaGem, 
    FaGithub
} from "react-icons/fa";
import GitHubContributions from "./GitHubContributions";
// import WakatimeTracker from "./WakatimeTracker";

const metrics = [
    { 
        id: 1, 
        value: '2+', 
        label: 'Years of Experience', 
        description: 'Dedicated to mastering skill in full-stack development.',
        icon: FaBolt,
    },
    { 
        id: 2, 
        value: '20+', 
        label: 'Projects Completed', 
        description: 'From small application to complex web platforms.',
        icon: FaRocket,
    },
    { 
        id: 3, 
        value: '5+', 
        label: 'Technologies Mastered', 
        description: 'Proficient in various programming languages and frameworks.',
        icon: FaTools,
    },
    { 
        id: 4, 
        value: '99%', 
        label: 'Code Quality', 
        description: 'Ensuring clean and maintainable code.',
        icon: FaGem,
    },
    { 
        id: 5, 
        value: '300+', 
        label: 'Commits on Github', 
        description: 'Active in contributing to open-source and personal projects.',
        icon: FaGithub,
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.18,
            delayChildren: 0.2,
        }
    }
};

const metricVariants = {
    hidden: { opacity: 0, y: 80, scale: 0.8, rotate: -10 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        rotate: 0,
        transition: {
            type: "spring" as const,
            stiffness: 120,
            damping: 14
        }
    }
};

export const KeyMetrics = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.section
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={containerVariants}
            className="glass px-4 py-32 text-white bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-slate-900/50 backdrop-blur-sm relative overflow-hidden rounded-3xl"
            id="about"
        >
            <div className="container mx-auto">
            <motion.h2
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 100 }}
                className="text-6xl font-bold mb-4"
            >
                Developer Stats
            </motion.h2>
            
            <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.7, type: "spring", stiffness: 80 }}
                className="text-gray-400 mb-12 text-lg"
            >
                A quick glance at my journey and achievements as a developer.
            </motion.p>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12"
                variants={containerVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
            >
                {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                    <motion.div
                    key={metric.id}
                    variants={metricVariants}
                    whileHover={{ scale: 1.08, boxShadow: "0 12px 32px 0 rgba(80,80,120,0.18)", rotate: 2 }}
                    whileTap={{ scale: 0.97, rotate: -2 }}
                    className="bg-white/5 rounded-xl border border-white/10 p-8 shadow-lg backdrop-blur-md"
                    >
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={inView ? { scale: 1, opacity: 1 } : {}}
                        transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
                        className="flex justify-center mb-4"
                    >
                        <Icon className="text-4xl text-violet-300 drop-shadow-lg" />
                    </motion.div>
                    <h3 className="text-3xl font-bold mb-2 text-center text-white">
                        {metric.value}
                    </h3>
                    <p className="text-lg font-semibold mb-2 text-center text-white">
                        {metric.label}
                    </p>
                    <p className="text-sm text-gray-200 text-center">
                        {metric.description}
                    </p>
                    </motion.div>
                );
                })}
            </motion.div>

            {/* GitHub Contributions Section */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7, duration: 0.8, type: "spring", stiffness: 80 }}
            >
                <GitHubContributions username="gilbertsibuea" />
            </motion.div>
            {/* <WakatimeTracker /> */}
            </div>
        </motion.section>
    );
};