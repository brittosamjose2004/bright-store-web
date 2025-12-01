'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserOrders } from '@/lib/firestore';
import Navbar from '@/components/Navbar';
import { Loader2, Package, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadOrders();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const loadOrders = async () => {
        try {
            if (!user) return;
            const data = await getUserOrders(user.id);
            setOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-yellow-500">
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[80vh] px-4 text-center">
                    <Package size={64} className="text-neutral-700 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Please Login</h1>
                    <p className="text-neutral-400 mb-6">You need to be logged in to view your orders.</p>
                    <Link href="/login" className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-full hover:bg-yellow-400 transition">
                        Login Now
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
                <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    My Orders
                </h1>

                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                        <Package size={64} className="text-neutral-700 mb-4" />
                        <h2 className="text-xl font-bold mb-2">No Orders Yet</h2>
                        <p className="text-neutral-400 mb-6">Looks like you haven't placed any orders yet.</p>
                        <Link href="/shop" className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-full hover:bg-yellow-400 transition">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-yellow-500/30 transition group"
                            >
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-mono text-sm text-neutral-500">#{order.id.slice(0, 8)}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase
                                                ${order.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                                    order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-neutral-800 text-neutral-400'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-neutral-400 text-sm">
                                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-white">₹{order.total_amount}</p>
                                        <p className="text-xs text-neutral-500 mb-2">{order.items?.length || 0} Items</p>
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="inline-flex items-center gap-1 text-sm text-yellow-500 hover:text-yellow-400 font-medium"
                                        >
                                            View Details <ChevronRight size={16} />
                                        </Link>
                                    </div>
                                </div>

                                <div className="border-t border-neutral-800 pt-4">
                                    <div className="space-y-2">
                                        {order.items?.map((item: any, i: number) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-neutral-300">
                                                    {item.quantity}x {item.name}
                                                </span>
                                                <span className="text-neutral-500">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
