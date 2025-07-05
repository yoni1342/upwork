import React, { useState, useEffect, useCallback } from "react"
import "../style.css"

function ResetPasswordPageContent() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [state, setState] = useState<any>(null)

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
    // Hide sidepanel when on reset password page
    chrome.runtime.sendMessage({ type: "REDUX_DISPATCH_ACTION", action: { type: "sidepanel/hideSidepanel" } })
  }, [])

  const handleReset = async () => {
    setError("")
    setMessage("")
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email.")
      return
    }
    setLoading(true)
    chrome.runtime.sendMessage({
      type: "RESET_PASSWORD_REQUEST",
      payload: { email }
    }, () => {
      setLoading(false)
      setMessage("Password reset link sent! Check your email.")
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {message && <div className="text-green-600 mb-4">{message}</div>}
        <input
          className="w-full p-2 mb-4 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          onClick={handleReset}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        <div className="mt-4 text-center">
          <a href="/tabs/login.html" className="text-blue-600 hover:underline">Back to Login</a>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return <ResetPasswordPageContent />
}