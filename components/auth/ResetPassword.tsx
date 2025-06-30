import React, { useState } from "react"
import { sendResetEmail } from "../../supabaseAuth"


export default function ResetPassword({ onSwitch }: any) {
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

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-md p-8 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-center text-yellow-700 mb-4">Reset Password</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
      />
      {error && <p className="text-red-600 text-sm mb-2 text-center">{error}</p>}
      {message && <p className="text-green-600 text-sm mb-2 text-center">{message}</p>}
      <button
        onClick={handleReset}
        className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition disabled:opacity-60 mb-2"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
      <button
        onClick={() => onSwitch("login")}
        className="w-full py-2 text-yellow-700 hover:underline text-sm"
        type="button"
      >
        Back to Login
      </button>
    </div>
  )
}
