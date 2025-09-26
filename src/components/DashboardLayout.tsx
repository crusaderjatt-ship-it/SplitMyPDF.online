"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PdfUploader from './PdfUploader';
import PdfList from './PdfList';
import PdfSplitter from './PdfSplitter';
import SplitPdfList from './SplitPdfList';

const DashboardLayout = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload PDF</TabsTrigger>
          <TabsTrigger value="my-pdfs">My PDFs</TabsTrigger>
          <TabsTrigger value="split-pdf">Split PDF</TabsTrigger>
          <TabsTrigger value="split-pages">Split Pages</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default DashboardLayout;