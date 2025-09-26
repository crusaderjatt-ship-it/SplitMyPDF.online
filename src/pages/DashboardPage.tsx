import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSession } from "@/integrations/supabase/session-context";
import PdfWorkflowPage from "@/pages/PdfWorkflowPage";
import AppHeader from "@/components/AppHeader";
import WorkflowStepper from "@/components/WorkflowStepper";
import React, { useState } from "react";
import { UploadCloud, Folder, Scissors, Combine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UsageAnalyticsCard from "@/components/UsageAnalyticsCard"; // Import UsageAnalyticsCard

const workflowSteps = [
  { id: 'upload', name: 'Upload PDF', icon: UploadCloud },
  { id: 'my-files', name: 'My Files', icon: Folder },
  { id: 'split-pdf', name: 'Split PDF', icon: Scissors },
  { id: 'merge-pdf', name: 'Merge PDFs', icon: Combine },
];

const DashboardPage = () => {
  const { user } = useSession();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleStepChange = (index: number) => {
    setCurrentStepIndex(index);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white p-4 space-y-8 pt-20">
      <AppHeader />

      <div className="container mx-auto max-w-6xl w-full space-y-8">
        {/* Welcome Card / Action Hub */}
        <Card className="w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-none text-center">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-4xl font-extrabold text-blue-800 dark:text-blue-300">
              Welcome, {user?.email?.split('@')[0]}!
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
              Let's get your PDF tasks done. Follow the steps below to manage your documents.
            </p>
          </CardContent>
        </Card>

        {/* Workflow Stepper */}
        <WorkflowStepper
          steps={workflowSteps}
          currentStepIndex={currentStepIndex}
          onStepClick={handleStepChange}
        />

        {/* PDF Workflow Content */}
        <PdfWorkflowPage
          currentStep={workflowSteps[currentStepIndex].id}
          onStepChange={handleStepChange}
        />

        {/* Usage Analytics Section */}
        <UsageAnalyticsCard />
      </div>

      <div className="mt-auto pb-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default DashboardPage;