"use client";

import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs'; // Removed TabsList, TabsTrigger
import PdfUploader from '@/components/PdfUploader';
import PdfList from '@/components/PdfList';
import PdfSplitter from '@/components/PdfSplitter';
import SplitPdfList from '@/components/SplitPdfList';
import PdfMerger from '@/components/PdfMerger';
import { Card, CardContent } from '@/components/ui/card';

interface PdfWorkflowPageProps {
  currentStep: string;
  onStepChange: (index: number) => void; // Added for potential future use or internal navigation
}

const PdfWorkflowPage: React.FC<PdfWorkflowPageProps> = ({ currentStep, onStepChange }) => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <Tabs value={currentStep} className="w-full">
        {/* TabsList and TabsTrigger are removed as navigation is handled by WorkflowStepper */}
        
        <TabsContent value="upload" className="mt-4 flex justify-center">
          <Card className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-md border-none">
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