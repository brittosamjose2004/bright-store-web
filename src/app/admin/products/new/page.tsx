'use client';

import { useState } from 'react';
import { addProduct, uploadImage } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        wholesalePrice: '',
        category: '',
        minWholesaleQuantity: '10',
        stock_quantity: '0',
        inStock: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = '';
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            await addProduct({
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                wholesalePrice: Number(formData.wholesalePrice),
                category: formData.category,
                minWholesaleQuantity: Number(formData.minWholesaleQuantity),
                stock_quantity: Number(formData.stock_quantity),
                imageUrl,
                createdAt: new Date().toISOString(),
            });

            router.push('/admin/products');
        } catch (error: any) {
            console.error('Error adding product:', error);
            alert(`Failed to add product: ${error.message || error.error_description || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 min-h-screen bg-neutral-950 text-white">
            <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Add New Product
            </h1>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Product Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                        >
                            <option value="">Select Category</option>
                            <option value="electronics">Electronics</option>
                            <option value="fashion">Fashion</option>
                            <option value="home">Home</option>
                            <option value="beauty">Beauty</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Retail Price (₹ per kg)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Wholesale Price (₹ per kg)</label>
                        <input
                            type="number"
                            name="wholesalePrice"
                            value={formData.wholesalePrice}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Min Wholesale Qty (kg)</label>
                        <input
                            type="number"
                            name="minWholesaleQuantity"
                            value={formData.minWholesaleQuantity}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Stock Quantity</label>
                        <input
                            type="number"
                            name="stock_quantity"
                            value={formData.stock_quantity}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Product Image</label>
                    <div className="border-2 border-dashed border-neutral-800 rounded-xl p-8 text-center hover:border-yellow-500/50 transition cursor-pointer relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2 text-neutral-400">
                            <Upload size={32} />
                            <span>{imageFile ? imageFile.name : 'Click to upload image'}</span>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                    {loading ? 'Adding Product...' : 'Add Product'}
                </button>
            </form>
        </div>
    );
}
