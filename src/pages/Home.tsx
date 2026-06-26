import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Truck, RotateCcw, Award, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import SectionTitle from '@/components/SectionTitle';
import SEO from '@/components/SEO';
import type { Product, Banner, Testimonial } from '@/types';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [
        { data: featuredData },
        { data: bestData },
        { data: newData },
        { data: bannerData },
        { data: testimonialData },
      ] = await Promise.all([
        supabase.from('products').select('*').eq('featured', true).limit(4),
        supabase.from('products').select('*').eq('best_seller', true).limit(4),
        supabase.from('products').select('*').eq('new_arrival', true).limit(4),
        supabase.from('banners').select('*').eq('active', true).order('order', { ascending: true }),
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
      ]);
      setFeatured(featuredData ?? []);
      setBestSellers(bestData ?? []);
      setNewArrivals(newData ?? []);
      setBanners(bannerData ?? []);
      setTestimonials(testimonialData ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <SEO />
      {/* Hero */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === currentBanner ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-navy/50 z-10" />
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div className="relative z-20 h-full flex items-center section-padding">
          <div className="max-w-2xl">
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {banners[currentBanner] && (
                <>
                  <span className="text-gold text-xs uppercase tracking-[0.3em] mb-4 block">
                    Aura & Anchor Collections
                  </span>
                  <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
                    {banners[currentBanner].title}
                  </h1>
                  <p className="text-white/80 text-lg mb-8 max-w-lg leading-relaxed">
                    {banners[currentBanner].subtitle}
                  </p>
                  <div className="flex gap-4">
                    <Link
                      to={banners[currentBanner].link ?? '/shop'}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      Shop Now <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link to="/shop" className="btn-outline inline-flex items-center gap-2">
                      Explore Collection
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
        {/* Banner Controls */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevBanner}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-navy transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextBanner}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-navy transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentBanner(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentBanner ? 'bg-gold w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Trust Badges */}
      <section className="bg-navy py-12">
        <div className="section-padding grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Shield, title: 'Authentic Guarantee', desc: '100% genuine timepieces' },
            { icon: Truck, title: 'Free Shipping', desc: 'Across East Africa' },
            { icon: RotateCcw, title: '30-Day Returns', desc: 'Hassle-free exchanges' },
            { icon: Award, title: '2-Year Warranty', desc: 'On all watches' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4"
            >
              <item.icon className="w-8 h-8 text-gold shrink-0" />
              <div>
                <h4 className="text-white font-medium text-sm">{item.title}</h4>
                <p className="text-white/50 text-xs">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 section-padding">
        <SectionTitle title="Featured Timepieces" subtitle="Curated Selection" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/shop" className="btn-outline inline-flex items-center gap-2">
            View All Watches <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Brand Story Banner */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-navy" />
        <div className="relative z-10 section-padding flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <img
              src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800"
              alt="Craftsmanship"
              className="w-full aspect-[4/3] object-cover shadow-2xl"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <span className="text-gold text-xs uppercase tracking-[0.3em] mb-4 block">Our Heritage</span>
            <h2 className="font-serif text-3xl lg:text-4xl text-white mb-6">
              Crafted for Those Who Appreciate Time
            </h2>
            <p className="text-white/70 leading-relaxed mb-6">
              At Aura & Anchor Collections, we believe a watch is more than a timekeeping device — it is a statement of character, 
              a companion through life&apos;s moments, and an heirloom for generations. Our curated selection brings the world&apos;s finest 
              timepieces to East Africa, backed by our commitment to authenticity and excellence.
            </p>
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { value: '500+', label: 'Watches Sold' },
                { value: '50+', label: 'Brands' },
                { value: '5', label: 'Countries Served' },
              ].map((stat) => (
                <div key={stat.label}>
                  <span className="font-serif text-2xl text-gold">{stat.value}</span>
                  <p className="text-white/50 text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <Link to="/about" className="btn-primary inline-flex items-center gap-2">
              Our Story <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 section-padding bg-white">
        <SectionTitle title="Best Sellers" subtitle="Customer Favorites" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 section-padding">
        <SectionTitle title="New Arrivals" subtitle="Just In" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-20 section-padding">
        <SectionTitle title="Shop by Collection" subtitle="Browse Categories" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Chronograph', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600', count: 12 },
            { name: 'Diver', image: 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=600', count: 8 },
            { name: 'Dress', image: 'https://images.unsplash.com/photo-1547996663-b0f255ffb89d?w=600', count: 15 },
          ].map((collection, i) => (
            <motion.div
              key={collection.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Link to={`/shop?category=${collection.name}`} className="group relative block overflow-hidden aspect-[3/4]">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-navy/40 group-hover:bg-navy/60 transition-all duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h3 className="font-serif text-2xl mb-2">{collection.name}</h3>
                  <span className="text-xs uppercase tracking-wider opacity-80">{collection.count} Watches</span>
                  <span className="mt-4 w-10 h-[1px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 section-padding bg-white">
        <SectionTitle title="What Our Clients Say" subtitle="Testimonials" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-pearl p-8 relative"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${j < t.rating ? 'text-gold fill-gold' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-navy/80 text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.comment}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-white font-serif text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-navy text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Instagram / Gallery */}
      <section className="py-20 section-padding">
        <SectionTitle title="Follow Our Journey" subtitle="@auraandanchor" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
            'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400',
            'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=400',
            'https://images.unsplash.com/photo-1547996663-b0f255ffb89d?w=400',
            'https://images.unsplash.com/photo-1507679799987-c73729787bd1?w=400',
            'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400',
          ].map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="aspect-square overflow-hidden group"
            >
              <img
                src={src}
                alt={`Gallery ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
