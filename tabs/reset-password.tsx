import React, { useState, useEffect } from "react"
import { Provider } from "react-redux"
import { useDispatch } from "react-redux"
import { sendResetEmail } from "../Slice/authSlice"
import { hideSidepanel } from "../Slice/authSlice"
import type { AppDispatch } from "../store"
import { store } from "../store"
import "../style.css"

function ResetPasswordPageContent() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    // Hide sidepanel when on reset password page
    dispatch(hideSidepanel())
  }, [dispatch])
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    setError("")
    setMessage("")

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email.")
      return
    }

    setLoading(true)
    const { error } = await sendResetEmail(email)
    setLoading(false)

    if (error) setError(error.message)
    else setMessage("Password reset link sent! Check your email.")
  }

  const navigateToLogin = () => {
    window.location.href = "/tabs/login.html"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <img src="/assets/icon.png" alt="Upwex Logo" className="h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-600 mt-2">Enter your email to receive a reset link</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
          
          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-600 text-sm text-center">{message}</p>
            </div>
          )}
          
          <button
            onClick={handleReset}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Sending reset link..." : "Send Reset Link"}
          </button>
          
          <div className="text-center">
            <button
              onClick={navigateToLogin}
              className="text-yellow-700 hover:text-yellow-800 hover:underline text-sm font-medium"
              type="button"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Provider store={store}>
      <ResetPasswordPageContent />
    </Provider>
  )
}