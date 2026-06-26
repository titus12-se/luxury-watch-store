import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { showToast } from '@/components/ui/Toast';
import type { Order } from '@/types';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('order_number', orderNumber.trim())
      .maybeSingle();
    setOrder(data ?? null);
    setLoading(false);
    if (!data) {
      showToast('Order not found', 'error');
    }
  };

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order?.status);
  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="pt-24 pb-20">
      <div className="section-padding max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl text-navy mb-2">Track Your Order</h1>
          <p className="text-gray-500">Enter your order number to check the status</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Enter order number (e.g., AA-ABC123-DEF)"
              className="w-full pl-12 pr-4 py-4 border border-gray-200 focus:outline-none focus:border-gold text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-navy text-white px-8 py-4 font-medium hover:bg-gold transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-100 p-8"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
              <div>
                <p className="text-sm text-gray-500">Order #{order.order_number}</p>
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-serif text-xl text-navy">{formatPrice(order.total)}</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs uppercase tracking-wider mt-1 ${
                  isCancelled ? 'text-red-600 bg-red-50' : 'text-gold bg-gold/10'
                }`}>
                  {isCancelled ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                  {order.status}
                </span>
              </div>
            </div>

            {/* Progress */}
            {!isCancelled && (
              <div className="mb-8">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-100 -z-10" />
                  {statusSteps.map((step, i) => {
                    const isActive = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-2 bg-white px-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-gold text-white' : 'bg-gray-100 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-gold/20' : ''}`}>
                          <step.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider ${isActive ? 'text-navy' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipping Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Shipping Address</h4>
                <div className="text-sm text-navy">
                  <p className="font-medium">{(order.shipping_address as any).full_name}</p>
                  <p className="text-gray-500">{(order.shipping_address as any).phone}</p>
                  <p className="text-gray-500">{(order.shipping_address as any).address_line1}</p>
                  {(order.shipping_address as any).address_line2 && (
                    <p className="text-gray-500">{(order.shipping_address as any).address_line2}</p>
                  )}
                  <p className="text-gray-500">{(order.shipping_address as any).city}, {(order.shipping_address as any).country}</p>
                </div>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Payment Method</h4>
                <p className="text-sm text-navy capitalize">
                  {order.payment_method === 'mtn' && 'MTN Mobile Money'}
                  {order.payment_method === 'airtel' && 'Airtel Money'}
                  {order.payment_method === 'cod' && 'Cash on Delivery'}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Items</h4>
              <div className="space-y-3">
                {(order as any).order_items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-50">
                    <div className="w-14 h-14 bg-gray-50 overflow-hidden shrink-0">
                      <img src={item.products?.images?.[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-navy">{item.products?.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm text-navy">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {searched && !order && !loading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-navy mb-2">Order Not Found</h3>
            <p className="text-gray-500 mb-6">We could not find an order with that number.</p>
            <Link to="/shop" className="btn-primary">Continue Shopping</Link>
          </div>
        )}
      </div>
    </div>
  );
}
