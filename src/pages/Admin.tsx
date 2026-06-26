import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings, Image,
  Plus, Pencil, Trash2, Search, DollarSign, UserCheck, Clock,
  Tag, Truck, FileText, Star, MessageSquare,
  Eye, AlertTriangle, BarChart3,
  TrendingUp, Calendar, ArrowUpRight, ArrowDownRight,
  Download, RefreshCw, Menu, X as XIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, generateSlug } from '@/lib/utils';
import { showToast } from '@/components/ui/Toast';
import type { Product, Order, CustomerProfile, Review, Testimonial, Banner, FAQ } from '@/types';
import type { SiteSetting, Coupon, Promotion, DeliverySetting } from '@/types/admin';

const ADMIN_EMAIL = 'auraanchorcollections@gmail.com';

type Tab = 'dashboard' | 'products' | 'orders' | 'customers' | 'reviews' | 'banners' | 'testimonials' | 'faqs' | 'coupons' | 'promotions' | 'delivery' | 'settings' | 'analytics';

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinChange, setShowPinChange] = useState(false);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySetting[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([]);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    avgOrderValue: 0,
    salesThisMonth: 0,
    salesLastMonth: 0,
    topProducts: [] as any[],
    recentOrders: [] as Order[],
    ordersByStatus: {} as Record<string, number>,
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState<Order | null>(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState<CustomerProfile | null>(null);
  const [showSettingsCategory, setShowSettingsCategory] = useState('general');

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [editingDelivery, setEditingDelivery] = useState<DeliverySetting | null>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', discount_price: '', stock_quantity: '',
    category: '', brand: '', featured: false, best_seller: false, new_arrival: false,
    images: [''], specifications: {} as Record<string, string>, specKey: '', specValue: '',
  });
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', image: '', link: '', active: true, order: 0 });
  const [testimonialForm, setTestimonialForm] = useState({ name: '', location: '', comment: '', rating: 5 });
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', order: 0 });
  const [couponForm, setCouponForm] = useState({ code: '', discount_type: 'percentage' as 'percentage' | 'fixed', discount_value: '', min_order_amount: '', max_uses: '', end_date: '', active: true });
  const [promotionForm, setPromotionForm] = useState({ name: '', type: 'flash_sale' as 'flash_sale' | 'category_discount' | 'buy_x_get_y', discount_percent: '', applicable_categories: '', start_date: '', end_date: '', active: true });
  const [deliveryForm, setDeliveryForm] = useState({ country: '', city: '', shipping_cost: '', free_shipping_threshold: '', delivery_days_min: '1', delivery_days_max: '5', active: true });

  const checkAdmin = useCallback(async () => {
    const verified = sessionStorage.getItem('admin_pin_verified') === 'true';
    if (!verified) {
      navigate('/admin-login');
      return false;
    }

    // Fetch current PIN
    const { data: pinData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_pin')
      .single();
    if (pinData?.value) setNewPin(pinData.value);

    return true;
  }, [navigate]);

  useEffect(() => {
    checkAdmin().then((ok) => { if (ok) fetchAllData(); });
  }, [checkAdmin]);

  useEffect(() => {
    if (activeTab === 'analytics') computeAnalytics();
  }, [activeTab, orders, products, customers]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        { data: prodData }, { data: orderData }, { data: custData },
        { data: revData }, { data: testData }, { data: bannerData },
        { data: faqData }, { data: couponData }, { data: promoData },
        { data: deliveryData }, { data: settingsData },
      ] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*, order_items(*, products(*))').order('created_at', { ascending: false }),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*, products(name)').order('created_at', { ascending: false }),
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
        supabase.from('banners').select('*').order('order', { ascending: true }),
        supabase.from('faqs').select('*').order('order', { ascending: true }),
        supabase.from('coupons').select('*').order('created_at', { ascending: false }),
        supabase.from('promotions').select('*').order('created_at', { ascending: false }),
        supabase.from('delivery_settings').select('*').order('country', { ascending: true }),
        supabase.from('site_settings').select('*').order('category', { ascending: true }),
      ]);
      setProducts(prodData ?? []);
      setOrders(orderData ?? []);
      setCustomers(custData ?? []);
      setReviews(revData ?? []);
      setTestimonials(testData ?? []);
      setBanners(bannerData ?? []);
      setFaqs(faqData ?? []);
      setCoupons(couponData ?? []);
      setPromotions(promoData ?? []);
      setDeliverySettings(deliveryData ?? []);
      setSiteSettings(settingsData ?? []);
      computeAnalytics(orderData ?? [], prodData ?? [], custData ?? []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const computeAnalytics = (ords = orders, prods = products, custs = customers) => {
    const totalRevenue = ords.reduce((s, o) => s + o.total, 0);
    const pendingOrders = ords.filter((o) => o.status === 'pending').length;
    const avgOrderValue = ords.length > 0 ? totalRevenue / ords.length : 0;

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const salesThisMonth = ords
      .filter((o) => { const d = new Date(o.created_at); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; })
      .reduce((s, o) => s + o.total, 0);
    const salesLastMonth = ords
      .filter((o) => { const d = new Date(o.created_at); return d.getMonth() === lastMonth && d.getFullYear() === lastYear; })
      .reduce((s, o) => s + o.total, 0);

    const productSales: Record<string, { name: string; total: number; qty: number }> = {};
    ords.forEach((o) => {
      (o as any).order_items?.forEach((item: any) => {
        const pid = item.product_id;
        if (!productSales[pid]) productSales[pid] = { name: item.products?.name || 'Unknown', total: 0, qty: 0 };
        productSales[pid].total += item.price * item.quantity;
        productSales[pid].qty += item.quantity;
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.total - a.total).slice(0, 5);

    const ordersByStatus: Record<string, number> = {};
    ords.forEach((o) => { ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1; });

    setAnalytics({
      totalRevenue, totalOrders: ords.length, totalCustomers: custs.length, totalProducts: prods.length,
      pendingOrders, avgOrderValue, salesThisMonth, salesLastMonth, topProducts,
      recentOrders: ords.slice(0, 10), ordersByStatus,
    });
  };

  const logAction = async (action: string, entityType: string, entityId?: string, details?: any) => {
    await supabase.from('admin_logs').insert({
      admin_email: ADMIN_EMAIL, action, entity_type: entityType, entity_id: entityId, details,
    });
  };

  // ===================== PRODUCTS =====================
  const handleSaveProduct = async () => {
    const payload = {
      name: productForm.name, slug: generateSlug(productForm.name), description: productForm.description,
      price: Number(productForm.price), discount_price: productForm.discount_price ? Number(productForm.discount_price) : null,
      stock_quantity: Number(productForm.stock_quantity), category: productForm.category, brand: productForm.brand,
      featured: productForm.featured, best_seller: productForm.best_seller, new_arrival: productForm.new_arrival,
      images: productForm.images.filter(Boolean), specifications: productForm.specifications,
    };
    if (editingProduct) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
      if (error) { showToast(error.message, 'error'); return; }
      await logAction('update', 'product', editingProduct.id, { name: payload.name });
      showToast('Product updated', 'success');
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select().single();
      if (error) { showToast(error.message, 'error'); return; }
      await logAction('create', 'product', data.id, { name: payload.name });
      showToast('Product created', 'success');
    }
    closeProductModal();
    fetchAllData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { showToast(error.message, 'error'); return; }
    await logAction('delete', 'product', id);
    showToast('Product deleted', 'info');
    fetchAllData();
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name, description: product.description, price: String(product.price),
        discount_price: product.discount_price ? String(product.discount_price) : '',
        stock_quantity: String(product.stock_quantity), category: product.category, brand: product.brand,
        featured: product.featured, best_seller: product.best_seller, new_arrival: product.new_arrival,
        images: product.images.length > 0 ? product.images : [''], specifications: product.specifications || {}, specKey: '', specValue: '',
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', discount_price: '', stock_quantity: '', category: '', brand: '', featured: false, best_seller: false, new_arrival: false, images: [''], specifications: {}, specKey: '', specValue: '' });
    }
    setShowProductModal(true);
  };

  const closeProductModal = () => { setShowProductModal(false); setEditingProduct(null); };

  // ===================== BANNERS =====================
  const handleSaveBanner = async () => {
    const payload = { title: bannerForm.title, subtitle: bannerForm.subtitle, image: bannerForm.image, link: bannerForm.link || null, active: bannerForm.active, order: bannerForm.order };
    if (editingBanner) {
      const { error } = await supabase.from('banners').update(payload).eq('id', editingBanner.id);
      if (error) { showToast(error.message, 'error'); return; }
      await logAction('update', 'banner', editingBanner.id);
      showToast('Banner updated', 'success');
    } else {
      const { data, error } = await supabase.from('banners').insert(payload).select().single();
      if (error) { showToast(error.message, 'error'); return; }
      await logAction('create', 'banner', data.id);
      showToast('Banner created', 'success');
    }
    closeBannerModal(); fetchAllData();
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await supabase.from('banners').delete().eq('id', id);
    await logAction('delete', 'banner', id);
    showToast('Banner deleted', 'info'); fetchAllData();
  };

  const openBannerModal = (banner?: Banner) => {
    if (banner) { setEditingBanner(banner); setBannerForm({ title: banner.title, subtitle: banner.subtitle, image: banner.image, link: banner.link || '', active: banner.active, order: banner.order }); }
    else { setEditingBanner(null); setBannerForm({ title: '', subtitle: '', image: '', link: '', active: true, order: banners.length }); }
    setShowBannerModal(true);
  };
  const closeBannerModal = () => { setShowBannerModal(false); setEditingBanner(null); };

  // ===================== TESTIMONIALS =====================
  const handleSaveTestimonial = async () => {
    const payload = { name: testimonialForm.name, location: testimonialForm.location, comment: testimonialForm.comment, rating: testimonialForm.rating };
    if (editingTestimonial) {
      await supabase.from('testimonials').update(payload).eq('id', editingTestimonial.id);
      await logAction('update', 'testimonial', editingTestimonial.id);
      showToast('Testimonial updated', 'success');
    } else {
      const { data } = await supabase.from('testimonials').insert(payload).select().single();
      await logAction('create', 'testimonial', data.id);
      showToast('Testimonial created', 'success');
    }
    closeTestimonialModal(); fetchAllData();
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    await logAction('delete', 'testimonial', id);
    showToast('Testimonial deleted', 'info'); fetchAllData();
  };

  const openTestimonialModal = (t?: Testimonial) => {
    if (t) { setEditingTestimonial(t); setTestimonialForm({ name: t.name, location: t.location, comment: t.comment, rating: t.rating }); }
    else { setEditingTestimonial(null); setTestimonialForm({ name: '', location: '', comment: '', rating: 5 }); }
    setShowTestimonialModal(true);
  };
  const closeTestimonialModal = () => { setShowTestimonialModal(false); setEditingTestimonial(null); };

  // ===================== FAQS =====================
  const handleSaveFAQ = async () => {
    const payload = { question: faqForm.question, answer: faqForm.answer, order: faqForm.order };
    if (editingFAQ) {
      await supabase.from('faqs').update(payload).eq('id', editingFAQ.id);
      await logAction('update', 'faq', editingFAQ.id);
      showToast('FAQ updated', 'success');
    } else {
      const { data } = await supabase.from('faqs').insert(payload).select().single();
      await logAction('create', 'faq', data.id);
      showToast('FAQ created', 'success');
    }
    closeFAQModal(); fetchAllData();
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    await supabase.from('faqs').delete().eq('id', id);
    await logAction('delete', 'faq', id);
    showToast('FAQ deleted', 'info'); fetchAllData();
  };

  const openFAQModal = (f?: FAQ) => {
    if (f) { setEditingFAQ(f); setFaqForm({ question: f.question, answer: f.answer, order: f.order }); }
    else { setEditingFAQ(null); setFaqForm({ question: '', answer: '', order: faqs.length }); }
    setShowFAQModal(true);
  };
  const closeFAQModal = () => { setShowFAQModal(false); setEditingFAQ(null); };

  // ===================== COUPONS =====================
  const handleSaveCoupon = async () => {
    const payload = {
      code: couponForm.code.toUpperCase(), discount_type: couponForm.discount_type,
      discount_value: Number(couponForm.discount_value), min_order_amount: Number(couponForm.min_order_amount || 0),
      max_uses: couponForm.max_uses ? Number(couponForm.max_uses) : null,
      end_date: couponForm.end_date ? new Date(couponForm.end_date).toISOString() : null,
      active: couponForm.active,
    };
    if (editingCoupon) {
      await supabase.from('coupons').update(payload).eq('id', editingCoupon.id);
      await logAction('update', 'coupon', editingCoupon.id);
      showToast('Coupon updated', 'success');
    } else {
      const { data } = await supabase.from('coupons').insert(payload).select().single();
      await logAction('create', 'coupon', data.id);
      showToast('Coupon created', 'success');
    }
    closeCouponModal(); fetchAllData();
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    await logAction('delete', 'coupon', id);
    showToast('Coupon deleted', 'info'); fetchAllData();
  };

  const openCouponModal = (c?: Coupon) => {
    if (c) {
      setEditingCoupon(c);
      setCouponForm({ code: c.code, discount_type: c.discount_type, discount_value: String(c.discount_value), min_order_amount: String(c.min_order_amount), max_uses: c.max_uses ? String(c.max_uses) : '', end_date: c.end_date ? c.end_date.slice(0, 16) : '', active: c.active });
    } else {
      setEditingCoupon(null);
      setCouponForm({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_uses: '', end_date: '', active: true });
    }
    setShowCouponModal(true);
  };
  const closeCouponModal = () => { setShowCouponModal(false); setEditingCoupon(null); };

  // ===================== PROMOTIONS =====================
  const handleSavePromotion = async () => {
    const payload = {
      name: promotionForm.name, type: promotionForm.type,
      discount_percent: Number(promotionForm.discount_percent),
      applicable_categories: promotionForm.applicable_categories.split(',').map((s) => s.trim()).filter(Boolean),
      start_date: new Date(promotionForm.start_date).toISOString(),
      end_date: new Date(promotionForm.end_date).toISOString(),
      active: promotionForm.active,
    };
    if (editingPromotion) {
      await supabase.from('promotions').update(payload).eq('id', editingPromotion.id);
      await logAction('update', 'promotion', editingPromotion.id);
      showToast('Promotion updated', 'success');
    } else {
      const { data } = await supabase.from('promotions').insert(payload).select().single();
      await logAction('create', 'promotion', data.id);
      showToast('Promotion created', 'success');
    }
    closePromotionModal(); fetchAllData();
  };

  const handleDeletePromotion = async (id: string) => {
    if (!confirm('Delete this promotion?')) return;
    await supabase.from('promotions').delete().eq('id', id);
    await logAction('delete', 'promotion', id);
    showToast('Promotion deleted', 'info'); fetchAllData();
  };

  const openPromotionModal = (p?: Promotion) => {
    if (p) {
      setEditingPromotion(p);
      setPromotionForm({ name: p.name, type: p.type, discount_percent: String(p.discount_percent), applicable_categories: p.applicable_categories.join(', '), start_date: p.start_date.slice(0, 16), end_date: p.end_date.slice(0, 16), active: p.active });
    } else {
      setEditingPromotion(null);
      setPromotionForm({ name: '', type: 'flash_sale', discount_percent: '', applicable_categories: '', start_date: '', end_date: '', active: true });
    }
    setShowPromotionModal(true);
  };
  const closePromotionModal = () => { setShowPromotionModal(false); setEditingPromotion(null); };

  // ===================== DELIVERY =====================
  const handleSaveDelivery = async () => {
    const payload = {
      country: deliveryForm.country, city: deliveryForm.city || null,
      shipping_cost: Number(deliveryForm.shipping_cost),
      free_shipping_threshold: deliveryForm.free_shipping_threshold ? Number(deliveryForm.free_shipping_threshold) : null,
      delivery_days_min: Number(deliveryForm.delivery_days_min),
      delivery_days_max: Number(deliveryForm.delivery_days_max),
      active: deliveryForm.active,
    };
    if (editingDelivery) {
      await supabase.from('delivery_settings').update(payload).eq('id', editingDelivery.id);
      await logAction('update', 'delivery', editingDelivery.id);
      showToast('Delivery setting updated', 'success');
    } else {
      const { data } = await supabase.from('delivery_settings').insert(payload).select().single();
      await logAction('create', 'delivery', data.id);
      showToast('Delivery setting created', 'success');
    }
    closeDeliveryModal(); fetchAllData();
  };

  const handleDeleteDelivery = async (id: string) => {
    if (!confirm('Delete this delivery setting?')) return;
    await supabase.from('delivery_settings').delete().eq('id', id);
    await logAction('delete', 'delivery', id);
    showToast('Delivery setting deleted', 'info'); fetchAllData();
  };

  const openDeliveryModal = (d?: DeliverySetting) => {
    if (d) {
      setEditingDelivery(d);
      setDeliveryForm({ country: d.country, city: d.city || '', shipping_cost: String(d.shipping_cost), free_shipping_threshold: d.free_shipping_threshold ? String(d.free_shipping_threshold) : '', delivery_days_min: String(d.delivery_days_min), delivery_days_max: String(d.delivery_days_max), active: d.active });
    } else {
      setEditingDelivery(null);
      setDeliveryForm({ country: '', city: '', shipping_cost: '', free_shipping_threshold: '', delivery_days_min: '1', delivery_days_max: '5', active: true });
    }
    setShowDeliveryModal(true);
  };
  const closeDeliveryModal = () => { setShowDeliveryModal(false); setEditingDelivery(null); };

  // ===================== ORDERS =====================
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) { showToast(error.message, 'error'); return; }
    await logAction('update_status', 'order', orderId, { status });
    showToast('Order status updated', 'success');
    fetchAllData();
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    const { error } = await supabase.from('orders').update({ payment_status: paymentStatus }).eq('id', orderId);
    if (error) { showToast(error.message, 'error'); return; }
    await logAction('update_payment', 'order', orderId, { payment_status: paymentStatus });
    showToast('Payment status updated', 'success');
    fetchAllData();
  };

  // ===================== SETTINGS =====================
  const handleUpdateSetting = async (id: string, value: string) => {
    const { error } = await supabase.from('site_settings').update({ value }).eq('id', id);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Setting saved', 'success');
    fetchAllData();
  };

  const handleChangePin = async () => {
    if (newPin.length < 4) { showToast('PIN must be at least 4 characters', 'error'); return; }
    if (newPin !== confirmPin) { showToast('PINs do not match', 'error'); return; }
    const pinSetting = siteSettings.find((s) => s.key === 'admin_pin');
    if (!pinSetting) { showToast('PIN setting not found', 'error'); return; }
    const { error } = await supabase.from('site_settings').update({ value: newPin }).eq('id', pinSetting.id);
    if (error) { showToast(error.message, 'error'); return; }
    setNewPin('');
    setConfirmPin('');
    setShowPinChange(false);
    showToast('Admin PIN updated successfully', 'success');
    await logAction('change_pin', 'security');
    fetchAllData();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_pin_verified');
    navigate('/admin-login');
  };

  // ===================== REVIEWS =====================
  const handleDeleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    await logAction('delete', 'review', id);
    showToast('Review deleted', 'info'); fetchAllData();
  };

  // ===================== FILTERING =====================
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matches = p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    if (productFilter === 'featured') return matches && p.featured;
    if (productFilter === 'best_seller') return matches && p.best_seller;
    if (productFilter === 'new_arrival') return matches && p.new_arrival;
    if (productFilter === 'low_stock') return matches && p.stock_quantity <= 5;
    if (productFilter === 'out_of_stock') return matches && p.stock_quantity === 0;
    return matches;
  });

  const filteredOrders = orderFilter ? orders.filter((o) => o.status === orderFilter) : orders;

  const settingCategories = [...new Set(siteSettings.map((s) => s.category))];

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'faqs', label: 'FAQs', icon: FileText },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'promotions', label: 'Promotions', icon: Tag },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy text-white transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/images/logo/WhatsApp_Image_2026-06-23_at_10.06.58_PM.jpeg" alt="" className="h-10 w-auto object-contain rounded" />
            <div>
              <h1 className="font-serif text-sm">Aura & Anchor</h1>
              <p className="text-[10px] text-gold uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                activeTab === tab.id ? 'bg-gold text-navy font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-navy text-xs font-bold">A</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate">{ADMIN_EMAIL}</p>
              <p className="text-[10px] text-white/50">Super Admin</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors">
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-navy">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-serif text-xl text-navy capitalize">{activeTab.replace('_', ' ')}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAllData} className="p-2 text-gray-400 hover:text-gold transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <a href="/" target="_blank" className="text-xs text-gold hover:underline">View Site</a>
          </div>
        </header>

        <main className="p-6">
          {/* ===================== DASHBOARD ===================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', value: formatPrice(analytics.totalRevenue), icon: DollarSign, color: 'bg-green-50 text-green-600', trend: analytics.salesThisMonth >= analytics.salesLastMonth ? 'up' : 'down' },
                  { label: 'Total Orders', value: analytics.totalOrders, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Pending Orders', value: analytics.pendingOrders, icon: Clock, color: 'bg-gold/10 text-gold' },
                  { label: 'Total Customers', value: analytics.totalCustomers, icon: UserCheck, color: 'bg-purple-50 text-purple-600' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase tracking-wider text-gray-500">{stat.label}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stat.color}`}><stat.icon className="w-4 h-4" /></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-serif text-2xl text-navy">{stat.value}</p>
                      {stat.trend && (stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-navy">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs text-gold hover:underline">View All</button>
                  </div>
                  <div className="space-y-3">
                    {analytics.recentOrders.slice(0, 5).map((o) => (
                      <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                        <div>
                          <p className="text-sm text-navy font-medium">{o.order_number}</p>
                          <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-navy">{formatPrice(o.total)}</span>
                          <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${
                            o.status === 'delivered' ? 'bg-green-50 text-green-600' : o.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-gold/10 text-gold'
                          }`}>{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-navy flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-gold" /> Low Stock Alert
                    </h3>
                    <button onClick={() => { setProductFilter('low_stock'); setActiveTab('products'); }} className="text-xs text-gold hover:underline">View All</button>
                  </div>
                  <div className="space-y-3">
                    {products.filter((p) => p.stock_quantity <= 5 && p.stock_quantity > 0).slice(0, 5).map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                          <img src={p.images[0]} alt="" className="w-8 h-8 object-cover rounded" />
                          <p className="text-sm text-navy">{p.name}</p>
                        </div>
                        <span className="text-xs text-gold font-medium">{p.stock_quantity} left</span>
                      </div>
                    ))}
                    {products.filter((p) => p.stock_quantity <= 5 && p.stock_quantity > 0).length === 0 && (
                      <p className="text-sm text-gray-400">No low stock items</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== PRODUCTS ===================== */}
          {activeTab === 'products' && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => openProductModal()} className="bg-gold text-navy px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gold-600 transition-colors">
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                  <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold">
                    <option value="">All Products</option>
                    <option value="featured">Featured</option>
                    <option value="best_seller">Best Sellers</option>
                    <option value="new_arrival">New Arrivals</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div className="relative max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gold" />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">Product</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">Brand</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">Price</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">Stock</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                        <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded" />
                              <span className="text-navy font-medium">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{p.brand}</td>
                          <td className="px-4 py-3 text-navy">{formatPrice(p.discount_price ?? p.price)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium ${p.stock_quantity <= 5 ? 'text-gold' : 'text-gray-500'}`}>{p.stock_quantity}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {p.featured && <span className="text-[10px] bg-gold/10 text-gold px-1.5 py-0.5 rounded">F</span>}
                              {p.best_seller && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">B</span>}
                              {p.new_arrival && <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded">N</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openProductModal(p)} className="p-1.5 text-gray-400 hover:text-gold rounded"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">{filteredProducts.length} products</div>
              </div>
            </div>
          )}

          {/* ===================== ORDERS ===================== */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold">
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button onClick={() => { const csv = orders.map((o) => `${o.order_number},${o.guest_email || o.customer_id},${o.total},${o.status},${o.created_at}`).join('\n'); const blob = new Blob([`Order,Customer,Total,Status,Date\n${csv}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click(); }} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm hover:border-gold transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Order #</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Customer</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Total</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Payment</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                    </tr></thead>
                    <tbody>
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-navy font-medium">{o.order_number}</td>
                          <td className="px-4 py-3 text-gray-500">{o.guest_name || o.guest_email || o.customer_id?.slice(0, 8) || 'Guest'}</td>
                          <td className="px-4 py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-navy">{formatPrice(o.total)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${
                              o.status === 'delivered' ? 'bg-green-50 text-green-600' : o.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-gold/10 text-gold'
                            }`}>{o.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${
                              o.payment_status === 'paid' ? 'bg-green-50 text-green-600' : o.payment_status === 'refunded' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                            }`}>{o.payment_status || 'pending'}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setShowOrderDetail(o)} className="p-1.5 text-gray-400 hover:text-navy rounded"><Eye className="w-4 h-4" /></button>
                              <select value={o.status} onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-gold">
                                <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
                              </select>
                              <select value={o.payment_status || 'pending'} onChange={(e) => handleUpdatePaymentStatus(o.id, e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-gold">
                                <option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== CUSTOMERS ===================== */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Phone</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Joined</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                  </tr></thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-navy font-medium">{c.full_name}</td>
                        <td className="px-4 py-3 text-gray-500">{c.email}</td>
                        <td className="px-4 py-3 text-gray-500">{c.phone || '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setShowCustomerDetail(c)} className="p-1.5 text-gray-400 hover:text-navy rounded"><Eye className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== REVIEWS ===================== */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Product</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Customer</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Rating</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Comment</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                  </tr></thead>
                  <tbody>
                    {reviews.map((r) => (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-navy">{(r as any).products?.name || r.product_id.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-gray-500">{r.customer_name}</td>
                        <td className="px-4 py-3"><span className="text-gold">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span></td>
                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{r.comment}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteReview(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== BANNERS ===================== */}
          {activeTab === 'banners' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={() => openBannerModal()} className="bg-gold text-navy px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gold-600 transition-colors">
                  <Plus className="w-4 h-4" /> Add Banner
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {banners.map((b) => (
                  <div key={b.id} className={`bg-white rounded-lg border shadow-sm overflow-hidden ${b.active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                    <div className="aspect-video overflow-hidden bg-gray-100">
                      <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-navy mb-1">{b.title}</h4>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{b.subtitle}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${b.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{b.active ? 'Active' : 'Inactive'}</span>
                        <div className="flex gap-1">
                          <button onClick={() => openBannerModal(b)} className="p-1.5 text-gray-400 hover:text-gold rounded"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteBanner(b.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TESTIMONIALS ===================== */}
          {activeTab === 'testimonials' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={() => openTestimonialModal()} className="bg-gold text-navy px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gold-600 transition-colors">
                  <Plus className="w-4 h-4" /> Add Testimonial
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testimonials.map((t) => (
                  <div key={t.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => <span key={s} className={`text-sm ${s <= t.rating ? 'text-gold' : 'text-gray-200'}`}>★</span>)}
                    </div>
                    <p className="text-sm text-navy/80 mb-4 italic">&ldquo;{t.comment}&rdquo;</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-navy">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.location}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openTestimonialModal(t)} className="p-1.5 text-gray-400 hover:text-gold rounded"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteTestimonial(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== FAQS ===================== */}
          {activeTab === 'faqs' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={() => openFAQModal()} className="bg-gold text-navy px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gold-600 transition-colors">
                  <Plus className="w-4 h-4" /> Add FAQ
                </button>
              </div>
              <div className="space-y-3 max-w-3xl">
                {faqs.map((f, i) => (
                  <div key={f.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-navy">{i + 1}. {f.question}</p>
                        <p className="text-sm text-gray-500 mt-2">{f.answer}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openFAQModal(f)} className="p-1.5 text-gray-400 hover:text-gold rounded"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteFAQ(f.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== COUPONS ===================== */}
          {activeTab === 'coupons' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={() => openCouponModal()} className="bg-gold text-navy px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gold-600 transition-colors">
                  <Plus className="w-4 h-4" /> Add Coupon
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Code</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Value</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Uses</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Expires</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                    </tr></thead>
                    <tbody>
                      {coupons.map((c) => (
                        <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-mono text-navy font-medium">{c.code}</td>
                          <td className="px-4 py-3 text-gray-500 capitalize">{c.discount_type}</td>
                          <td className="px-4 py-3 text-navy">{c.discount_type === 'percentage' ? `${c.discount_value}%` : formatPrice(c.discount_value)}</td>
                          <td className="px-4 py-3 text-gray-500">{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                          <td className="px-4 py-3 text-gray-500">{c.end_date ? new Date(c.end_date).toLocaleDateString() : 'Never'}</td>
                          <td className="px-4 py-3"><span className={`text-[10px] uppercase px-2 py-0.5 rounded ${c.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{c.active ? 'Active' : 'Inactive'}</span></td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openCouponModal(c)} className="p-1.5 text-gray-400 hover:text-gold rounded"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteCoupon(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== PROMOTIONS ===================== */}
          {activeTab === 'promotions' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={() => openPromotionModal()} className="bg-gold text-navy px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gold-600 transition-colors">
                  <Plus className="w-4 h-4" /> Add Promotion
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promotions.map((p) => (
                  <div key={p.id} className={`bg-white rounded-lg border shadow-sm p-5 ${p.active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-navy">{p.name}</h4>
                        <p className="text-xs text-gray-500 capitalize">{p.type.replace('_', ' ')}</p>
                      </div>
                      <span className="text-2xl font-serif text-gold">{p.discount_percent}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Categories: {p.applicable_categories.join(', ') || 'All'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()}</span>
                      <div className="flex gap-1">
                        <button onClick={() => openPromotionModal(p)} className="p-1.5 text-gray-400 hover:text-gold rounded"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDeletePromotion(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== DELIVERY ===================== */}
          {activeTab === 'delivery' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={() => openDeliveryModal()} className="bg-gold text-navy px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gold-600 transition-colors">
                  <Plus className="w-4 h-4" /> Add Delivery Zone
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Country</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">City</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Shipping Cost</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Free Shipping</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Delivery Time</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                    </tr></thead>
                    <tbody>
                      {deliverySettings.map((d) => (
                        <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-navy font-medium">{d.country}</td>
                          <td className="px-4 py-3 text-gray-500">{d.city || 'All'}</td>
                          <td className="px-4 py-3 text-navy">{formatPrice(d.shipping_cost)}</td>
                          <td className="px-4 py-3 text-gray-500">{d.free_shipping_threshold ? formatPrice(d.free_shipping_threshold) : '-'}</td>
                          <td className="px-4 py-3 text-gray-500">{d.delivery_days_min}-{d.delivery_days_max} days</td>
                          <td className="px-4 py-3"><span className={`text-[10px] uppercase px-2 py-0.5 rounded ${d.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{d.active ? 'Active' : 'Inactive'}</span></td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openDeliveryModal(d)} className="p-1.5 text-gray-400 hover:text-gold rounded"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteDelivery(d.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== SETTINGS ===================== */}
          {activeTab === 'settings' && (
            <div>
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {settingCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setShowSettingsCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm capitalize whitespace-nowrap transition-colors ${
                      showSettingsCategory === cat ? 'bg-navy text-white' : 'bg-white text-navy border border-gray-200 hover:border-gold'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-6">
                {siteSettings.filter((s) => s.category === showSettingsCategory).map((s) => (
                  <div key={s.id}>
                    <label className="text-sm font-medium text-navy mb-1 block">{s.key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</label>
                    <p className="text-xs text-gray-400 mb-2">{s.description}</p>
                    {s.type === 'textarea' ? (
                      <textarea
                        defaultValue={s.value}
                        onBlur={(e) => handleUpdateSetting(s.id, e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold text-sm"
                      />
                    ) : s.type === 'boolean' ? (
                      <select
                        defaultValue={s.value}
                        onChange={(e) => handleUpdateSetting(s.id, e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold text-sm"
                      >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    ) : s.type === 'color' ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          defaultValue={s.value}
                          onChange={(e) => handleUpdateSetting(s.id, e.target.value)}
                          className="w-12 h-10 rounded border border-gray-200"
                        />
                        <span className="text-sm text-gray-500 font-mono">{s.value}</span>
                      </div>
                    ) : s.type === 'image' ? (
                      <div className="flex items-center gap-3">
                        <img src={s.value} alt="" className="w-16 h-16 object-contain border border-gray-100 rounded" />
                        <input
                          type="text"
                          defaultValue={s.value}
                          onBlur={(e) => handleUpdateSetting(s.id, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold text-sm"
                        />
                      </div>
                    ) : (
                      <input
                        type={s.type === 'number' ? 'number' : s.type === 'url' ? 'url' : 'text'}
                        defaultValue={s.value}
                        onBlur={(e) => handleUpdateSetting(s.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold text-sm"
                      />
                    )}
                  </div>
                ))}

                {/* Change PIN Section */}
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-navy">Admin PIN</h3>
                      <p className="text-xs text-gray-400">Change the PIN used to access this dashboard</p>
                    </div>
                    <button
                      onClick={() => setShowPinChange(!showPinChange)}
                      className="text-xs text-gold hover:underline"
                    >
                      {showPinChange ? 'Cancel' : 'Change PIN'}
                    </button>
                  </div>

                  {showPinChange && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3 max-w-md">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">New PIN</label>
                        <input
                          type="password"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          placeholder="Min 4 characters"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Confirm New PIN</label>
                        <input
                          type="password"
                          value={confirmPin}
                          onChange={(e) => setConfirmPin(e.target.value)}
                          placeholder="Re-enter new PIN"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold text-sm"
                        />
                      </div>
                      <button
                        onClick={handleChangePin}
                        className="bg-gold text-navy px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors"
                      >
                        Update PIN
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================== ANALYTICS ===================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Revenue', value: formatPrice(analytics.totalRevenue), icon: DollarSign, color: 'bg-green-50 text-green-600' },
                  { label: 'Orders', value: analytics.totalOrders, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Avg Order', value: formatPrice(analytics.avgOrderValue), icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
                  { label: 'This Month', value: formatPrice(analytics.salesThisMonth), icon: Calendar, color: 'bg-gold/10 text-gold' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase tracking-wider text-gray-500">{stat.label}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stat.color}`}><stat.icon className="w-4 h-4" /></div>
                    </div>
                    <p className="font-serif text-2xl text-navy">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                  <h3 className="font-medium text-navy mb-4">Top Selling Products</h3>
                  <div className="space-y-3">
                    {analytics.topProducts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center">{i + 1}</span>
                          <span className="text-sm text-navy">{p.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-navy">{formatPrice(p.total)}</p>
                          <p className="text-xs text-gray-400">{p.qty} sold</p>
                        </div>
                      </div>
                    ))}
                    {analytics.topProducts.length === 0 && <p className="text-sm text-gray-400">No sales data yet</p>}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                  <h3 className="font-medium text-navy mb-4">Orders by Status</h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-500 capitalize">{status}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gold rounded-full" style={{ width: `${analytics.totalOrders > 0 ? (count / analytics.totalOrders) * 100 : 0}%` }} />
                          </div>
                          <span className="text-sm text-navy w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================== MODALS ===================== */}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-serif text-xl text-navy">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={closeProductModal} className="p-1 text-gray-400 hover:text-navy"><XIcon className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-600 mb-1 block">Name *</label><input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
                <div><label className="text-sm text-gray-600 mb-1 block">Brand *</label><input value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-600 mb-1 block">Category *</label><input value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
                <div><label className="text-sm text-gray-600 mb-1 block">Stock Quantity *</label><input type="number" value={productForm.stock_quantity} onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-600 mb-1 block">Price (UGX) *</label><input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
                <div><label className="text-sm text-gray-600 mb-1 block">Discount Price (UGX)</label><input type="number" value={productForm.discount_price} onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
              </div>
              <div><label className="text-sm text-gray-600 mb-1 block">Description *</label><textarea rows={4} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold resize-none" /></div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Images</label>
                <div className="space-y-2">
                  {productForm.images.map((img, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={img} onChange={(e) => { const next = [...productForm.images]; next[i] = e.target.value; setProductForm({ ...productForm, images: next }); }} placeholder="Image URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" />
                      {productForm.images.length > 1 && <button onClick={() => { const next = productForm.images.filter((_, idx) => idx !== i); setProductForm({ ...productForm, images: next.length ? next : [''] }); }} className="px-3 text-red-500 hover:bg-red-50 rounded"><XIcon className="w-4 h-4" /></button>}
                    </div>
                  ))}
                  <button onClick={() => setProductForm({ ...productForm, images: [...productForm.images, ''] })} className="text-sm text-gold hover:underline">+ Add another image</button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Specifications</label>
                <div className="flex gap-2 mb-2">
                  <input value={productForm.specKey} onChange={(e) => setProductForm({ ...productForm, specKey: e.target.value })} placeholder="Key (e.g. Movement)" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" />
                  <input value={productForm.specValue} onChange={(e) => setProductForm({ ...productForm, specValue: e.target.value })} placeholder="Value" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" />
                  <button onClick={() => { if (!productForm.specKey.trim() || !productForm.specValue.trim()) return; setProductForm({ ...productForm, specifications: { ...productForm.specifications, [productForm.specKey]: productForm.specValue }, specKey: '', specValue: '' }); }} className="bg-navy text-white px-4 py-2 rounded-lg text-sm hover:bg-gold transition-colors">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(productForm.specifications).map(([k, v]) => (
                    <span key={k} className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded text-xs">{k}: {v}<button onClick={() => { const next = { ...productForm.specifications }; delete next[k]; setProductForm({ ...productForm, specifications: next }); }} className="text-gray-400 hover:text-red-500"><XIcon className="w-3 h-3" /></button></span>
                  ))}
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={productForm.featured} onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })} className="accent-gold" /><span className="text-sm text-navy">Featured</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={productForm.best_seller} onChange={(e) => setProductForm({ ...productForm, best_seller: e.target.checked })} className="accent-gold" /><span className="text-sm text-navy">Best Seller</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={productForm.new_arrival} onChange={(e) => setProductForm({ ...productForm, new_arrival: e.target.checked })} className="accent-gold" /><span className="text-sm text-navy">New Arrival</span></label>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={closeProductModal} className="flex-1 py-3 border border-gray-200 text-navy rounded-lg hover:border-gold transition-colors">Cancel</button>
              <button onClick={handleSaveProduct} className="flex-1 bg-gold text-navy py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors">{editingProduct ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100"><h2 className="font-serif text-xl text-navy">{editingBanner ? 'Edit Banner' : 'Add Banner'}</h2><button onClick={closeBannerModal} className="p-1 text-gray-400 hover:text-navy"><XIcon className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="text-sm text-gray-600 mb-1 block">Title *</label><input value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">Subtitle *</label><textarea rows={2} value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold resize-none" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">Image URL *</label><input value={bannerForm.image} onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
              {bannerForm.image && <img src={bannerForm.image} alt="Preview" className="w-full h-32 object-cover rounded-lg" />}
              <div><label className="text-sm text-gray-600 mb-1 block">Link</label><input value={bannerForm.link} onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-600 mb-1 block">Order</label><input type="number" value={bannerForm.order} onChange={(e) => setBannerForm({ ...bannerForm, order: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
                <div className="flex items-end"><label className="flex items-center gap-2 cursor-pointer pb-2"><input type="checkbox" checked={bannerForm.active} onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })} className="accent-gold" /><span className="text-sm text-navy">Active</span></label></div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={closeBannerModal} className="flex-1 py-3 border border-gray-200 text-navy rounded-lg hover:border-gold transition-colors">Cancel</button>
              <button onClick={handleSaveBanner} className="flex-1 bg-gold text-navy py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors">{editingBanner ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100"><h2 className="font-serif text-xl text-navy">{editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}</h2><button onClick={closeTestimonialModal} className="p-1 text-gray-400 hover:text-navy"><XIcon className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="text-sm text-gray-600 mb-1 block">Name *</label><input value={testimonialForm.name} onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">Location *</label><input value={testimonialForm.location} onChange={(e) => setTestimonialForm({ ...testimonialForm, location: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">Comment *</label><textarea rows={4} value={testimonialForm.comment} onChange={(e) => setTestimonialForm({ ...testimonialForm, comment: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold resize-none" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">Rating</label><select value={testimonialForm.rating} onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold"><option value={1}>1 Star</option><option value={2}>2 Stars</option><option value={3}>3 Stars</option><option value={4}>4 Stars</option><option value={5}>5 Stars</option></select></div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={closeTestimonialModal} className="flex-1 py-3 border border-gray-200 text-navy rounded-lg hover:border-gold transition-colors">Cancel</button>
              <button onClick={handleSaveTestimonial} className="flex-1 bg-gold text-navy py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors">{editingTestimonial ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFAQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100"><h2 className="font-serif text-xl text-navy">{editingFAQ ? 'Edit FAQ' : 'Add FAQ'}</h2><button onClick={closeFAQModal} className="p-1 text-gray-400 hover:text-navy"><XIcon className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="text-sm text-gray-600 mb-1 block">Question *</label><input value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">Answer *</label><textarea rows={4} value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold resize-none" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">Order</label><input type="number" value={faqForm.order} onChange={(e) => setFaqForm({ ...faqForm, order: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={closeFAQModal} className="flex-1 py-3 border border-gray-200 text-navy rounded-lg hover:border-gold transition-colors">Cancel</button>
              <button onClick={handleSaveFAQ} className="flex-1 bg-gold text-navy py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors">{editingFAQ ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100"><h2 className="font-serif text-xl text-navy">{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</h2><button onClick={closeCouponModal} className="p-1 text-gray-400 hover:text-navy"><XIcon className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="text-sm text-gray-600 mb-1 block">Code *</label><input value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold font-mono" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-600 mb-1 block">Type *</label><select value={couponForm.discount_type} onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as any })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold"><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></select></div>
                <div><label className="text-sm text-gray-600 mb-1 block">Value *</label><input type="number" value={couponForm.discount_value} onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-600 mb-1 block">Min Order (UGX)</label><input type="number" value={couponForm.min_order_amount} onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
                <div><label className="text-sm text-gray-600 mb-1 block">Max Uses</label><input type="number" value={couponForm.max_uses} onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" placeholder="Unlimited" /></div>
              </div>
              <div><label className="text-sm text-gray-600 mb-1 block">Expiry Date</label><input type="datetime-local" value={couponForm.end_date} onChange={(e) => setCouponForm({ ...couponForm, end_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={couponForm.active} onChange={(e) => setCouponForm({ ...couponForm, active: e.target.checked })} className="accent-gold" /><span className="text-sm text-navy">Active</span></label>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={closeCouponModal} className="flex-1 py-3 border border-gray-200 text-navy rounded-lg hover:border-gold transition-colors">Cancel</button>
              <button onClick={handleSaveCoupon} className="flex-1 bg-gold text-navy py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors">{editingCoupon ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100"><h2 className="font-serif text-xl text-navy">{editingPromotion ? 'Edit Promotion' : 'Add Promotion'}</h2><button onClick={closePromotionModal} className="p-1 text-gray-400 hover:text-navy"><XIcon className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="text-sm text-gray-600 mb-1 block">Name *</label><input value={promotionForm.name} onChange={(e) => setPromotionForm({ ...promotionForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-600 mb-1 block">Type *</label><select value={promotionForm.type} onChange={(e) => setPromotionForm({ ...promotionForm, type: e.target.value as any })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold"><option value="flash_sale">Flash Sale</option><option value="category_discount">Category Discount</option><option value="buy_x_get_y">Buy X Get Y</option></select></div>
                <div><label className="text-sm text-gray-600 mb-1 block">Discount % *</label><input type="number" value={promotionForm.discount_percent} onChange={(e) => setPromotionForm({ ...promotionForm, discount_percent: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
              </div>
              <div><label className="text-sm text-gray-600 mb-1 block">Categories (comma separated)</label><input value={promotionForm.applicable_categories} onChange={(e) => setPromotionForm({ ...promotionForm, applicable_categories: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" placeholder="Chronograph, Diver, Dress" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-600 mb-1 block">Start Date *</label><input type="datetime-local" value={promotionForm.start_date} onChange={(e) => setPromotionForm({ ...promotionForm, start_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
                <div><label className="text-sm text-gray-600 mb-1 block">End Date *</label><input type="datetime-local" value={promotionForm.end_date} onChange={(e) => setPromotionForm({ ...promotionForm, end_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={promotionForm.active} onChange={(e) => setPromotionForm({ ...promotionForm, active: e.target.checked })} className="accent-gold" /><span className="text-sm text-navy">Active</span></label>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={closePromotionModal} className="flex-1 py-3 border border-gray-200 text-navy rounded-lg hover:border-gold transition-colors">Cancel</button>
              <button onClick={handleSavePromotion} className="flex-1 bg-gold text-navy py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors">{editingPromotion ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100"><h2 className="font-serif text-xl text-navy">{editingDelivery ? 'Edit Delivery Zone' : 'Add Delivery Zone'}</h2><button onClick={closeDeliveryModal} className="p-1 text-gray-400 hover:text-navy"><XIcon className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-600 mb-1 block">Country *</label><input value={deliveryForm.country} onChange={(e) => setDeliveryForm({ ...deliveryForm, country: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
                <div><label className="text-sm text-gray-600 mb-1 block">City</label><input value={deliveryForm.city} onChange={(e) => setDeliveryForm({ ...deliveryForm, city: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" placeholder="Leave empty for all cities" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-600 mb-1 block">Shipping Cost (UGX) *</label><input type="number" value={deliveryForm.shipping_cost} onChange={(e) => setDeliveryForm({ ...deliveryForm, shipping_cost: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
                <div><label className="text-sm text-gray-600 mb-1 block">Free Shipping Threshold (UGX)</label><input type="number" value={deliveryForm.free_shipping_threshold} onChange={(e) => setDeliveryForm({ ...deliveryForm, free_shipping_threshold: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" placeholder="Optional" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-600 mb-1 block">Min Delivery Days *</label><input type="number" value={deliveryForm.delivery_days_min} onChange={(e) => setDeliveryForm({ ...deliveryForm, delivery_days_min: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
                <div><label className="text-sm text-gray-600 mb-1 block">Max Delivery Days *</label><input type="number" value={deliveryForm.delivery_days_max} onChange={(e) => setDeliveryForm({ ...deliveryForm, delivery_days_max: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold" /></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={deliveryForm.active} onChange={(e) => setDeliveryForm({ ...deliveryForm, active: e.target.checked })} className="accent-gold" /><span className="text-sm text-navy">Active</span></label>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={closeDeliveryModal} className="flex-1 py-3 border border-gray-200 text-navy rounded-lg hover:border-gold transition-colors">Cancel</button>
              <button onClick={handleSaveDelivery} className="flex-1 bg-gold text-navy py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors">{editingDelivery ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100"><h2 className="font-serif text-xl text-navy">Order Details</h2><button onClick={() => setShowOrderDetail(null)} className="p-1 text-gray-400 hover:text-navy"><XIcon className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500">Order #{showOrderDetail.order_number}</p><p className="text-xs text-gray-400">{new Date(showOrderDetail.created_at).toLocaleDateString()}</p></div>
                <span className={`text-xs uppercase px-3 py-1 rounded ${showOrderDetail.status === 'delivered' ? 'bg-green-50 text-green-600' : showOrderDetail.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-gold/10 text-gold'}`}>{showOrderDetail.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg"><h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Shipping Address</h4><div className="text-sm text-navy"><p className="font-medium">{(showOrderDetail.shipping_address as any).full_name}</p><p className="text-gray-500">{(showOrderDetail.shipping_address as any).phone}</p><p className="text-gray-500">{(showOrderDetail.shipping_address as any).address_line1}</p><p className="text-gray-500">{(showOrderDetail.shipping_address as any).city}, {(showOrderDetail.shipping_address as any).country}</p></div></div>
                <div className="bg-gray-50 p-4 rounded-lg"><h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Payment</h4><p className="text-sm text-navy capitalize">{showOrderDetail.payment_method === 'mtn' ? 'MTN Mobile Money' : showOrderDetail.payment_method === 'airtel' ? 'Airtel Money' : 'Cash on Delivery'}</p><p className="text-sm text-navy mt-2 font-medium">{formatPrice(showOrderDetail.total)}</p></div>
              </div>
              <div><h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Items</h4><div className="space-y-2">{(showOrderDetail as any).order_items?.map((item: any) => (<div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50"><img src={item.products?.images?.[0]} alt="" className="w-12 h-12 object-cover rounded" /><div className="flex-1"><p className="text-sm text-navy">{item.products?.name}</p><p className="text-xs text-gray-500">Qty: {item.quantity}</p></div><span className="text-sm text-navy">{formatPrice(item.price * item.quantity)}</span></div>))}</div></div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showCustomerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100"><h2 className="font-serif text-xl text-navy">Customer Details</h2><button onClick={() => setShowCustomerDetail(null)} className="p-1 text-gray-400 hover:text-navy"><XIcon className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center text-white font-serif text-xl">{showCustomerDetail.full_name.charAt(0)}</div>
                <div><h3 className="font-medium text-navy text-lg">{showCustomerDetail.full_name}</h3><p className="text-sm text-gray-500">{showCustomerDetail.email}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg"><p className="text-xs text-gray-500 uppercase">Phone</p><p className="text-sm text-navy">{showCustomerDetail.phone || 'Not provided'}</p></div>
                <div className="bg-gray-50 p-4 rounded-lg"><p className="text-xs text-gray-500 uppercase">Member Since</p><p className="text-sm text-navy">{new Date(showCustomerDetail.created_at).toLocaleDateString()}</p></div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Orders</p>
                {orders.filter((o) => o.customer_id === showCustomerDetail.id).map((o) => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50"><span className="text-sm text-navy">{o.order_number}</span><span className="text-sm text-navy">{formatPrice(o.total)}</span></div>
                ))}
                {orders.filter((o) => o.customer_id === showCustomerDetail.id).length === 0 && <p className="text-sm text-gray-400">No orders yet</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
