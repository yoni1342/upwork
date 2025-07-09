import React, { useEffect, useState, useCallback } from "react"
import LandingPage from "./components/landingPage"
import LandingPageLoggedIn from "./components/landingPageLoggedIn"
import SynchProfile from "./components/synchProfile"
import Setting from "./components/setting"

interface AuthState {
  user: unknown // TODO: Replace with a proper user type if available
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}
interface SidepanelState {
  showSidepanel: boolean
}
interface ReduxState {
  auth: AuthState
  sidepanel: SidepanelState
  // add other slices if needed
}

export default function SidePanelContent() {
  const [state, setState] = useState<ReduxState | null>(null)
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

  // Always check session on mount and when sidepanel is shown
  useEffect(() => {
    fetchReduxState()
    chrome.runtime.sendMessage({ type: "REDUX_DISPATCH_ACTION", action: { type: "auth/checkCurrentUser" } })
    const listener = (msg: { type: string; state: ReduxState }) => {
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
    const handler = (msg: { type: string }) => {
      if (msg.type === 'SHOW_SYNCH_PROFILE') {
        setShowSynchProfile(true)
        setShowSetting(false)
        // Always check session when opening SynchProfile
        chrome.runtime.sendMessage({ type: "REDUX_DISPATCH_ACTION", action: { type: "auth/checkCurrentUser" } })
      }
      if (msg.type === 'SHOW_SETTING') {
        setShowSetting(true)
        setShowSynchProfile(false)
        // Always check session when opening Setting
        chrome.runtime.sendMessage({ type: "REDUX_DISPATCH_ACTION", action: { type: "auth/checkCurrentUser" } })
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
  if (showSynchProfile && state.auth?.isAuthenticated) {
    return (
      <div style={{ padding: "1rem" }}>
        <SynchProfile />
      </div>
    )
  }

  // Show Setting if triggered
  if (showSetting && state.auth?.isAuthenticated) {
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