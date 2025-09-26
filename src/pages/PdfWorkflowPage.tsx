"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PdfUploader from '@/components/PdfUploader';
import PdfList from '@/components/PdfList';
import PdfSplitter from '@/components/PdfSplitter';
import SplitPdfList from '@/components/SplitPdfList';
import PdfMerger from '@/components/PdfMerger';
import { Card, CardContent } from '@/components/ui/card';

const PdfWorkflowPage = () => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-4 lg:grid-cols-4 h-auto">
          <TabsTrigger value="upload" className="py-2">Upload</TabsTrigger>
          <TabsTrigger value="my-files" className="py-2">My Files</TabsTrigger>
          <TabsTrigger value="split-pdf" className="py-2">Split PDF</TabsTrigger>
          <TabsTrigger value="merge-pdf" className="py-2">Merge PDFs</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4 flex justify-center">
          <Card className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <CardContent className="p-6">
              <PdfUploader />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-files" className="mt-4 flex flex-col items-center space-y-8">
          <PdfList />
          <SplitPdfList />
        </TabsContent>

        <TabsContent value="split-pdf" className="mt-4 flex justify-center">
          <PdfSplitter />
        </TabsContent>

        <TabsContent value="merge-pdf" className="mt-4 flex justify-center">
          <PdfMerger />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PdfWorkflowPage;