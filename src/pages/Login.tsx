import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/session-context';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { useTheme } from 'next-themes'; // Import useTheme

const Login = () => {
  const { session, isLoading } = useSession();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme(); // Get the resolved theme (light or dark)

  useEffect(() => {
    if (session && !isLoading) {
      navigate('/dashboard'); // Redirect to dashboard after login
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AppHeader />
        <p className="text-gray-700 dark:text-gray-300 mt-20">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 pt-20 overflow-hidden">
      {/* Subtle background animation/elements for modern feel */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob absolute top-0 left-0"></div>
        <div className="w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 absolute bottom-0 right-0"></div>
      </div>

      <AppHeader />
      <div className="container mx-auto max-w-3xl py-12 relative z-10 flex flex-col items-center">
        {/* Marketing Text Section */}
        <div className="text-center mb-12 max-w-2xl">
          <h2 className="text-4xl font-extrabold mb-4 text-blue-800 dark:text-blue-300 leading-tight">
            Your Gateway to Effortless PDF Management
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Welcome to SplitMyPDF.online! Sign in or sign up to access your personalized dashboard.
            A world of seamless PDF organization, splitting, and merging awaits you.
          </p>
          <ul className="space-y-3 text-left text-gray-700 dark:text-gray-300 text-base mx-auto max-w-xs">
            <li className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              Instant PDF Splitting & Merging
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              Secure Cloud Storage for All Your Docs
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              Intuitive Interface, Zero Learning Curve
            </li>
          </ul>
        </div>

        {/* Login Card (only one box) */}
        <Card className="w-full max-w-md p-8 rounded-xl shadow-lg dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700">
          <CardHeader className="text-center p-0 mb-6">
            <CardTitle className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              Welcome to SplitMyPDF.online
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Sign in or create an account to manage your PDFs.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Auth
              supabaseClient={supabase}
              providers={[]}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: { // Light theme variables
                    colors: {
                      brand: 'hsl(221.2 83.2% 53.3%)', // Primary brand color
                      brandAccent: 'hsl(221.2 83.2% 45.3%)', // Accent for brand
                      button: {
                        default: {
                          background: 'hsl(221.2 83.2% 53.3%)', // A vibrant blue
                          text: 'hsl(0 0% 100%)', // White text
                          border: 'hsl(221.2 83.2% 53.3%)',
                        },
                        hover: {
                          background: 'hsl(221.2 83.2% 45.3%)', // Slightly darker blue on hover
                          text: 'hsl(0 0% 100%)',
                          border: 'hsl(221.2 83.2% 45.3%)',
                        },
                      },
                      input: {
                        background: 'hsl(var(--background))',
                        border: 'hsl(var(--border))',
                        focusBorder: 'hsl(var(--ring))',
                        borderRadius: 'var(--radius)',
                      },
                    },
                  },
                  dark: { // Dark theme variables
                    colors: {
                      brand: 'hsl(221.2 83.2% 65.3%)', // Adjusted primary for dark theme
                      brandAccent: 'hsl(221.2 83.2% 55.3%)', // Adjusted accent for dark theme
                      button: {
                        default: {
                          background: 'hsl(221.2 83.2% 65.3%)', // Dark theme blue
                          text: 'hsl(0 0% 100%)',
                          border: 'hsl(221.2 83.2% 65.3%)',
                        },
                        hover: {
                          background: 'hsl(221.2 83.2% 55.3%)', // Darker blue on hover
                          text: 'hsl(0 0% 100%)',
                          border: 'hsl(221.2 83.2% 55.3%)',
                        },
                      },
                      input: {
                        background: 'hsl(var(--input))', // Use existing dark input background
                        border: 'hsl(var(--border))',
                        focusBorder: 'hsl(var(--ring))',
                        borderRadius: 'var(--radius)',
                      },
                      // You might want to adjust other colors like text, background, etc.
                      // based on your global dark theme variables if ThemeSupa doesn't pick them up automatically.
                      // For example:
                      // text: 'hsl(var(--foreground))',
                      // defaultButtonBackground: 'hsl(var(--primary))',
                      // defaultButtonText: 'hsl(var(--primary-foreground))',
                    },
                  },
                },
              }}
              theme={resolvedTheme === 'dark' ? 'dark' : 'light'} // Dynamically set theme
              redirectTo={window.location.origin + '/dashboard'}
            />
          </CardContent>
        </Card>
      </div>

      {/* SEO-friendly Footer */}
      <footer className="absolute bottom-4 w-full text-center text-gray-600 dark:text-gray-400 text-sm z-10">
        <p className="mb-1">
          <span className="font-semibold">SplitMyPDF.online:</span> Your ultimate tool for secure and efficient PDF management.
        </p>
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Login;