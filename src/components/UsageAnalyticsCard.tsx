"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/session-context';
import { showError } from '@/utils/toast';
import { Loader2, UploadCloud, Scissors, Combine, Trash2, Download } from 'lucide-react';

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
        <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm">
          <UploadCloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">PDFs Uploaded</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{analytics.totalUploads}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm">
          <Scissors className="h-6 w-6 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">PDFs Split</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{analytics.totalSplits}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow-sm">
          <Combine className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">PDFs Merged</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{analytics.totalMerges}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm">
          <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Original PDFs Deleted</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{analytics.totalDeletes}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-sm">
          <Trash2 className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Split Pages Deleted</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{analytics.totalSplitPageDeletes + analytics.totalSplitGroupDeletes + analytics.totalAllSplitDeletes}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg shadow-sm">
          <Download className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">All Split PDFs Downloaded</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{analytics.totalAllSplitDownloads}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageAnalyticsCard;