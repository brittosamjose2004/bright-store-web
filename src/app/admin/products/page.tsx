'use client';

import { useEffect, useState, useRef } from 'react';
import { getProducts, deleteProduct } from '@/lib/firestore';
import { Product } from '@/types';
import Link from 'next/link';
import { Plus, Trash2, Edit, Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const data = await getProducts();
        setProducts(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(id);
            loadProducts();
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadStatus(null);

        try {
            const text = await file.text();
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            const newProducts = [];

            // Expected headers: name, description, price, wholesale_price, category, image_url
            // We'll try to map based on index or header name

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;

                // Handle CSV parsing properly (respecting quotes is hard with simple split, assuming simple CSV for now)
                const values = lines[i].split(',').map(v => v.trim());

                if (values.length < 3) continue; // Skip invalid lines

                const product = {
                    name: values[headers.indexOf('name')] || values[0],
                    description: values[headers.indexOf('description')] || values[1] || '',
                    price: parseFloat(values[headers.indexOf('price')] || values[2] || '0'),
                    wholesalePrice: parseFloat(values[headers.indexOf('wholesale_price')] || values[3] || '0'),
                    category: values[headers.indexOf('category')] || values[4] || 'General',
                    imageUrl: values[headers.indexOf('image_url')] || values[5] || '',
                    unit: 'kg', // Default unit
                    inStock: true
                };

                newProducts.push(product);
            }

            if (newProducts.length === 0) {
                throw new Error('No valid products found in CSV');
            }

            const { error } = await supabase.from('products').insert(newProducts);

            if (error) throw error;

            setUploadStatus({ type: 'success', message: `Successfully imported ${newProducts.length} products!` });
            loadProducts();

            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = '';

        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadStatus({ type: 'error', message: error.message || 'Failed to upload products' });
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="p-8 min-h-screen bg-neutral-950 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        Products
                    </h1>
                    <p className="text-neutral-400 text-sm mt-1">Manage your inventory</p>
                </div>

                <div className="flex gap-3">
                    <div className="relative">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                            ref={fileInputRef}
                            disabled={isUploading}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-200 font-medium rounded-lg hover:bg-neutral-700 transition border border-neutral-700 disabled:opacity-50"
                        >
                            {isUploading ? (
                                <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Upload size={20} />
                            )}
                            Import CSV
                        </button>
                    </div>

                    <Link
                        href="/admin/products/new"
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition"
                    >
                        <Plus size={20} />
                        Add Product
                    </Link>
                </div>
            </div>

            {uploadStatus && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${uploadStatus.type === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    {uploadStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p>{uploadStatus.message}</p>
                    <button onClick={() => setUploadStatus(null)} className="ml-auto hover:opacity-70">
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden group hover:border-neutral-700 transition">
                        <div className="aspect-video bg-neutral-800 relative overflow-hidden">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-700">
                                    <FileText size={48} />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs font-medium text-white">
                                {product.category}
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                            <p className="text-neutral-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                                {product.description || 'No description'}
                            </p>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <span className="text-yellow-500 font-bold text-lg">₹{product.price}</span>
                                    <span className="text-neutral-500 text-sm ml-1">/ kg</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs text-neutral-500">Wholesale</span>
                                    <span className="text-sm font-medium text-neutral-300">₹{product.wholesalePrice}</span>
                                </div>
                            </div>

                            {/* Stock Display */}
                            <div className="flex items-center justify-between mb-4 bg-neutral-800/50 p-2 rounded-lg">
                                <div className="flex flex-col">
                                    <span className={`text-sm font-medium ${(product.stock_quantity || 0) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {(product.stock_quantity || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                    <span className="text-xs text-neutral-400">
                                        Qty: {product.stock_quantity || 0}
                                    </span>
                                </div>
                                {(product.stock_quantity || 0) < 5 && (product.stock_quantity || 0) > 0 && (
                                    <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded">
                                        Low Stock
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition text-sm font-medium"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 rounded-lg transition text-sm font-medium">
                                    <Edit size={16} />
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
