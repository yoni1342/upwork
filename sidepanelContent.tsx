import React, { useEffect, useState, useCallback } from "react"
import LandingPage from "./components/landingPage"
import LandingPageLoggedIn from "./components/landingPageLoggedIn"
import SynchProfile from "./components/synchProfile"
import Setting from "./components/setting"
import CoverLetterModal from "./components/coverLetterModal"

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
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false)
  // Remove coverLetterModalData state

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

  // Listen for SHOW_SYNCH_PROFILE, SHOW_SETTING, and OPEN_COVER_LETTER_MODAL messages
  useEffect(() => {
    const handler = (msg: { type: string }) => {
      if (msg.type === 'SHOW_SYNCH_PROFILE') {
        setShowSynchProfile(true)
        setShowSetting(false)
        chrome.runtime.sendMessage({ type: "REDUX_DISPATCH_ACTION", action: { type: "auth/checkCurrentUser" } })
      }
      if (msg.type === 'SHOW_SETTING') {
        setShowSetting(true)
        setShowSynchProfile(false)
        chrome.runtime.sendMessage({ type: "REDUX_DISPATCH_ACTION", action: { type: "auth/checkCurrentUser" } })
      }
      if (msg.type === 'OPEN_COVER_LETTER_MODAL') {
        setShowCoverLetterModal(true)
      }
    }
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(handler)
      return () => chrome.runtime.onMessage.removeListener(handler)
    }
  }, [state])

  // Render the modal above all content if needed
  return (
    <div style={{ padding: "1rem", position: "relative" }}>
      {loading || !state ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      ) : !state.sidepanel?.showSidepanel ? null
        : showSynchProfile && state.auth?.isAuthenticated ? <SynchProfile />
        : showSetting && state.auth?.isAuthenticated ? <Setting />
        : showCoverLetterModal ? (
            <CoverLetterModal onClose={() => setShowCoverLetterModal(false)} />
          )
        : state.auth?.isAuthenticated ? <LandingPageLoggedIn user={state.auth.user} />
        : <LandingPage />
      }
    </div>
  )
}