'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Mail, Phone, MapPin, User } from 'lucide-react';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name', { ascending: true });

            if (error) {
                console.error('Supabase error fetching customers:', error);
            }
            setCustomers(data || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone?.includes(search) ||
        customer.city?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 hover:bg-neutral-900 rounded-lg transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Customers</h1>
                        <p className="text-neutral-400">View and manage your customer base</p>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-8 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search customers by name, phone, or city..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-yellow-500 transition"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Customers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCustomers.map((customer) => (
                        <div key={customer.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-yellow-500 font-bold text-xl border border-neutral-700">
                                    {customer.full_name?.[0]?.toUpperCase() || <User size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{customer.full_name || 'Unnamed User'}</h3>
                                    <p className="text-neutral-500 text-sm">Customer ID: {customer.id.slice(0, 6)}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {customer.phone && (
                                    <div className="flex items-center gap-3 text-neutral-400">
                                        <Phone size={16} className="text-neutral-600" />
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                {customer.city && (
                                    <div className="flex items-start gap-3 text-neutral-400">
                                        <MapPin size={16} className="text-neutral-600 mt-1" />
                                        <span className="flex-1">
                                            {customer.address_line1}, {customer.city} - {customer.pincode}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {filteredCustomers.length === 0 && (
                        <div className="col-span-full text-center py-20 text-neutral-500">
                            <p>No customers found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
