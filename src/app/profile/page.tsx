'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { User, MapPin, Phone, Save, Loader2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, profile, refreshProfile, loading: authLoading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        alt_phone: '',
        address_line1: '',
        address_line2: '',
        landmark: '',
        city: 'Chennai',
        pincode: '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                alt_phone: profile.alt_phone || '',
                address_line1: profile.address_line1 || '',
                address_line2: profile.address_line2 || '',
                landmark: profile.landmark || '',
                city: profile.city || 'Chennai',
                pincode: profile.pincode || '',
            });
        }
    }, [user, profile, authLoading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            if (!user) throw new Error('No user logged in');

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    ...formData,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            await refreshProfile();
            setMessage({ type: 'success', text: 'Profile updated successfully! Redirecting...' });
            setTimeout(() => {
                router.push('/');
            }, 1000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-yellow-500" size={40} />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        My Profile
                    </h1>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar / Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-2xl font-bold text-black">
                                    {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg">{profile?.full_name || 'User'}</h2>
                                    <p className="text-neutral-400 text-sm">{user?.email}</p>
                                </div>
                            </div>
                            <div className="text-sm text-neutral-500">
                                Complete your profile to speed up checkout and get orders delivered to your doorstep.
                            </div>
                        </div>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-2"
                    >
                        <form onSubmit={handleSubmit} className="bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800 space-y-6">
                            {message && (
                                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-yellow-500">
                                    <User size={20} /> Personal Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-neutral-400">Full Name</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-neutral-400">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-neutral-400">Alternative Phone (Optional)</label>
                                    <input
                                        type="tel"
                                        name="alt_phone"
                                        value={formData.alt_phone}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none"
                                        placeholder="+91 ..."
                                    />
                                </div>
                            </div>

                            <div className="border-t border-neutral-800 pt-6 space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-yellow-500">
                                    <MapPin size={20} /> Delivery Address
                                </h3>
                                <div className="space-y-2">
                                    <label className="text-sm text-neutral-400">Address Line 1</label>
                                    <input
                                        type="text"
                                        name="address_line1"
                                        value={formData.address_line1}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none"
                                        placeholder="House No, Street Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-neutral-400">Address Line 2 (Area/Colony)</label>
                                    <input
                                        type="text"
                                        name="address_line2"
                                        value={formData.address_line2}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none"
                                        placeholder="Area Name"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-neutral-400">Landmark</label>
                                        <input
                                            type="text"
                                            name="landmark"
                                            value={formData.landmark}
                                            onChange={handleChange}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none"
                                            placeholder="Near..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-neutral-400">Pincode</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none"
                                            placeholder="600..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-neutral-400">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                Save Profile
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
