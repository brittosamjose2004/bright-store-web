'use client';

import { useState } from 'react';
import { bulkAddProducts, uploadImage } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import { Plus, Save, Trash2, ArrowLeft, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types';
import Image from 'next/image';

// Simple types for the grid
type GridRow = {
    id: string; // temp id for key
    name: string;
    category: string;
    price: string;
    wholesalePrice: string;
    stock: string;
    minWholesale: string;
    description: string;
    imageFile: File | null;
    previewUrl: string | null;
};

export default function BulkProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<GridRow[]>([
        { id: '1', name: '', category: 'grocery', price: '', wholesalePrice: '', stock: '100', minWholesale: '5', description: '', imageFile: null, previewUrl: null }
    ]);

    const addRow = () => {
        setRows([...rows, {
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            category: 'grocery',
            price: '',
            wholesalePrice: '',
            stock: '100',
            minWholesale: '5',
            description: '',
            imageFile: null,
            previewUrl: null
        }]);
    };

    const removeRow = (id: string) => {
        if (rows.length > 1) {
            setRows(rows.filter(r => r.id !== id));
        }
    };

    const updateRow = (id: string, field: keyof GridRow, value: string) => {
        setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleImageChange = (id: string, file: File) => {
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setRows(rows.map(r => r.id === id ? { ...r, imageFile: file, previewUrl } : r));
        }
    };

    const handleSave = async () => {
        // Validation
        const validRows = rows.filter(r => r.name.trim() !== '' && r.price !== '');
        if (validRows.length === 0) {
            alert('Please fill in at least one product completely.');
            return;
        }

        if (!confirm(`Ready to add ${validRows.length} products?`)) return;

        setLoading(true);
        try {
            // Upload images first
            const productsWithImages = await Promise.all(validRows.map(async (row) => {
                let imageUrl = '';
                if (row.imageFile) {
                    try {
                        imageUrl = await uploadImage(row.imageFile);
                    } catch (err) {
                        console.error(`Failed to upload image for ${row.name}`, err);
                        // Continue without image or handle error? For bulk, maybe warning is better.
                    }
                }

                return {
                    name: row.name,
                    description: row.description,
                    price: Number(row.price),
                    wholesalePrice: Number(row.wholesalePrice || row.price), // fallback to retail if empty
                    category: row.category,
                    minWholesaleQuantity: Number(row.minWholesale),
                    stock_quantity: Number(row.stock),
                    imageUrl: imageUrl,
                    variants: [],
                } as Omit<Product, 'id' | 'createdAt'>;
            }));

            // @ts-ignore - createdAt is handled in backend/wrapper
            await bulkAddProducts(productsWithImages);

            alert('Products Added Successfully!');
            router.push('/admin/products');
        } catch (error: any) {
            console.error(error);
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 min-h-screen bg-neutral-950 text-white">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 bg-neutral-900 rounded-full hover:bg-neutral-800">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        Bulk Product Entry
                    </h1>
                </div>
                <div className="flex gap-4">
                    <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700">
                        <Plus size={20} /> Add Row
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50"
                    >
                        {loading ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : <><Save size={20} /> Save All</>}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto border border-neutral-800 rounded-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-neutral-900 text-sm text-neutral-400 border-b border-neutral-800">
                            <th className="p-4 w-12">#</th>
                            <th className="p-4 w-20">Image</th>
                            <th className="p-4 w-1/4">Name</th>
                            <th className="p-4 w-1/6">Category</th>
                            <th className="p-4 w-24">Price (₹)</th>
                            <th className="p-4 w-24">Wholesale</th>
                            <th className="p-4 w-24">Stock</th>
                            <th className="p-4 w-1/4">Description</th>
                            <th className="p-4 w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 bg-neutral-900/50">
                        {rows.map((row, index) => (
                            <tr key={row.id} className="hover:bg-neutral-900 transition group">
                                <td className="p-4 text-neutral-500">{index + 1}</td>
                                <td className="p-2">
                                    <div className="relative w-12 h-12 bg-neutral-800 rounded overflow-hidden flex items-center justify-center cursor-pointer group/image">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) handleImageChange(row.id, e.target.files[0]);
                                            }}
                                        />
                                        {row.previewUrl ? (
                                            <Image
                                                src={row.previewUrl}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <Upload size={16} className="text-neutral-500" />
                                        )}
                                    </div>
                                </td>
                                <td className="p-2">
                                    <input
                                        className="w-full bg-transparent border border-transparent hover:border-neutral-700 focus:border-yellow-500 rounded p-2 outline-none"
                                        placeholder="Product Name"
                                        value={row.name}
                                        onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                                        autoFocus={index === rows.length - 1 && index > 0}
                                    />
                                </td>
                                <td className="p-2">
                                    <select
                                        className="w-full bg-transparent border border-transparent hover:border-neutral-700 focus:border-yellow-500 rounded p-2 outline-none"
                                        value={row.category}
                                        onChange={(e) => updateRow(row.id, 'category', e.target.value)}
                                    >
                                        <option value="grocery">Grocery</option>
                                        <option value="electronics">Electronics</option>
                                        <option value="fashion">Fashion</option>
                                        <option value="home">Home</option>
                                        <option value="beauty">Beauty</option>
                                    </select>
                                </td>
                                <td className="p-2">
                                    <input
                                        type="number"
                                        className="w-full bg-transparent border border-transparent hover:border-neutral-700 focus:border-yellow-500 rounded p-2 outline-none"
                                        placeholder="0"
                                        value={row.price}
                                        onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        type="number"
                                        className="w-full bg-transparent border border-transparent hover:border-neutral-700 focus:border-yellow-500 rounded p-2 outline-none"
                                        placeholder="0"
                                        value={row.wholesalePrice}
                                        onChange={(e) => updateRow(row.id, 'wholesalePrice', e.target.value)}
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        type="number"
                                        className="w-full bg-transparent border border-transparent hover:border-neutral-700 focus:border-yellow-500 rounded p-2 outline-none"
                                        placeholder="Qty"
                                        value={row.stock}
                                        onChange={(e) => updateRow(row.id, 'stock', e.target.value)}
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        className="w-full bg-transparent border border-transparent hover:border-neutral-700 focus:border-yellow-500 rounded p-2 outline-none"
                                        placeholder="Short description..."
                                        value={row.description}
                                        onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                                    />
                                </td>
                                <td className="p-2 text-center">
                                    <button
                                        onClick={() => removeRow(row.id)}
                                        className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                        tabIndex={-1}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-center">
                <button onClick={addRow} className="px-4 py-4 text-neutral-500 hover:text-white w-full border-2 border-dashed border-neutral-800 hover:border-neutral-700 rounded-xl transition">
                    + Add Another Product
                </button>
            </div>
        </div>
    );
}
