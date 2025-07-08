import React, { useEffect, useState, useCallback } from "react"
import LandingPage from "./components/landingPage"
import LandingPageLoggedIn from "./components/landingPageLoggedIn"

export default function SidePanelContent() {
  const [state, setState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showLandingPage, setShowLandingPage] = useState(false)

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

  // Listen for show-landing-page event
  useEffect(() => {
    const handler = () => setShowLandingPage(true)
    window.addEventListener('show-landing-page', handler)
    return () => window.removeEventListener('show-landing-page', handler)
  }, [])

  // Example: dispatch action to background
  // const dispatchAction = (action: any) => {
  //   chrome.runtime.sendMessage({ type: "REDUX_DISPATCH_ACTION", action })
  // }

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

  // Show LandingPage if triggered by event
  if (showLandingPage) {
    return (
      <div style={{ padding: "1rem" }}>
        <LandingPage />
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