/*
# Migration 004: Operational Gaps

1. Newsletter subscribers table
2. Payment status on orders
3. Shipping cost tracking
4. Stock deduction trigger
5. RLS policies for new table
*/

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Add payment status to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Add shipping cost tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost numeric NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0);

-- Add estimated delivery days
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_days integer DEFAULT 3;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- RLS for newsletter
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter_public_insert" ON newsletter_subscribers;
CREATE POLICY "newsletter_public_insert" ON newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "newsletter_admin_all" ON newsletter_subscribers;
CREATE POLICY "newsletter_admin_all" ON newsletter_subscribers
FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'auraanchorcollections@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'auraanchorcollections@gmail.com');

-- Stock deduction function and trigger
CREATE OR REPLACE FUNCTION public.deduct_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if enough stock
  IF (SELECT stock_quantity FROM products WHERE id = NEW.product_id) < NEW.quantity THEN
    RAISE EXCEPTION 'Insufficient stock for product %', NEW.product_id;
  END IF;

  -- Deduct stock
  UPDATE products
  SET stock_quantity = stock_quantity - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deduct_stock ON order_items;
CREATE TRIGGER trg_deduct_stock
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_stock_on_order();

-- Restore stock when order is cancelled
CREATE OR REPLACE FUNCTION public.restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status <> 'cancelled' AND NEW.status = 'cancelled' THEN
    -- Restore stock for each item
    UPDATE products
    SET stock_quantity = stock_quantity + oi.quantity,
        updated_at = now()
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND products.id = oi.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_restore_stock ON orders;
CREATE TRIGGER trg_restore_stock
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.restore_stock_on_cancel();
