import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSession } from "@/integrations/supabase/session-context";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout"; // Import the new DashboardLayout

const Index = () => {
  const { user } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome, {user?.email}!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          This is your personalized PDF splitting portal.
        </p>
        <Button onClick={handleLogout} variant="destructive">
          Logout
        </Button>
      </div>

      {/* Integrate the new DashboardLayout component */}
      <DashboardLayout />

      <div className="absolute bottom-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;