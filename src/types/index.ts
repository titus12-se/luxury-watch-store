export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  specifications: Record<string, string>;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  category: string;
  brand: string;
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  guest_name: string | null;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  total: number;
  shipping_cost: number;
  shipping_address: ShippingAddress;
  payment_method: string;
  estimated_delivery_days: number | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  country: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_id: string | null;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  customer_id: string;
  product_id: string;
  product?: Product;
  created_at: string;
}

export interface Address {
  id: string;
  customer_id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string | null;
  active: boolean;
  order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  comment: string;
  rating: number;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  created_at: string;
}

export interface CustomerProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}
