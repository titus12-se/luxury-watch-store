import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, order_id, email, order_number, total, customer_name, payment_method } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const { data: settings } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["business_name", "email", "phone"]);

    const get = (k: string) => settings?.find((s) => s.key === k)?.value || "";
    const businessName = get("business_name") || "Aura & Anchor Collections";
    const adminEmail = get("email") || "auraanchorcollections@gmail.com";

    if (type === "order_confirmation") {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0F1E3A;">Thank you for your order, ${customer_name || "Customer"}!</h2>
          <p>Your order <strong>#${order_number}</strong> has been received and is being processed.</p>
          <p><strong>Total:</strong> ${total}</p>
          <p><strong>Payment Method:</strong> ${payment_method}</p>
          <p>We will notify you when your order is shipped. You can track your order at any time using your order number.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">
            ${businessName}<br/>
            Email: ${adminEmail}<br/>
            WhatsApp: +256 708 018549
          </p>
        </div>
      `;
      const subject = `Order Confirmation - ${order_number}`;
      await supabase
        .from("admin_logs")
        .insert({
          admin_email: adminEmail,
          action: "email_sent",
          entity_type: "order",
          entity_id: order_id,
          details: { type: "customer_confirmation", email, subject },
        });
      return new Response(JSON.stringify({ success: true, message: "Customer confirmation queued" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "admin_alert") {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0F1E3A;">New Order Alert</h2>
          <p>An order has been placed on your website.</p>
          <p><strong>Order #:</strong> ${order_number}</p>
          <p><strong>Customer:</strong> ${customer_name}</p>
          <p><strong>Total:</strong> ${total}</p>
          <p><strong>Payment Method:</strong> ${payment_method}</p>
          <p>Please log in to your admin dashboard to process this order.</p>
        </div>
      `;
      const subject = `New Order - ${order_number}`;
      await supabase
        .from("admin_logs")
        .insert({
          admin_email: adminEmail,
          action: "email_sent",
          entity_type: "order",
          entity_id: order_id,
          details: { type: "admin_alert", email: adminEmail, subject },
        });
      return new Response(JSON.stringify({ success: true, message: "Admin alert logged" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
