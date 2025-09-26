"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import AppHeader from '@/components/AppHeader'; // Import AppHeader

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  is_active: boolean;
}

const AdminPricingPage = () => {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pricing_tiers')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setPricingTiers(data || []);
    } catch (error: any) {
      showError(`Failed to load pricing for admin: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const handleInputChange = (id: string, field: keyof PricingTier, value: any) => {
    setPricingTiers((prev) =>
      prev.map((tier) => (tier.id === id ? { ...tier, [field]: value } : tier))
    );
  };

  const handleFeaturesChange = (id: string, value: string) => {
    setPricingTiers((prev) =>
      prev.map((tier) =>
        tier.id === id ? { ...tier, features: value.split('\n').map((f) => f.trim()).filter(Boolean) } : tier
      )
    );
  };

  const handleSave = async (tier: PricingTier) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('pricing_tiers')
        .update({
          name: tier.name,
          description: tier.description,
          price: tier.price,
          features: tier.features,
          is_active: tier.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tier.id);

      if (error) {
        throw error;
      }

      showSuccess(`${tier.name} pricing updated successfully!`);
      fetchPricing(); // Re-fetch to ensure latest data
    } catch (error: any) {
      showError(`Failed to save ${tier.name} pricing: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <AppHeader />
        <p className="text-gray-700 dark:text-gray-300 mt-20">Loading pricing plans for admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white pt-20 pb-8">
      <AppHeader />
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-white">
          Admin: Manage Pricing Tiers
        </h1>

        <div className="space-y-8">
          {pricingTiers.map((tier) => (
            <Card key={tier.id} className="p-6 rounded-xl shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {tier.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div>
                  <Label htmlFor={`name-${tier.id}`} className="text-gray-700 dark:text-gray-300">Tier Name</Label>
                  <Input
                    id={`name-${tier.id}`}
                    value={tier.name}
                    onChange={(e) => handleInputChange(tier.id, 'name', e.target.value)}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor={`description-${tier.id}`} className="text-gray-700 dark:text-gray-300">Description</Label>
                  <Textarea
                    id={`description-${tier.id}`}
                    value={tier.description}
                    onChange={(e) => handleInputChange(tier.id, 'description', e.target.value)}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor={`price-${tier.id}`} className="text-gray-700 dark:text-gray-300">Price (e.g., 9.99 for Pro, 0 for Free)</Label>
                  <Input
                    id={`price-${tier.id}`}
                    type="number"
                    step="0.01"
                    value={tier.price}
                    onChange={(e) => handleInputChange(tier.id, 'price', parseFloat(e.target.value))}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor={`features-${tier.id}`} className="text-gray-700 dark:text-gray-300">Features (one per line)</Label>
                  <Textarea
                    id={`features-${tier.id}`}
                    value={tier.features.join('\n')}
                    onChange={(e) => handleFeaturesChange(tier.id, e.target.value)}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`is_active-${tier.id}`}
                    checked={tier.is_active}
                    onCheckedChange={(checked) => handleInputChange(tier.id, 'is_active', checked)}
                  />
                  <Label htmlFor={`is_active-${tier.id}`} className="text-gray-700 dark:text-gray-300">Is Active</Label>
                </div>
                <Button
                  onClick={() => handleSave(tier)}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPricingPage;