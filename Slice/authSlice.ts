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
    } catch (error: any) {
      return rejectWithValue(error.message || error)
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
      return null
    } catch (error: any) {
      return rejectWithValue(error.message || error)
    }
  }
)

// Thunk to sign in
export const signInWithEmail = createAsyncThunk(
  "auth/signInWithEmail",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      // Optionally, fetch user after sign in
      const { data: userData } = await supabase.auth.getUser()
      return userData.user
    } catch (error: any) {
      return rejectWithValue(error.message || error)
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
    } catch (error: any) {
      return rejectWithValue(error.message || error)
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
    } catch (error: any) {
      return rejectWithValue(error.message || error)
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
    showSidepanel: true, // Default to showing sidepanel
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    hideSidepanel: (state) => {
      state.showSidepanel = false
    },
    showSidepanel: (state) => {
      state.showSidepanel = true
    },
    toggleSidepanel: (state) => {
      state.showSidepanel = !state.showSidepanel
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
        // Hide sidepanel if user is authenticated
        if (action.payload) {
          state.showSidepanel = false
        }
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
        state.showSidepanel = true // Show sidepanel after sign out
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

export const { setUser, hideSidepanel, showSidepanel, toggleSidepanel } = authSlice.actions
export default authSlice.reducer