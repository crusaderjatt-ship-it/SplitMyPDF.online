import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSession } from "@/integrations/supabase/session-context";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import AppHeader from "@/components/AppHeader"; // Import AppHeader

const DashboardPage = () => {
  const { user } = useSession();
  const navigate = useNavigate();

  // Logout functionality is now handled by AppHeader
  // const handleLogout = async () => {
  //   await supabase.auth.signOut();
  //   navigate('/login');
  // };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 space-y-8 pt-20"> {/* Adjusted padding for header */}
      <AppHeader /> {/* AppHeader added here */}

      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome, {user?.email}!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Your all-in-one portal for PDF management.
        </p>
        {/* Logout button moved to AppHeader */}
        {/* <Button onClick={handleLogout} variant="destructive">
          Logout
        </Button> */}
      </div>

      <DashboardLayout />

      <div className="absolute bottom-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default DashboardPage;