import { getProductById, getRelatedProducts } from '@/lib/firestore';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductDetailsClient from './ProductDetailsClient';
import ReviewSection from '@/components/ReviewSection';

export const runtime = 'edge';

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
                <Link href="/shop" className="text-yellow-500 hover:text-yellow-400">Back to Shop</Link>
            </div>
        );
    }

    const relatedProducts = await getRelatedProducts(product.category, product.id);

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                <Link href="/shop" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition">
                    <ArrowLeft size={20} />
                    Back to Shop
                </Link>

                <ProductDetailsClient product={product} />

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <section className="mb-24">
                        <h2 className="text-2xl font-bold mb-8">Related Products</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((related) => (
                                <Link href={`/shop/${related.id}`} key={related.id} className="group">
                                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden hover:border-yellow-500/30 transition">
                                        <div className="aspect-square overflow-hidden">
                                            <img
                                                src={related.imageUrl}
                                                alt={related.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg mb-1 group-hover:text-yellow-500 transition">{related.name}</h3>
                                            <p className="text-neutral-400 text-sm mb-3 line-clamp-2">{related.description}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-yellow-500">₹{related.price}</span>
                                                <span className="text-xs text-neutral-500 uppercase">{related.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Reviews Section */}
                <ReviewSection productId={product.id} />
            </div>
        </main>
    );
}
