import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { formatPrice } from '@/lib/utils';
import { showToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';

export default function Cart() {
  const { items, removeItem, updateQuantity, getSubtotal, getTotal, coupon, discount, applyCoupon, removeCoupon, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      showToast('Enter a coupon code', 'error');
      return;
    }
    setCouponLoading(true);

    const { data: couponData } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('active', true)
      .single();

    if (!couponData) {
      showToast('Invalid or expired coupon code', 'error');
      setCouponLoading(false);
      return;
    }

    const now = new Date();
    if (couponData.end_date && new Date(couponData.end_date) < now) {
      showToast('This coupon has expired', 'error');
      setCouponLoading(false);
      return;
    }

    if (couponData.max_uses && couponData.used_count >= couponData.max_uses) {
      showToast('This coupon has reached its usage limit', 'error');
      setCouponLoading(false);
      return;
    }

    if (couponData.min_order_amount && getSubtotal() < couponData.min_order_amount) {
      showToast(`Minimum order of ${formatPrice(couponData.min_order_amount)} required`, 'error');
      setCouponLoading(false);
      return;
    }

    let disc = 0;
    if (couponData.discount_type === 'percentage') {
      disc = Math.round(getSubtotal() * (couponData.discount_value / 100));
    } else {
      disc = Math.min(couponData.discount_value, getSubtotal());
    }

    applyCoupon(couponData.code, disc);
    showToast('Coupon applied successfully!', 'success');
    setCouponCode('');
    setCouponLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-navy mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-6">Discover our collection of luxury timepieces.</p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="section-padding">
        <h1 className="font-serif text-3xl text-navy mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, i) => {
              const price = item.product.discount_price ?? item.product.price;
              return (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4 bg-white p-4 border border-gray-100"
                >
                  <Link to={`/product/${item.product.slug}`} className="w-24 h-24 shrink-0 overflow-hidden">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/product/${item.product.slug}`}>
                          <h3 className="font-serif text-navy hover:text-gold transition-colors">{item.product.name}</h3>
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">{item.product.brand}</p>
                      </div>
                      <button
                        onClick={() => {
                          removeItem(item.product.id);
                          showToast('Item removed from cart', 'info');
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-medium text-navy">{formatPrice(price * item.quantity)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <div className="flex justify-between">
              <Link to="/shop" className="text-sm text-gold hover:underline flex items-center gap-1">
                <ArrowRight className="w-3 h-3 rotate-180" /> Continue Shopping
              </Link>
              <button
                onClick={() => {
                  clearCart();
                  showToast('Cart cleared', 'info');
                }}
                className="text-sm text-red-500 hover:underline"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 border border-gray-100 sticky top-24">
              <h3 className="font-serif text-xl text-navy mb-6">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-navy">{formatPrice(getSubtotal())}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount ({coupon})</span>
                    <span className="text-green-600">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="h-[1px] bg-gray-100" />
                <div className="flex justify-between">
                  <span className="font-medium text-navy">Total</span>
                  <span className="font-serif text-xl text-navy">{formatPrice(getTotal())}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-6">
                {coupon ? (
                  <div className="flex items-center justify-between bg-green-50 px-4 py-2">
                    <span className="text-sm text-green-700 flex items-center gap-2">
                      <Tag className="w-3 h-3" /> {coupon}
                    </span>
                    <button onClick={removeCoupon} className="text-xs text-red-500 hover:underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-gold"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="bg-navy text-white px-4 py-2 text-sm hover:bg-gold transition-colors disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-1">Try code: LUXURY10</p>
              </div>

              <Link
                to="/checkout"
                className="btn-primary w-full text-center flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
