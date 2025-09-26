"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  bgColorClass: string; // Tailwind class for background color/gradient
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, bgColorClass }) => {
  return (
    <Card className={cn(
      "relative flex flex-col justify-between h-full p-8 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] border-none",
      bgColorClass
    )}>
      <div className="absolute inset-0 opacity-20">
        {/* Optional: Add a subtle pattern or texture here for more depth */}
      </div>
      <CardHeader className="relative z-10 p-0 mb-6">
        <Icon className="h-16 w-16 text-white mb-4 drop-shadow-md" />
        <CardTitle className="text-3xl font-bold text-white leading-tight drop-shadow-sm">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 p-0 text-lg text-white opacity-90">
        {description}
      </CardContent>
    </Card>
  );
};

export default FeatureCard;