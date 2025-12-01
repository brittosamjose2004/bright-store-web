'use client';

import { supabase } from '@/lib/supabase';
import { updateOrderStatus } from '@/lib/firestore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    Clock,
    Truck,
    XCircle
} from 'lucide-react';

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error fetching orders:', error);
            }
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            await updateOrderStatus(orderId, newStatus);

            // Optimistic update
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

            // Send Notification
            const order = orders.find(o => o.id === orderId);
            if (order && order.user_id) {
                await fetch('/api/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: order.user_id,
                        title: `Order Update: ${newStatus.toUpperCase()}`,
                        body: `Your order #${order.id.slice(0, 8)} is now ${newStatus}.`,
                        data: { orderId: order.id }
                    })
                });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'all' || order.status === filter;
        const matchesSearch =
            order.id.toLowerCase().includes(search.toLowerCase()) ||
            order.shipping_address?.full_name?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'processing': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-neutral-400 bg-neutral-800 border-neutral-700';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 hover:bg-neutral-900 rounded-lg transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Orders</h1>
                        <p className="text-neutral-400">Manage and track customer orders</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Customer Name..."
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-yellow-500 transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['all', 'pending', 'processing', 'completed', 'cancelled'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-4 py-2 rounded-lg border capitalize transition whitespace-nowrap
                                    ${filter === s
                                        ? 'bg-yellow-500 text-black border-yellow-500 font-medium'
                                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Grid */}
                <div className="grid gap-4">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition group">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                {/* Order Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-mono text-neutral-500">#{order.id.slice(0, 8)}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)} capitalize`}>
                                            {order.status}
                                        </span>
                                        <span className="text-neutral-500 text-sm flex items-center gap-1">
                                            <Clock size={14} />
                                            {new Date(order.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold mb-1">{order.shipping_address?.full_name || 'Guest Customer'}</h3>
                                    <p className="text-neutral-400 text-sm mb-4">
                                        {order.shipping_address?.phone} • {order.shipping_address?.city}, {order.shipping_address?.pincode}
                                    </p>

                                    {/* Items Preview */}
                                    <div className="flex gap-2 flex-wrap">
                                        {order.items?.map((item: any, idx: number) => (
                                            <span key={idx} className="px-2 py-1 bg-neutral-950 rounded text-xs text-neutral-300 border border-neutral-800">
                                                {item.name} x{item.quantity}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions & Total */}
                                <div className="flex flex-col items-end justify-between gap-4">
                                    <div className="text-right">
                                        <p className="text-neutral-500 text-sm">Total Amount</p>
                                        <p className="text-2xl font-bold text-yellow-500">₹{order.total_amount}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 cursor-pointer"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-20 text-neutral-500">
                            <p>No orders found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
