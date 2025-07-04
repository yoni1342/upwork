import React, { useState,  } from "react"
import Login from "./components/auth/Login"
import Register from "./components/auth/Register"
import ResetPassword from "./components/auth/ResetPassword"
//import { getCurrentUser, signOut } from "./supabaseAuth"
import "./style.css"
import { Provider } from "react-redux"
import { store } from "./store"

export default function Popup() {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login")
  const [user, setUser] = useState<{ email: string } | null>(null)

  // useEffect(() => {
  //   getCurrentUser().then(setUser)
  // }, [])

  if (user) {
    return (
      <Provider store={store}>
        <div className="flex flex-col items-center justify-center min-w-[350px] max-w-[720px] w-full bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-2xl p-8">
          <p className="mb-6 text-lg font-semibold text-blue-900 flex items-center gap-2">
            <span className="text-2xl">👋</span> Welcome,{" "}
            <span className="font-bold">{user.email}</span>
          </p>
          <button
            className="w-full py-3 rounded-lg text-lg font-semibold cursor-pointer transition bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-lg"
            onClick={async () => {
              await signOut()
              setUser(null)
              setMode("login")
            }}
          >
            Log Out
          </button>
        </div>
      </Provider>
    )
  }

  return (
    <Provider store={store}>
      <div className="flex flex-col items-center justify-center min-w-[350px] max-w-[420px] w-full bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-2xl p-8">
        {mode === "login" && (
          <Login onSwitch={setMode} onLoggedIn={setUser} />
        )}
        {mode === "register" && (
          <Register onSwitch={setMode} onLoggedIn={setUser} />
        )}
        {mode === "reset" && <ResetPassword onSwitch={setMode} />}
      </div>
    </Provider>
  )
}
