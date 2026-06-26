import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import SectionTitle from '@/components/SectionTitle';
import SEO from '@/components/SEO';
import type { Product } from '@/types';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState('newest');

  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('products').select('*');
      setProducts(data ?? []);
      const cats = [...new Set((data ?? []).map((p) => p.category))].sort();
      const brs = [...new Set((data ?? []).map((p) => p.brand))].sort();
      setCategories(cats);
      setBrands(brs);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'new') setSortBy('newest');
    if (filter === 'best') setSortBy('popular');
    if (filter === 'featured') {
      // will be handled in filtering
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = [...products];

    const search = searchParams.get('search') || searchQuery;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (selectedBrand) {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    result = result.filter(
      (p) => {
        const price = p.discount_price ?? p.price;
        return price >= priceRange[0] && price <= priceRange[1];
      }
    );

    const filter = searchParams.get('filter');
    if (filter === 'featured') result = result.filter((p) => p.featured);
    if (filter === 'best') result = result.filter((p) => p.best_seller);
    if (filter === 'new') result = result.filter((p) => p.new_arrival);

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
        break;
      case 'price-high':
        result.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
        break;
      case 'popular':
        result.sort((a, b) => (b.best_seller ? 1 : 0) - (a.best_seller ? 1 : 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [products, searchParams, searchQuery, selectedCategory, selectedBrand, priceRange, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) params.set('search', searchQuery);
    else params.delete('search');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange([0, 10000000]);
    setSortBy('newest');
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    selectedBrand,
    priceRange[0] > 0 || priceRange[1] < 10000000,
  ].filter(Boolean).length;

  return (
    <div className="pt-24 pb-20">
      <SEO title="Shop Luxury Watches | Aura & Anchor Collections" description="Browse our curated collection of luxury watches. Chronograph, Diver, Dress, Pilot, and Field styles available across East Africa." />
      {/* Header */}
      <div className="section-padding mb-8">
        <SectionTitle title="Our Collection" subtitle="Shop" />

        {/* Search & Sort Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search watches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 focus:outline-none focus:border-gold text-sm"
              />
            </div>
            <button type="submit" className="bg-navy text-white px-5 py-2.5 text-sm hover:bg-gold transition-colors">
              Search
            </button>
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-sm hover:border-gold transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-gold text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-gold cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="section-padding flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <motion.aside
          initial={false}
          animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
          className={`lg:w-64 overflow-hidden lg:overflow-visible ${showFilters ? 'block' : 'hidden lg:block'}`}
        >
          <div className="bg-white p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg text-navy">Filters</h3>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-gold hover:underline">
                  Clear All
                </button>
              )}
            </div>

            {/* Category */}
            <div className="mb-6">
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Category</h4>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="accent-gold"
                    />
                    <span className="text-sm text-navy/80 group-hover:text-gold transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand */}
            <div className="mb-6">
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Brand</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                {brands.map((brand) => (
                  <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="brand"
                      checked={selectedBrand === brand}
                      onChange={() => setSelectedBrand(brand)}
                      className="accent-gold"
                    />
                    <span className="text-sm text-navy/80 group-hover:text-gold transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Price Range</h4>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0] || ''}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full px-3 py-2 border border-gray-200 text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1] === 10000000 ? '' : priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 10000000])}
                  className="w-full px-3 py-2 border border-gray-200 text-sm"
                />
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse aspect-[4/5] rounded-sm" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-serif text-xl text-navy mb-2">No watches found</h3>
              <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search query.</p>
              <button onClick={clearFilters} className="btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{filtered.length} watch{filtered.length !== 1 ? 'es' : ''} found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
