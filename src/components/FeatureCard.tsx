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
  glowColorClass: string; // Tailwind class for the glow color (e.g., 'bg-blue-300/70')
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, bgColorClass, glowColorClass }) => {
  return (
    <Card className={cn(
      "group relative flex flex-col justify-between h-full p-8 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] border-none",
      bgColorClass
    )}>
      {/* Colored immersive glow on hover */}
      <div className={cn(
        "absolute rounded-3xl z-0",
        "inset-[-10px]", // Creates a spread effect by extending 10px on all sides
        "translate-x-2 translate-y-2", // Offsets the glow slightly to the bottom-right
        glowColorClass, // Now expects a direct bg- color class
        "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        "transition-transform duration-300 ease-out", // Smooth transition for the offset
        "filter blur-2xl" // Applies a 40px blur for a soft glow
      )}></div>
      
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