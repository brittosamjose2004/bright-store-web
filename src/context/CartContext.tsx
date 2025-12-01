'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

export interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    checkout: () => Promise<void>;
    total: number;
    subtotal: number;
    coupon: { code: string; discount: number } | null;
    applyCoupon: (code: string) => Promise<{ success: boolean; message?: string }>;
    removeCoupon: () => void;
    isOutstation: boolean;
    deliveryRequested: boolean;
    setDeliveryRequested: (value: boolean) => void;
    selectedAddress: any;
    setSelectedAddress: (address: any) => void;
}

const CartContext = createContext<CartContextType>({
    items: [],
    addToCart: () => { },
    removeFromCart: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    checkout: async () => { },
    total: 0,
    subtotal: 0,
    coupon: null,
    applyCoupon: async () => ({ success: false }),
    removeCoupon: () => { },
    isOutstation: false,
    deliveryRequested: false,
    setDeliveryRequested: () => { },
    selectedAddress: null,
    setSelectedAddress: () => { },
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const { profile, user, session } = useAuth();

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setItems(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: Product, quantity: number = 1) => {
        setItems(current => {
            const existing = current.find(item => item.id === product.id);
            if (existing) {
                return current.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...current, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(current => current.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) return;
        setItems(current =>
            current.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => setItems([]);

    const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
    const [deliveryRequested, setDeliveryRequested] = useState(false);

    const LOCAL_PINCODES = ['600001', '600002', '600003', '600004', '600005']; // Example Chennai pincodes - Expand this list

    const isOutstation = profile?.pincode ? !LOCAL_PINCODES.includes(profile.pincode) : false;

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = Math.max(0, subtotal - (coupon?.discount || 0));

    const applyCoupon = async (code: string) => {
        const { validateCoupon } = await import('@/lib/firestore');
        const result = await validateCoupon(code, subtotal);
        if (result.valid) {
            setCoupon({ code, discount: result.discount });
            return { success: true, message: result.message };
        } else {
            setCoupon(null);
            return { success: false, message: result.message };
        }
    };

    const removeCoupon = () => setCoupon(null);

    // Re-validate coupon when cart changes
    useEffect(() => {
        if (coupon) {
            applyCoupon(coupon.code);
        }
    }, [items]);

    const [selectedAddress, setSelectedAddress] = useState<any>(null);

    const checkout = async () => {
        const phoneNumber = '918939479296';
        let message = `*New Order from Bright Store*\n\n`;

        if (profile) {
            message += `*Customer Details:*\n`;
            message += `Name: ${profile.full_name || 'N/A'}\n`;
            message += `Phone: ${profile.phone || 'N/A'}\n`;

            if (deliveryRequested && selectedAddress) {
                message += `\n*Delivery Address:*\n`;
                message += `${selectedAddress.full_name}\n`;
                message += `${selectedAddress.address_line1}\n`;
                if (selectedAddress.address_line2) message += `${selectedAddress.address_line2}\n`;
                message += `${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}\n`;
                if (selectedAddress.landmark) message += `Landmark: ${selectedAddress.landmark}\n`;
                message += `Phone: ${selectedAddress.phone}\n`;
            } else {
                message += `Address: ${profile.address_line1}, ${profile.address_line2}, ${profile.city} - ${profile.pincode}\n`;
                if (profile.landmark) message += `Landmark: ${profile.landmark}\n`;
            }

            message += `\n*Order Type:* ${deliveryRequested ? '🚚 Delivery Requested' : '🏪 Store Pickup'}\n`;

            if (deliveryRequested && isOutstation) {
                message += `⚠️ *Note:* Customer is outside local area. Extra shipping charges may apply.\n`;
            }
            message += `\n`;
        }

        message += `*Order Items:*\n`;
        items.forEach(item => {
            message += `- ${item.name} (${item.quantity} kg): ₹${item.price * item.quantity}\n`;
        });

        message += `\n*Subtotal: ₹${subtotal}*`;
        if (coupon) {
            message += `\n*Discount (${coupon.code}): -₹${coupon.discount}*`;
        }
        message += `\n*Total Amount: ₹${total}*`;

        if (deliveryRequested && isOutstation) {
            message += `\n(Plus Shipping Charges)`;
        }

        // Open WhatsApp immediately to avoid popup blockers
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');

        // Call API to save order and send email in the background
        if (profile) {
            try {
                const response = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`,
                    },
                    body: JSON.stringify({
                        items,
                        total,
                        subtotal,
                        coupon,
                        user, // Pass user object which contains email
                        profile,
                        deliveryRequested,
                        shippingAddress: deliveryRequested ? selectedAddress : null,
                    }),
                });

                if (!response.ok) {
                    console.error('Failed to process server-side checkout');
                }
            } catch (error) {
                console.error('Error calling checkout API:', error);
            }
        }
    };

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, checkout, total, subtotal, coupon, applyCoupon, removeCoupon, isOutstation, deliveryRequested, setDeliveryRequested, selectedAddress, setSelectedAddress }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
