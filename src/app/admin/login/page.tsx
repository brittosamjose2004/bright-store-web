'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            router.push('/admin');
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-xl"
            >
                <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Admin Login
                </h1>
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                            placeholder="admin@brightstore.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-lg hover:opacity-90 transition transform active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Sign In'}
                        </button>
                        <button
                            onClick={async (e) => {
                                e.preventDefault();
                                setLoading(true);
                                setError('');
                                try {
                                    const { error } = await supabase.auth.signUp({
                                        email,
                                        password,
                                    });
                                    if (error) throw error;
                                    setError('Account created! Please check your email to confirm, or if email confirmation is disabled, Sign In now.');
                                } catch (err: any) {
                                    setError(err.message);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            className="flex-1 py-3 bg-neutral-800 border border-neutral-700 text-white font-bold rounded-lg hover:bg-neutral-700 transition transform active:scale-95 disabled:opacity-50"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
