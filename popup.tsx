import React, { useState, useEffect } from "react"
import Login from "./components/auth/Login"
import Register from "./components/auth/Register"
import ResetPassword from "./components/auth/ResetPassword"
import { getCurrentUser, signOut } from "./supabaseAuth"
import "./style.css"

export default function Popup() {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  if (user) {
    return (
      <div className="auth-form" style={{ textAlign: "center", minWidth: "350px", maxWidth: "420px", width: "100%" }}>
        <p style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>
          👋 Welcome, {user.email}
        </p>
        <button
          className="btn-warning"
          onClick={async () => {
            await signOut()
            setUser(null)
            setMode("login")
          }}
        >
          Log Out
        </button>
      </div>
    )
  }

  return (
    <div className="auth-form" style={{ minWidth: "350px", maxWidth: "420px", width: "100%" }}>
      {mode === "login" && (
        <Login onSwitch={setMode} onLoggedIn={setUser} />
      )}
      {mode === "register" && (
        <Register onSwitch={setMode} onLoggedIn={setUser} />
      )}
      {mode === "reset" && <ResetPassword onSwitch={setMode} />}
    </div>
  )
}
