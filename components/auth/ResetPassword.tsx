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
    <div className="auth-form">
      <h2>Reset Password</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <button
        onClick={handleReset}
        className="btn-warning"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
      <button onClick={() => onSwitch("login")} className="btn-link">
        Back to Login
      </button>
    </div>
  )
}
