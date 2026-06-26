import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/store/useWishlist';
import { useAuth } from '@/store/useAuth';
import ProductCard from '@/components/ProductCard';

export default function Wishlist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, fetchWishlist, loading } = useWishlist();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user]);

  if (loading) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="section-padding">
        <h1 className="font-serif text-3xl text-navy mb-8">My Wishlist</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-navy mb-2">Your Wishlist is Empty</h2>
            <p className="text-gray-500 mb-6">Save your favorite watches here.</p>
            <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
