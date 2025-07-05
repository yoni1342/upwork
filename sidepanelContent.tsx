import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "./store"
import { checkCurrentUser } from "./Slice/authSlice"
import LandingPage from "./components/landingPage"

export default function SidePanelContent() {
  const dispatch = useDispatch<AppDispatch>()
  const showSidepanel = useSelector((state: RootState) => state.sidepanel.showSidepanel)
  //const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const loading = useSelector((state: RootState) => state.auth.loading)

  useEffect(() => {
    // Check if user is authenticated on component mount
    dispatch(checkCurrentUser())
  }, [dispatch])

  // Don't render if sidepanel should be hidden or user is authenticated
  if (!showSidepanel) {
    return null
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ padding: "1rem" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: "1rem" }}>
      <LandingPage />
    </div>
  )
} 