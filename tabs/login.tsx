import React, { useState, useEffect, useCallback } from "react"
import "../style.css"

function LoginPageContent() {
  const [state, setState] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Fetch Redux state from background
  const fetchReduxState = useCallback(() => {
    chrome.runtime.sendMessage({ type: "REDUX_GET_STATE" }, (response) => {
      setState(response?.state)
    })
  }, [])

  useEffect(() => {
    fetchReduxState()
    const listener = (msg: any) => {
      if (msg.type === "REDUX_STATE_UPDATED") {
        setState(msg.state)
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [fetchReduxState])

  useEffect(() => {
    // Hide sidepanel when on login page
    chrome.runtime.sendMessage({ type: "REDUX_DISPATCH_ACTION", action: { type: "sidepanel/hideSidepanel" } })
    // Always check session on mount
    chrome.runtime.sendMessage({ type: "REDUX_DISPATCH_ACTION", action: { type: "auth/checkCurrentUser" } })
  }, [])

  useEffect(() => {
    // Debug current auth state
    console.log("🔐 Auth state:", state?.auth)
    if (state?.auth?.error) {
      console.log("🔴 Auth error:", state?.auth?.error)
      setError(state.auth.error)
    }
    // Redirect to dashboard after login
    if (state?.auth?.isAuthenticated && !state?.auth?.loading) {
      console.log("✅ Redirecting to dashboard")
      window.location.replace("/tabs/dashboard.html")
    }
  }, [state?.auth?.isAuthenticated, state?.auth?.loading, state?.auth?.error])

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password required")
      return
    }
    setLoading(true)
    setError("")
    chrome.runtime.sendMessage({
      type: "LOGIN_REQUEST",
      payload: { email, password }
    }, (response) => {
      setLoading(false)
      if (response?.error) {
        console.log("🔴 Login error from background:", response.error)
        setError(response.error)
      } else {
        console.log("🟢 Login response from background:", response)
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <input
          className="w-full p-2 mb-4 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 mb-4 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="mt-4 text-center">
          <a href="/tabs/register.html" className="text-blue-600 hover:underline">Register</a>
        </div>
        <div className="mt-2 text-center">
          <a href="/tabs/reset-password.html" className="text-blue-600 hover:underline">Forgot Password?</a>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <LoginPageContent />
}