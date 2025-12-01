import Link from 'next/link';
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-neutral-950 border-t border-white/10 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Info */}
                    <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
                            Bright Store
                        </h3>
                        <p className="text-neutral-400 mb-6">
                            Premium quality wholesale and retail products delivered to your doorstep. Experience the best in class service.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            <li><Link href="/shop" className="text-neutral-400 hover:text-yellow-500 transition">Shop Collection</Link></li>
                            <li><Link href="/about" className="text-neutral-400 hover:text-yellow-500 transition">About Us</Link></li>
                            <li><Link href="/cart" className="text-neutral-400 hover:text-yellow-500 transition">My Cart</Link></li>
                            <li><Link href="/admin/login" className="text-neutral-400 hover:text-yellow-500 transition">Admin Login</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-neutral-400">
                                <MapPin className="text-yellow-500 shrink-0 mt-1" size={20} />
                                <a
                                    href="https://maps.app.goo.gl/Wha5H3ToTf2Egaqn7"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition"
                                >
                                    46, Subhiksha Ave, Satya Nagar,<br />
                                    Lakshmi Nagar, Kovilambakkam,<br />
                                    Chennai, Tamil Nadu 600129
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-neutral-400">
                                <Phone className="text-yellow-500 shrink-0" size={20} />
                                <a href="tel:+918939479296" className="hover:text-white transition">+91 89394 79296</a>
                            </li>
                            <li className="flex items-center gap-3 text-neutral-400">
                                <Mail className="text-yellow-500 shrink-0" size={20} />
                                <a href="mailto:contact@brightstore.com" className="hover:text-white transition">contact@brightstore.com</a>
                            </li>
                        </ul>
                    </div>

                    {/* Map */}
                    <div className="h-48 rounded-xl overflow-hidden border border-white/10">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.586687848684!2d80.1906663!3d12.9342557!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525d0050800001%3A0x4000000000000000!2s46%2C%20Subhiksha%20Ave%2C%20Satya%20Nagar%2C%20Lakshmi%20Nagar%2C%20Kovilambakkam%2C%20Chennai%2C%20Tamil%20Nadu%20600129!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-neutral-500 text-sm">
                        © {new Date().getFullYear()} Bright Store. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-neutral-500 hover:text-white transition"><Instagram size={20} /></a>
                        <a href="#" className="text-neutral-500 hover:text-white transition"><Facebook size={20} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
