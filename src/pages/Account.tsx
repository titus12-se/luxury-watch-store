import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, ShoppingBag, Heart, MapPin, LogOut, ChevronRight, Package, Clock, CheckCircle, XCircle, Plus, Pencil, Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/useAuth';
import { formatPrice } from '@/lib/utils';
import { showToast } from '@/components/ui/Toast';
import type { Order, Address, Product } from '@/types';

export default function Account() {
  const navigate = useNavigate();
  const { user, setUser, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    email: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: '', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', country: 'Uganda', isDefault: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setProfileForm({
      fullName: user.full_name || '',
      phone: user.phone || '',
      email: user.email || '',
    });
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'orders') {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('customer_id', user!.id)
        .order('created_at', { ascending: false });
      setOrders(data ?? []);
    } else if (activeTab === 'wishlist') {
      const { data } = await supabase
        .from('wishlist')
        .select('products(*)')
        .eq('customer_id', user!.id);
      setWishlist((data ?? []).map((d: any) => d.products).filter(Boolean));
    } else if (activeTab === 'addresses') {
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', user!.id)
        .order('is_default', { ascending: false });
      setAddresses(data ?? []);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed out successfully', 'info');
    navigate('/');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    const { error } = await supabase
      .from('customers')
      .update({ full_name: profileForm.fullName, phone: profileForm.phone })
      .eq('id', user.id);
    if (error) {
      showToast(error.message, 'error');
    } else {
      setUser({ ...user, full_name: profileForm.fullName, phone: profileForm.phone });
      showToast('Profile updated', 'success');
    }
    setProfileSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwordForm.new.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Password updated successfully', 'success');
      setPasswordForm({ current: '', new: '', confirm: '' });
    }
    setPasswordSaving(false);
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    if (!addressForm.label || !addressForm.fullName || !addressForm.phone || !addressForm.addressLine1 || !addressForm.city) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setAddressSaving(true);

    if (editingAddress) {
      const { error } = await supabase.from('addresses').update({
        label: addressForm.label,
        full_name: addressForm.fullName,
        phone: addressForm.phone,
        address_line1: addressForm.addressLine1,
        address_line2: addressForm.addressLine2 || null,
        city: addressForm.city,
        country: addressForm.country,
        is_default: addressForm.isDefault,
      }).eq('id', editingAddress.id);
      if (error) showToast(error.message, 'error');
      else showToast('Address updated', 'success');
    } else {
      const { error } = await supabase.from('addresses').insert({
        customer_id: user.id,
        label: addressForm.label,
        full_name: addressForm.fullName,
        phone: addressForm.phone,
        address_line1: addressForm.addressLine1,
        address_line2: addressForm.addressLine2 || null,
        city: addressForm.city,
        country: addressForm.country,
        is_default: addressForm.isDefault,
      });
      if (error) showToast(error.message, 'error');
      else showToast('Address saved', 'success');
    }

    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm({ label: '', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', country: 'Uganda', isDefault: false });
    setAddressSaving(false);
    fetchData();
  };

  const handleEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label,
      fullName: addr.full_name,
      phone: addr.phone,
      addressLine1: addr.address_line1,
      addressLine2: addr.address_line2 || '',
      city: addr.city,
      country: addr.country,
      isDefault: addr.is_default,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id: string) => {
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) showToast(error.message, 'error');
    else {
      showToast('Address deleted', 'success');
      fetchData();
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    if (error) showToast(error.message, 'error');
    else {
      showToast('Default address updated', 'success');
      fetchData();
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'shipped': return <Package className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gold" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'shipped': return 'text-blue-600 bg-blue-50';
      default: return 'text-gold bg-gold/10';
    }
  };

  const tabs = [
    { id: 'orders' as const, label: 'My Orders', icon: ShoppingBag },
    { id: 'wishlist' as const, label: 'Wishlist', icon: Heart },
    { id: 'addresses' as const, label: 'Addresses', icon: MapPin },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <div className="pt-24 pb-20">
      <div className="section-padding">
        <h1 className="font-serif text-3xl text-navy mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center text-white font-serif text-xl mb-3">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <h3 className="font-medium text-navy">{user?.full_name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <nav>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-6 py-4 text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gold/5 text-gold border-l-2 border-gold'
                        : 'text-navy/70 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-6 py-4 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div>
                <h2 className="font-serif text-xl text-navy mb-6">Order History</h2>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-gray-100 animate-pulse h-24 rounded-sm" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-gray-100">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No orders yet</p>
                    <Link to="/shop" className="btn-primary">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white border border-gray-100 p-6"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Order #{order.order_number}</p>
                            <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wider ${statusColor(order.status)}`}>
                              {statusIcon(order.status)}
                              {order.status}
                            </span>
                            {order.payment_status === 'pending' && order.status !== 'cancelled' && (
                              <span className="flex items-center gap-1 px-3 py-1 text-xs uppercase tracking-wider text-orange-600 bg-orange-50">
                                <Clock className="w-3 h-3" />
                                Awaiting Payment
                              </span>
                            )}
                            {order.payment_status === 'paid' && (
                              <span className="flex items-center gap-1 px-3 py-1 text-xs uppercase tracking-wider text-green-600 bg-green-50">
                                <CheckCircle className="w-3 h-3" />
                                Paid
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-navy">{formatPrice(order.total)}</span>
                          <Link to={`/track-order?order=${order.order_number}`} className="text-sm text-gold hover:underline flex items-center gap-1">
                            Track Order <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="font-serif text-xl text-navy mb-6">My Wishlist</h2>
                {wishlist.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-gray-100">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">Your wishlist is empty</p>
                    <Link to="/shop" className="btn-primary">Explore Watches</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((product) => (
                      <Link key={product.id} to={`/product/${product.slug}`} className="group">
                        <div className="bg-white border border-gray-100 overflow-hidden">
                          <div className="aspect-[4/5] overflow-hidden">
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          </div>
                          <div className="p-4">
                            <p className="text-[10px] uppercase tracking-wider text-gold">{product.brand}</p>
                            <h3 className="font-serif text-sm text-navy mt-1">{product.name}</h3>
                            <p className="text-navy font-medium mt-2">{formatPrice(product.discount_price ?? product.price)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl text-navy">Saved Addresses</h2>
                  <button
                    onClick={() => { setShowAddressForm(true); setEditingAddress(null); setAddressForm({ label: '', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', country: 'Uganda', isDefault: false }); }}
                    className="flex items-center gap-2 text-sm text-gold hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Add New Address
                  </button>
                </div>

                {showAddressForm && (
                  <div className="bg-white border border-gray-100 p-6 mb-6">
                    <h3 className="font-medium text-navy mb-4">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Label (e.g. Home, Work) *</label>
                        <input value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:border-gold text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Full Name *</label>
                        <input value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:border-gold text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Phone *</label>
                        <input value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:border-gold text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Address Line 1 *</label>
                        <input value={addressForm.addressLine1} onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })} className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:border-gold text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Address Line 2</label>
                        <input value={addressForm.addressLine2} onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })} className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:border-gold text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">City *</label>
                        <input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:border-gold text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Country</label>
                        <select value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:border-gold text-sm bg-white">
                          <option>Uganda</option>
                          <option>Kenya</option>
                          <option>Tanzania</option>
                          <option>Rwanda</option>
                          <option>South Sudan</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="accent-gold" />
                        <label htmlFor="isDefault" className="text-sm text-gray-500">Set as default address</label>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setShowAddressForm(false)} className="px-4 py-2 border border-gray-200 text-sm text-navy hover:border-gold transition-colors">Cancel</button>
                      <button onClick={handleSaveAddress} disabled={addressSaving} className="px-4 py-2 bg-gold text-navy text-sm font-medium hover:bg-gold-600 transition-colors disabled:opacity-50">
                        {addressSaving ? 'Saving...' : 'Save Address'}
                      </button>
                    </div>
                  </div>
                )}

                {addresses.length === 0 && !showAddressForm ? (
                  <div className="text-center py-12 bg-white border border-gray-100">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No saved addresses</p>
                    <button onClick={() => setShowAddressForm(true)} className="btn-primary">Add First Address</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`bg-white border p-6 relative ${addr.is_default ? 'border-gold' : 'border-gray-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs uppercase tracking-wider text-gold">{addr.label}</span>
                          <div className="flex items-center gap-1">
                            {addr.is_default && <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 mr-1">Default</span>}
                            <button onClick={() => handleEditAddress(addr)} className="text-gray-400 hover:text-gold p-1"><Pencil className="w-3 h-3" /></button>
                            <button onClick={() => handleDeleteAddress(addr.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                        <p className="font-medium text-navy">{addr.full_name}</p>
                        <p className="text-sm text-gray-500 mt-1">{addr.phone}</p>
                        <p className="text-sm text-gray-500">{addr.address_line1}</p>
                        {addr.address_line2 && <p className="text-sm text-gray-500">{addr.address_line2}</p>}
                        <p className="text-sm text-gray-500">{addr.city}, {addr.country}</p>
                        {!addr.is_default && (
                          <button onClick={() => handleSetDefaultAddress(addr.id)} className="mt-3 text-xs text-gold hover:underline">
                            Set as default
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="font-serif text-xl text-navy mb-6">Profile Information</h2>
                <div className="bg-white border border-gray-100 p-6 max-w-lg space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
                      <input
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:border-gold text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Email</label>
                      <input
                        value={profileForm.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-400 text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                      <input
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:border-gold text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="bg-gold text-navy px-6 py-2 text-sm font-medium hover:bg-gold-600 transition-colors disabled:opacity-50"
                  >
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                <div className="bg-white border border-gray-100 p-6 max-w-lg mt-8 space-y-4">
                  <h3 className="font-medium text-navy">Change Password</h3>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:border-gold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:border-gold text-sm"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordSaving}
                    className="bg-navy text-white px-6 py-2 text-sm font-medium hover:bg-gold transition-colors disabled:opacity-50"
                  >
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
