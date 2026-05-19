import { supabase } from "@/integrations/supabase/client";

export const getAnonymousSessionId = () => {
  const key = "splitmypdf_anonymous_session_id";
  const existing = window.localStorage.getItem(key);

  if (existing) return existing;

  const next = crypto.randomUUID();
  window.localStorage.setItem(key, next);
  return next;
};

export const logUsageEvent = async (
  actionType: string,
  details: Record<string, unknown> = {},
) => {
  try {
    const { data } = await supabase.auth.getSession();
    await supabase.from("usage_events").insert({
      user_id: data.session?.user.id ?? null,
      anonymous_session_id: data.session ? null : getAnonymousSessionId(),
      action_type: actionType,
      details,
    });
  } catch (error) {
    console.warn("Usage event skipped:", error);
  }
};
