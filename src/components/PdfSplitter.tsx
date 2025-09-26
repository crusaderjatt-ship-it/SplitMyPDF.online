"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/session-context';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input'; // Import Input for custom page count
import { Label } from '@/components/ui/label';
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
  const [totalPdfPages, setTotalPdfPages] = useState<number | null>(null);
  const [pagesPerSplit, setPagesPerSplit] = useState<string>('1'); // Default to 1 page per split

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

  // Effect to fetch total pages when a PDF is selected
  useEffect(() => {
    const fetchPdfPageCount = async () => {
      if (selectedPdfPath && user && session) {
        try {
          // Invoke a temporary function or modify split-pdf to get page count
          // For now, we'll assume split-pdf can return page count or we'll get it during split
          // A more robust solution would be a separate edge function for metadata
          setTotalPdfPages(null); // Reset
          const { data, error } = await supabase.functions.invoke('split-pdf', {
            body: { pdfPath: selectedPdfPath, getPageCountOnly: true }, // Request only page count
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          if (error) {
            throw error;
          }

          if (data && data.totalPdfPages) {
            setTotalPdfPages(data.totalPdfPages);
            setPagesPerSplit('1'); // Reset pages per split when new PDF is selected
          } else {
            showError('Failed to get PDF page count.');
          }
        } catch (error: any) {
          console.error('Error fetching PDF page count:', error);
          showError(`Failed to get PDF page count: ${error.message}`);
        }
      }
    };
    fetchPdfPageCount();
  }, [selectedPdfPath, user, session]);

  const handleSplitPdf = async () => {
    if (!user || !selectedPdfPath || !session) {
      showError('Please select a PDF and ensure you are logged in.');
      return;
    }

    const pagesPerSplitNum = parseInt(pagesPerSplit);
    if (isNaN(pagesPerSplitNum) || pagesPerSplitNum <= 0) {
      showError('Please enter a valid number of pages per split (e.g., 1, 2, 5).');
      return;
    }
    if (totalPdfPages && pagesPerSplitNum > totalPdfPages) {
      showError(`Pages per split cannot exceed total pages (${totalPdfPages}).`);
      return;
    }

    setSplitting(true);
    setSplitPdfUrls([]); // Clear previous results

    try {
      const { data, error } = await supabase.functions.invoke('split-pdf', {
        body: { pdfPath: selectedPdfPath, pagesPerSplit: pagesPerSplitNum },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data && data.splitPdfUrls) {
        setSplitPdfUrls(data.splitPdfUrls);
        showSuccess('PDF split successfully!');
        
        logUserAction(user.id, 'split_pdf', { 
          originalFileName: selectedPdfPath.split('/').pop(), 
          pagesProcessed: data.splitPdfUrls.length,
          pagesPerSplit: pagesPerSplitNum,
          totalOriginalPages: totalPdfPages
        });

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

  const generatePageSplitOptions = () => {
    if (!totalPdfPages || totalPdfPages === 0) return [];
    const options = [];
    // Common options
    if (totalPdfPages >= 1) options.push(1);
    if (totalPdfPages >= 2) options.push(2);
    if (totalPdfPages >= 5) options.push(5);
    if (totalPdfPages >= 10) options.push(10);
    // Add total pages as an option if not already there
    if (!options.includes(totalPdfPages)) options.push(totalPdfPages);
    
    // Filter unique and sort
    return [...new Set(options)].sort((a, b) => a - b);
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
            <div>
              <Label htmlFor="select-pdf" className="text-gray-700 dark:text-gray-300">Select a PDF to split</Label>
              <Select onValueChange={setSelectedPdfPath} value={selectedPdfPath || ''}>
                <SelectTrigger id="select-pdf" className="w-full">
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
            </div>

            {selectedPdfPath && totalPdfPages !== null && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total pages: {totalPdfPages}</p>
                <Label htmlFor="pages-per-split" className="text-gray-700 dark:text-gray-300">Pages per split</Label>
                <Select onValueChange={setPagesPerSplit} value={pagesPerSplit}>
                  <SelectTrigger id="pages-per-split" className="w-full">
                    <SelectValue placeholder="Select pages per split" />
                  </SelectTrigger>
                  <SelectContent>
                    {generatePageSplitOptions().map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        {num === 1 ? '1 page' : `${num} pages`}
                      </SelectItem>
                    ))}
                    {/* Option for custom input, if needed */}
                    {/* <SelectItem value="custom">Custom...</SelectItem> */}
                  </SelectContent>
                </Select>
                {/* If 'custom' was selected, you'd show an input field here */}
              </div>
            )}

            <Button
              onClick={handleSplitPdf}
              disabled={!selectedPdfPath || splitting || pagesPerSplit === ''}
              className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
            >
              {splitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Splitting...
                </>
              ) : (
                'Split PDF'
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
                        <span className="text-sm text-gray-800 dark:text-gray-200">Part {index + 1}</span>
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