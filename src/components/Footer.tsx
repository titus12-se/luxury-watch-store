import { Link } from 'react-router-dom';
import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/components/ui/Toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email', 'error');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.toLowerCase() });
    setLoading(false);
    if (error) {
      if (error.message.includes('duplicate')) {
        showToast('You are already subscribed!', 'error');
      } else {
        showToast(error.message, 'error');
      }
    } else {
      showToast('Welcome to the Inner Circle!', 'success');
      setEmail('');
    }
  };

  return (
    <footer className="bg-navy text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="section-padding py-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h3 className="font-serif text-2xl lg:text-3xl mb-2">Join the Inner Circle</h3>
            <p className="text-white/60 text-sm">Be the first to know about new arrivals, exclusive offers, and horological insights.</p>
          </div>
          <form className="flex w-full max-w-md" onSubmit={handleSubscribe}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 bg-white/10 border border-white/20 px-5 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-gold"
            />
            <button type="submit" disabled={loading} className="bg-gold text-navy px-6 py-3 font-medium hover:bg-gold-300 transition-colors disabled:opacity-50">
              {loading ? '...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/images/logo/WhatsApp_Image_2026-06-23_at_10.06.58_PM.jpeg"
                alt="Aura & Anchor"
                className="h-12 w-auto object-contain"
              />
              <div>
                <span className="font-serif text-lg font-semibold">Aura & Anchor</span>
                <span className="block text-[9px] uppercase tracking-[0.2em] text-gold">Collections</span>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Timeless elegance on every wrist. Curating the finest timepieces for discerning collectors across East Africa since 2020.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-navy transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-navy transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-navy transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg mb-6 text-gold">Explore</h4>
            <ul className="space-y-3">
              {[
                { label: 'Shop All Watches', href: '/shop' },
                { label: 'New Arrivals', href: '/shop?filter=new' },
                { label: 'Best Sellers', href: '/shop?filter=best' },
                { label: 'Featured', href: '/shop?filter=featured' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-white/60 hover:text-gold transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-serif text-lg mb-6 text-gold">Customer Service</h4>
            <ul className="space-y-3">
              {[
                { label: 'Track Your Order', href: '/track-order' },
                { label: 'Shipping & Delivery', href: '/shipping' },
                { label: 'Returns & Exchanges', href: '/returns' },
                { label: 'Warranty Information', href: '/warranty' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Size Guide', href: '/size-guide' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-white/60 hover:text-gold transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg mb-6 text-gold">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span className="text-white/60 text-sm">Plot 42, Kampala Road, Kampala, Uganda</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <a href="tel:+256708018549" className="text-white/60 hover:text-gold transition-colors text-sm">
                  +256 708 018549
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <a href="mailto:auraanchorcollections@gmail.com" className="text-white/60 hover:text-gold transition-colors text-sm">
                  auraanchorcollections@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gold shrink-0" />
                <span className="text-white/60 text-sm">Mon - Sat: 9:00 AM - 6:00 PM</span>
              </li>
            </ul>
            <a
              href="https://wa.me/256708018549"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 text-sm hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="section-padding py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} Aura & Anchor Collections. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-white/40 hover:text-white text-xs transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-white/40 hover:text-white text-xs transition-colors">Terms of Service</Link>
            <Link to="/shipping" className="text-white/40 hover:text-white text-xs transition-colors">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
