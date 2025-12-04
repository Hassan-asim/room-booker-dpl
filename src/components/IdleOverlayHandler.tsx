import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import Index from "../pages/Index";
import Auth from "../pages/Auth";
import MyBookings from "../pages/MyBookings";
import Admin from "../pages/Admin";
import NotFound from "../pages/NotFound";
import { ProtectedRoute } from "./ProtectedRoute";
import RoomStatusOverlay from './RoomStatusOverlay';
import useIdleTimer from '../hooks/useIdleTimer';

const IdleOverlayHandler = () => {
  const isIdle = useIdleTimer(120 * 1000); // 120 seconds (2 minutes) for screensaver
  const [showOverlay, setShowOverlay] = useState(false);
  const location = useLocation(); // Get current location

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

  return (
    <>
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
    </>
  );
};

export default IdleOverlayHandler;
