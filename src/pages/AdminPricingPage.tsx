"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

interface Plan {
  id: string;
  name: string;
  price_inr: number;
  billing_interval: string;
  limits: Record<string, unknown>;
  is_active: boolean;
}

const formatLimits = (limits: Record<string, unknown>) => JSON.stringify(limits, null, 2);

const AdminPricingPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("id,name,price_inr,billing_interval,limits,is_active")
        .order("price_inr", { ascending: true });

      if (error) throw error;
      setPlans((data || []) as Plan[]);
    } catch (error: any) {
      showError(`Failed to load plans: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const updatePlan = (id: string, changes: Partial<Plan>) => {
    setPlans((currentPlans) =>
      currentPlans.map((plan) => (plan.id === id ? { ...plan, ...changes } : plan)),
    );
  };

  const handleLimitsChange = (id: string, value: string) => {
    try {
      updatePlan(id, { limits: JSON.parse(value) });
    } catch {
      updatePlan(id, { limits: { rawInvalidJson: value } });
    }
  };

  const savePlan = async (plan: Plan) => {
    if ("rawInvalidJson" in plan.limits) {
      showError("Limits must be valid JSON before saving.");
      return;
    }

    setSavingId(plan.id);
    try {
      const { error } = await supabase
        .from("plans")
        .update({
          name: plan.name,
          price_inr: plan.price_inr,
          billing_interval: plan.billing_interval,
          limits: plan.limits,
          is_active: plan.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", plan.id);

      if (error) throw error;
      showSuccess(`${plan.name} updated.`);
      fetchPlans();
    } catch (error: any) {
      showError(`Failed to save ${plan.name}: ${error.message}`);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 pt-20 dark:bg-gray-900">
        <AppHeader />
        <div className="mt-20 text-center text-gray-700 dark:text-gray-300">Loading admin plans...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-8 pt-20 text-gray-900 dark:bg-gray-900 dark:text-white">
      <AppHeader />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Pricing</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage the plans used by checkout, subscriptions, and public pricing.
          </p>
        </div>

        <div className="space-y-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`name-${plan.id}`}>Plan name</Label>
                    <Input
                      id={`name-${plan.id}`}
                      value={plan.name}
                      onChange={(event) => updatePlan(plan.id, { name: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`price-${plan.id}`}>Price in INR</Label>
                    <Input
                      id={`price-${plan.id}`}
                      type="number"
                      min="0"
                      value={plan.price_inr}
                      onChange={(event) => updatePlan(plan.id, { price_inr: Number(event.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`billing-${plan.id}`}>Billing interval</Label>
                  <Input
                    id={`billing-${plan.id}`}
                    value={plan.billing_interval}
                    onChange={(event) => updatePlan(plan.id, { billing_interval: event.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor={`limits-${plan.id}`}>Limits JSON</Label>
                  <Textarea
                    id={`limits-${plan.id}`}
                    value={
                      "rawInvalidJson" in plan.limits
                        ? String(plan.limits.rawInvalidJson)
                        : formatLimits(plan.limits)
                    }
                    onChange={(event) => handleLimitsChange(plan.id, event.target.value)}
                    className="min-h-36 font-mono text-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`active-${plan.id}`}
                    checked={plan.is_active}
                    onCheckedChange={(checked) => updatePlan(plan.id, { is_active: checked === true })}
                  />
                  <Label htmlFor={`active-${plan.id}`}>Active plan</Label>
                </div>

                <Button onClick={() => savePlan(plan)} disabled={savingId === plan.id} className="w-full">
                  {savingId === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminPricingPage;
