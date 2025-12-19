"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Banner } from '@/types';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';

export default function AdminAdsPage() {
    const [ads, setAds] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newAdTitle, setNewAdTitle] = useState('');

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        const { data, error } = await supabase
            .from('ads')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setAds(data);
        setLoading(false);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return;
            setUploading(true);

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('ads')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('ads')
                .getPublicUrl(filePath);

            await createAd(publicUrl);
        } catch (error) {
            alert('Error uploading image!');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const createAd = async (imageUrl: string) => {
        const { error } = await supabase
            .from('ads')
            .insert({
                title: newAdTitle || 'New Advertisement',
                image_url: imageUrl,
                active: true,
                display_order: 0
            });

        if (error) alert('Error creating ad');
        else {
            setNewAdTitle('');
            fetchAds();
        }
    };

    const deleteAd = async (id: string, imageUrl: string) => {
        if (!confirm('Are you sure?')) return;

        // Delete from Storage
        const path = imageUrl.split('/').pop();
        if (path) await supabase.storage.from('ads').remove([path]);

        // Delete from DB
        await supabase.from('ads').delete().eq('id', id);
        fetchAds();
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        await supabase.from('ads').update({ active: !currentStatus }).eq('id', id);
        fetchAds();
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-yellow-500 mb-8">Manage Advertisements</h1>

            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Upload New Ad</h2>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm text-neutral-400 mb-2">Ad Title (Optional)</label>
                        <input
                            type="text"
                            value={newAdTitle}
                            onChange={(e) => setNewAdTitle(e.target.value)}
                            placeholder="Enter ad title..."
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500"
                        />
                    </div>
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="ad-upload"
                            disabled={uploading}
                        />
                        <label
                            htmlFor="ad-upload"
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold cursor-pointer ${uploading ? 'bg-neutral-700 text-neutral-500' : 'bg-yellow-500 text-black hover:bg-yellow-400'}`}
                        >
                            {uploading ? <span className="animate-spin">⏳</span> : <Upload size={20} />}
                            {uploading ? 'Uploading...' : 'Upload Banner'}
                        </label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map((ad) => (
                    <div key={ad.id} className={`relative group rounded-xl overflow-hidden border ${ad.active ? 'border-neutral-700' : 'border-red-900 opacity-50'}`}>
                        <div className="aspect-video relative">
                            <Image
                                src={ad.imageUrl || ad.image_url}
                                alt={ad.title}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button
                                    onClick={() => toggleActive(ad.id, ad.active)}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm ${ad.active ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                                >
                                    {ad.active ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                    onClick={() => deleteAd(ad.id, ad.imageUrl || ad.image_url)}
                                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-neutral-900">
                            <h3 className="font-bold text-white">{ad.title}</h3>
                            <p className="text-xs text-neutral-500 mt-1">Status: {ad.active ? 'Active' : 'Inactive'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {ads.length === 0 && !loading && (
                <div className="text-center py-20 text-neutral-500">
                    No advertisements found. Upload one to get started!
                </div>
            )}
        </div>
    );
}
