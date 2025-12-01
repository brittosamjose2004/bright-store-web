'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Video duration or fixed timer
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 1000); // Wait for exit animation
        }, 4000); // Adjust based on video length

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black"
                >
                    <video
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        onEnded={() => setIsVisible(false)}
                    >
                        <source src="/intro.mp4" type="video/mp4" />
                    </video>

                    {/* Overlay for glass effect if needed */}
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
