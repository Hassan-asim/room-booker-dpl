import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">Room Booking System</h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Book meeting rooms and manage your reservations
          </p>
          <Button onClick={() => navigate("/auth")}>Sign In / Sign Up</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Room Booking</h1>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/rooms")}>
              Browse Rooms
            </Button>
            <Button variant="ghost" onClick={() => navigate("/my-bookings")}>
              My Bookings
            </Button>
            <Button variant="ghost" onClick={() => navigate("/admin")}>
              Admin
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </nav>
      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center p-8">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold">Welcome back!</h2>
          <p className="mb-8 text-muted-foreground">
            Start by browsing available rooms or checking your bookings
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/rooms")}>Browse Rooms</Button>
            <Button variant="outline" onClick={() => navigate("/my-bookings")}>
              View My Bookings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
