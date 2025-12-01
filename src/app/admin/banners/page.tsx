'use client';

import { useEffect, useState } from 'react';
import { getBanners, addBanner, deleteBanner, uploadBannerImage } from '@/lib/firestore';
import { Banner } from '@/types';
import { Trash2, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newBanner, setNewBanner] = useState({
        title: '',
        link: '',
        imageFile: null as File | null,
    });

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        try {
            const data = await getBanners();
            setBanners(data);
        } catch (error) {
            console.error('Error loading banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewBanner({ ...newBanner, imageFile: e.target.files[0] });
        }
    };

    const handleAddBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBanner.title || !newBanner.imageFile) {
            alert('Please provide a title and an image.');
            return;
        }

        setUploading(true);
        try {
            const imageUrl = await uploadBannerImage(newBanner.imageFile);
            await addBanner({
                title: newBanner.title,
                imageUrl: imageUrl,
                link: newBanner.link,
                active: true,
                displayOrder: banners.length + 1,
            });
            setNewBanner({ title: '', link: '', imageFile: null });
            loadBanners();
        } catch (error) {
            console.error('Error adding banner:', error);
            alert('Failed to add banner.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this banner?')) {
            await deleteBanner(id);
            loadBanners();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-yellow-500">
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-neutral-950 text-white">
            <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Manage Banners
            </h1>

            {/* Add New Banner Form */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-yellow-500" /> Add New Banner
                </h2>
                <form onSubmit={handleAddBanner} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-neutral-400 mb-1">Title</label>
                            <input
                                type="text"
                                value={newBanner.title}
                                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none"
                                placeholder="Summer Sale"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-neutral-400 mb-1">Link (Optional)</label>
                            <input
                                type="text"
                                value={newBanner.link}
                                onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none"
                                placeholder="/shop"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-neutral-400 mb-1">Banner Image</label>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer bg-neutral-800 border border-neutral-700 hover:border-yellow-500 transition rounded-lg px-4 py-3 flex items-center gap-2">
                                <ImageIcon size={20} />
                                <span>{newBanner.imageFile ? newBanner.imageFile.name : 'Choose Image'}</span>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                            {newBanner.imageFile && (
                                <span className="text-sm text-green-500">Image selected</span>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={uploading}
                        className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-400 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                        {uploading ? 'Uploading...' : 'Add Banner'}
                    </button>
                </form>
            </div>

            {/* Banners List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                    <div key={banner.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden group">
                        <div className="relative aspect-video">
                            <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <button
                                    onClick={() => handleDelete(banner.id)}
                                    className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg">{banner.title}</h3>
                            {banner.link && <p className="text-sm text-neutral-500 truncate">{banner.link}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
