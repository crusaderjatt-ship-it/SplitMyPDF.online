import { useState } from "react";
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

  const startCheckout = async () => {
    setLoading(true);
    try {
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
      showError(error.message || "Payment could not be started.");
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
