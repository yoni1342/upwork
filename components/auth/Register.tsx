import React, { useState } from "react"
import { signUpWithEmail } from "../../supabaseAuth"


export default function Register({ onSwitch, onLoggedIn }: any) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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
    const { data, error } = await signUpWithEmail(email, password)
    setLoading(false)

    if (error) setError(error.message)
    else onLoggedIn(data.user)
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-md p-8 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-center text-green-700 mb-4">Register</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
      />
      {error && <p className="text-red-600 text-sm mb-2 text-center">{error}</p>}
      <button
        onClick={handleRegister}
        className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-60 mb-2"
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>
      <button
        onClick={() => onSwitch("login")}
        className="w-full py-2 text-green-600 hover:underline text-sm"
        type="button"
      >
        Already have an account? Log in
      </button>
    </div>
  )
}
