'use client';

import { useState } from 'react';
import { addOffer } from '@/lib/firestore';
import { useRouter } from 'next/navigation';

export default function NewOfferPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        code: '',
        discountPercentage: '',
        active: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addOffer({
                title: formData.title,
                description: formData.description,
                code: formData.code.toUpperCase(),
                discountPercentage: Number(formData.discountPercentage),
                active: formData.active,
            });

            router.push('/admin/offers');
        } catch (error) {
            console.error('Error adding offer:', error);
            alert('Failed to add offer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 min-h-screen bg-neutral-950 text-white">
            <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Create New Offer
            </h1>

            <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
                <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Offer Title</label>
                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Summer Sale"
                        className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="e.g. Get 20% off on all electronics"
                        className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Discount Code</label>
                        <input
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            required
                            placeholder="SUMMER20"
                            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none uppercase"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Discount (%)</label>
                        <input
                            type="number"
                            name="discountPercentage"
                            value={formData.discountPercentage}
                            onChange={handleChange}
                            required
                            min="0"
                            max="100"
                            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                        className="w-5 h-5 accent-yellow-500"
                    />
                    <label htmlFor="active" className="text-neutral-300">Active Promotion</label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                    {loading ? 'Creating Offer...' : 'Create Offer'}
                </button>
            </form>
        </div>
    );
}
