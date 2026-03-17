import React from "react";

/**
 * Reconnecting overlay shown during network disconnection.
 * Shows a "Reconnecting..." message with a spinner.
 */
const ReconnectingOverlay = ({ isVisible, message = "Reconnecting..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-xs mx-4">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
        
        {/* Message */}
        <p className="text-gray-700 font-medium text-center">{message}</p>
        
        {/* Sub-message */}
        <p className="text-gray-500 text-sm text-center">
          Please wait while we restore your connection...
        </p>
      </div>
    </div>
  );
};

export default ReconnectingOverlay;
