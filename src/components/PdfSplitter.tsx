"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/session-context';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Download, FileText } from 'lucide-react';
import { logUserAction } from '@/utils/analytics'; // Import logUserAction

interface PdfFile {
  name: string;
  path: string;
}

const PdfSplitter = () => {
  const { user, session } = useSession();
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(true);
  const [selectedPdfPath, setSelectedPdfPath] = useState<string | null>(null);
  const [splitting, setSplitting] = useState(false);
  const [splitPdfUrls, setSplitPdfUrls] = useState<string[]>([]);

  const fetchPdfs = useCallback(async () => {
    if (!user) {
      setLoadingPdfs(false);
      return;
    }

    setLoadingPdfs(true);
    try {
      const { data, error } = await supabase.storage.from('user_pdfs').list(user.id, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

      if (error) {
        throw error;
      }

      // Filter out the '.emptyFolderPlaceholder' and any previously split PDFs
      setPdfs(data.filter(file => file.name !== '.emptyFolderPlaceholder' && !file.name.startsWith('split_pdfs/')).map(file => ({
        name: file.name,
        path: `${user.id}/${file.name}`,
      })));
    } catch (error: any) {
      showError(`Failed to fetch PDFs for splitting: ${error.message}`);
    } finally {
      setLoadingPdfs(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPdfs();
  }, [fetchPdfs]);

  const handleSplitPdf = async () => {
    if (!user || !selectedPdfPath || !session) {
      showError('Please select a PDF and ensure you are logged in.');
      return;
    }

    setSplitting(true);
    setSplitPdfUrls([]); // Clear previous results

    try {
      // Invoke the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('split-pdf', {
        body: { pdfPath: selectedPdfPath },
        headers: {
          Authorization: `Bearer ${session.access_token}`, // Pass the user's session token for authentication
        },
      });

      if (error) {
        throw error;
      }

      if (data && data.splitPdfUrls) {
        setSplitPdfUrls(data.splitPdfUrls);
        showSuccess('PDF split successfully!');
        
        // Log the split action
        logUserAction(user.id, 'split_pdf', { originalFileName: selectedPdfPath.split('/').pop(), pagesProcessed: data.splitPdfUrls.length });

      } else {
        showError('PDF splitting failed: No URLs returned.');
      }
    } catch (error: any) {
      console.error('Error invoking split-pdf function:', error);
      showError(`PDF splitting failed: ${error.message}`);
    } finally {
      setSplitting(false);
    }
  };

  return (
    <Card className="w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Split PDF</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingPdfs ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Loading available PDFs...</p>
        ) : pdfs.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">No PDFs available to split. Please upload some first.</p>
        ) : (
          <div className="space-y-4">
            <Select onValueChange={setSelectedPdfPath} value={selectedPdfPath || ''}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a PDF to split" />
              </SelectTrigger>
              <SelectContent>
                {pdfs.map((pdf) => (
                  <SelectItem key={pdf.path} value={pdf.path}>
                    {pdf.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleSplitPdf}
              disabled={!selectedPdfPath || splitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
            >
              {splitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Splitting...
                </>
              ) : (
                'Split PDF into Single Pages'
              )}
            </Button>

            {splitPdfUrls.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Split Pages:</h4>
                <ul className="space-y-2">
                  {splitPdfUrls.map((url, index) => (
                    <li key={index} className="flex items-center justify-between p-2 border rounded-md bg-gray-50 dark:bg-gray-700">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-purple-500 mr-2" />
                        <span className="text-sm text-gray-800 dark:text-gray-200">Page {index + 1}</span>
                      </div>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PdfSplitter;