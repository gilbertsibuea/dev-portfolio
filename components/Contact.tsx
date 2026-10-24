"use client"

import {motion} from "framer-motion"
import { FaWhatsapp, FaLinkedin } from "react-icons/fa"
import { MdEmail } from "react-icons/md"

export const Contact = () => {
    return(
        <section id="contact" className="overflow-x-clip py-32 text-white rounded-t-3xl">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    transition={{duration: 0.8}}
                    whileInView={{opacity: 1, y: 0}}
                    className="flex flex-col items-center justify-center text-center space-y-12"
                    viewport={{once: true}}
                >
                    <motion.h2
                        initial={{opacity: 0, x:-20}}
                        transition={{duration: 0.6, delay: 0.2}}
                        whileInView={{opacity: 1,x:0}}
                        className="text-5xl sm:text-7xl font-bold text-gray-300"
                    >
                        Get in <span className="text-gray-500">touch</span>
                    </motion.h2>
                    
                    <motion.div
                        initial={{opacity: 0, y:20}}
                        transition={{duration: 0.6, delay: 0.4}}
                        whileInView={{opacity: 1,y:0}}
                        className="glass p-8 sm:p-12 rounded-2xl space-y-8 sm:space-y-10 max-w-2xl w-full"
                    >
                        <div className="space-y-3">
                            <p className="text-lg text-gray-300">Phone</p>
                            <a href="https://wa.me/6285110806407?text=Hi Gilbert!, I'm%20interested%20in%20your%20programming%20service%20" 
                               target="_blank" 
                               className="text-xl sm:text-2xl font-semibold hover:text-gray-400 transition duration-300 flex items-center justify-center gap-3"
                            >
                                <FaWhatsapp className="text-green-400 text-2xl sm:text-3xl" />
                                +62 851 1080 6407
                            </a>
                        </div>
                        
                        <div className="space-y-3">
                            <p className="text-lg text-gray-300">Email</p>
                            <a href="mailto:devgilberths@gmail.com" 
                               className="text-xl sm:text-2xl font-semibold hover:text-gray-400 transition duration-300 flex items-center justify-center gap-3"
                            >
                                <MdEmail className="text-red-400 text-2xl sm:text-xl" />
                                gilbertsibuea8539@gmail.com
                            </a>
                        </div>
                        
                        <div className="space-y-3">
                            <p className="text-lg text-gray-300">LinkedIn</p>
                            <a href="https://www.linkedin.com/in/gilbert-sibuea-93b524246/" 
                               target="_blank"
                               className="text-xl sm:text-2xl font-semibold hover:text-gray-400 transition duration-300 flex items-center justify-center gap-3"
                            >
                                <FaLinkedin className="text-blue-400 text-2xl sm:text-3xl" />
                                Gilbert Sibuea
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}