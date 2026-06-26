export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'color' | 'image' | 'url' | 'textarea';
  category: string;
  description: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  start_date: string;
  end_date: string | null;
  active: boolean;
  created_at: string;
}

export interface Promotion {
  id: string;
  name: string;
  type: 'flash_sale' | 'category_discount' | 'buy_x_get_y';
  discount_percent: number;
  applicable_products: string[];
  applicable_categories: string[];
  start_date: string;
  end_date: string;
  active: boolean;
  created_at: string;
}

export interface DeliverySetting {
  id: string;
  country: string;
  city: string | null;
  shipping_cost: number;
  free_shipping_threshold: number | null;
  delivery_days_min: number;
  delivery_days_max: number;
  active: boolean;
  created_at: string;
}

export interface AdminLog {
  id: string;
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, any>;
  created_at: string;
}
