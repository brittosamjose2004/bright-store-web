import { supabase } from './supabase';
import { Product, Offer, Banner } from '@/types';

// Products
export async function getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        wholesalePrice: item.wholesaleprice, // Map from DB
        category: item.category,
        imageUrl: item.imageurl, // Map from DB
        stock_quantity: item.stock_quantity, // Added
        minWholesaleQuantity: item.minwholesalequantity, // Map from DB
        createdAt: item.created_at,
    })) as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;

    return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        wholesalePrice: data.wholesaleprice,
        category: data.category,
        imageUrl: data.imageurl,
        stock_quantity: data.stock_quantity, // Added
        minWholesaleQuantity: data.minwholesalequantity,
        createdAt: data.created_at,
    } as Product;
}

export async function addProduct(product: Omit<Product, 'id'>) {
    const dbProduct = {
        name: product.name,
        description: product.description,
        price: product.price,
        wholesaleprice: product.wholesalePrice, // Map to lowercase
        category: product.category,
        imageurl: product.imageUrl, // Map to lowercase
        stock_quantity: product.stock_quantity || 0, // Added
        minwholesalequantity: product.minWholesaleQuantity, // Map to lowercase
        created_at: new Date().toISOString(), // Map to snake_case
    };

    const { error } = await supabase
        .from('products')
        .insert([dbProduct]);

    if (error) {
        console.error('Supabase Error:', error);
        throw error;
    }
}

export async function updateProduct(id: string, product: Partial<Product>) {
    const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id);

    if (error) throw error;
}

export async function deleteProduct(id: string) {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function decrementStock(productId: string, quantity: number) {
    // 1. Get current stock
    const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();

    if (fetchError) throw fetchError;

    const currentStock = product.stock_quantity || 0;
    const newStock = Math.max(0, currentStock - quantity);

    // 2. Update stock
    const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', productId);

    if (updateError) throw updateError;
}

// Offers
export async function getOffers(): Promise<Offer[]> {
    const { data, error } = await supabase
        .from('offers')
        .select('*');

    if (error) throw error;

    return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        code: item.code,
        discountPercentage: item.discountpercentage, // Map from DB
        active: item.active,
    })) as Offer[];
}

export async function addOffer(offer: Omit<Offer, 'id'>) {
    const { error } = await supabase
        .from('offers')
        .insert([offer]);

    if (error) throw error;
}

export async function deleteOffer(id: string) {
    const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// Storage
export async function uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

// Reviews
export async function getReviews(productId: string) {
    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            profiles:user_id (
                full_name
            )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function addReview(review: { product_id: string; user_id: string; rating: number; comment: string }) {
    const { error } = await supabase
        .from('reviews')
        .insert([review]);

    if (error) throw error;
}

// Orders
export async function getRelatedProducts(category: string, currentProductId: string): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .neq('id', currentProductId)
        .limit(4);

    if (error) throw error;
    return data;
}

export async function getUserOrders(userId: string) {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getOrderById(orderId: string) {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (error) throw error;
    return data;
}

export async function updateOrderStatus(orderId: string, status: string) {
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

    if (error) throw error;
}

// Banners
export async function getBanners(): Promise<Banner[]> {
    const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });

    if (error) throw error;

    return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.image_url,
        link: item.link,
        active: item.active,
        displayOrder: item.display_order,
    })) as Banner[];
}

export async function addBanner(banner: Omit<Banner, 'id'>) {
    const dbBanner = {
        title: banner.title,
        image_url: banner.imageUrl,
        link: banner.link,
        active: banner.active,
        display_order: banner.displayOrder,
    };

    const { error } = await supabase
        .from('banners')
        .insert([dbBanner]);

    if (error) throw error;
}

export async function deleteBanner(id: string) {
    const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function uploadBannerImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

// Coupons
export interface Coupon {
    id: string;
    code: string;
    discountType: 'FIXED' | 'PERCENTAGE';
    value: number;
    minOrderAmount: number;
    maxDiscountAmount?: number;
    isActive: boolean;
    usageLimit?: number;
    usedCount: number;
}

export async function getCoupons(): Promise<Coupon[]> {
    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((item: any) => ({
        id: item.id,
        code: item.code,
        discountType: item.discount_type,
        value: item.value,
        minOrderAmount: item.min_order_amount,
        maxDiscountAmount: item.max_discount_amount,
        isActive: item.is_active,
        usageLimit: item.usage_limit,
        usedCount: item.used_count,
    })) as Coupon[];
}

export async function addCoupon(coupon: Omit<Coupon, 'id' | 'usedCount'>) {
    const dbCoupon = {
        code: coupon.code.toUpperCase(),
        discount_type: coupon.discountType,
        value: coupon.value,
        min_order_amount: coupon.minOrderAmount,
        max_discount_amount: coupon.maxDiscountAmount,
        is_active: coupon.isActive,
        usage_limit: coupon.usageLimit,
    };

    const { error } = await supabase
        .from('coupons')
        .insert([dbCoupon]);

    if (error) throw error;
}

export async function deleteCoupon(id: string) {
    const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function validateCoupon(code: string, orderAmount: number): Promise<{ valid: boolean; discount: number; message?: string }> {
    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

    if (error || !data) {
        return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
    }

    if (data.usage_limit && data.used_count >= data.usage_limit) {
        return { valid: false, discount: 0, message: 'Coupon usage limit reached.' };
    }

    if (orderAmount < data.min_order_amount) {
        return { valid: false, discount: 0, message: `Minimum order amount of ₹${data.min_order_amount} required.` };
    }

    let discount = 0;
    if (data.discount_type === 'FIXED') {
        discount = data.value;
    } else {
        discount = (orderAmount * data.value) / 100;
        if (data.max_discount_amount) {
            discount = Math.min(discount, data.max_discount_amount);
        }
    }

    return { valid: true, discount, message: 'Coupon applied successfully!' };
}

// Addresses
export interface Address {
    id: string;
    user_id: string;
    label: string;
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    is_default: boolean;
}

export async function getAddresses(): Promise<Address[]> {
    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .order('is_default', { ascending: false });

    if (error) throw error;
    return data;
}

export async function addAddress(address: Omit<Address, 'id' | 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // If setting as default, unset other defaults
    if (address.is_default) {
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id);
    }

    const { error } = await supabase
        .from('addresses')
        .insert([{ ...address, user_id: user.id }]);

    if (error) throw error;
}

export async function updateAddress(id: string, address: Partial<Address>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    if (address.is_default) {
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id);
    }

    const { error } = await supabase
        .from('addresses')
        .update(address)
        .eq('id', id);

    if (error) throw error;
}

export async function deleteAddress(id: string) {
    const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
