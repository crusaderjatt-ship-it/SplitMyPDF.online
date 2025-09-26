import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/session-context';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad'; // Import MadeWithDyad

const Login = () => {
  const { session, isLoading } = useSession();
  const navigate = useNavigate();

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
      <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-12 relative z-10">
        {/* Left Section: Marketing Text */}
        <div className="text-center lg:text-left p-6 lg:p-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg">
          <img src="/SplitMyPDF_Logo.png" alt="Split My PDF Logo" className="h-16 w-auto mx-auto lg:mx-0 mb-6" />
          <h2 className="text-4xl font-extrabold mb-4 text-blue-800 dark:text-blue-300 leading-tight">
            Your Gateway to Effortless PDF Management
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Welcome to SplitMyPDF.online! Sign in or sign up to access your personalized dashboard.
            A world of seamless PDF organization, splitting, and merging awaits you.
          </p>
          <ul className="space-y-3 text-left text-gray-700 dark:text-gray-300 text-base lg:text-lg">
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

        {/* Right Section: Auth Form */}
        <Card className="w-full max-w-md mx-auto p-8 rounded-xl shadow-lg dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              Join SplitMyPDF.online
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Sign in or create an account to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              providers={[]}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(var(--primary))',
                      brandAccent: 'hsl(var(--primary-foreground))',
                    },
                  },
                },
              }}
              theme="light"
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