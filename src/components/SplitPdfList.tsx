"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/session-context';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Trash2, Download, Loader2, FolderOpen } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { logUserAction } from '@/utils/analytics'; // Import logUserAction

interface SplitPdfFile {
  name: string;
  path: string;
  publicUrl: string;
  originalFileName: string; // Added to group files
}

interface GroupedSplitPdfs {
  [originalFileName: string]: SplitPdfFile[];
}

const SplitPdfList = () => {
  const { user, session } = useSession();
  const [groupedSplitPdfs, setGroupedSplitPdfs] = useState<GroupedSplitPdfs>({});
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

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
          
          // Extract original file name for grouping
          const match = file.name.match(/(.*)_page_\d+\.pdf/);
          const originalFileName = match ? match[1] + '.pdf' : 'Unknown Original PDF'; // Re-add .pdf for clarity

          if (publicUrlData.publicUrl) {
            fetchedPdfs.push({
              name: file.name,
              path: filePath,
              publicUrl: publicUrlData.publicUrl,
              originalFileName: originalFileName,
            });
          }
        }
      }

      // Group PDFs by originalFileName
      const newGroupedPdfs: GroupedSplitPdfs = fetchedPdfs.reduce((acc, pdf) => {
        if (!acc[pdf.originalFileName]) {
          acc[pdf.originalFileName] = [];
        }
        acc[pdf.originalFileName].push(pdf);
        return acc;
      }, {} as GroupedSplitPdfs);

      setGroupedSplitPdfs(newGroupedPdfs);
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

    console.log('Attempting to delete split PDF:', { pdfPath, pdfName, userId: user.id });

    try {
      const { error } = await supabase.storage.from('user_pdfs').remove([pdfPath]);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      showSuccess(`"${pdfName}" deleted successfully.`);
      fetchSplitPdfs(); // Refresh the list
      
      // Log the delete action
      logUserAction(user.id, 'delete_split_page', { fileName: pdfName, filePath: pdfPath });

    } catch (error: any) {
      console.error('Caught delete error:', error);
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
      
      // Log the download action
      logUserAction(user.id, 'download_all_split_pdfs', { count: Object.values(groupedSplitPdfs).flat().length });

    } catch (error: any) {
      console.error('Error invoking download-split-pdfs function:', error);
      showError(`Failed to download all split PDFs: ${error.message}`);
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleDeleteGroup = async (originalFileName: string) => {
    if (!user || !session) {
      showError('You must be logged in to delete files.');
      return;
    }

    if (!confirm(`Are you sure you want to delete all split pages from "${originalFileName}"?`)) {
      return;
    }

    setDeletingGroup(originalFileName);
    try {
      const { data, error } = await supabase.functions.invoke('delete-split-pdfs-by-original', {
        body: { originalFileName },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data && data.success) {
        showSuccess(`All split pages from "${originalFileName}" deleted successfully.`);
        fetchSplitPdfs(); // Refresh the list
        
        // Log the delete group action
        logUserAction(user.id, 'delete_split_group', { originalFileName });

      } else {
        showError(`Failed to delete split pages from "${originalFileName}".`);
      }
    } catch (error: any) {
      console.error('Error invoking delete-split-pdfs-by-original function:', error);
      showError(`Failed to delete split pages: ${error.message}`);
    } finally {
      setDeletingGroup(null);
    }
  };

  const handleDeleteAllSplitPdfs = async () => {
    if (!user || !session) {
      showError('You must be logged in to delete files.');
      return;
    }

    if (!confirm('Are you sure you want to delete ALL your split PDF pages? This action cannot be undone.')) {
      return;
    }

    setDeletingAll(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-all-split-pdfs', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data && data.success) {
        showSuccess('All split PDF pages deleted successfully!');
        setGroupedSplitPdfs({}); // Clear local state immediately
        
        // Log the delete all split PDFs action
        logUserAction(user.id, 'delete_all_split_pdfs');

      } else {
        showError('Failed to delete all split PDF pages.');
      }
    } catch (error: any) {
      console.error('Error invoking delete-all-split-pdfs function:', error);
      showError(`Failed to delete all split PDFs: ${error.message}`);
    } finally {
      setDeletingAll(false);
    }
  };

  const hasSplitPdfs = Object.keys(groupedSplitPdfs).length > 0;

  if (loading) {
    return <div className="text-center text-gray-600 dark:text-gray-400">Loading split PDFs...</div>;
  }

  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Your Split PDF Pages</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasSplitPdfs ? (
          <p className="text-gray-600 dark:text-gray-400">No split PDF pages available yet.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleDownloadAllSplitPdfs}
                disabled={downloadingAll || !hasSplitPdfs}
                className="flex-grow bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
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
              <Button
                onClick={handleDeleteAllSplitPdfs}
                disabled={deletingAll || !hasSplitPdfs}
                variant="destructive"
                className="flex-grow"
              >
                {deletingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting All...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All Split PDFs
                  </>
                )}
              </Button>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              {Object.entries(groupedSplitPdfs).map(([originalFileName, pdfsInGroup]) => (
                <Collapsible key={originalFileName} className="border rounded-md bg-gray-50 dark:bg-gray-700">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 font-medium text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center">
                      <FolderOpen className="h-5 w-5 text-purple-600 mr-3" />
                      <span>{originalFileName} ({pdfsInGroup.length} pages)</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent collapsible from toggling
                        handleDeleteGroup(originalFileName);
                      }}
                      disabled={deletingGroup === originalFileName}
                      className="flex items-center gap-1 ml-4"
                    >
                      {deletingGroup === originalFileName ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete Group
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="border-t dark:border-gray-600 p-3 space-y-2">
                    <ul className="space-y-2">
                      {pdfsInGroup.map((pdf) => (
                        <li key={pdf.path} className="flex items-center justify-between p-2 border rounded-md bg-white dark:bg-gray-800">
                          <div className="flex items-center flex-grow min-w-0">
                            <FileText className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{pdf.name}</span>
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
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SplitPdfList;