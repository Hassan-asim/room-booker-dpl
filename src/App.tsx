import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "react-router-dom"; // Updated import
import { ThemeProvider } from "./components/theme-provider";
import SplashScreen from './components/SplashScreen';
import IdleOverlayHandler from './components/IdleOverlayHandler'; // Import IdleOverlayHandler
import InstallPromptHandler from './components/InstallPromptHandler';

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // Show splash screen for 3 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="room-booker-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <IdleOverlayHandler /> {/* Render IdleOverlayHandler */}
          <InstallPromptHandler />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
