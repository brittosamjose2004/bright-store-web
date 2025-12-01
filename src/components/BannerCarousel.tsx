'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banner } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BannerCarouselProps {
    banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    if (banners.length === 0) return null;

    return (
        <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-neutral-900">
            <AnimatePresence initial={false} mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    <img
                        src={banners[currentIndex].imageUrl}
                        alt={banners[currentIndex].title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-4">
                        <div className="max-w-4xl">
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg"
                            >
                                {banners[currentIndex].title}
                            </motion.h1>
                            {banners[currentIndex].link && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Link
                                        href={banners[currentIndex].link!}
                                        className="inline-block px-8 py-3 bg-yellow-500 text-black font-bold rounded-full hover:bg-yellow-400 transition transform hover:scale-105 shadow-lg"
                                    >
                                        Shop Now
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {banners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition backdrop-blur-sm"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition backdrop-blur-sm"
                    >
                        <ChevronRight size={32} />
                    </button>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-yellow-500 w-8' : 'bg-white/50 hover:bg-white'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
