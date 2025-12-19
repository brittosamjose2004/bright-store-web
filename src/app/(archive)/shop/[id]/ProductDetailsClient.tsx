'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ShoppingBag, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductDetailsClientProps {
    product: Product;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
            {/* Image Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800"
            >
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
            </motion.div>

            {/* Details Section */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-yellow-500 font-bold uppercase tracking-wider text-sm">
                            {product.category}
                        </span>
                        <h1 className="text-4xl font-bold mt-2">{product.name}</h1>
                    </div>
                    <button
                        onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                        className="p-3 rounded-full bg-neutral-900 border border-neutral-800 hover:border-red-500/50 transition group"
                    >
                        <Heart
                            size={24}
                            className={isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-neutral-400 group-hover:text-red-500"}
                        />
                    </button>
                </div>

                <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
                    {product.description}
                </p>

                <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800 mb-8">
                    <div className="flex items-end gap-4 mb-2">
                        <span className="text-3xl font-bold text-white">₹{product.price}</span>
                        <span className="text-neutral-400 mb-1">/ kg</span>
                    </div>
                    <p className="text-sm text-neutral-500 mb-4">
                        Wholesale Price: <span className="text-neutral-300">₹{product.wholesalePrice}</span> / kg
                        (Min {product.minWholesaleQuantity} kg)
                    </p>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${(product.stock_quantity || 0) > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {(product.stock_quantity || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                        </div>
                        {(product.stock_quantity || 0) < 5 && (product.stock_quantity || 0) > 0 && (
                            <span className="text-orange-500 text-sm font-medium">
                                Only {product.stock_quantity} left!
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 mt-auto">
                    <div className="flex items-center bg-neutral-900 rounded-xl border border-neutral-800">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={(product.stock_quantity || 0) === 0}
                            className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-white transition text-xl disabled:opacity-50"
                        >
                            -
                        </button>
                        <span className="w-12 text-center font-bold text-xl">{quantity}</span>
                        <button
                            onClick={() => setQuantity(Math.min((product.stock_quantity || 0), quantity + 1))}
                            disabled={(product.stock_quantity || 0) === 0 || quantity >= (product.stock_quantity || 0)}
                            className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-white transition text-xl disabled:opacity-50"
                        >
                            +
                        </button>
                    </div>

                    <button
                        onClick={() => addToCart(product, quantity)}
                        disabled={(product.stock_quantity || 0) === 0}
                        className={`flex-1 font-bold rounded-xl transition flex items-center justify-center gap-2 text-lg ${(product.stock_quantity || 0) > 0
                            ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                            : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            }`}
                    >
                        <ShoppingBag />
                        {(product.stock_quantity || 0) > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
