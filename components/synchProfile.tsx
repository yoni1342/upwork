import React, { useState, useEffect } from "react"

interface ExperienceType {
  company: string
  description: string
}
interface WorkHistoryType {
  project_title: string
  rating: string | number | null
  feedback: string
}
interface ProfileType {
  image?: string | null
  name?: string | null
  location?: string | null
  about?: string | null
  hourly_rate?: string | number | null
  role?: string | null
  upwork_user_id?: string | null
}
interface ProfileDataType {
  profile: ProfileType
  skills: string[]
  certifications: string[]
  experience: ExperienceType[]
  workHistory: WorkHistoryType[]
}

export default function SynchProfile() {
  const [profileData, setProfileData] = useState<ProfileDataType | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState("")

  // Helper to fetch profile data
  const fetchProfile = () => {
    setLoading(true)
    setError("")
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: "GET_CURRENT_USER" }, (response) => {
        const userId = response?.user?.id
        if (!userId) {
          setError("No user logged in.")
          setLoading(false)
          setProfileData(null)
          return
        }
        chrome.runtime.sendMessage({ type: "FETCH_PROFILE", payload: { user_id: userId } }, (resp) => {
          if (resp?.data) {
            setProfileData(resp.data)
          } else {
            setProfileData(null)
            setError(resp?.error || "Failed to fetch profile.")
          }
          setLoading(false)
        })
      })
    }
  }

  // Handler for Sync Current Profile button
  const handleSyncProfile = async () => {
    setSyncing(true)
    setError("")
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.runtime) {
      // Query for the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: "SCRAPE_PROFILE" }, () => {
            // Wait a moment for backend to process, then re-fetch
            setTimeout(() => {
              fetchProfile()
              setSyncing(false)
            }, 1200)
          })
        } else {
          setSyncing(false)
        }
      })
    } else {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const showLoader = loading || syncing

  return (
    <div className="min-h-screen flex flex-col items-center bg-white rounded-lg shadow-lg overflow-hidden w-full relative p-4">
      {/* Logo */}
      <div className="w-full flex flex-col items-center mt-2 mb-2">
        <img src="/assets/icon.png" alt="Upwex Logo" className="h-8 mb-2" />
      </div>
      {/* Profile Image */}
      <div className="flex justify-center w-full mt-2 mb-4">
        <img
          src={profileData?.profile?.image || ""}
          alt="Profile"
          className="rounded-full border-4 border-white shadow-lg w-28 h-28 object-cover"
        />
      </div>
      {/* Title */}
      <h2 className="text-xl font-semibold text-center mb-4">Upwork Connected Profiles</h2>
      {/* Sync Current Profile Button */}
      <button className="w-full flex items-center justify-center bg-[#256046] text-white py-3 rounded-lg font-medium mb-4 hover:bg-[#1e4d38] transition" onClick={handleSyncProfile} disabled={syncing}>
        {syncing ? "Syncing..." : "Sync Current Profile"}
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 0021 12.07M18.364 5A9 9 0 003 11.93" />
        </svg>
      </button>
      {showLoader && <div className="text-gray-500">Loading profile...</div>}
      {error && !showLoader && <div className="text-red-500 mb-2">{error}</div>}
      {/* Only show profile info if data exists and not loading/syncing */}
      {profileData && !showLoader && (
        <div className="w-full mt-4">
          <div className="mb-2"><b>Name:</b> {profileData.profile?.name}</div>
          <div className="mb-2"><b>Location:</b> {profileData.profile?.location}</div>
          <div className="mb-2"><b>About:</b> {profileData.profile?.about}</div>
          <div className="mb-2"><b>Hourly Rate:</b> {profileData.profile?.hourly_rate}</div>
          <div className="mb-2"><b>Role:</b> {profileData.profile?.role}</div>
          <div className="mb-2"><b>Upwork User ID:</b> {profileData.profile?.upwork_user_id}</div>
          <div className="mb-2"><b>Skills:</b> {profileData.skills?.join(", ")}</div>
          <div className="mb-2"><b>Certifications:</b> {profileData.certifications?.join(", ")}</div>
          <div className="mb-2"><b>Experience:</b>
            <ul className="list-disc ml-6">
              {profileData.experience?.map((exp, idx) => (
                <li key={idx}><b>{exp.company}</b>: {exp.description}</li>
              ))}
            </ul>
          </div>
          <div className="mb-2"><b>Work History:</b>
            <ul className="list-disc ml-6">
              {profileData.workHistory?.map((w, idx) => (
                <li key={idx}><b>{w.project_title}</b> (Rating: {w.rating}): {w.feedback}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 