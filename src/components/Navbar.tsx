'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X, User, Heart, Package } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { items } = useCart();
    const { user } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-white/10 group-hover:border-yellow-500/50 transition">
                            <img src="/logo.png" alt="Bright Store" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                            Bright Store
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-neutral-300 hover:text-white transition">Home</Link>
                        <Link href="/shop" className="text-neutral-300 hover:text-white transition">Shop</Link>
                        <Link href="/about" className="text-neutral-300 hover:text-white transition">About</Link>

                        {user ? (
                            <>
                                <Link href="/profile" className="text-neutral-300 hover:text-white transition flex items-center gap-2">
                                    <User size={20} />
                                    Profile
                                </Link>
                                <Link href="/orders" className="text-neutral-300 hover:text-white transition flex items-center gap-2">
                                    <Package size={20} />
                                    Orders
                                </Link>
                            </>
                        ) : (
                            <Link href="/login" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-bold transition">
                                Login
                            </Link>
                        )}

                        <Link href="/wishlist" className="text-neutral-300 hover:text-white transition">
                            <Heart size={24} />
                        </Link>

                        <Link href="/cart" className="relative p-2 text-neutral-300 hover:text-white transition">
                            <ShoppingCart size={24} />
                            {items.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {items.length}
                                </span>
                            )}
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center gap-4">
                        <Link href="/cart" className="relative p-2 text-neutral-300 hover:text-white transition">
                            <ShoppingCart size={24} />
                            {items.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {items.length}
                                </span>
                            )}
                        </Link>
                        <button onClick={() => setIsOpen(!isOpen)} className="text-neutral-300">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-neutral-900 border-b border-white/10 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-4 space-y-2">
                            <Link href="/" className="block px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg">Home</Link>
                            <Link href="/shop" className="block px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg">Shop</Link>
                            <Link href="/about" className="block px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg">About</Link>
                            {user ? (
                                <>
                                    <Link href="/profile" className="block px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg">My Profile</Link>
                                    <Link href="/orders" className="block px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg">My Orders</Link>
                                </>
                            ) : (
                                <Link href="/login" className="block px-3 py-2 text-yellow-500 font-bold hover:bg-neutral-800 rounded-lg">Login / Sign Up</Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav >
    );
}
