'use client';

import { useState } from 'react';
import { addProduct, uploadImage } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { Variant, VariantOption } from '@/types';

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
    });

    const [variants, setVariants] = useState<Variant[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    // Variant Management functions
    const addVariant = () => {
        setVariants([...variants, { name: '', options: [{ label: '', priceModifier: 0 }] }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariantName = (index: number, name: string) => {
        const newVariants = [...variants];
        newVariants[index].name = name;
        setVariants(newVariants);
    };

    const addOption = (variantIndex: number) => {
        const newVariants = [...variants];
        newVariants[variantIndex].options.push({ label: '', priceModifier: 0 });
        setVariants(newVariants);
    };

    const removeOption = (variantIndex: number, optionIndex: number) => {
        const newVariants = [...variants];
        newVariants[variantIndex].options = newVariants[variantIndex].options.filter((_, i) => i !== optionIndex);
        setVariants(newVariants);
    };

    const updateOption = (variantIndex: number, optionIndex: number, field: keyof VariantOption, value: string | number) => {
        const newVariants = [...variants];
        if (field === 'priceModifier') {
            newVariants[variantIndex].options[optionIndex].priceModifier = Number(value);
        } else {
            newVariants[variantIndex].options[optionIndex].label = String(value);
        }
        setVariants(newVariants);
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
                variants: variants.filter(v => v.name.trim() !== ''),
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
                            <option value="grocery">Grocery (Weight Based)</option>
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
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Retail Price (₹)</label>
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
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Wholesale Price (₹)</label>
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
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Min Wholesale Qty</label>
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

                {/* Variants Section */}
                <div className="border border-neutral-800 p-6 rounded-xl bg-neutral-900/50">
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-lg font-bold text-white">Product Variants / Addons</label>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-sm flex items-center gap-1"
                        >
                            <Plus size={16} /> Add Variant Group
                        </button>
                    </div>

                    {variants.map((variant, vIndex) => (
                        <div key={vIndex} className="mb-6 p-4 bg-black/40 rounded-lg border border-neutral-800">
                            <div className="flex gap-4 mb-3">
                                <input
                                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded p-2 text-sm"
                                    placeholder="Variant Name (e.g. Size, Color)"
                                    value={variant.name}
                                    onChange={(e) => updateVariantName(vIndex, e.target.value)}
                                />
                                <button type="button" onClick={() => removeVariant(vIndex)} className="text-red-500 p-2 hover:bg-neutral-800 rounded">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="space-y-2 pl-4 border-l-2 border-neutral-800">
                                {variant.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex gap-2 items-center">
                                        <input
                                            className="flex-1 bg-neutral-900 border border-neutral-800 rounded p-2 text-xs"
                                            placeholder="Option Label (e.g. Small)"
                                            value={opt.label}
                                            onChange={(e) => updateOption(vIndex, oIndex, 'label', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            className="w-24 bg-neutral-900 border border-neutral-800 rounded p-2 text-xs"
                                            placeholder="Price (+/-)"
                                            value={opt.priceModifier}
                                            onChange={(e) => updateOption(vIndex, oIndex, 'priceModifier', e.target.value)}
                                        />
                                        <button type="button" onClick={() => removeOption(vIndex, oIndex)} className="text-neutral-500 hover:text-red-500">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addOption(vIndex)} className="text-xs text-yellow-500 hover:underline mt-2">
                                    + Add Option
                                </button>
                            </div>
                        </div>
                    ))}
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
