"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/session-context';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Trash2 } from 'lucide-react';
import { logUserAction } from '@/utils/analytics'; // Import logUserAction

interface PdfFile {
  name: string;
  path: string;
}

const PdfList = () => {
  const { user } = useSession();
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPdfs = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from('user_pdfs').list(user.id, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

      if (error) {
        throw error;
      }

      setPdfs(data.filter(file => file.name !== '.emptyFolderPlaceholder').map(file => ({
        name: file.name,
        path: `${user.id}/${file.name}`,
      })));
    } catch (error: any) {
      showError(`Failed to fetch PDFs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPdfs();
  }, [fetchPdfs]);

  const handleDeletePdf = async (pdfPath: string, pdfName: string) => {
    if (!user) {
      showError('You must be logged in to delete files.');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${pdfName}"?`)) {
      return;
    }

    console.log('Attempting to delete PDF:', { pdfPath, pdfName, userId: user.id });

    try {
      const { error } = await supabase.storage.from('user_pdfs').remove([pdfPath]);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      showSuccess(`"${pdfName}" deleted successfully.`);
      fetchPdfs(); // Refresh the list
      
      // Log the delete action
      logUserAction(user.id, 'delete_pdf', { fileName: pdfName, filePath: pdfPath });

    } catch (error: any) {
      console.error('Caught delete error:', error);
      showError(`Failed to delete PDF: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600 dark:text-gray-400">Loading PDFs...</div>;
  }

  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Your Uploaded PDFs</CardTitle>
      </CardHeader>
      <CardContent>
        {pdfs.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No PDFs uploaded yet.</p>
        ) : (
          <ul className="space-y-3">
            {pdfs.map((pdf) => (
              <li key={pdf.path} className="flex items-center justify-between p-3 border rounded-md bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-3" />
                  <span className="text-gray-800 dark:text-gray-200">{pdf.name}</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePdf(pdf.path, pdf.name)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default PdfList;