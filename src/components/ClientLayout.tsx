'use client';

import { Inter } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const isHome = pathname === '/';

    useEffect(() => {
        if (!isHome) {
            setLoading(false);
        }
    }, [isHome]);

    return (
        <div className={inter.className}>
            <AuthProvider>
                <WishlistProvider>
                    <CartProvider>
                        {loading && isHome ? (
                            <LoadingScreen onComplete={() => setLoading(false)} />
                        ) : (
                            <div className="flex flex-col min-h-screen">
                                <div className="flex-grow">
                                    {children}
                                </div>
                                <Footer />
                            </div>
                        )}
                    </CartProvider>
                </WishlistProvider>
            </AuthProvider>
        </div>
    );
}
