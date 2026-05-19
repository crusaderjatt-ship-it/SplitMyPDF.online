"use client";

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSession } from '@/integrations/supabase/session-context';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  className?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ className }) => {
  const { session } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isOnDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  return (
    <header className={cn(
      "w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm z-50",
      "fixed top-0 left-0 right-0 p-4",
      "flex items-center justify-between",
      className
    )}>
      <Link to="/" className="flex items-center space-x-2 rounded-md bg-white px-2 py-1 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
        <img src="/SplitMyPDF_Logo.png" alt="Split My PDF Logo" className="h-12 w-auto" />
      </Link>

      <nav className="flex items-center space-x-4">
        {!isOnDashboard && (
          <>
            <Link to="/tools/split-pdf" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
              Split
            </Link>
            <Link to="/tools/merge-pdf" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
              Merge
            </Link>
            <Link to="/tools/compress-pdf" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
              Compress
            </Link>
            <a href="/#pricing" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
              Pro
            </a>
          </>
        )}
        {session ? (
          <>
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <Button onClick={handleLogout} variant="ghost" className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900">
              Logout
            </Button>
          </>
        ) : (
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        )}
        <ThemeToggle />
      </nav>
    </header>
  );
};

export default AppHeader;
