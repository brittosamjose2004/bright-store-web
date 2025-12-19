'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { getProducts } from '@/lib/firestore';
import { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    useEffect(() => {
        loadWishlistProducts();
    }, [wishlist]);

    const loadWishlistProducts = async () => {
        setLoading(true);
        const allProducts = await getProducts();
        const wishlistProducts = allProducts.filter(p => wishlist.includes(p.id));
        setProducts(wishlistProducts);
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <Heart className="text-red-500 fill-red-500" />
                    My Wishlist
                </h1>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 text-neutral-500">
                        <Heart size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-xl mb-4">Your wishlist is empty</p>
                        <Link href="/shop" className="text-yellow-500 hover:text-yellow-400 font-bold">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {products.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-red-500/50 transition group"
                                >
                                    <div className="h-48 overflow-hidden relative">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                        />
                                        <button
                                            onClick={() => removeFromWishlist(product.id)}
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-red-500/20 text-white hover:text-red-500 transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                                        <p className="text-neutral-400 text-sm mb-4 line-clamp-2 h-10">{product.description}</p>

                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-xl font-bold text-white">₹{product.price}</span>
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition text-sm"
                                            >
                                                <ShoppingBag size={16} />
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </main>
    );
}
