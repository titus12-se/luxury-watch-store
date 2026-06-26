import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import { useAuth } from '@/store/useAuth';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const inWishlist = isInWishlist(product.id);
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const displayPrice = product.discount_price ?? product.price;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="luxury-card relative overflow-hidden bg-white">
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/20 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <button
                onClick={handleAddToCart}
                className="w-10 h-10 bg-white text-navy rounded-full flex items-center justify-center hover:bg-gold hover:text-white transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300"
                title="Add to Cart"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
              <button
                onClick={handleWishlist}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300 delay-75 ${
                  inWishlist ? 'bg-gold text-white' : 'bg-white text-navy hover:bg-gold hover:text-white'
                }`}
                title="Add to Wishlist"
              >
                <Heart className="w-4 h-4" />
              </button>
              <button
                className="w-10 h-10 bg-white text-navy rounded-full flex items-center justify-center hover:bg-gold hover:text-white transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300 delay-150"
                title="Quick View"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.new_arrival && (
                <span className="bg-navy text-white text-[10px] uppercase tracking-wider px-2.5 py-1">New</span>
              )}
              {hasDiscount && (
                <span className="bg-gold text-white text-[10px] uppercase tracking-wider px-2.5 py-1">
                  -{Math.round(((product.price - (product.discount_price ?? 0)) / product.price) * 100)}%
                </span>
              )}
              {product.best_seller && (
                <span className="bg-white/90 text-navy text-[10px] uppercase tracking-wider px-2.5 py-1">Best Seller</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-1">{product.brand}</p>
            <h3 className="font-serif text-sm text-navy mb-2 line-clamp-1 group-hover:text-gold transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="font-medium text-navy">{formatPrice(displayPrice)}</span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
              )}
            </div>
            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
              <p className="text-[10px] text-red-500 mt-1">Only {product.stock_quantity} left</p>
            )}
            {product.stock_quantity === 0 && (
              <p className="text-[10px] text-gray-400 mt-1">Out of stock</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
