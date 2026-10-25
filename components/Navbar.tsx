'use client'

import Link from "next/link"
import React, { useState, useRef, useEffect } from "react"
import {AiOutlineMenu, AiOutlineClose} from "react-icons/ai"
import { AiOutlineHome } from "react-icons/ai"

const navLinks = [
    { title: "Stack", path: "#stack" },
    { title: "Experience", path: "#experience" },
    { title: "Portfolio", path: "#portfolio" },
    { title: "About", path: "#about" },
    { title: "Contact", path: "#contact" },
]

export const Navbar = () => {
    const [nav, setNav] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const toggleNav = () => setNav(!nav)
    const closeNav = () => setNav(false)

    // Close mobile menu when clicking outside
    useEffect(() => {
        if (!nav) return
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                closeNav()
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [nav])

    // Only allow scrolling to valid hash links
    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault()
        if (!/^#[\w-]+$/.test(path)) return // Only allow hash links like #about
        const element = document.querySelector(path)
        closeNav()
        element?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        })
    }

    return(
       <div className="z-50 fixed flex justify-center w-full text-white font-medium">

            {/* Desktop Navbar with Glassmorphism */}
            <div className="border border-white/20 mt-6 backdrop-blur-xl bg-white/10 rounded-[32px] 
                            shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] 
                            hidden md:flex items-center justify-center px-8 py-4 w-auto mx-auto
                            hover:bg-white/15 hover:shadow-[0_12px_40px_0_rgba(255,255,255,0.15)]
                            transition-all duration-300 ease-in-out">
                <ul className="flex flex-row space-x-8">
                    {navLinks.map((link, index) => (    
                        <li key={index}>
                             <Link 
                                href={link.path} 
                                onClick={(e) => handleScroll(e, link.path)}
                                className="px-6 py-3 rounded-xl text-base 
                                         hover:bg-white/20 hover:text-white hover:shadow-[0_4px_20px_0_rgba(255,255,255,0.2)]
                                         transition-all duration-300 ease-in-out
                                         active:scale-95 whitespace-nowrap"
                            >
                                {link.title}
                            </Link>     
                        </li>
                    ))}
                </ul>
            </div>

            {/* Mobile Menu Button with Glassmorphism */}
            <div onClick={toggleNav} 
                 className="md:hidden absolute top-6 right-6 
                           backdrop-blur-xl bg-white/10 border border-white/20
                           rounded-xl p-4 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]
                           hover:bg-white/15 hover:shadow-[0_12px_40px_0_rgba(255,255,255,0.15)]
                           transition-all duration-300 ease-in-out
                           active:scale-95 cursor-pointer">
                {nav ? <AiOutlineClose size={26} className="text-white" /> : <AiOutlineMenu size={26} className="text-white"/>}
            </div>

            {/* Mobile Menu Overlay with Enhanced Glassmorphism */}
            <div className={`fixed left-0 top-0 w-full h-full 
                           backdrop-blur-2xl bg-black/40 
                           transform transition-all duration-500 ease-in-out
                           ${nav ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}
                           md:hidden`}>
                
                {/* Mobile Menu Content */}
                <div className="flex items-center justify-center h-full p-6">
                    <div ref={menuRef} className="relative backdrop-blur-xl bg-white/10 border border-white/20
                                   rounded-3xl p-10 mx-4 shadow-[0_16px_60px_0_rgba(255,255,255,0.15)]
                                   w-full max-w-sm">
                        {/* Close Button */}
                        <button
                            onClick={closeNav}
                            className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2 hover:bg-white/30 transition"
                            aria-label="Close menu"
                        >
                            <AiOutlineClose size={28} />
                        </button>
                        <ul className="flex flex-col items-center space-y-8 mt-8">
                            {navLinks.map((link, index) => (    
                                <li key={index} className="w-full">
                                  <Link 
                                        href={link.path} 
                                        onClick={(e) => handleScroll(e, link.path)}
                                        className="text-2xl font-medium px-8 py-4 rounded-2xl
                                                 hover:bg-white/20 hover:shadow-[0_8px_30px_0_rgba(255,255,255,0.2)]
                                                 transition-all duration-300 ease-in-out
                                                 active:scale-95 block text-center w-full"
                                    >
                                        {link.title}
                                    </Link>     
                                </li>
                            ))} 
                        </ul>
                    </div>
                </div>
            </div>

       </div>
    )
}