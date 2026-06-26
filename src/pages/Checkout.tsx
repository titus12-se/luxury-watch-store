import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Truck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/store/useCart';
import { useAuth } from '@/store/useAuth';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import { showToast } from '@/components/ui/Toast';

export default function Checkout() {
  const { items, getSubtotal, getTotal, coupon, discount, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [orderNumber, setOrderNumber] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [freeThreshold, setFreeThreshold] = useState(500000);
  const [deliveryDays, setDeliveryDays] = useState({ min: 1, max: 2 });

  const [form, setForm] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    country: 'Uganda',
    paymentMethod: 'mtn' as 'mtn' | 'airtel' | 'cod',
  });

  useEffect(() => {
    async function fetchShippingCost() {
      const { data: deliveryData } = await supabase
        .from('delivery_settings')
        .select('*')
        .eq('country', form.country)
        .eq('active', true)
        .order('shipping_cost', { ascending: true });

      if (deliveryData && deliveryData.length > 0) {
        const cityMatch = deliveryData.find((d) => d.city && d.city.toLowerCase() === form.city.toLowerCase());
        const zone = cityMatch || deliveryData[0];
        setShippingCost(zone.shipping_cost || 0);
        setFreeThreshold(zone.free_shipping_threshold || 500000);
        setDeliveryDays({ min: zone.delivery_days_min || 1, max: zone.delivery_days_max || 2 });
      } else {
        setShippingCost(0);
        setFreeThreshold(500000);
        setDeliveryDays({ min: 1, max: 2 });
      }
    }
    fetchShippingCost();
  }, [form.country, form.city]);

  const effectiveShipping = getSubtotal() >= freeThreshold ? 0 : shippingCost;
  const finalTotal = getTotal() + effectiveShipping;

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-navy mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-6">Add some watches to proceed to checkout.</p>
          <Link to="/shop" className="btn-primary">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.phone || !form.addressLine1 || !form.city) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const orderNum = generateOrderNumber();
      setOrderNumber(orderNum);

      // Stock check before ordering
      const productIds = items.map((i) => i.product.id);
      const { data: products } = await supabase.from('products').select('id, stock_quantity, name').in('id', productIds);
      for (const item of items) {
        const p = products?.find((prod) => prod.id === item.product.id);
        if (!p || p.stock_quantity < item.quantity) {
          throw new Error(`Not enough stock for ${p?.name || 'a product'} (only ${p?.stock_quantity ?? 0} left)`);
        }
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNum,
          customer_id: user?.id || null,
          guest_email: user ? null : form.email,
          guest_phone: user ? null : form.phone,
          guest_name: user ? null : form.fullName,
          status: 'pending',
          payment_status: 'pending',
          total: finalTotal,
          shipping_cost: effectiveShipping,
          shipping_address: {
            full_name: form.fullName,
            phone: form.phone,
            address_line1: form.addressLine1,
            address_line2: form.addressLine2,
            city: form.city,
            country: form.country,
          },
          payment_method: form.paymentMethod,
          estimated_delivery_days: deliveryDays.max,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.discount_price ?? item.product.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // Increment coupon usage
      if (coupon) {
        await supabase.rpc('increment_coupon_usage', { coupon_code: coupon });
      }

      clearCart();
      setStep('success');

      // Notify customer and admin
      try {
        const edgeUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-notifications`;
        const payload = {
          type: 'order_confirmation',
          order_id: orderData.id,
          email: form.email,
          order_number: orderNum,
          total: formatPrice(finalTotal),
          customer_name: form.fullName,
          payment_method: form.paymentMethod,
        };
        fetch(edgeUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` }, body: JSON.stringify(payload) }).catch(() => {});

        const adminPayload = {
          type: 'admin_alert',
          order_id: orderData.id,
          email: form.email,
          order_number: orderNum,
          total: formatPrice(finalTotal),
          customer_name: form.fullName,
          payment_method: form.paymentMethod,
        };
        fetch(edgeUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` }, body: JSON.stringify(adminPayload) }).catch(() => {});
      } catch {
        // Silent fail for email notifications
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-serif text-3xl text-navy mb-2">Order Placed!</h2>
          <p className="text-gray-500 mb-2">Thank you for your purchase.</p>
          <p className="text-navy font-medium mb-6">Order Number: <span className="text-gold">{orderNumber}</span></p>
          <p className="text-sm text-gray-500 mb-4">
            Estimated delivery: {deliveryDays.min}-{deliveryDays.max} business days.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            You can track your order using the order number on our Track Order page.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/track-order" className="btn-outline">
              Track Order
            </Link>
            <Link to="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {['Information', 'Payment', 'Confirmation'].map((label, i) => (
              <div key={label} className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${i <= (step === 'info' ? 0 : 1) ? 'text-gold' : 'text-gray-300'}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i <= (step === 'info' ? 0 : 1) ? 'bg-gold text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="hidden sm:block text-sm">{label}</span>
                </div>
                {i < 2 && <div className="w-8 h-[1px] bg-gray-200" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl text-navy mb-6">
                {step === 'info' ? 'Delivery Information' : 'Payment Method'}
              </h2>

              {step === 'info' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Full Name *</label>
                      <input
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Phone Number *</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+256 708 018549"
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Address Line 1 *</label>
                    <input
                      value={form.addressLine1}
                      onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Address Line 2</label>
                    <input
                      value={form.addressLine2}
                      onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">City *</label>
                      <input
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Country</label>
                      <select
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gold bg-white"
                      >
                        <option value="Uganda">Uganda</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Rwanda">Rwanda</option>
                        <option value="South Sudan">South Sudan</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep('payment')}
                    className="btn-primary w-full mt-4"
                  >
                    Continue to Payment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { id: 'mtn', label: 'MTN Mobile Money', icon: '🟡' },
                      { id: 'airtel', label: 'Airtel Money', icon: '🔴' },
                      { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                          form.paymentMethod === method.id ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={form.paymentMethod === method.id}
                          onChange={() => setForm({ ...form, paymentMethod: method.id as any })}
                          className="accent-gold"
                        />
                        <span className="text-lg">{method.icon}</span>
                        <span className="text-navy font-medium">{method.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('info')}
                      className="flex-1 py-3 border border-gray-200 text-navy hover:border-gold transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>Place Order <ArrowLeft className="w-4 h-4 rotate-180" /></>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 border border-gray-100 sticky top-24">
                <h3 className="font-serif text-lg text-navy mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6">
                  {items.map((item) => {
                    const price = item.product.discount_price ?? item.product.price;
                    return (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="w-14 h-14 bg-gray-50 overflow-hidden shrink-0">
                          <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-navy line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm text-navy">{formatPrice(price * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="h-[1px] bg-gray-100 mb-4" />
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm text-navy">{formatPrice(getSubtotal())}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">Discount ({coupon})</span>
                    <span className="text-sm text-green-600">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Shipping
                  </span>
                  <span className={`text-sm ${effectiveShipping === 0 ? 'text-green-600' : 'text-navy'}`}>
                    {effectiveShipping === 0 ? 'Free' : formatPrice(effectiveShipping)}
                  </span>
                </div>
                {getSubtotal() < freeThreshold && (
                  <p className="text-xs text-gray-400 mb-3">
                    {formatPrice(freeThreshold - getSubtotal())} more for free shipping
                  </p>
                )}
                <div className="h-[1px] bg-gray-100 mb-4" />
                <div className="flex justify-between">
                  <span className="font-medium text-navy">Total</span>
                  <span className="font-serif text-xl text-navy">{formatPrice(finalTotal)}</span>
                </div>
                {deliveryDays.min > 0 && (
                  <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Delivery: {deliveryDays.min}-{deliveryDays.max} business days
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
