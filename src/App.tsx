import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage"; // Renamed from Index
import LandingPage from "./pages/LandingPage"; // New landing page
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { SessionContextProvider, useSession } from "./integrations/supabase/session-context";
import React from "react";
import { ThemeProvider } from "@/components/theme-provider"; // Import ThemeProvider

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

// Component to handle conditional routing based on authentication status
const AppRoutes = () => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading authentication...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/landing" element={<LandingPage />} /> {/* Explicit landing page route */}
      <Route
        path="/"
        element={session ? <Navigate to="/dashboard" replace /> : <LandingPage />} // If authenticated, redirect to dashboard, else show landing
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme"> {/* ThemeProvider added here */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SessionContextProvider>
            <AppRoutes /> {/* Use the new AppRoutes component */}
          </SessionContextProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;