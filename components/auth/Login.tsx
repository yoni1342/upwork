import React, { useState } from "react"
import { signInWithEmail } from "../../supabaseAuth"

export default function Login({ onSwitch, onLoggedIn }: any) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password required")
      return
    }

    setLoading(true)
    const { data, error } = await signInWithEmail(email, password)
    setLoading(false)

    if (error) setError(error.message)
    else onLoggedIn(data.user)
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-md p-8 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />
      {error && <p className="text-red-600 text-sm mb-2 text-center">{error}</p>}
      <button
        onClick={handleLogin}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-60 mb-2"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      <button
        onClick={() => onSwitch("register")}
        className="w-full py-2 text-blue-600 hover:underline text-sm mb-1"
        type="button"
      >
        No account? Register
      </button>
      <button
        onClick={() => onSwitch("reset")}
        className="w-full py-2 text-gray-500 hover:text-blue-500 hover:underline text-xs"
        type="button"
      >
        Forgot password?
      </button>
    </div>
  )
}
