import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"; // Import useLocation
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MyBookings from "./pages/MyBookings";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./components/theme-provider";
import SplashScreen from './components/SplashScreen';
import RoomStatusOverlay from './components/RoomStatusOverlay'; // Import RoomStatusOverlay
import useIdleTimer from './hooks/useIdleTimer'; // Import useIdleTimer

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const isIdle = useIdleTimer(120 * 1000); // 120 seconds (2 minutes) for screensaver
  const [showOverlay, setShowOverlay] = useState(false);
  const location = useLocation(); // Get current location

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // Show splash screen for 3 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only show overlay if idle and not on auth or admin pages
    if (isIdle && location.pathname !== '/auth' && location.pathname !== '/admin') {
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
  }, [isIdle, location.pathname]);

  const dismissOverlay = () => {
    setShowOverlay(false);
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="room-booker-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {showOverlay && <RoomStatusOverlay onClick={dismissOverlay} />}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
