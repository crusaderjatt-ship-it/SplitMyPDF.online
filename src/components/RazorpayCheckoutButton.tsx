import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

interface RazorpayCheckoutButtonProps {
  planId: string;
  label?: string;
  className?: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const loadRazorpay = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const RazorpayCheckoutButton = ({ planId, label = "Upgrade", className }: RazorpayCheckoutButtonProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getCheckoutErrorMessage = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error || "");

    if (
      message.includes("Failed to send a request to the Edge Function") ||
      message.includes("FunctionsFetchError") ||
      message.includes("not found")
    ) {
      return "Payments are not live yet. Deploy the Razorpay Edge Functions and configure Razorpay keys before accepting upgrades.";
    }

    if (message.includes("Unauthorized") || message.includes("JWT")) {
      return "Please log in before upgrading to Pro.";
    }

    return message || "Payment could not be started.";
  };

  const startCheckout = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        showError("Please log in before upgrading to Pro.");
        navigate(`/login?plan=${encodeURIComponent(planId)}`);
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        throw new Error("Razorpay checkout could not be loaded.");
      }

      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: { planId },
      });

      if (error) throw error;
      if (!data?.orderId || !data?.keyId) {
        throw new Error("Payment order could not be created.");
      }

      const checkout = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "SplitMyPDF.online",
        description: data.planName || "Pro upgrade",
        order_id: data.orderId,
        handler: async (response: Record<string, string>) => {
          const verify = await supabase.functions.invoke("verify-razorpay-payment", {
            body: { ...response, planId },
          });

          if (verify.error) throw verify.error;
          showSuccess("Payment verified. Pro access is now active.");
        },
        theme: { color: "#2563eb" },
      });

      checkout.open();
    } catch (error: any) {
      showError(getCheckoutErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={startCheckout} disabled={loading} className={className}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {label}
    </Button>
  );
};

export default RazorpayCheckoutButton;
