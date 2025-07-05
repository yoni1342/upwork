import React, { useState, useEffect } from "react"
import { Provider } from "react-redux"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { hideSidepanel } from "../Slice/sidepanelSlice"
import { checkCurrentUser,  signInWithEmail } from "../Slice/authSlice"
import type { RootState, AppDispatch } from "../store"
import { store } from "../store"
import "../style.css"

function LoginPageContent() {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, loading: authLoading, error: authError } = useSelector((state: RootState) => state.auth)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Hide sidepanel when on login page
    dispatch(hideSidepanel())
    
    // Check if user is already authenticated
    dispatch(checkCurrentUser())
  }, [dispatch])

  useEffect(() => {
    // Redirect to dashboard if already authenticated and 
    if (isAuthenticated ) {
      window.location.replace("/tabs/dashboard.html")
    }
  }, [isAuthenticated])


  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password required")
      return
    }
    setLoading(true)
    setError("")
    const resultAction = await dispatch(signInWithEmail({ email, password }) as any)
    setLoading(false)
    if (signInWithEmail.rejected.match(resultAction)) {
      setError(typeof resultAction.payload === "string" ? resultAction.payload : "Login failed")
    } 
  }

  const navigateToRegister = () => {
    window.location.href = "/tabs/register.html"
  }

  const navigateToReset = () => {
    window.location.href = "/tabs/reset-password.html"
  }

 

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <img src="/assets/icon.png" alt="Upwex Logo" className="h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your Upwex account</p>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          
          <div className="text-center space-y-3">
            <button
              onClick={navigateToRegister}
              className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
              type="button"
            >
              Don't have an account? Sign up
            </button>
            <br />
            <button
              onClick={navigateToReset}
              className="text-gray-500 hover:text-blue-600 hover:underline text-sm"
              type="button"
            >
              Forgot your password?
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Provider store={store}>
      <LoginPageContent />
    </Provider>
  )
}