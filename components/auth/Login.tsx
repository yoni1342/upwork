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
    <div className="auth-form">
      <h2>Login</h2>
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
      {error && <p className="error">{error}</p>}
      <button
        onClick={handleLogin}
        className="btn-primary"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      <button onClick={() => onSwitch("register")} className="btn-link">
        No account? Register
      </button>
      <button onClick={() => onSwitch("reset")} className="btn-link btn-link-secondary">
        Forgot password?
      </button>
    </div>
  )
}
