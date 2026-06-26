/*
# Migration 005: Coupon RPC function

Create a function to safely increment coupon usage count.
*/

CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code text)
RETURNS void AS $$
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE code = coupon_code;
END;
$$ LANGUAGE plpgsql;
