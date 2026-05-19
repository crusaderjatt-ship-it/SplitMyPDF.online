import { useEffect } from "react";

interface AdSenseSlotProps {
  slot?: string;
  className?: string;
  label?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

const AdSenseSlot = ({ slot, className, label = "Advertisement" }: AdSenseSlotProps) => {
  useEffect(() => {
    if (!clientId || !slot) return;
    try {
      const scriptId = "google-adsense-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
        document.head.appendChild(script);
      }

      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (error) {
      console.warn("AdSense slot skipped:", error);
    }
  }, [slot]);

  if (!clientId || !slot) {
    return (
      <div className={className}>
        <div className="flex min-h-24 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {label}
        </div>
      </div>
    );
  }

  return (
    <div className={className} aria-label={label}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSenseSlot;
