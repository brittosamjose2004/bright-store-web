'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { getAddresses, Address } from '@/lib/firestore';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, total, subtotal, coupon, applyCoupon, removeCoupon, checkout, isOutstation, deliveryRequested, setDeliveryRequested, selectedAddress, setSelectedAddress } = useCart();
    const [couponCode, setCouponCode] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [couponMessage, setCouponMessage] = useState('');
    const [addresses, setAddresses] = useState<Address[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            getAddresses().then(data => {
                setAddresses(data);
                const defaultAddr = data.find(a => a.is_default);
                if (defaultAddr && !selectedAddress) {
                    setSelectedAddress(defaultAddr);
                }
            });
        }
    }, [user]);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setApplyingCoupon(true);
        setCouponMessage('');

        try {
            const result = await applyCoupon(couponCode);
            setCouponMessage(result.message || (result.success ? 'Coupon applied!' : 'Invalid coupon'));
            if (result.success) setCouponCode('');
        } catch (error) {
            setCouponMessage('Error applying coupon');
        } finally {
            setApplyingCoupon(false);
        }
    };

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
                <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Your Cart
                </h1>

                {items.length === 0 ? (
                    <div className="text-center py-20 bg-neutral-900 rounded-2xl border border-neutral-800">
                        <p className="text-neutral-400 text-lg mb-6">Your cart is empty</p>
                        <Link
                            href="/shop"
                            className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-full hover:bg-yellow-400 transition"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-4">
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    className="flex gap-4 p-4 bg-neutral-900 rounded-xl border border-neutral-800"
                                >
                                    <div className="w-24 h-24 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.imageUrl && (
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                        <p className="text-yellow-500 font-semibold">₹{item.price}</p>

                                        <div className="flex items-center gap-4 mt-4">
                                            <div className="flex items-center gap-2 bg-neutral-800 rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 hover:bg-neutral-700 rounded transition"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-12 text-center font-mono">{item.quantity} kg</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 hover:bg-neutral-700 rounded transition"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="md:col-span-1">
                            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 sticky top-24">
                                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                                <div className="space-y-2 mb-6 text-neutral-400">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal}</span>
                                    </div>
                                    {coupon && (
                                        <div className="flex justify-between text-green-500">
                                            <span>Discount ({coupon.code})</span>
                                            <div className="flex items-center gap-2">
                                                <span>-₹{coupon.discount}</span>
                                                <button onClick={removeCoupon} className="text-red-500 hover:text-red-400">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span>TBD</span>
                                    </div>
                                    <div className="border-t border-neutral-800 pt-2 mt-2 flex justify-between text-white font-bold text-lg">
                                        <span>Total</span>
                                        <span>₹{total}</span>
                                    </div>
                                </div>

                                {/* Coupon Input */}
                                <div className="mb-6">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Coupon Code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 outline-none uppercase"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={!couponCode || applyingCoupon}
                                            className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-700 transition disabled:opacity-50"
                                        >
                                            {applyingCoupon ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                    {couponMessage && (
                                        <p className={`text-xs mt-2 ${couponMessage.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
                                            {couponMessage}
                                        </p>
                                    )}
                                </div>

                                <div className="mb-4 flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="deliveryRequest"
                                        checked={deliveryRequested}
                                        onChange={(e) => setDeliveryRequested(e.target.checked)}
                                        className="w-5 h-5 rounded border-neutral-600 text-yellow-500 focus:ring-yellow-500 bg-neutral-700"
                                    />
                                    <label htmlFor="deliveryRequest" className="text-sm font-medium cursor-pointer select-none">
                                        Request Home Delivery
                                    </label>
                                </div>

                                {deliveryRequested && (
                                    <div className="mb-4 space-y-3">
                                        {isOutstation && (
                                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-sm">
                                                <p className="font-bold mb-1">⚠️ Outstation Delivery</p>
                                                <p>You are outside our local delivery area. Shipping charges will be calculated and added to your bill manually.</p>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-neutral-400 mb-2">Select Delivery Address</label>
                                            {addresses.length > 0 ? (
                                                <select
                                                    value={selectedAddress?.id || ''}
                                                    onChange={(e) => {
                                                        const addr = addresses.find(a => a.id === e.target.value);
                                                        setSelectedAddress(addr);
                                                    }}
                                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                                                >
                                                    <option value="">-- Select Address --</option>
                                                    {addresses.map(addr => (
                                                        <option key={addr.id} value={addr.id}>
                                                            {addr.label} - {addr.address_line1}, {addr.city}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <p className="text-sm text-red-400">No saved addresses found.</p>
                                            )}
                                            <Link href="/profile/addresses" className="text-xs text-yellow-500 hover:text-yellow-400 mt-1 inline-block">
                                                + Manage Addresses
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={checkout}
                                    disabled={deliveryRequested && !selectedAddress}
                                    className="w-full py-4 bg-[#25D366] text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <MessageCircle size={24} />
                                    Order via WhatsApp
                                </button>
                                <p className="text-xs text-center text-neutral-500 mt-4">
                                    You will be redirected to WhatsApp to confirm your order details with the owner.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
