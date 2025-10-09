"use client";

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MadeWithDyad } from '@/components/made-with-dyad';
import FeatureCard from '@/components/FeatureCard';
import { UploadCloud, Scissors, Combine, FolderArchive, CheckCircle2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  is_active: boolean;
}

const LandingPage = () => {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [pricingVisible, setPricingVisible] = useState(true); // State for pricing visibility
  const [loadingSettings, setLoadingSettings] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchPricingAndSettings = async () => {
      setLoadingPricing(true);
      setLoadingSettings(true);
      try {
        // Fetch pricing tiers
        const { data: pricingData, error: pricingError } = await supabase
          .from('pricing_tiers')
          .select('*')
          .order('price', { ascending: true });

        if (pricingError) {
          throw pricingError;
        }
        setPricingTiers(pricingData || []);

        // Fetch pricing visibility setting
        const { data: settingsData, error: settingsError } = await supabase
          .from('app_settings')
          .select('setting_value')
          .eq('setting_name', 'pricing_visibility')
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 means no rows found
          throw settingsError;
        }

        if (settingsData) {
          setPricingVisible(settingsData.setting_value.pricing_visible);
        } else {
          // If no setting found, assume default true
          setPricingVisible(true);
        }

      } catch (error: any) {
        showError(`Failed to load data: ${error.message}`);
      } finally {
        setLoadingPricing(false);
        setLoadingSettings(false);
      }
    };

    fetchPricingAndSettings();
  }, []);

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementPosition - headerOffset,
            behavior: 'smooth'
          });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <AppHeader />

      {/* Hero Section */}
      <section id="home" className="relative py-24 md:py-40 text-center px-4 overflow-hidden pt-32">
        <div className="container mx-auto max-w-5xl relative z-10">
          <h1 className="text-6xl md:text-7xl font-extrabold leading-tight mb-8 text-blue-800 dark:text-blue-300 tracking-tight">
            SplitMyPDF.online <br className="hidden md:inline"/> Effortless PDF Management
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Upload, Split, Merge, and Organize Your Documents with unparalleled ease. Secure, lightning-fast, and intuitively designed for you.
          </p>
          <Button asChild className="px-10 py-7 text-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl">
            <Link to="/login">Get Started Free</Link>
          </Button>
        </div>
        {/* Subtle background animation/elements for modern feel */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob absolute top-0 left-0"></div>
          <div className="w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 absolute bottom-0 right-0"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-white dark:bg-gray-900 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-5xl font-bold text-center mb-20 text-gray-800 dark:text-white tracking-tight">
            Powerful PDF Tools at Your Fingertips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 h-full">
            <FeatureCard
              title="Upload & Manage"
              description="Securely upload and store your PDF documents in the cloud. Access them anytime, anywhere, with robust security."
              icon={UploadCloud}
              bgColorClass="bg-gradient-to-br from-blue-600 to-blue-400 dark:from-blue-800 dark:to-blue-600"
              glowColorClass="from-blue-300/70 dark:from-blue-600/70"
            />
            <FeatureCard
              title="Split PDFs"
              description="Effortlessly break down large PDF files into individual pages or smaller, manageable documents. Perfect for extracting specific sections."
              icon={Scissors}
              bgColorClass="bg-gradient-to-br from-green-600 to-green-400 dark:from-green-800 dark:to-green-600"
              glowColorClass="from-green-300/70 dark:from-green-600/70"
            />
            <FeatureCard
              title="Merge PDFs"
              description="Combine multiple PDF files into a single, cohesive document. Streamline your reports, presentations, and consolidate information."
              icon={Combine}
              bgColorClass="bg-gradient-to-br from-purple-600 to-purple-400 dark:from-purple-800 dark:to-purple-600"
              glowColorClass="from-purple-300/70 dark:from-purple-600/70"
            />
            <FeatureCard
              title="Organize & Download"
              description="Keep your documents perfectly organized and download split or merged files with a single click, including convenient ZIP archives."
              icon={FolderArchive}
              bgColorClass="bg-gradient-to-br from-orange-600 to-orange-400 dark:from-orange-800 dark:to-orange-600"
              glowColorClass="from-orange-300/70 dark:from-orange-600/70"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section - Conditionally rendered */}
      {loadingSettings ? (
        <section className="py-20 md:py-32 bg-gray-100 dark:bg-gray-900 px-4 text-center">
          <p className="text-gray-700 dark:text-gray-300">Loading pricing section...</p>
        </section>
      ) : pricingVisible && (
        <section id="pricing" className="py-20 md:py-32 bg-gray-100 dark:bg-gray-900 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-5xl font-extrabold text-center mb-6 text-blue-800 dark:text-blue-300">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-center mb-16 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Choose the plan that best fits your PDF management needs. Upgrade anytime!
            </p>

            {loadingPricing ? (
              <p className="text-center text-gray-700 dark:text-gray-300">Loading pricing plans...</p>
            ) : (
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
                    <CardContent className="p-0 flex flex-col flex-grow justify-between">
                      <ul className="space-y-3 text-lg text-gray-800 dark:text-gray-200">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full py-6 text-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg shadow-md mt-8">
                        {tier.name === 'Free' ? 'Get Started Free' : 'Choose Pro Plan'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Call to Action Section */}
      <section id="cta" className="py-24 md:py-36 text-center bg-blue-700 dark:bg-blue-900 text-white px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-5xl md:text-6xl font-bold mb-10 leading-tight">
            Ready to Simplify Your PDF Workflow?
          </h2>
          <p className="text-xl md:text-2xl mb-14 opacity-90 max-w-3xl mx-auto">
            Join thousands of satisfied users who trust SplitMyPDF.online for their essential document needs.
          </p>
          <Button asChild className="px-12 py-8 text-2xl bg-white hover:bg-gray-100 text-blue-700 dark:text-blue-900 rounded-full shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl">
            <Link to="/login">Start Your Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="py-10 bg-gray-800 dark:bg-gray-950 text-gray-400 text-center px-4">
        <div className="container mx-auto">
          <p className="mb-3 text-lg">&copy; {new Date().getFullYear()} SplitMyPDF.online. All rights reserved.</p>
          <MadeWithDyad />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;