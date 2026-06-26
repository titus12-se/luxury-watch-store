/*
# Admin Tables for Aura & Anchor Collections

1. New Tables
- `site_settings`: Key-value store for website configuration (logo, contact info, branding, theme)
- `coupons`: Promotional codes with discount rules
- `promotions`: Flash sales and promotional campaigns
- `delivery_settings`: Supported countries, shipping rates, delivery zones
- `admin_logs`: Audit trail for admin actions

2. Security
- RLS enabled on all tables
- Admin-only access via email check
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  category text NOT NULL DEFAULT 'general',
  description text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value >= 0),
  min_order_amount numeric DEFAULT 0,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('flash_sale', 'category_discount', 'buy_x_get_y')),
  discount_percent integer NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  applicable_products text[] DEFAULT '{}',
  applicable_categories text[] DEFAULT '{}',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  city text,
  shipping_cost numeric NOT NULL DEFAULT 0,
  free_shipping_threshold numeric,
  delivery_days_min integer NOT NULL DEFAULT 1,
  delivery_days_max integer NOT NULL DEFAULT 5,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(active);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(active);
CREATE INDEX IF NOT EXISTS idx_delivery_active ON delivery_settings(active);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at DESC);

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only policies using email check
DROP POLICY IF EXISTS "site_settings_admin_all" ON site_settings;
CREATE POLICY "site_settings_admin_all" ON site_settings
FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'auraanchorcollections@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'auraanchorcollections@gmail.com');

DROP POLICY IF EXISTS "coupons_admin_all" ON coupons;
CREATE POLICY "coupons_admin_all" ON coupons
FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'auraanchorcollections@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'auraanchorcollections@gmail.com');

DROP POLICY IF EXISTS "promotions_admin_all" ON promotions;
CREATE POLICY "promotions_admin_all" ON promotions
FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'auraanchorcollections@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'auraanchorcollections@gmail.com');

DROP POLICY IF EXISTS "delivery_admin_all" ON delivery_settings;
CREATE POLICY "delivery_admin_all" ON delivery_settings
FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'auraanchorcollections@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'auraanchorcollections@gmail.com');

DROP POLICY IF EXISTS "admin_logs_admin_all" ON admin_logs;
CREATE POLICY "admin_logs_admin_all" ON admin_logs
FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'auraanchorcollections@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'auraanchorcollections@gmail.com');

-- Seed default site settings
INSERT INTO site_settings (key, value, type, category, description) VALUES
('business_name', 'Aura & Anchor Collections', 'text', 'general', 'Business name displayed across the site'),
('tagline', 'Timeless Elegance on Every Wrist', 'text', 'general', 'Business tagline'),
('phone', '+256 708 018549', 'text', 'contact', 'Primary business phone'),
('whatsapp', '+256 708 018549', 'text', 'contact', 'WhatsApp number'),
('email', 'auraanchorcollections@gmail.com', 'text', 'contact', 'Business email'),
('address', 'Plot 42, Kampala Road, Kampala, Uganda', 'text', 'contact', 'Business address'),
('business_hours', 'Mon - Sat: 9:00 AM - 6:00 PM', 'text', 'contact', 'Business hours'),
('facebook_url', '', 'url', 'social', 'Facebook page URL'),
('instagram_url', '', 'url', 'social', 'Instagram page URL'),
('twitter_url', '', 'url', 'social', 'Twitter/X page URL'),
('logo_url', '/images/logo/WhatsApp_Image_2026-06-23_at_10.06.58_PM.jpeg', 'image', 'branding', 'Website logo URL'),
('favicon_url', '', 'image', 'branding', 'Favicon URL'),
('primary_color', '#C9A227', 'color', 'theme', 'Primary brand color'),
('secondary_color', '#0F1E3A', 'color', 'theme', 'Secondary brand color'),
('accent_color', '#C9A227', 'color', 'theme', 'Accent color'),
('currency', 'UGX', 'text', 'general', 'Default currency code'),
('free_shipping_threshold', '500000', 'number', 'shipping', 'Minimum order for free shipping'),
('enable_reviews', 'true', 'boolean', 'features', 'Enable product reviews'),
('enable_wishlist', 'true', 'boolean', 'features', 'Enable wishlist feature'),
('enable_guest_checkout', 'true', 'boolean', 'features', 'Allow guest checkout'),
('meta_title', 'Aura & Anchor Collections | Luxury Watches East Africa', 'text', 'seo', 'Default meta title'),
('meta_description', 'Premium luxury watches curated for discerning collectors across East Africa. Authentic timepieces with free shipping.', 'text', 'seo', 'Default meta description'),
('footer_about', 'Timeless elegance on every wrist. Curating the finest timepieces for discerning collectors across East Africa since 2020.', 'text', 'content', 'Footer about text')
ON CONFLICT (key) DO NOTHING;

-- Seed delivery settings
INSERT INTO delivery_settings (country, city, shipping_cost, free_shipping_threshold, delivery_days_min, delivery_days_max) VALUES
('Uganda', 'Kampala', 0, 500000, 1, 2),
('Uganda', 'Other', 15000, 500000, 2, 4),
('Kenya', NULL, 25000, 750000, 3, 5),
('Tanzania', NULL, 30000, 750000, 3, 5),
('Rwanda', NULL, 25000, 750000, 3, 5),
('South Sudan', NULL, 40000, 1000000, 5, 7)
ON CONFLICT DO NOTHING;

-- Seed coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, end_date) VALUES
('LUXURY10', 'percentage', 10, 0, 100, '2026-12-31 23:59:59'),
('WELCOME15', 'percentage', 15, 0, 200, '2026-12-31 23:59:59'),
('FLASH20', 'percentage', 20, 1000000, 50, '2026-07-31 23:59:59'),
('VIP50000', 'fixed', 50000, 500000, NULL, '2026-12-31 23:59:59')
ON CONFLICT (code) DO NOTHING;
