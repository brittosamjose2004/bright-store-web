'use client';

import { useEffect, useState } from 'react';
import { getOffers, deleteOffer } from '@/lib/firestore';
import { Offer } from '@/types';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        const data = await getOffers();
        setOffers(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this offer?')) {
            await deleteOffer(id);
            loadOffers();
        }
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="p-8 min-h-screen bg-neutral-950 text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Offers & Promotions
                </h1>
                <Link
                    href="/admin/offers/new"
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition"
                >
                    <Plus size={20} />
                    Add Offer
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer) => (
                    <div key={offer.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2">
                            <span className={`text-xs px-2 py-1 rounded ${offer.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {offer.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{offer.title}</h3>
                        <p className="text-neutral-400 text-sm mb-4">{offer.description}</p>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-2xl font-bold text-yellow-500">{offer.discountPercentage}% OFF</span>
                            <span className="text-sm font-mono bg-neutral-800 px-2 py-1 rounded text-neutral-300">
                                {offer.code}
                            </span>
                        </div>
                        <button
                            onClick={() => handleDelete(offer.id)}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
