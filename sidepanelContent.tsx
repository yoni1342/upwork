import React, { useEffect, useState, useCallback } from "react"
import LandingPage from "./components/landingPage"
import LandingPageLoggedIn from "./components/landingPageLoggedIn"
import SynchProfile from "./components/synchProfile"
import Setting from "./components/setting"

export default function SidePanelContent() {
  const [state, setState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showSynchProfile, setShowSynchProfile] = useState(false)
  const [showSetting, setShowSetting] = useState(false)

  // Helper to get Redux state from background
  const fetchReduxState = useCallback(() => {
    chrome.runtime.sendMessage({ type: "REDUX_GET_STATE" }, (response) => {
      setState(response?.state)
      setLoading(false)
    })
  }, [])

  // Listen for state updates from background
  useEffect(() => {
    fetchReduxState()
    // Always check session on mount
    chrome.runtime.sendMessage({ type: "REDUX_DISPATCH_ACTION", action: { type: "auth/checkCurrentUser" } })
    const listener = (msg: any) => {
      if (msg.type === "REDUX_STATE_UPDATED") {
        setState(msg.state)
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [fetchReduxState])

  useEffect(() => {
    setShowSynchProfile(false)
    setShowSetting(false)
  }, [])

  // Listen for SHOW_SYNCH_PROFILE and SHOW_SETTING messages
  useEffect(() => {
    const handler = (msg: any, sender: any, sendResponse: any) => {
      if (msg.type === 'SHOW_SYNCH_PROFILE') {
        setShowSynchProfile(true)
        setShowSetting(false)
      }
      if (msg.type === 'SHOW_SETTING') {
        setShowSetting(true)
        setShowSynchProfile(false)
      }
    }
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(handler)
      return () => chrome.runtime.onMessage.removeListener(handler)
    }
  }, [])

  if (loading || !state) {
    return (
      <div style={{ padding: "1rem" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!state.sidepanel?.showSidepanel) {
    return null
  }

  // Show SynchProfile if triggered
  if (showSynchProfile) {
    return (
      <div style={{ padding: "1rem" }}>
        <SynchProfile />
      </div>
    )
  }

  // Show Setting if triggered
  if (showSetting) {
    return (
      <div style={{ padding: "1rem" }}>
        <Setting />
      </div>
    )
  }

  // Show logged-in landing page if authenticated
  if (state.auth?.isAuthenticated) {
    return (
      <div style={{ padding: "1rem" }}>
        <LandingPageLoggedIn user={state.auth.user} />
      </div>
    )
  }

  // Otherwise, show guest landing page
  return (
    <div style={{ padding: "1rem" }}>
      <LandingPage />
    </div>
  )
}