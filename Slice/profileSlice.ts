import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { supabase } from "../supabaseClient"

interface ProfilePayload {
  name: string | null
  location: string | null
  about: string | null
  hourlyRate: string | null
  role: string | null
  skills: string[] | null
  certifications: string[] | null
  workHistory: { projectTitle: string; rating: string; feedback: string }[] | null
  experience: { titleCompany: string; description: string }[] | null
  user_id?: string | null
  upworkUserId?: string | null
}

// Thunk to send profile data to Supabase
export const sendProfileToSupabase = createAsyncThunk(
  "profile/sendToSupabase",
  async (profile: ProfilePayload, { rejectWithValue }) => {
    try {
      // 1. Insert into Profile
      const { name, user_id, upworkUserId, location, about, hourlyRate, role, skills, certifications, workHistory, experience,image} = profile
      const { data: profileData, error: profileError } = await supabase
        .from("Profile")
        .insert([
          {
            name,
            user_id,
            location,
            about,
            hourly_rate: hourlyRate ? parseFloat(hourlyRate.replace(/[^\d.]/g, "")) : null,
            role,
            upwork_user_id: upworkUserId,
            image
          },
        ])
        .select()
        .single()
      console.log("Profile insert:", profileData, profileError)
      if (profileError) throw profileError
      const profile_id = profileData.id

      // 2. Insert Skills
      if (skills?.length) {
        const skillRows = skills.map((name) => ({ profile_id, name }))
        const { error: skillError } = await supabase.from("Skill").insert(skillRows)
        if (skillError) throw skillError
      }

      // 3. Insert Certifications
      if (certifications?.length) {
        const certRows = certifications.map((name) => ({ profile_id, name }))
        const { error: certError } = await supabase.from("Certification").insert(certRows)
        if (certError) throw certError
      }

      // 4. Insert Experience
      if (experience?.length) {
        const expRows = experience.map((exp) => ({
          profile_id,
          company: exp.titleCompany,
          description: exp.description,
        }))
        const { error: expError } = await supabase.from("Experience").insert(expRows)
        if (expError) throw expError
      }

      // 5. Insert Work History
      if (workHistory?.length) {
        const workRows = workHistory.map((w) => ({
          profile_id,
          project_title: w.projectTitle,
          rating: w.rating ? parseFloat(w.rating) : null,
          feedback: w.feedback,
        }))
        const { error: workError } = await supabase.from("workHistory").insert(workRows)
        if (workError) throw workError
      }

      return profileData
    } catch (err) {
      return rejectWithValue((err as Error).message || err)
    }
  }
)

// Thunk to fetch profile and related data from Supabase
export const fetchProfileFromSupabase = createAsyncThunk(
  "profile/fetchFromSupabase",
  async (user_id: string, { rejectWithValue }) => {
    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from("Profile")
        .select("*")
        .eq("user_id", user_id)
        .single()
      if (profileError) throw profileError
      const profile_id = profileData.id

      // 2. Fetch Skills
      const { data: skills, error: skillError } = await supabase
        .from("Skill")
        .select("name")
        .eq("profile_id", profile_id)
      if (skillError) throw skillError

      // 3. Fetch Certifications
      const { data: certifications, error: certError } = await supabase
        .from("Certification")
        .select("name")
        .eq("profile_id", profile_id)
      if (certError) throw certError

      // 4. Fetch Experience
      const { data: experience, error: expError } = await supabase
        .from("Experience")
        .select("company, description")
        .eq("profile_id", profile_id)
      if (expError) throw expError

      // 5. Fetch Work History
      const { data: workHistory, error: workError } = await supabase
        .from("workHistory")
        .select("project_title, rating, feedback")
        .eq("profile_id", profile_id)
      if (workError) throw workError

      return {
        profile: profileData,
        skills: skills?.map((s) => s.name) || [],
        certifications: certifications?.map((c) => c.name) || [],
        experience: experience || [],
        workHistory: workHistory || [],
      }
    } catch (err) {
      return rejectWithValue((err as Error).message || err)
    }
  }
)

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    profile: null,
    loading: false,
    error: null,
    supabaseProfile: null,
    fetchedProfile: null,
  },
  reducers: {
    setProfile(state, action) {
      state.profile = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendProfileToSupabase.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendProfileToSupabase.fulfilled, (state, action) => {
        state.loading = false
        state.supabaseProfile = action.payload
        // Optionally, keep the original profile data as well
        // state.profile = action.meta.arg // <-- This is the original payload
      })
      .addCase(sendProfileToSupabase.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Add extra reducers for fetchProfileFromSupabase
      .addCase(fetchProfileFromSupabase.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfileFromSupabase.fulfilled, (state, action) => {
        state.loading = false
        // Store the full profile object (with all related data)
        state.fetchedProfile = action.payload
        state.profile = action.payload // Keep this in sync for easy access
      })
      .addCase(fetchProfileFromSupabase.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setProfile } = profileSlice.actions
export default profileSlice.reducer
