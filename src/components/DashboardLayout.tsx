"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PdfUploader from './PdfUploader';
import PdfList from './PdfList';
import PdfSplitter from './PdfSplitter';
import SplitPdfList from './SplitPdfList';
import PdfMerger from './PdfMerger'; // Import the new PdfMerger component

const DashboardLayout = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-5"> {/* Increased grid columns for new tab */}
          <TabsTrigger value="upload">Upload PDF</TabsTrigger>
          <TabsTrigger value="my-pdfs">My PDFs</TabsTrigger>
          <TabsTrigger value="split-pdf">Split PDF</TabsTrigger>
          <TabsTrigger value="split-pages">Split Pages</TabsTrigger>
          <TabsTrigger value="merge-pdf">Merge PDFs</TabsTrigger> {/* New tab for merging */}
        </TabsList>
        <TabsContent value="upload" className="mt-4 flex justify-center">
          <PdfUploader />
        </TabsContent>
        <TabsContent value="my-pdfs" className="mt-4 flex justify-center">
          <PdfList />
        </TabsContent>
        <TabsContent value="split-pdf" className="mt-4 flex justify-center">
          <PdfSplitter />
        </TabsContent>
        <TabsContent value="split-pages" className="mt-4 flex justify-center">
          <SplitPdfList />
        </TabsContent>
        <TabsContent value="merge-pdf" className="mt-4 flex justify-center"> {/* Content for new tab */}
          <PdfMerger />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardLayout;