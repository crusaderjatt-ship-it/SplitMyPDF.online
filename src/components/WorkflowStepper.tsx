"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { UploadCloud, Folder, Scissors, Combine, CheckCircle2 } from 'lucide-react';

interface WorkflowStepperProps {
  steps: { id: string; name: string; icon: React.ElementType }[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
}

const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ steps, currentStepIndex, onStepClick }) => {
  return (
    <Card className="w-full p-4 md:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-none">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <Button
                variant="ghost"
                onClick={() => onStepClick(index)}
                className={cn(
                  "flex flex-col items-center justify-center text-center p-2 h-auto min-w-[80px] md:min-w-[120px] rounded-lg transition-all duration-200",
                  "text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700",
                  isActive && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md",
                  isCompleted && "text-green-600 dark:text-green-400"
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-full mb-2",
                  "bg-gray-200 dark:bg-gray-700",
                  isActive && "bg-blue-600 dark:bg-blue-500 text-white",
                  isCompleted && "bg-green-600 dark:bg-green-500 text-white"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  isActive && "text-blue-700 dark:text-blue-300",
                  isCompleted && "text-green-600 dark:text-green-400"
                )}>
                  {step.name}
                </span>
              </Button>
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-grow h-1 bg-gray-200 dark:bg-gray-700 hidden md:block",
                  isCompleted && "bg-green-400 dark:bg-green-600"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </Card>
  );
};

export default WorkflowStepper;