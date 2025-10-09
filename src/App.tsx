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
import { SessionContextProvider, useSession } from "./integrations/supabase/session-context";
import React, { useEffect } from "react"; // Import useEffect
import { ThemeProvider } from "@/components/theme-provider";
import AppHeader from "@/components/AppHeader";
import { useTheme } from "next-themes"; // Import useTheme

const queryClient = new QueryClient();

// Component to visually indicate theme status and log it
const ThemeStatusIndicator = () => {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    console.log("Current theme (from next-themes):", theme);
    console.log("Resolved theme (from next-themes):", resolvedTheme);
    // You can also inspect document.documentElement.classList in browser dev tools
  }, [theme, resolvedTheme]);

  return (
    <div className="fixed top-2 right-2 p-2 rounded-md text-white text-xs z-[9999] bg-red-500 dark:bg-green-500">
      Theme: {resolvedTheme}
    </div>
  );
};

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

// Component to handle conditional routing based on authentication status
const AppRoutes = () => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading authentication...</div>;
  }

  return (
    <>
      <AppHeader />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/landing" element={<LandingPage />} />
        {/* <Route path="/pricing" element={<PricingPage />} /> Removed: Pricing content is now on LandingPage */}
        <Route
          path="/"
          element={session ? <Navigate to="/dashboard" replace /> : <LandingPage />}
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
            <ProtectedRoute>
              <AdminPricingPage />
            </ProtectedRoute>
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
      <ThemeStatusIndicator /> {/* Add this component */}
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