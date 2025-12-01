'use client';

import { useEffect, useState } from 'react';
import { getAddresses, addAddress, deleteAddress, updateAddress, Address } from '@/lib/firestore';
import { Plus, Trash2, Edit, MapPin, Check, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AddressesPage() {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        label: 'Home',
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: 'Tamil Nadu',
        pincode: '',
        landmark: '',
        is_default: false,
    });

    useEffect(() => {
        if (user) {
            loadAddresses();
        }
    }, [user]);

    const loadAddresses = async () => {
        try {
            const data = await getAddresses();
            setAddresses(data);
        } catch (error) {
            console.error('Error loading addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this address?')) {
            await deleteAddress(id);
            loadAddresses();
        }
    };

    const handleEdit = (address: Address) => {
        setEditingId(address.id);
        setFormData({
            label: address.label,
            full_name: address.full_name,
            phone: address.phone,
            address_line1: address.address_line1,
            address_line2: address.address_line2 || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            landmark: address.landmark || '',
            is_default: address.is_default,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateAddress(editingId, formData);
            } else {
                await addAddress(formData);
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({
                label: 'Home',
                full_name: '',
                phone: '',
                address_line1: '',
                address_line2: '',
                city: '',
                state: 'Tamil Nadu',
                pincode: '',
                landmark: '',
                is_default: false,
            });
            loadAddresses();
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Failed to save address: ' + (error as Error).message);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>;

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        My Addresses
                    </h1>
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                label: 'Home',
                                full_name: '',
                                phone: '',
                                address_line1: '',
                                address_line2: '',
                                city: '',
                                state: 'Tamil Nadu',
                                pincode: '',
                                landmark: '',
                                is_default: false,
                            });
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition"
                    >
                        <Plus size={20} />
                        Add New Address
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <div key={address.id} className={`bg-neutral-900 border rounded-xl p-6 relative group transition ${address.is_default ? 'border-yellow-500/50' : 'border-neutral-800 hover:border-neutral-700'}`}>
                            {address.is_default && (
                                <div className="absolute top-4 right-4 px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded-full">
                                    Default
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-neutral-800 rounded-lg text-neutral-400">
                                    <MapPin size={20} />
                                </div>
                                <span className="font-bold text-lg">{address.label}</span>
                            </div>

                            <div className="space-y-1 text-neutral-400 text-sm mb-6">
                                <p className="text-white font-medium">{address.full_name}</p>
                                <p>{address.address_line1}</p>
                                {address.address_line2 && <p>{address.address_line2}</p>}
                                <p>{address.city}, {address.state} - {address.pincode}</p>
                                <p>Phone: {address.phone}</p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(address)}
                                    className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(address.id)}
                                    className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Address' : 'Add New Address'}</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-400 mb-1">Label</label>
                                        <select
                                            name="label"
                                            value={formData.label}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                        >
                                            <option value="Home">Home</option>
                                            <option value="Work">Work</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-400 mb-1">Full Name</label>
                                        <input
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Phone Number</label>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Address Line 1</label>
                                    <input
                                        name="address_line1"
                                        value={formData.address_line1}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Address Line 2 (Optional)</label>
                                    <input
                                        name="address_line2"
                                        value={formData.address_line2}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-400 mb-1">City</label>
                                        <input
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-400 mb-1">Pincode</label>
                                        <input
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, is_default: !prev.is_default }))}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.is_default ? 'bg-yellow-500 border-yellow-500' : 'border-neutral-600'}`}>
                                        {formData.is_default && <Check size={14} className="text-black" />}
                                    </div>
                                    <span className="text-sm font-medium select-none">Set as default address</span>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition mt-4"
                                >
                                    {editingId ? 'Update Address' : 'Save Address'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
