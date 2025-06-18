import { supabase } from "./supabaseClient"

export const signInWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password })
}

export const signUpWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password })
}

export const sendResetEmail = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:5173/reset" // Replace if needed
  })
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const getCurrentUser = async () => {
  const {
    data: { user }
  } = await supabase.auth.getUser()
  return user
}
