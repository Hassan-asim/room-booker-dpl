import React from 'react';
import { Progress } from 'antd'; // Import Progress component

const SplashScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 relative"> {/* Added relative for absolute positioning of text */}
      <img src="/logo.png" alt="Logo" className="h-64 w-64 object-contain mb-8 animate-pulse" /> {/* Logo 2x bigger */}
      <div className="text-lg font-semibold mb-2">100% Loading</div> {/* Percentage text above the bar */}
      <Progress 
        percent={100} 
        status="active" 
        showInfo={false} // Hide default percentage
        strokeColor="#ef4444" // Red color
        className="w-64"
      /> {/* Line progress bar */}
      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm">All rights reserved | Made by Sufi Hassan Asim</p> {/* Text at bottom center */}
    </div>
  );
};

export default SplashScreen;
