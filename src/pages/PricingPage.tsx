"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import AppHeader from '@/components/AppHeader'; // Import AppHeader

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  is_active: boolean;
}

const PricingPage = () => {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pricing_tiers')
          .select('*')
          .order('price', { ascending: true });

        if (error) {
          throw error;
        }

        setPricingTiers(data || []);
      } catch (error: any) {
        showError(`Failed to load pricing: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <AppHeader />
        <p className="text-gray-700 dark:text-gray-300 mt-20">Loading pricing plans...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white pt-20 pb-8">
      <AppHeader />
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-5xl font-extrabold text-center mb-6 text-blue-800 dark:text-blue-300">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-center mb-16 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
          Choose the plan that best fits your PDF management needs. Upgrade anytime!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pricingTiers.map((tier) => (
            <Card key={tier.id} className="flex flex-col justify-between p-8 rounded-xl shadow-lg dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-4xl font-bold mb-2 text-blue-700 dark:text-blue-300">
                  {tier.name}
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                  {tier.description}
                </CardDescription>
                <p className="text-5xl font-extrabold mt-4 text-gray-900 dark:text-white">
                  {tier.price === 0 ? 'Free' : `$${tier.price.toFixed(2)}`}
                  {tier.price > 0 && <span className="text-xl font-medium text-gray-500 dark:text-gray-400">/month</span>}
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-3 text-lg text-gray-800 dark:text-gray-200 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full py-6 text-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg shadow-md">
                  {tier.name === 'Free' ? 'Get Started Free' : 'Choose Pro Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;