"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/session-context';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Download } from 'lucide-react';

interface PdfFile {
  name: string;
  path: string;
}

const PdfMerger = () => {
  const { user, session } = useSession();
  const [availablePdfs, setAvailablePdfs] = useState<PdfFile[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(true);
  const [selectedPdfPaths, setSelectedPdfPaths] = useState<string[]>([]);
  const [mergedFileName, setMergedFileName] = useState<string>('');
  const [merging, setMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

  const fetchAvailablePdfs = useCallback(async () => {
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

      // Filter out empty folder placeholders and any previously split/merged PDFs
      setAvailablePdfs(data.filter(file => 
        file.name !== '.emptyFolderPlaceholder' && 
        !file.name.startsWith('split_pdfs/') &&
        !file.name.startsWith('merged_pdfs/')
      ).map(file => ({
        name: file.name,
        path: `${user.id}/${file.name}`,
      })));
    } catch (error: any) {
      showError(`Failed to fetch available PDFs: ${error.message}`);
    } finally {
      setLoadingPdfs(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAvailablePdfs();
  }, [fetchAvailablePdfs]);

  const handleCheckboxChange = (path: string, checked: boolean) => {
    setSelectedPdfPaths((prev) =>
      checked ? [...prev, path] : prev.filter((p) => p !== path)
    );
  };

  const handleMergePdfs = async () => {
    if (!user || !session) {
      showError('You must be logged in to merge files.');
      return;
    }
    if (selectedPdfPaths.length < 2) {
      showError('Please select at least two PDF files to merge.');
      return;
    }

    setMerging(true);
    setMergedPdfUrl(null); // Clear previous result

    try {
      const finalMergedFileName = mergedFileName.trim() ? `${mergedFileName.trim()}.pdf` : undefined;

      const { data, error } = await supabase.functions.invoke('merge-pdfs', {
        body: { pdfPaths: selectedPdfPaths, mergedFileName: finalMergedFileName },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data && data.mergedPdfUrl) {
        setMergedPdfUrl(data.mergedPdfUrl);
        showSuccess('PDFs merged successfully!');
        setSelectedPdfPaths([]); // Clear selection
        setMergedFileName(''); // Clear file name input
        // Optionally, refresh the list of available PDFs if the merged PDF should appear there
        // fetchAvailablePdfs(); 
      } else {
        showError('PDF merging failed: No URL returned.');
      }
    } catch (error: any) {
      console.error('Error invoking merge-pdfs function:', error);
      showError(`PDF merging failed: ${error.message}`);
    } finally {
      setMerging(false);
    }
  };

  return (
    <Card className="w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Merge PDFs</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingPdfs ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Loading available PDFs...</p>
        ) : availablePdfs.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">No PDFs available to merge. Please upload some first.</p>
        ) : (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Select PDFs to Merge:</h4>
            <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2 bg-gray-50 dark:bg-gray-700">
              {availablePdfs.map((pdf) => (
                <div key={pdf.path} className="flex items-center space-x-2">
                  <Checkbox
                    id={pdf.path}
                    checked={selectedPdfPaths.includes(pdf.path)}
                    onCheckedChange={(checked) => handleCheckboxChange(pdf.path, checked as boolean)}
                  />
                  <Label htmlFor={pdf.path} className="text-gray-800 dark:text-gray-200 cursor-pointer">
                    {pdf.name}
                  </Label>
                </div>
              ))}
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="merged-file-name" className="text-gray-700 dark:text-gray-300">Merged File Name (optional)</Label>
              <Input
                id="merged-file-name"
                type="text"
                placeholder="e.g., MyCombinedDocument"
                value={mergedFileName}
                onChange={(e) => setMergedFileName(e.target.value)}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <Button
              onClick={handleMergePdfs}
              disabled={selectedPdfPaths.length < 2 || merging}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              {merging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Merging...
                </>
              ) : (
                'Merge Selected PDFs'
              )}
            </Button>

            {mergedPdfUrl && (
              <div className="mt-6 space-y-3 text-center">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Merged PDF Ready:</h4>
                <a href={mergedPdfUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Merged PDF
                  </Button>
                </a>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PdfMerger;