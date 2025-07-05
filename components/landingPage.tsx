import React from 'react';

export default function LandingPage() {
  const handleLogin = () => {
    // Open login page in a new tab
    chrome.tabs.create({ url: chrome.runtime.getURL('/tabs/login.html') });
  };

  const handleRegister = () => {
    // Open register page in a new tab
    chrome.tabs.create({ url: chrome.runtime.getURL('/tabs/register.html') });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-white rounded-lg shadow-lg overflow-hidden w-full">
      {/* Header with logo and background */}
      <div className="w-full bg-[#11443A] flex flex-col items-center pt-8 pb-4">
        <img src="/assets/icon.png" alt="Upwex Logo" className="h-10 mb-4" />
        <div className="bg-white rounded-full p-2 shadow-md -mb-12 z-10">
          <svg height="96" width="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="48" cy="48" r="48" fill="#F3F4F6" />
            <circle cx="48" cy="38" r="18" fill="#E5E7EB" />
            <ellipse cx="48" cy="70" rx="24" ry="14" fill="#E5E7EB" />
          </svg>
        </div>
      </div>
      {/* Main content */}
      <div className="flex flex-col items-center w-full px-6 mt-16">
        <h2 className="text-2xl font-semibold mt-2 mb-6">Hello User</h2>
        <button
          className="w-full bg-[#11443A] text-white py-3 rounded-lg font-medium mb-6 hover:bg-[#0d362e] transition"
          onClick={handleLogin}
        >
          Login in YONI
        </button>
        <p className="text-center text-gray-700 mb-2">Don't have an account?</p>
        <button
          className="w-full border border-[#E5E7EB] text-[#11443A] py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          onClick={handleRegister}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
} 