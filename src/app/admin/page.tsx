'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
    ShoppingBag,
    TrendingUp,
    LogOut,
    ChevronRight,
    Clock,
    Image as ImageIcon,
    LayoutDashboard,
    Package,
    Tags,
    Users
} from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch Orders
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            // Fetch Customers
            const { count: customerCount, error: customersError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            if (customersError) throw customersError;

            // Calculate Stats
            const totalRevenue = orders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
            const totalOrders = orders?.length || 0;

            setStats({
                totalRevenue,
                totalOrders,
                totalCustomers: customerCount || 0
            });

            setRecentOrders(orders?.slice(0, 5) || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Do not throw, just log
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            {/* Sidebar / Navigation */}
            <div className="fixed top-0 left-0 h-full w-64 bg-neutral-900 border-r border-neutral-800 p-6 hidden md:flex flex-col">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-black">B</span>
                    </div>
                    <span className="text-xl font-bold">Bright Admin</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-yellow-500/10 text-yellow-500 rounded-xl border border-yellow-500/20">
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:bg-neutral-800 hover:text-white rounded-xl transition">
                        <ShoppingBag size={20} />
                        <span className="font-medium">Orders</span>
                    </Link>
                    <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:bg-neutral-800 hover:text-white rounded-xl transition">
                        <Package size={20} />
                        <span className="font-medium">Products</span>
                    </Link>
                    <Link href="/admin/offers" className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:bg-neutral-800 hover:text-white rounded-xl transition">
                        <Tags size={20} />
                        <span className="font-medium">Offers</span>
                    </Link>
                    <Link href="/admin/banners" className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:bg-neutral-800 hover:text-white rounded-xl transition">
                        <ImageIcon size={20} />
                        <span className="font-medium">Banners</span>
                    </Link>
                    <Link href="/admin/customers" className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:bg-neutral-800 hover:text-white rounded-xl transition">
                        <Users size={20} />
                        <span className="font-medium">Customers</span>
                    </Link>
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition mt-auto"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="md:ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Overview</h1>
                        <p className="text-neutral-400">Welcome back, Admin</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 rounded-full border border-neutral-800">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-neutral-400">System Online</span>
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-900 border border-neutral-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                            <TrendingUp size={100} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-neutral-400 mb-2">Total Revenue</p>
                            <h3 className="text-3xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</h3>
                            <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
                                <TrendingUp size={16} />
                                <span>+12.5% from last month</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-900 border border-neutral-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                            <ShoppingBag size={100} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-neutral-400 mb-2">Total Orders</p>
                            <h3 className="text-3xl font-bold text-white">{stats.totalOrders}</h3>
                            <div className="mt-4 flex items-center gap-2 text-yellow-400 text-sm">
                                <Clock size={16} />
                                <span>{recentOrders.length} recent orders</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-900 border border-neutral-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                            <Users size={100} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-neutral-400 mb-2">Total Customers</p>
                            <h3 className="text-3xl font-bold text-white">{stats.totalCustomers}</h3>
                            <div className="mt-4 flex items-center gap-2 text-blue-400 text-sm">
                                <Users size={16} />
                                <span>Active user base</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
                    <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                        <h2 className="text-lg font-bold">Recent Orders</h2>
                        <Link href="/admin/orders" className="text-sm text-yellow-500 hover:text-yellow-400 flex items-center gap-1">
                            View All <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-950/50 text-neutral-400 text-sm">
                                <tr>
                                    <th className="p-4 font-medium">Order ID</th>
                                    <th className="p-4 font-medium">Customer</th>
                                    <th className="p-4 font-medium">Amount</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-neutral-800/50 transition">
                                        <td className="p-4 font-mono text-sm text-neutral-400">
                                            #{order.id.slice(0, 8)}
                                        </td>
                                        <td className="p-4">
                                            {order.shipping_address?.full_name || 'Guest'}
                                        </td>
                                        <td className="p-4 font-medium">
                                            ₹{order.total_amount}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                                                ${order.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                                    order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-neutral-800 text-neutral-400'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-neutral-400 text-sm">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {recentOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-neutral-500">
                                            No orders found yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
