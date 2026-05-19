import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SessionContextProvider, useSession } from "./integrations/supabase/session-context";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { useTheme } from "next-themes";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const AdminPricingPage = lazy(() => import("./pages/AdminPricingPage"));
const PublicToolPage = lazy(() => import("./pages/PublicToolPage"));
const GuidePage = lazy(() => import("./pages/GuidePage"));

const siteUrl = "https://splitmypdf.online";

const routeMeta: Record<string, { title: string; description: string }> = {
  "/": {
    title: "SplitMyPDF.online - Free PDF Tools",
    description: "Split, merge, extract, and compress PDFs in your browser for forms, certificates, and everyday document uploads.",
  },
  "/landing": {
    title: "SplitMyPDF.online - Free PDF Tools",
    description: "Use free browser-first PDF tools for quick document tasks, then upgrade for larger files and saved workflows.",
  },
  "/tools/split-pdf": {
    title: "Split PDF Online Free - SplitMyPDF.online",
    description: "Split PDF pages into upload-ready files in your browser without login for small document jobs.",
  },
  "/tools/merge-pdf": {
    title: "Merge PDF Online Free - SplitMyPDF.online",
    description: "Combine certificates, mark sheets, ID proof, and other PDFs into one document.",
  },
  "/tools/extract-pages": {
    title: "Extract PDF Pages Online - SplitMyPDF.online",
    description: "Extract only the PDF pages needed for application forms, portals, and document uploads.",
  },
  "/tools/compress-pdf": {
    title: "Compress PDF Online Free - SplitMyPDF.online",
    description: "Reduce PDF size for upload limits with a browser-first compression tool.",
  },
  "/guides/compress-pdf-under-200kb": {
    title: "Compress PDF Under 200KB - SplitMyPDF.online",
    description: "A practical guide to reduce PDF file size for strict online upload limits.",
  },
  "/guides/merge-certificates-pdf": {
    title: "Merge Certificates Into One PDF - SplitMyPDF.online",
    description: "Learn how to combine certificates, ID proof, and mark sheets into a single PDF.",
  },
  "/guides/split-pdf-for-online-form": {
    title: "Split PDF For Online Form Uploads - SplitMyPDF.online",
    description: "Prepare PDF pages for application forms and portals that ask for separate uploads.",
  },
  "/login": {
    title: "Login - SplitMyPDF.online",
    description: "Sign in to save document history and use private cloud PDF workflows.",
  },
  "/dashboard": {
    title: "Dashboard - SplitMyPDF.online",
    description: "Manage your uploaded PDFs, saved history, split files, and merged documents.",
  },
  "/admin/pricing": {
    title: "Admin Pricing - SplitMyPDF.online",
    description: "Admin pricing controls for SplitMyPDF.online.",
  },
};

const LoadingScreen = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center">{message}</div>
);

const PageMetadata = () => {
  const location = useLocation();

  useEffect(() => {
    const meta = routeMeta[location.pathname] || {
      title: "SplitMyPDF.online",
      description: "Free PDF tools for everyday document uploads.",
    };
    document.title = meta.title;

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    description?.setAttribute("content", meta.description);

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${siteUrl}${location.pathname === "/landing" ? "/" : location.pathname}`;
  }, [location.pathname]);

  return null;
};

// ProtectedRoute component to guard routes that require authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <LoadingScreen message="Loading authentication..." />;
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
    return <LoadingScreen message="Checking permissions..." />;
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
    return <LoadingScreen message="Loading authentication..." />;
  }

  return (
    <>
      <PageMetadata />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/tools/:toolSlug" element={<PublicToolPage />} />
          <Route path="/guides/:guideSlug" element={<GuidePage />} />
          <Route path="/" element={<LandingPage />} />
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
      </Suspense>
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
