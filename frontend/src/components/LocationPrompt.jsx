import React from 'react';
import { FiMapPin, FiX } from 'react-icons/fi';

const LocationPrompt = ({ onAllow, onDecline }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in duration-300">
        <button
          onClick={onDecline}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FiMapPin className="h-6 w-6 text-blue-600" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Find Properties Near You
          </h3>

          <p className="text-gray-600 mb-6">
            Allow location access to discover nearby properties and get personalized recommendations based on your area.
          </p>

          <div className="space-y-3">
            <button
              onClick={onAllow}
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
            >
              Allow Location Access
            </button>

            <button
              onClick={onDecline}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Skip for Now
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Your location data is only used to show nearby properties and is not stored permanently.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationPrompt;