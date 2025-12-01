'use client';

import { useEffect, useState } from 'react';
import { getCoupons, addCoupon, deleteCoupon, Coupon } from '@/lib/firestore';
import { Plus, Trash2, Tag, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'FIXED' as 'FIXED' | 'PERCENTAGE',
        value: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        usageLimit: '',
        isActive: true,
    });
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        try {
            const data = await getCoupons();
            setCoupons(data);
        } catch (error) {
            console.error('Error loading coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this coupon?')) {
            try {
                await deleteCoupon(id);
                loadCoupons();
                setStatus({ type: 'success', message: 'Coupon deleted successfully' });
            } catch (error) {
                setStatus({ type: 'error', message: 'Failed to delete coupon' });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addCoupon({
                code: formData.code,
                discountType: formData.discountType,
                value: Number(formData.value),
                minOrderAmount: Number(formData.minOrderAmount) || 0,
                maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
                isActive: formData.isActive,
            });
            setShowModal(false);
            setFormData({
                code: '',
                discountType: 'FIXED',
                value: '',
                minOrderAmount: '',
                maxDiscountAmount: '',
                usageLimit: '',
                isActive: true,
            });
            loadCoupons();
            setStatus({ type: 'success', message: 'Coupon created successfully' });
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message || 'Failed to create coupon' });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="p-8 min-h-screen bg-neutral-950 text-white">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        Coupons
                    </h1>
                    <p className="text-neutral-400 text-sm mt-1">Manage discount codes</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition"
                >
                    <Plus size={20} />
                    Create Coupon
                </button>
            </div>

            {status && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${status.type === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p>{status.message}</p>
                    <button onClick={() => setStatus(null)} className="ml-auto hover:opacity-70">
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon) => (
                    <div key={coupon.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative group hover:border-neutral-700 transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                    <Tag size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl tracking-wider">{coupon.code}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${coupon.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(coupon.id)}
                                className="text-neutral-500 hover:text-red-500 transition"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div className="space-y-2 text-sm text-neutral-400">
                            <div className="flex justify-between">
                                <span>Discount:</span>
                                <span className="text-white font-medium">
                                    {coupon.discountType === 'FIXED' ? `₹${coupon.value}` : `${coupon.value}%`}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Min Order:</span>
                                <span className="text-white">₹{coupon.minOrderAmount}</span>
                            </div>
                            {coupon.maxDiscountAmount && (
                                <div className="flex justify-between">
                                    <span>Max Discount:</span>
                                    <span className="text-white">₹{coupon.maxDiscountAmount}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Usage:</span>
                                <span className="text-white">{coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-md w-full relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6">Create New Coupon</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Coupon Code</label>
                                <input
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. SAVE10"
                                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none uppercase"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Type</label>
                                    <select
                                        name="discountType"
                                        value={formData.discountType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                    >
                                        <option value="FIXED">Fixed Amount (₹)</option>
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Value</label>
                                    <input
                                        type="number"
                                        name="value"
                                        value={formData.value}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Min Order (₹)</label>
                                    <input
                                        type="number"
                                        name="minOrderAmount"
                                        value={formData.minOrderAmount}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Usage Limit</label>
                                    <input
                                        type="number"
                                        name="usageLimit"
                                        value={formData.usageLimit}
                                        onChange={handleChange}
                                        placeholder="Optional"
                                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                    />
                                </div>
                            </div>

                            {formData.discountType === 'PERCENTAGE' && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Max Discount Amount (₹)</label>
                                    <input
                                        type="number"
                                        name="maxDiscountAmount"
                                        value={formData.maxDiscountAmount}
                                        onChange={handleChange}
                                        placeholder="Optional limit for % off"
                                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition mt-4"
                            >
                                Create Coupon
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
