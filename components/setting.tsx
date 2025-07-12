import React, { useState } from "react"

export default function Setting() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center bg-white rounded-lg shadow-lg overflow-hidden w-full relative p-4">
      {/* Close Button */}
      <button className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none">
        &times;
      </button>
      {/* Logo */}
      <div className="w-full flex flex-col items-center mt-2 mb-2">
        <img src="/assets/icon.png" alt="Upwex Logo" className="h-8 mb-2" />
      </div>
      {/* Title */}
      <h2 className="text-xl font-semibold text-center mb-6">Settings</h2>
      {/* Account Section */}
      <div className="w-full mb-4">
        <h3 className="text-lg font-medium mb-2">Account</h3>
        <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-700">user@email.com</div>
      </div>
      {/* Preferences Section */}
      <div className="w-full mb-6">
        <h3 className="text-lg font-medium mb-2">Preferences</h3>
        <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2">
          <span>Dark Mode</span>
          <button
            className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${darkMode ? 'bg-[#256046]' : 'bg-gray-300'}`}
            onClick={() => setDarkMode(!darkMode)}
          >
            <span
              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${darkMode ? 'translate-x-6' : ''}`}
            />
          </button>
        </div>
      </div>
      {/* Save Button */}
      <button className="w-full bg-[#256046] text-white py-3 rounded-lg font-medium hover:bg-[#1e4d38] transition">
        Save Settings
      </button>
    </div>
  )
} 