import React, { useState, useEffect, useCallback } from "react"
import "../style.css"

function RegisterPageContent() {
  const [state, setState] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
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
    // Hide sidepanel when on register page
    chrome.runtime.sendMessage({ type: "REDUX_DISPATCH_ACTION", action: { type: "sidepanel/hideSidepanel" } })
    // Check if user is already authenticated
    chrome.runtime.sendMessage({ type: "REDUX_DISPATCH_ACTION", action: { type: "auth/checkCurrentUser" } })
  }, [])

  useEffect(() => {
    if (state?.auth?.isAuthenticated) {
      window.location.href = "/tabs/dashboard.html"
    }
  }, [state?.auth?.isAuthenticated])

  const handleRegister = async () => {
    setError("")
    if (!email || !password || !confirmPassword) {
      setError("All fields are required.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setLoading(true)
    chrome.runtime.sendMessage({
      type: "REGISTER_REQUEST",
      payload: { email, password }
    }, () => setLoading(false))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
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
        <input
          className="w-full p-2 mb-4 border rounded"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
        <button
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        <div className="mt-4 text-center">
          <a href="/tabs/login.html" className="text-blue-600 hover:underline">Login</a>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return <RegisterPageContent />
}