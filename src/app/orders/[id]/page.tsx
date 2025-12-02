'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrderById } from '@/lib/firestore';
import Navbar from '@/components/Navbar';
import { Loader2, Package, MapPin, Phone, CheckCircle, Circle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const runtime = 'edge';

export default function OrderDetailsPage() {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadOrder();
        }
    }, [id]);

    const loadOrder = async () => {
        try {
            const data = await getOrderById(id as string);
            setOrder(data);
        } catch (error) {
            console.error('Error loading order:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-yellow-500">
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
                <Link href="/orders" className="text-yellow-500 hover:text-yellow-400">Back to Orders</Link>
            </div>
        );
    }

    const trackingSteps = [
        { status: 'placed', label: 'Order Placed' },
        { status: 'confirmed', label: 'Order Confirmed' },
        { status: 'packed', label: 'Packed' },
        { status: 'shipped', label: 'Shipped' },
        { status: 'out_for_delivery', label: 'Out for Delivery' },
        { status: 'delivered', label: 'Delivered' },
    ];

    // Determine current step index based on order status or tracking history
    // For now, we'll map simple status to steps. In a real app, we'd use tracking_history array.
    const getStepIndex = (status: string) => {
        const map: any = {
            'pending': 0,
            'confirmed': 1,
            'packed': 2,
            'shipped': 3,
            'out_for_delivery': 4,
            'completed': 5,
            'delivered': 5,
            'cancelled': -1
        };
        return map[status] ?? 0;
    };

    const currentStepIndex = getStepIndex(order.status);

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
                <Link href="/orders" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition">
                    <ArrowLeft size={20} />
                    Back to Orders
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                            Order #{order.id.slice(0, 8)}
                        </h1>
                        <p className="text-neutral-400 mt-1">
                            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider
                        ${order.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                            order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                'bg-yellow-500/10 text-yellow-500'}`}>
                        {order.status}
                    </div>
                </div>

                {/* Tracking Timeline */}
                {order.status !== 'cancelled' && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 mb-8 overflow-x-auto">
                        <div className="flex items-center justify-between min-w-[600px] relative">
                            {/* Progress Bar Background */}
                            <div className="absolute left-0 top-1/2 w-full h-1 bg-neutral-800 -z-10 transform -translate-y-1/2" />

                            {/* Active Progress Bar */}
                            <div
                                className="absolute left-0 top-1/2 h-1 bg-yellow-500 -z-10 transform -translate-y-1/2 transition-all duration-500"
                                style={{ width: `${(currentStepIndex / (trackingSteps.length - 1)) * 100}%` }}
                            />

                            {trackingSteps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;

                                return (
                                    <div key={step.status} className="flex flex-col items-center gap-3 relative bg-neutral-900 px-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                            ${isCompleted ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-neutral-900 border-neutral-700 text-neutral-500'}
                                            ${isCurrent ? 'ring-4 ring-yellow-500/20 scale-110' : ''}
                                        `}>
                                            {isCompleted ? <CheckCircle size={16} /> : <Circle size={16} />}
                                        </div>
                                        <span className={`text-xs font-medium whitespace-nowrap ${isCompleted ? 'text-white' : 'text-neutral-500'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Order Items */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Package size={20} className="text-yellow-500" />
                                Items
                            </h2>
                            <div className="space-y-4">
                                {order.items?.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center border-b border-neutral-800 pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-bold">{item.name}</p>
                                            <p className="text-sm text-neutral-400">{item.quantity} kg x ₹{item.price}</p>
                                        </div>
                                        <p className="font-bold">₹{item.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary & Address */}
                    <div className="space-y-6">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                            <div className="space-y-2 text-neutral-400">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{order.subtotal || order.total_amount}</span>
                                </div>
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-green-500">
                                        <span>Discount</span>
                                        <span>-₹{order.discount_amount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>{order.shipping_cost ? `₹${order.shipping_cost}` : 'Free'}</span>
                                </div>
                                <div className="border-t border-neutral-800 pt-2 mt-2 flex justify-between text-white font-bold text-lg">
                                    <span>Total</span>
                                    <span>₹{order.total_amount}</span>
                                </div>
                            </div>
                        </div>

                        {order.shipping_address && (
                            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <MapPin size={20} className="text-yellow-500" />
                                    Delivery Address
                                </h2>
                                <div className="text-neutral-400 text-sm space-y-1">
                                    <p className="text-white font-bold text-base mb-2">{order.shipping_address.full_name}</p>
                                    <p>{order.shipping_address.address_line1}</p>
                                    {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                                    <p>{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}</p>
                                    {order.shipping_address.landmark && <p>Landmark: {order.shipping_address.landmark}</p>}
                                    <div className="flex items-center gap-2 mt-3 text-white">
                                        <Phone size={14} />
                                        <span>{order.shipping_address.phone}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
