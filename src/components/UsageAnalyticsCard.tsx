"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/session-context';
import { showError } from '@/utils/toast';
import { Loader2, UploadCloud, Scissors, Combine, Trash2, Download } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn for utility classes

interface AnalyticsData {
  totalUploads: number;
  totalSplits: number;
  totalMerges: number;
  totalDeletes: number;
  totalSplitPageDeletes: number;
  totalSplitGroupDeletes: number;
  totalAllSplitDeletes: number;
  totalAllSplitDownloads: number;
}

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  bgColorClass: string;
  iconColorClass: string;
  glowColorClass: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon: Icon, label, value, bgColorClass, iconColorClass, glowColorClass }) => (
  <Card className={cn(
    "group relative flex flex-col justify-between h-full p-4 rounded-lg shadow-sm transition-all duration-300 ease-in-out transform hover:scale-[1.02] border-none overflow-hidden",
    bgColorClass
  )}>
    {/* Colored immersive glow on hover */}
    <div className={cn(
      "absolute rounded-lg z-0",
      "inset-[-10px]", // Creates a spread effect by extending 10px on all sides
      "translate-x-2 translate-y-2", // Offsets the glow slightly to the bottom-right
      glowColorClass.replace('from-', 'bg-'), // Uses a solid background color for the glow
      "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
      "transition-transform duration-300 ease-out", // Smooth transition for the offset
      "filter blur-2xl" // Applies a 40px blur for a soft glow
    )}></div>
    <div className="relative z-10 flex items-center space-x-3">
      <Icon className={cn("h-6 w-6 drop-shadow-md", iconColorClass)} />
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </Card>
);


const UsageAnalyticsCard = () => {
  const { user } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) {
        setAnalytics(null);
        setLoading(false);
        console.log("UsageAnalyticsCard: No user session, skipping analytics fetch.");
        return;
      }

      setLoading(true);
      console.log("UsageAnalyticsCard: Fetching analytics for user:", user.id);
      try {
        const { data, error } = await supabase
          .from('user_actions')
          .select('action_type')
          .eq('user_id', user.id);

        if (error) {
          console.error("UsageAnalyticsCard: Supabase fetch error:", error);
          throw error;
        }

        console.log("UsageAnalyticsCard: Raw data from Supabase:", data);

        const counts = data.reduce((acc: any, action: { action_type: string }) => {
          acc[action.action_type] = (acc[action.action_type] || 0) + 1;
          return acc;
        }, {});

        console.log("UsageAnalyticsCard: Processed counts:", counts);

        setAnalytics({
          totalUploads: counts['upload_pdf'] || 0,
          totalSplits: counts['split_pdf'] || 0,
          totalMerges: counts['merge_pdfs'] || 0,
          totalDeletes: counts['delete_pdf'] || 0,
          totalSplitPageDeletes: counts['delete_split_page'] || 0,
          totalSplitGroupDeletes: counts['delete_split_group'] || 0,
          totalAllSplitDeletes: counts['delete_all_split_pdfs'] || 0,
          totalAllSplitDownloads: counts['download_all_split_pdfs'] || 0,
        });

      } catch (error: any) {
        showError(`Failed to fetch analytics: ${error.message}`);
        setAnalytics(null);
        console.error("UsageAnalyticsCard: Caught error during analytics fetch:", error);
      } finally {
        setLoading(false);
        console.log("UsageAnalyticsCard: Analytics fetch completed.");
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <Card className="w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-none text-center">
        <CardContent className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="ml-3 text-gray-700 dark:text-gray-300">Loading usage statistics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className="w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-none text-center">
        <CardContent className="p-4 text-gray-600 dark:text-gray-400">
          No usage data available yet. Start managing your PDFs!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-none">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-3xl font-bold text-blue-800 dark:text-blue-300">
          Your Activity Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard
          icon={UploadCloud}
          label="PDFs Uploaded"
          value={analytics.totalUploads}
          bgColorClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
          glowColorClass="from-blue-300/70"
        />
        <KpiCard
          icon={Scissors}
          label="PDFs Split"
          value={analytics.totalSplits}
          bgColorClass="bg-green-50 dark:bg-green-900/20"
          iconColorClass="text-green-600 dark:text-green-400"
          glowColorClass="from-green-300/70"
        />
        <KpiCard
          icon={Combine}
          label="PDFs Merged"
          value={analytics.totalMerges}
          bgColorClass="bg-purple-50 dark:bg-purple-900/20"
          iconColorClass="text-purple-600 dark:text-purple-400"
          glowColorClass="from-purple-300/70"
        />
        <KpiCard
          icon={Trash2}
          label="Original PDFs Deleted"
          value={analytics.totalDeletes}
          bgColorClass="bg-red-50 dark:bg-red-900/20"
          iconColorClass="text-red-600 dark:text-red-400"
          glowColorClass="from-red-300/70"
        />
        <KpiCard
          icon={Trash2}
          label="Split Pages Deleted"
          value={analytics.totalSplitPageDeletes + analytics.totalSplitGroupDeletes + analytics.totalAllSplitDeletes}
          bgColorClass="bg-yellow-50 dark:bg-yellow-900/20"
          iconColorClass="text-yellow-600 dark:text-yellow-400"
          glowColorClass="from-yellow-300/70"
        />
        <KpiCard
          icon={Download}
          label="All Split PDFs Downloaded"
          value={analytics.totalAllSplitDownloads}
          bgColorClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
          glowColorClass="from-indigo-300/70"
        />
      </CardContent>
    </Card>
  );
};

export default UsageAnalyticsCard;