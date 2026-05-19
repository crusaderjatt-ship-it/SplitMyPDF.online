import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminPricingPage from "./pages/AdminPricingPage";
import PublicToolPage from "./pages/PublicToolPage";
import GuidePage from "./pages/GuidePage";
import { SessionContextProvider, useSession } from "./integrations/supabase/session-context";
import React, { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { useTheme } from "next-themes";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

// ProtectedRoute component to guard routes that require authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading authentication...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setCheckingAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      setIsAdmin(Boolean(data) && !error);
      setCheckingAdmin(false);
    };

    checkAdmin();
  }, [user]);

  if (isLoading || checkingAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Checking permissions...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center px-4 text-center">You do not have access to this admin area.</div>;
  }

  return <>{children}</>;
};

// Component to handle conditional routing based on authentication status
const AppRoutes = () => {
  const { session, isLoading } = useSession();
  const { resolvedTheme } = useTheme(); // Get the resolved theme

  // Manually apply the 'dark' class to the html element
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (resolvedTheme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [resolvedTheme]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading authentication...</div>;
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/tools/:toolSlug" element={<PublicToolPage />} />
        <Route path="/guides/:guideSlug" element={<GuidePage />} />
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pricing"
          element={
            <AdminRoute>
              <AdminPricingPage />
            </AdminRoute>
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SessionContextProvider>
            <AppRoutes />
          </SessionContextProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
