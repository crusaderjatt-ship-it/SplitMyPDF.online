import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders, rejectDisallowedOrigin } from "../_shared/cors.ts";

const planCatalog: Record<string, { name: string; amount: number; currency: string }> = {
  "pro-monthly": { name: "SplitMyPDF Pro Monthly", amount: 29900, currency: "INR" },
  "pro-yearly": { name: "SplitMyPDF Pro Yearly", amount: 249900, currency: "INR" },
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const originError = rejectDisallowedOrigin(req);
  if (originError) return originError;

  try {
    const keyId = Deno.env.get("RAZORPAY_KEY_ID") || Deno.env.get("VITE_RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      throw new Error("Razorpay keys are not configured");
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

    const { planId } = await req.json();
    const plan = planCatalog[planId];

    if (!plan) {
      return new Response(JSON.stringify({ error: "Unknown plan" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const receipt = `${user.id.slice(0, 8)}-${planId}-${Date.now()}`.slice(0, 40);
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: plan.amount,
        currency: plan.currency,
        receipt,
        notes: { user_id: user.id, plan_id: planId },
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Razorpay order failed: ${details}`);
    }

    const order = await response.json();
    const { error: orderError } = await supabaseAdmin.from("payment_orders").insert({
      razorpay_order_id: order.id,
      user_id: user.id,
      plan_id: planId,
      amount: plan.amount,
      currency: plan.currency,
      status: "created",
    });

    if (orderError) {
      throw orderError;
    }

    return new Response(JSON.stringify({
      orderId: order.id,
      amount: plan.amount,
      currency: plan.currency,
      keyId,
      planName: plan.name,
    }), {
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
