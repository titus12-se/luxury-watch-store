import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Share2,
  MessageCircle,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Star,
  Minus,
  Plus,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import { useAuth } from '@/store/useAuth';
import { formatPrice } from '@/lib/utils';
import { showToast } from '@/components/ui/Toast';
import ProductCard from '@/components/ProductCard';
import ReviewForm from '@/components/ReviewForm';
import type { Product, Review } from '@/types';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const inWishlist = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      const { data } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
      if (data) {
        setProduct(data);
        setSelectedImage(0);
        // Related products
        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(4);
        setRelated(rel ?? []);
        // Reviews
        const { data: revs } = await supabase.from('reviews').select('*').eq('product_id', data.id);
        setReviews(revs ?? []);
      }
      setLoading(false);
    }
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    showToast(`${product.name} added to cart`, 'success');
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product, quantity);
    window.location.href = '/checkout';
  };

  const handleWishlist = async () => {
    if (!product) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (inWishlist) {
      await removeFromWishlist(product.id);
      showToast('Removed from wishlist', 'info');
    } else {
      await addToWishlist(product);
      showToast('Added to wishlist', 'success');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard', 'success');
    }
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const text = `Hi, I'm interested in the ${product.name}. Can you provide more details? ${window.location.href}`;
    window.open(`https://wa.me/256708018549?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-navy mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">The watch you are looking for does not exist.</p>
          <Link to="/shop" className="btn-primary">
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const displayPrice = product.discount_price ?? product.price;
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="pt-24 pb-20">
      {/* Breadcrumb */}
      <div className="section-padding mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gold transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-navy">{product.name}</span>
        </div>
      </div>

      <div className="section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-[4/5] bg-gray-50 mb-4 overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 flex items-center justify-center hover:bg-gold hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 flex items-center justify-center hover:bg-gold hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? 'border-gold' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-gold mb-2 block">{product.brand}</span>
            <h1 className="font-serif text-3xl lg:text-4xl text-navy mb-4">{product.name}</h1>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(avgRating) ? 'text-gold fill-gold' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-serif text-3xl text-navy">{formatPrice(displayPrice)}</span>
              {hasDiscount && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
              )}
              {hasDiscount && (
                <span className="bg-gold/10 text-gold text-xs px-2 py-1">
                  Save {formatPrice(product.price - (product.discount_price ?? 0))}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="mb-6">
              {product.stock_quantity > 0 ? (
                <span className="text-green-600 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  In Stock ({product.stock_quantity} available)
                </span>
              ) : (
                <span className="text-red-500 text-sm">Out of Stock</span>
              )}
            </div>

            <p className="text-navy/70 leading-relaxed mb-8">{product.description}</p>

            {/* Quantity */}
            {product.stock_quantity > 0 && (
              <div className="flex items-center gap-4 mb-8">
                <span className="text-sm text-gray-500">Quantity</span>
                <div className="flex items-center border border-gray-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock_quantity === 0}
                className="bg-navy text-white px-8 py-3 font-medium tracking-wide hover:bg-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
              <button
                onClick={handleWishlist}
                className={`w-12 h-12 border flex items-center justify-center transition-colors ${
                  inWishlist ? 'bg-gold border-gold text-white' : 'border-gray-200 text-navy hover:border-gold hover:text-gold'
                }`}
              >
                <Heart className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="w-12 h-12 border border-gray-200 text-navy flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleWhatsApp}
                className="w-12 h-12 bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-pearl">
              {[
                { icon: Truck, label: 'Free Shipping' },
                { icon: Shield, label: 'Authentic' },
                { icon: RotateCcw, label: '30-Day Return' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center text-center gap-2">
                  <item.icon className="w-5 h-5 text-gold" />
                  <span className="text-[10px] uppercase tracking-wider text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Specifications & Description Tabs */}
        <div className="mb-20">
          <div className="border-b border-gray-200 mb-8">
            <div className="flex gap-8">
              <button className="pb-4 border-b-2 border-gold text-navy font-medium text-sm">Specifications</button>
              <button className="pb-4 border-b-2 border-transparent text-gray-500 text-sm">Description</button>
              <button className="pb-4 border-b-2 border-transparent text-gray-500 text-sm">Reviews ({reviews.length})</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-serif text-xl text-navy mb-6">Technical Specifications</h3>
              <div className="space-y-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">{key}</span>
                    <span className="text-sm text-navy font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl text-navy mb-6">Product Description</h3>
              <p className="text-navy/70 leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-20">
          <h2 className="font-serif text-2xl text-navy mb-8">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review Form */}
            <div className="md:col-span-1">
              <div className="bg-white p-6 border border-gray-100">
                <h3 className="font-medium text-navy mb-4">Write a Review</h3>
                {user ? (
                  <ReviewForm productId={product.id} onReviewSubmitted={() => {
                    supabase.from('reviews').select('*').eq('product_id', product.id).then(({ data }) => {
                      if (data) setReviews(data);
                    });
                  }} />
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500 mb-4">Sign in to leave a review</p>
                    <Link to="/login" className="btn-primary text-sm">Sign In</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews List */}
            <div className="md:col-span-2">
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center text-gold font-bold text-sm">
                            {review.customer_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-navy text-sm">{review.customer_name}</p>
                            <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-gold fill-gold' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 border border-gray-100">
                  <p className="text-gray-500 mb-2">No reviews yet</p>
                  <p className="text-sm text-gray-400">Be the first to share your experience with this timepiece</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="font-serif text-2xl text-navy mb-8 text-center">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
