'use client';

import Navbar from '@/components/Navbar';
import BannerCarousel from '@/components/BannerCarousel';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Star, TrendingUp, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getBanners } from '@/lib/firestore';
import { Banner } from '@/types';

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-neutral-950 text-white overflow-hidden">
      <Navbar />

      {/* Hero Section / Banner Carousel */}
      {loading ? (
        <div className="h-[60vh] md:h-[80vh] flex items-center justify-center bg-neutral-900">
          <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : banners.length > 0 ? (
        <BannerCarousel banners={banners} />
      ) : (
        <section className="relative min-h-screen flex items-center justify-center pt-20">
          {/* Fallback Hero if no banners */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8 inline-block"
            >
              <div className="w-32 h-32 mx-auto mb-6 rounded-3xl glass-dark p-2 border border-white/10 shadow-2xl shadow-yellow-500/20">
                <img src="/logo.png" alt="Bright Store Logo" className="w-full h-full object-cover rounded-2xl" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent"
            >
              Premium Quality, <br />
              <span className="text-gradient">Unbeatable Prices</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto"
            >
              Experience the finest selection of products with our new weight-based pricing.
              Quality you can trust, delivered to your doorstep.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/shop" className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-bold rounded-full hover:opacity-90 transition transform hover:scale-105 shadow-lg shadow-yellow-500/25">
                Shop Now
              </Link>
              <Link href="/about" className="px-8 py-4 glass text-white font-bold rounded-full hover:bg-white/20 transition transform hover:scale-105">
                Learn More
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Premium Quality", desc: "Sourced from the best suppliers", icon: "✨" },
              { title: "Weight-Based", desc: "Pay exactly for what you need", icon: "⚖️" },
              { title: "Fast Delivery", desc: "Right to your doorstep", icon: "🚚" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass-dark p-8 rounded-2xl text-center hover:border-yellow-500/30 transition duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-neutral-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Priya S.", text: "The quality of dry fruits is amazing. Packaging was excellent!", rating: 5 },
              { name: "Rahul K.", text: "Love the new weight-based pricing. Very transparent and fair.", rating: 5 },
              { name: "Anita M.", text: "Fast delivery to Kovilambakkam. Will order again!", rating: 4 }
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass p-6 rounded-xl border border-white/5"
              >
                <div className="flex gap-1 text-yellow-500 mb-4">
                  {[...Array(review.rating)].map((_, j) => <span key={j}>★</span>)}
                </div>
                <p className="text-neutral-300 mb-4">"{review.text}"</p>
                <p className="font-bold text-white">- {review.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: "Do you deliver all over Chennai?", a: "Yes, we deliver to most areas in Chennai. Check our shipping policy for details." },
              { q: "Can I buy in small quantities?", a: "Absolutely! Our weight-based pricing allows you to buy exactly what you need." },
              { q: "How do I pay?", a: "You can place orders via WhatsApp and pay via UPI or Cash on Delivery." }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-dark p-6 rounded-xl"
              >
                <h3 className="text-lg font-bold text-yellow-500 mb-2">{faq.q}</h3>
                <p className="text-neutral-400">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-8 bg-neutral-900 rounded-2xl border border-neutral-800 hover:border-yellow-500/30 transition"
    >
      <div className="mb-4 p-3 bg-yellow-500/10 w-fit rounded-xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-neutral-400">{description}</p>
    </motion.div>
  );
}
