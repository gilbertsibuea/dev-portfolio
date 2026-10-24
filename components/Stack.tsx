"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FaReact } from 'react-icons/fa';
import { SiJavascript } from 'react-icons/si';
import { SiTypescript } from 'react-icons/si';
import { TbBrandNextjs } from 'react-icons/tb';
import { SiMysql } from "react-icons/si";
import { FaLaravel } from "react-icons/fa";
import { FaPython } from "react-icons/fa";
import { FaFlutter } from "react-icons/fa6";
import { FaJava } from "react-icons/fa";
import { FaPhp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDocker } from "react-icons/fa";
import { SiTailwindcss } from "react-icons/si";
import { FaGitAlt } from "react-icons/fa";
import { SiSqlite } from "react-icons/si";
import { SiExpress } from "react-icons/si";

const stackItems = [
    {id:1,name:"React",icon:FaReact, color: '#61DAFB'},
    {id:2,name:"Laravel",icon:FaLaravel, color: '#FF2D20'},
    {id:3,name:"Javascript",icon:SiJavascript, color: '#F7DF1E'},
    {id:4,name:"Typescript",icon:SiTypescript, color: '#3178C6'},
    {id:5,name:"MySQL",icon:SiMysql, color: '#4479A1'},
    {id:6,name:"Next.js",icon:TbBrandNextjs, color: '#000000'},
    {id:7,name:"Python",icon:FaPython, color: '#3776AB'},
    {id:8,name:"Flutter",icon:FaFlutter, color: '#02569B'},
    {id:9,name:"Java",icon:FaJava, color: '#FF0000'},
    {id:10,name:"PHP",icon:FaPhp, color: '#777BB4'},
    {id:11,name:"Docker",icon:FaDocker, color: '#2496ED'},
    {id:12,name:"Tailwind",icon:SiTailwindcss, color: '#38BDF8'},
    {id:13,name:"Git",icon:FaGitAlt, color: '#F05032'},
    {id:14,name:"SQLite",icon:SiSqlite, color: '#003B57'},
    {id:15,name:"Express",icon:SiExpress, color: '#000000'},
];

interface Bullet {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
    life: number;
}

interface FloatingIcon {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    stackItem: typeof stackItems[0];
    hit: boolean;
    radius: number;
    hitTime?: number;
}


export const Stack = () => {
    const [gameMode, setGameMode] = useState(false);
    const [showIntro, setShowIntro] = useState(false);
    const [introStep, setIntroStep] = useState(0);
    const [score, setScore] = useState(0);
    const [bullets, setBullets] = useState<Bullet[]>([]);
    const [floatingIcons, setFloatingIcons] = useState<FloatingIcon[]>([]);
    const [cannonAngle, setCannonAngle] = useState(0);
    const [gameArea, setGameArea] = useState({ width: 800, height: 600 });
    const [hoveredIcon, setHoveredIcon] = useState<number | null>(null);
    const [gameTime, setGameTime] = useState(0);
    const [totalHits, setTotalHits] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const gameRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | undefined>(undefined);

    // Fix hydration issue by only rendering random particles on client
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Responsive game area sizing
    useEffect(() => {
        const updateGameArea = () => {
            const container = gameRef.current?.parentElement;
            if (container) {
                const containerWidth = container.clientWidth - 32; // Account for padding
                const maxWidth = Math.min(containerWidth, 800);
                const aspectRatio = 0.75; // height/width ratio
                const height = Math.max(maxWidth * aspectRatio, 400);
                
                setGameArea({
                    width: maxWidth,
                    height: height
                });
            }
        };

        updateGameArea();
        window.addEventListener('resize', updateGameArea);
        return () => window.removeEventListener('resize', updateGameArea);
    }, [gameMode]);

    // Memoize background particles to prevent re-generation
    const backgroundParticles = useMemo(() => {
        if (!isClient) return [];
        
        return Array.from({ length: 20 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2
        }));
    }, [isClient]);

    // Generate random position that doesn't overlap with cannon area
    const generateRandomPosition = () => {
        const margin = 30; // Reduced margin for mobile
        const cannonZone = gameArea.width < 600 ? 60 : 100; // Smaller cannon zone on mobile
        
        let x, y;
        do {
            x = Math.random() * (gameArea.width - margin * 2) + margin;
            y = Math.random() * (gameArea.height - margin * 2 - cannonZone) + margin;
        } while (
            x > gameArea.width / 2 - cannonZone && 
            x < gameArea.width / 2 + cannonZone && 
            y > gameArea.height - cannonZone
        );
        
        return { x, y };
    };

    // Create a new floating icon
    const createFloatingIcon = (stackItem: typeof stackItems[0], customPosition?: {x: number, y: number}) => {
        const position = customPosition || generateRandomPosition();
        const isMobile = gameArea.width < 600;
        return {
            id: Date.now() + Math.random(),
            x: position.x,
            y: position.y,
            vx: (Math.random() - 0.5) * (isMobile ? 2 : 3), // Slower movement on mobile
            vy: (Math.random() - 0.5) * (isMobile ? 2 : 3),
            stackItem,
            hit: false,
            radius: isMobile ? 20 : 24 // Smaller icons on mobile
        };
    };

    // Initialize floating icons with multiple instances of each tech
    const initializeGame = useCallback(() => {
        const icons: FloatingIcon[] = [];
        const isMobile = gameArea.width < 600;
        const instances = isMobile ? 1 : 1; // Same number of instances
        
        // Create instances of each tech stack item
        stackItems.forEach(item => {
            for (let i = 0; i < instances; i++) {
                icons.push(createFloatingIcon(item));
            }
        });
        
        setFloatingIcons(icons);
        setScore(0);
        setBullets([]);
        setGameTime(0);
        setTotalHits(0);
    }, [gameArea]);

    // Respawn hit icons after a delay
    const respawnHitIcons = useCallback(() => {
        const currentTime = Date.now();
        const respawnDelay = 2000;
        const isMobile = gameArea.width < 600;
        const maxIcons = isMobile ? 10 : 15; // Fewer icons on mobile for better performance

        setFloatingIcons(prev => {
            const activeIcons = prev.filter(icon => !icon.hit).length;

            return prev.map(icon => {
                if (icon.hit && icon.hitTime && currentTime - icon.hitTime > respawnDelay && activeIcons < maxIcons) {
                    return createFloatingIcon(icon.stackItem);
                }
                return icon;
            });
        });
    }, [gameArea]);

    // Periodically add new random icons to keep the game dynamic
    const addRandomIcons = useCallback(() => {
        const isMobile = gameArea.width < 600;
        const maxIcons = isMobile ? 10 : 15;
        
        if (Math.random() < 0.3) {
            const randomStackItem = stackItems[Math.floor(Math.random() * stackItems.length)];
            const newIcon = createFloatingIcon(randomStackItem);
            
            setFloatingIcons(prev => {
                if (prev.length < maxIcons) {
                    return [...prev, newIcon];
                }
                return prev;
            });
        }
    }, [gameArea]);

    // Collision detection function
    const checkCollision = (bullet: Bullet, icon: FloatingIcon): boolean => {
        if (icon.hit) return false;
        
        const iconSize = gameArea.width < 600 ? 20 : 24; // Responsive icon size
        const dx = bullet.x - (icon.x + iconSize);
        const dy = bullet.y - (icon.y + iconSize);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (icon.radius + 6);
    };

    // Game loop with improved logic
    const gameLoop = useCallback(() => {
        setGameTime(prev => prev + 1);

        // Update bullets
        setBullets(prev => {
            const updatedBullets = prev.map(bullet => {
                const newX = bullet.x + bullet.vx;
                const newY = bullet.y + bullet.vy;
                const newLife = bullet.life - 1;

                if (newX < 0 || newX > gameArea.width || 
                    newY < 0 || newY > gameArea.height || 
                    newLife <= 0) {
                    return null;
                }

                return {
                    ...bullet,
                    x: newX,
                    y: newY,
                    life: newLife
                };
            }).filter(Boolean) as Bullet[];

            return updatedBullets;
        });

        // Update floating icons and check collisions
        setFloatingIcons(prev => {
            const iconSize = gameArea.width < 600 ? 40 : 48; // Responsive icon container size
            
            return prev.map(icon => {
                if (icon.hit) return icon;
                
                const hitByBullet = bullets.some(bullet => checkCollision(bullet, icon));
                
                if (hitByBullet) {
                    setBullets(prevBullets => 
                        prevBullets.filter(bullet => !checkCollision(bullet, icon))
                    );
                    
                    setScore(s => s + 10);
                    setTotalHits(h => h + 1);
                    
                    return { 
                        ...icon, 
                        hit: true, 
                        hitTime: Date.now() 
                    };
                }
                
                const newX = icon.x + icon.vx;
                const newY = icon.y + icon.vy;
                let newVx = icon.vx;
                let newVy = icon.vy;

                if (newX <= 0 || newX >= gameArea.width - iconSize) newVx = -newVx;
                if (newY <= 0 || newY >= gameArea.height - iconSize) newVy = -newVy;

                return {
                    ...icon,
                    x: Math.max(0, Math.min(gameArea.width - iconSize, newX)),
                    y: Math.max(0, Math.min(gameArea.height - iconSize, newY)),
                    vx: newVx,
                    vy: newVy
                };
            });
        });

        if (gameTime % 30 === 0) {
            respawnHitIcons();
        }

        if (gameTime % 180 === 0) {
            addRandomIcons();
        }

        animationRef.current = requestAnimationFrame(gameLoop);
    }, [gameArea, bullets, gameTime, respawnHitIcons, addRandomIcons]);

    // Start/stop game loop
    useEffect(() => {
        if (gameMode) {
            animationRef.current = requestAnimationFrame(gameLoop);
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [gameMode, gameLoop]);

    // Handle intro sequence
    const startIntroSequence = () => {
        setShowIntro(true);
        setIntroStep(0);
        
        setTimeout(() => setIntroStep(1), 1000);
        setTimeout(() => setIntroStep(2), 2500);
        setTimeout(() => setIntroStep(3), 4000);
        setTimeout(() => {
            setShowIntro(false);
            setGameMode(true);
            initializeGame();
        }, 5500);
    };

    // Handle shooting with touch support
    const handleShoot = (e: React.MouseEvent | React.TouchEvent) => {
        if (!gameMode) return;
        
        const rect = gameRef.current?.getBoundingClientRect();
        if (!rect) return;

        let clientX, clientY;
        if ('touches' in e) {
            // Touch event
            if (e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                return;
            }
        } else {
            // Mouse event
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const targetX = clientX - rect.left;
        const targetY = clientY - rect.top;
        const cannonX = gameArea.width / 2;
        const cannonY = gameArea.height - 50;

        const dx = targetX - cannonX;
        const dy = targetY - cannonY;
        const angle = Math.atan2(dy, dx);
        const speed = gameArea.width < 600 ? 8 : 12; // Slower bullets on mobile
        
        setCannonAngle(angle);

        const newBullet: Bullet = {
            id: Date.now() + Math.random(),
            x: cannonX,
            y: cannonY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            speed: speed,
            life: 120
        };

        setBullets(prev => [...prev, newBullet]);
    };

    const activeIconsCount = floatingIcons.filter(icon => !icon.hit).length;
    const isMobile = gameArea.width < 600;

    return (
         <section 
            className='glass py-16 bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-slate-900/50 backdrop-blur-sm relative overflow-hidden rounded-t-2xl' 
            id='stack'
         >
            {/* Fixed background particles - only render on client */}
            {isClient && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {backgroundParticles.map((particle) => (
                        <motion.div
                            key={particle.id}
                            className="absolute w-1 h-1 bg-violet-400/30 rounded-full"
                            animate={{
                                x: [0, 100, 0],
                                y: [0, -100, 0],
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: particle.duration,
                                repeat: Infinity,
                                delay: particle.delay
                            }}
                            style={{
                                left: particle.left,
                                top: particle.top
                            }}
                        />
                    ))}
                </div>
            )}

            <div className='max-w-[1200px] mx-auto px-4 text-center relative z-10'>
                <motion.h2 
                    className={`${isMobile ? 'text-3xl' : 'text-5xl'} text-center text-gray-200 font-bold tracking-tight mb-8`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    My Tech Stack
                    {gameMode && (
                        <span className="text-gray-500 font-medium block sm:inline mt-2 sm:mt-0 sm:ml-3 text-xl sm:text-2xl tabular-nums">
                            {score}
                        </span>
                    )}
                </motion.h2>

                {/* Intro Sequence Overlay */}
                <AnimatePresence>
                    {showIntro && (
                        <motion.div
                            className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="text-center max-w-sm w-full">
                                <AnimatePresence mode="wait">
                                    {introStep === 0 && (
                                        <motion.div
                                            key="step0"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.35 }}
                                        >
                                            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">
                                                Mini game
                                            </p>
                                            <h3 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-white tracking-tight`}>
                                                Shoot the stack
                                            </h3>
                                        </motion.div>
                                    )}
                                    
                                    {introStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.35 }}
                                            className="space-y-3"
                                        >
                                            <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white tracking-tight`}>
                                                What you&apos;re doing
                                            </h3>
                                            <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-400 leading-relaxed`}>
                                                Icons drift around. Hit them with the cannon. They come back after a short pause.
                                            </p>
                                        </motion.div>
                                    )}
                                    
                                    {introStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.35 }}
                                            className="space-y-4"
                                        >
                                            <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white tracking-tight`}>
                                                Controls
                                            </h3>
                                            <ul className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-400 space-y-2 text-left mx-auto w-fit`}>
                                                <li className="flex gap-3">
                                                    <span className="text-gray-600 tabular-nums w-4 shrink-0">1</span>
                                                    <span>{isMobile ? 'Tap to aim and fire' : 'Click to aim and fire'}</span>
                                                </li>
                                                <li className="flex gap-3">
                                                    <span className="text-gray-600 tabular-nums w-4 shrink-0">2</span>
                                                    <span>10 points per hit</span>
                                                </li>
                                            </ul>
                                        </motion.div>
                                    )}
                                    
                                    {introStep === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.35 }}
                                        >
                                            <h3 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-white tracking-tight`}>
                                                Ready
                                            </h3>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!gameMode ? (
                    <>
                        <motion.div 
                            className="mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <p className={`text-gray-400 ${isMobile ? 'text-sm' : 'text-base'}`}>
                                {isMobile ? 'Tap a skill to play.' : 'Click a skill to play.'}
                            </p>
                        </motion.div>

                        {/* Enhanced Stack Display with Game Trigger */}
                        <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                            {stackItems.map((item, index) => (
                                <motion.div 
                                    key={item.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onHoverStart={() => setHoveredIcon(item.id)}
                                    onHoverEnd={() => setHoveredIcon(null)}
                                    onClick={startIntroSequence}
                                    className='flex items-center justify-center flex-col rounded-xl p-2 sm:p-8 cursor-pointer bg-white/5 hover:bg-white/15 relative overflow-hidden border border-transparent hover:border-violet-500/50 transition-all duration-300'
                                >
                                    {/* Hover glow effect */}
                                    <motion.div
                                        className="absolute inset-0 rounded-xl opacity-0"
                                        animate={{
                                            opacity: hoveredIcon === item.id ? 0.3 : 0,
                                            background: `radial-gradient(circle, ${item.color}40, transparent)`
                                        }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    
                                    <motion.div 
                                        className='mb-1 sm:mb-2 p-1 sm:p-2 rounded-xl relative z-10'
                                        animate={hoveredIcon === item.id ? { scale: 1.06 } : { scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {React.createElement(item.icon, {
                                            className: `${isMobile ? 'w-8 h-8' : 'w-12 h-12'} sm:w-16 sm:h-16 transition-colors duration-200`,
                                            style: { color: item.color }
                                        })}
                                    </motion.div>
                                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400 font-medium relative z-10 transition-colors text-center`}>
                                        {item.name}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </>
                ) : (
                    // Game Mode
                    <div className="space-y-4">
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => {
                                    setGameMode(false);
                                    setScore(0);
                                }}
                                className={`${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'} border border-white/15 hover:border-white/30 rounded-lg transition-colors text-gray-300 hover:text-white font-medium`}
                            >
                                Exit
                            </button>
                            <button
                                onClick={initializeGame}
                                className={`${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'} border border-white/15 hover:border-white/30 rounded-lg transition-colors text-gray-300 hover:text-white font-medium`}
                            >
                                Reset
                            </button>
                        </div>

                        <div 
                            ref={gameRef}
                            className="relative bg-black/30 rounded-xl border border-white/10 mx-auto cursor-crosshair overflow-hidden w-full"
                            style={{ 
                                width: gameArea.width, 
                                height: gameArea.height,
                                maxWidth: '100%'
                            }}
                            onClick={handleShoot}
                            onTouchStart={handleShoot}
                        >
                            {/* Scoreboard */}
                            <div className={`absolute top-2 left-2 sm:top-4 sm:left-4 text-left font-mono ${isMobile ? 'text-[11px]' : 'text-xs'} leading-relaxed`}>
                                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-gray-500">
                                    <span>score</span>
                                    <span className="text-white tabular-nums text-right">{score}</span>
                                    <span>hits</span>
                                    <span className="text-gray-300 tabular-nums text-right">{totalHits}</span>
                                    <span>active</span>
                                    <span className="text-gray-300 tabular-nums text-right">{activeIconsCount}</span>
                                </div>
                            </div>

                            {/* Floating Icons */}
                            <AnimatePresence>
                                {floatingIcons.map((icon) => {
                                    const iconSize = isMobile ? 'w-10 h-10' : 'w-12 h-12';
                                    const innerIconSize = isMobile ? 'w-6 h-6' : 'w-8 h-8';
                                    
                                    return (
                                        <motion.div
                                            key={icon.id}
                                            className={`absolute ${iconSize} flex items-center justify-center rounded-lg backdrop-blur-sm border ${
                                                icon.hit 
                                                    ? 'bg-green-500/50 border-green-400' 
                                                    : 'bg-white/10 border-white/20'
                                            }`}
                                            style={{
                                                left: icon.x,
                                                top: icon.y,
                                            }}
                                            animate={{
                                                scale: icon.hit ? [1, 1.5, 0] : [0.9, 1.1, 0.9],
                                                rotate: icon.hit ? [0,180,360] : 0,
                                                opacity: icon.hit ? [1, 1, 0] : 1
                                            }}
                                            transition={{
                                                duration: icon.hit ? 0.4 : 2,
                                                repeat: icon.hit ? 0 : Infinity,
                                                ease : icon.hit ? "easeOut" : "easeInOut"
                                            }}
                                        >
                                            {React.createElement(icon.stackItem.icon, {
                                                className: innerIconSize,
                                                style: { 
                                                    color: icon.hit ? '#22c55e' : icon.stackItem.color,
                                                    filter: icon.hit ? 'brightness(1.5)' : 'none'
                                                }
                                            })}
                                            
                                            {/* Hit effect */}
                                            {icon.hit && (
                                                <motion.div
                                                    className="absolute inset-0 rounded-lg bg-green-400/20"
                                                    animate={{
                                                        scale: [1, 2, 0],
                                                        opacity: [0.8, 0.3, 0]
                                                    }}
                                                    transition={{ duration: 0.6 }}
                                                />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {/* Enhanced Bullets with Physics */}
                            {bullets.map((bullet) => (
                                <motion.div
                                    key={bullet.id}
                                    className={`absolute ${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full`}
                                    style={{
                                        left: bullet.x - (isMobile ? 0.75 : 1),
                                        top: bullet.y - (isMobile ? 0.75 : 1),
                                        boxShadow: '0 0 8px #fbbf24'
                                    }}
                                    animate={{
                                        scale: [0.8, 1.2, 0.8]
                                    }}
                                    transition={{
                                        duration: 0.2,
                                        repeat: Infinity
                                    }}
                                />
                            ))}

                            {/* Enhanced Cannon */}
                            <motion.div 
                                className="absolute bottom-2 sm:bottom-4 left-1/2"
                                style={{
                                    transform: `translateX(-50%) rotate(${cannonAngle}rad)`,
                                    transformOrigin: 'center bottom'
                                }}
                                animate={{
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity
                                }}
                            >
                                <div className={`${isMobile ? 'w-10 h-7' : 'w-14 h-10'} bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 rounded-t-lg border border-gray-400 shadow-lg`}></div>
                                <div className={`${isMobile ? 'w-7 h-4' : 'w-10 h-6'} bg-gradient-to-b from-gray-600 to-gray-800 mx-auto rounded-b border border-gray-500`}></div>
                                <div className="absolute inset-0 bg-violet-400/20 rounded-lg blur-sm"></div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};