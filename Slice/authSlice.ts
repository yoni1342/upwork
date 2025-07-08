import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { supabase } from "../supabaseClient"

// Thunk to check current user
export const checkCurrentUser = createAsyncThunk(
  "auth/checkCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      return data.user
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue(String(error))
    }
  }
)

// Thunk to sign out
export const signOutUser = createAsyncThunk(
  "auth/signOutUser",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Remove token from chrome.storage.local
      await chrome.storage.local.remove("supabase_token")

      return null
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue(String(error))
    }
  }
)

// Thunk to sign in
export const signInWithEmail = createAsyncThunk(
  "auth/signInWithEmail",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        console.error("Supabase signInWithPassword error:", error)
        throw error
      }

      // ✅ Store token in chrome.storage.local for extension-wide access
      if (signInData?.session?.access_token) {
        await chrome.storage.local.set({ supabase_token: signInData.session.access_token })
        console.log("Stored access_token in chrome.storage.local")
      }

      // ✅ Return the signed-in user
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error("Supabase getUser error:", userError)
        throw userError
      }
      return userData.user
    } catch (error: unknown) {
      console.error("signInWithEmail thunk error:", error)
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue(String(error))
    }
  }
)

// Thunk to sign up
export const signUpWithEmail = createAsyncThunk(
  "auth/signUpWithEmail",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      return data.user
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue(String(error))
    }
  }
)

// Thunk to send reset email
export const sendResetEmail = createAsyncThunk(
  "auth/sendResetEmail",
  async (email: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:5173/reset"
      })
      if (error) throw error
      return data
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue(String(error))
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkCurrentUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = !!action.payload
      })
      .addCase(checkCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.user = null
        state.isAuthenticated = false
      })
      .addCase(signOutUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
        state.error = null
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(signInWithEmail.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = !!action.payload
        state.loading = false
        state.error = null
      })
      .addCase(signInWithEmail.rejected, (state, action) => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setUser } = authSlice.actions
export default authSlice.reducer