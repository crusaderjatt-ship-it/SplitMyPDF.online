"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/session-context';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Trash2, Download, Loader2 } from 'lucide-react';

interface SplitPdfFile {
  name: string;
  path: string;
  publicUrl: string;
}

const SplitPdfList = () => {
  const { user, session } = useSession();
  const [splitPdfs, setSplitPdfs] = useState<SplitPdfFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const fetchSplitPdfs = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const splitFolderPath = `${user.id}/split_pdfs`;
      const { data, error } = await supabase.storage.from('user_pdfs').list(splitFolderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

      if (error) {
        throw error;
      }

      const fetchedPdfs: SplitPdfFile[] = [];
      for (const file of data) {
        if (file.name !== '.emptyFolderPlaceholder') {
          const filePath = `${splitFolderPath}/${file.name}`;
          const { data: publicUrlData } = supabase.storage.from('user_pdfs').getPublicUrl(filePath);
          if (publicUrlData.publicUrl) {
            fetchedPdfs.push({
              name: file.name,
              path: filePath,
              publicUrl: publicUrlData.publicUrl,
            });
          }
        }
      }
      setSplitPdfs(fetchedPdfs);
    } catch (error: any) {
      showError(`Failed to fetch split PDFs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSplitPdfs();
  }, [fetchSplitPdfs]);

  const handleDeleteSplitPdf = async (pdfPath: string, pdfName: string) => {
    if (!user) {
      showError('You must be logged in to delete files.');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${pdfName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.storage.from('user_pdfs').remove([pdfPath]);

      if (error) {
        throw error;
      }

      showSuccess(`"${pdfName}" deleted successfully.`);
      fetchSplitPdfs(); // Refresh the list
    } catch (error: any) {
      showError(`Failed to delete split PDF: ${error.message}`);
    }
  };

  const handleDownloadAllSplitPdfs = async () => {
    if (!user || !session) {
      showError('You must be logged in to download files.');
      return;
    }

    setDownloadingAll(true);
    try {
      const { data, error } = await supabase.functions.invoke('download-split-pdfs', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      // The Edge Function returns a Blob directly, so we create a URL and trigger download
      const blob = new Blob([data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'split_pdfs.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('All split PDFs downloaded successfully!');

    } catch (error: any) {
      console.error('Error invoking download-split-pdfs function:', error);
      showError(`Failed to download all split PDFs: ${error.message}`);
    } finally {
      setDownloadingAll(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600 dark:text-gray-400">Loading split PDFs...</div>;
  }

  return (
    <Card className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Your Split PDF Pages</CardTitle>
      </CardHeader>
      <CardContent>
        {splitPdfs.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No split PDF pages available yet.</p>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={handleDownloadAllSplitPdfs}
              disabled={downloadingAll || splitPdfs.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {downloadingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing Download...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download All Split PDFs (.zip)
                </>
              )}
            </Button>
            <ul className="space-y-3">
              {splitPdfs.map((pdf) => (
                <li key={pdf.path} className="flex items-center justify-between p-3 border rounded-md bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center flex-grow min-w-0">
                    <FileText className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-800 dark:text-gray-200 truncate">{pdf.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <a href={pdf.publicUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </a>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSplitPdf(pdf.path, pdf.name)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SplitPdfList;