import React, { useState, useEffect } from "react"
import { Provider } from "react-redux"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { checkCurrentUser, hideSidepanel, signUpWithEmail } from "../Slice/authSlice"
import type { RootState, AppDispatch } from "../store"
import { store } from "../store"
import "../style.css"

function RegisterPageContent() {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Hide sidepanel when on register page
    dispatch(hideSidepanel())
    
    // Check if user is already authenticated
    dispatch(checkCurrentUser())
  }, [dispatch])

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      window.location.href = "/tabs/dashboard.html"
    }
  }, [isAuthenticated])

  const handleRegister = async () => {
    setError("")

    if (!email || !password || !confirmPassword) {
      setError("All fields are required.")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Invalid email address.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    const resultAction = await dispatch(signUpWithEmail({ email, password }) as any)
    setLoading(false)

    if (signUpWithEmail.rejected.match(resultAction)) {
      setError(typeof resultAction.payload === "string" ? resultAction.payload : "Registration failed")
    } else {
      // Check current user and redirect to dashboard
      await dispatch(checkCurrentUser())
      window.location.href = "/tabs/dashboard.html"
    }
  }

  const navigateToLogin = () => {
    window.location.href = "/tabs/login.html"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <img src="/assets/icon.png" alt="Upwex Logo" className="h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join Upwex and get started</p>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleRegister}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
          
          <div className="text-center">
            <button
              onClick={navigateToLogin}
              className="text-green-600 hover:text-green-700 hover:underline text-sm font-medium"
              type="button"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Provider store={store}>
      <RegisterPageContent />
    </Provider>
  )
}