import React, { useState } from "react"

export default function SynchProfile() {
  const [manualLink, setManualLink] = useState("")

  // Handler for Sync Current Profile button
  const handleSyncProfile = async () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      // Query for the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: "SCRAPE_PROFILE" })
        }
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-white rounded-lg shadow-lg overflow-hidden w-full relative p-4">
      {/* Close Button */}
   
      {/* Logo */}
      <div className="w-full flex flex-col items-center mt-2 mb-2">
        <img src="/assets/icon.png" alt="Upwex Logo" className="h-8 mb-2" />
      </div>
      {/* Profile Image */}
      <div className="flex justify-center w-full mt-2 mb-4">
        <img
          src=""
          alt="Profile"
          className="rounded-full border-4 border-white shadow-lg w-28 h-28 object-cover"
        />
      </div>
      {/* Title */}
      <h2 className="text-xl font-semibold text-center mb-4">Upwork Connected Profiles</h2>
      {/* Sync Current Profile Button */}
      <button className="w-full flex items-center justify-center bg-[#256046] text-white py-3 rounded-lg font-medium mb-4 hover:bg-[#1e4d38] transition" onClick={handleSyncProfile}>
        Sync Current Profile
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 0021 12.07M18.364 5A9 9 0 003 11.93" />
        </svg>
      </button>

    </div>
  )
} 