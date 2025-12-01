'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getReviews, addReview } from '@/lib/firestore';
import { Star, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface Review {
    id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles?: {
        full_name: string;
    };
}

export default function ReviewSection({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        loadReviews();
    }, [productId]);

    const loadReviews = async () => {
        try {
            const data = await getReviews(productId);
            setReviews(data);
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            await addReview({
                product_id: productId,
                user_id: user.id,
                rating,
                comment,
            });
            setComment('');
            setRating(5);
            loadReviews(); // Reload reviews
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review');
        }
    };

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

            {/* Review Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 mb-8">
                    <h3 className="text-lg font-bold mb-4">Write a Review</h3>
                    <div className="flex gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`transition ${star <= rating ? 'text-yellow-500' : 'text-neutral-600'}`}
                            >
                                <Star fill={star <= rating ? "currentColor" : "none"} />
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white mb-4 focus:ring-2 focus:ring-yellow-500 outline-none"
                        rows={3}
                        required
                    />
                    <button
                        type="submit"
                        className="bg-yellow-500 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-400 transition"
                    >
                        Submit Review
                    </button>
                </form>
            ) : (
                <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 mb-8 text-center">
                    <p className="text-neutral-400">Please login to write a review.</p>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <p className="text-neutral-500">No reviews yet. Be the first to review!</p>
                ) : (
                    reviews.map((review) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-neutral-900 p-4 rounded-xl border border-neutral-800"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center">
                                        <User size={16} className="text-neutral-400" />
                                    </div>
                                    <span className="font-bold text-white">
                                        {review.profiles?.full_name || 'Anonymous User'}
                                    </span>
                                </div>
                                <div className="flex text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            fill={i < review.rating ? "currentColor" : "none"}
                                            className={i < review.rating ? "text-yellow-500" : "text-neutral-700"}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-neutral-300">{review.comment}</p>
                            <span className="text-xs text-neutral-500 mt-2 block">
                                {new Date(review.created_at).toLocaleDateString()}
                            </span>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
