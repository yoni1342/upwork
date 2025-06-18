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
    <div className="auth-form">
      <h2>Register</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button
        onClick={handleRegister}
        className="btn-success"
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>
      <button onClick={() => onSwitch("login")} className="btn-link">
        Already have an account? Log in
      </button>
    </div>
  )
}
