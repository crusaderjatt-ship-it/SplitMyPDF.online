import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders, rejectDisallowedOrigin } from "../_shared/cors.ts";

const encodeHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

const verifySignature = async (payload: string, signature: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return encodeHex(digest) === signature;
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const originError = rejectDisallowedOrigin(req);
  if (originError) return originError;

  try {
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) {
      throw new Error("Razorpay secret is not configured");
    }
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      throw new Error("Service role key is not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      serviceRoleKey,
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const valid = await verifySignature(payload, razorpay_signature, keySecret);

    if (!valid) {
      return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { data: orderRecord, error: orderError } = await supabaseAdmin
      .from("payment_orders")
      .select("id,user_id,plan_id,status")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!orderRecord || orderRecord.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Payment order not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (orderRecord.status === "paid") {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const { error } = await supabaseAdmin.from("subscriptions").upsert({
      user_id: user.id,
      plan_id: orderRecord.plan_id,
      razorpay_order_id,
      razorpay_payment_id,
      status: "active",
      current_period_start: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (error) {
      throw error;
    }

    const { error: updateOrderError } = await supabaseAdmin
      .from("payment_orders")
      .update({
        razorpay_payment_id,
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderRecord.id);

    if (updateOrderError) throw updateOrderError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
