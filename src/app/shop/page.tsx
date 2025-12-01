'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { getProducts } from '@/lib/firestore';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { motion } from 'framer-motion';
import { Search, Filter, ShoppingBag, Heart } from 'lucide-react';
import Link from 'next/link';

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { addToCart, items, total } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const updateLocalQuantity = (productId: string, change: number) => {
        setQuantities(prev => {
            const currentQty = prev[productId] || 1;
            const newQty = Math.max(1, currentQty + change);
            return { ...prev, [productId]: newQty };
        });
    };

    const categories = ['All', 'Vegetables', 'Fruits', 'Spices', 'Dry Fruits', 'Oils'];

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [searchQuery, selectedCategory, products]);

    const loadProducts = async () => {
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
    };

    const filterProducts = () => {
        let result = products;

        if (searchQuery) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory);
        }

        setFilteredProducts(result);
    };

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        Shop Collection
                    </h1>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-white placeholder-neutral-500"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${selectedCategory === cat
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-yellow-500/50 transition group"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <Link href={`/shop/${product.id}`}>
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-600">
                                                No Image
                                            </div>
                                        )}
                                    </Link>
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                isInWishlist(product.id)
                                                    ? removeFromWishlist(product.id)
                                                    : addToWishlist(product.id);
                                            }}
                                            className="p-1.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 transition"
                                        >
                                            <Heart
                                                size={18}
                                                className={isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-white"}
                                            />
                                        </button>
                                        <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-yellow-500 uppercase">
                                            {product.category}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                                    <p className="text-neutral-400 text-sm mb-4 line-clamp-2 h-10">{product.description}</p>
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <span className="text-xl font-bold text-white">₹{product.price} <span className="text-sm font-normal text-neutral-400">/ kg</span></span>
                                            <span className="block text-xs text-neutral-500">Wholesale: ₹{product.wholesalePrice} / kg</span>
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center bg-neutral-800 rounded-lg p-1">
                                                <button
                                                    onClick={() => updateLocalQuantity(product.id, -1)}
                                                    className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center font-bold text-white">
                                                    {quantities[product.id] || 1}
                                                </span>
                                                <button
                                                    onClick={() => updateLocalQuantity(product.id, 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    addToCart(product, quantities[product.id] || 1);
                                                    // Optional: Reset quantity after adding
                                                    // setQuantities(prev => ({ ...prev, [product.id]: 1 }));
                                                }}
                                                className="flex-1 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition text-sm"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && filteredProducts.length === 0 && (
                    <div className="text-center py-20 text-neutral-500">
                        <Filter size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-xl">No products found matching your criteria</p>
                    </div>
                )}
            </div>

            {/* Floating Cart Summary */}
            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 p-4 z-50">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-neutral-400 text-sm">{items.length} items in cart</span>
                            <span className="text-xl font-bold text-white">₹{total}</span>
                        </div>
                        <Link
                            href="/cart"
                            className="flex items-center gap-2 bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition"
                        >
                            <ShoppingBag size={20} />
                            View Cart
                        </Link>
                    </div>
                </div>
            )}
        </main>
    );
}
