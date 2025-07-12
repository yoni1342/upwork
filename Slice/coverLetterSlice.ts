import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Payload for the thunk - updated to match the expected structure
interface GenerateCoverLetterPayload {
  jobDetailsHtml: string
  url: string
  userId: string
  timestamp: string
  profile: {
    name: string
    role: string
    location: string
    hourly_rate: number
    about: string
    image: string
    upwork_user_id: string
    user_id: string
  }
  userProfile: {
    certifications: string[]
    experience: Array<{
      company: string
      description: string
    }>
  }
  skills: string[]
  workHistory: Array<{
    project_title: string
    rating: number
    feedback: string
  }>
}

// Async thunk to send payload to n8n Webhook
export const generateCoverLetter = createAsyncThunk<
  { coverLetter: string },
  GenerateCoverLetterPayload,
  { rejectValue: string }
>(
  "coverLetter/generate",
  async (payload, { rejectWithValue }) => {
    try {
      console.log('🚀 [coverLetterSlice] Starting cover letter generation...')
      console.log('📤 [coverLetterSlice] Payload being sent to n8n:', JSON.stringify(payload, null, 2))
      
      const response = await fetch(
        "https://n8n.tebita.com/webhook/generate-cover-letter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(payload)
        }
      );
      
      console.log('📡 [coverLetterSlice] Response status:', response.status)
      console.log('📡 [coverLetterSlice] Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [coverLetterSlice] HTTP Error:', response.status, errorText)
        throw new Error(`Server returned status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📥 [coverLetterSlice] Raw response from n8n:', JSON.stringify(data, null, 2))

      // Handle array response with output property (new format)
      if (Array.isArray(data) && data.length > 0 && typeof data[0].output === "string") {
        console.log('✅ [coverLetterSlice] Successfully extracted cover letter from array format')
        return { coverLetter: data[0].output };
      }

      // Handle object response with coverLetter property (old format)
      if (typeof data.coverLetter === "string") {
        console.log('✅ [coverLetterSlice] Successfully extracted cover letter from object format')
        return { coverLetter: data.coverLetter };
      }

      // Handle direct string response
      if (typeof data === "string") {
        console.log('✅ [coverLetterSlice] Successfully extracted cover letter from string format')
        return { coverLetter: data };
      }

      console.error('❌ [coverLetterSlice] Invalid response format:', data)
      throw new Error("Invalid response format: missing `output` in array, `coverLetter` in object, or direct string");
    } catch (err: unknown) {
      console.error('💥 [coverLetterSlice] Error in generateCoverLetter:', err)
      let message = "Unknown error";
      if (typeof err === "object" && err !== null && "message" in err) {
        const errorWithMessage = err as { message: string };
        if (typeof errorWithMessage.message === "string") {
          message = errorWithMessage.message;
        }
      }
      return rejectWithValue(message);
    }
  }
);

// State shape
interface CoverLetterState {
  loading: boolean
  error: string | null
  coverLetter: string | null
}

const initialState: CoverLetterState = {
  loading: false,
  error: null,
  coverLetter: null
}

const coverLetterSlice = createSlice({
  name: "coverLetter",
  initialState,
  reducers: {
    clearCoverLetter(state) {
      console.log('🧹 [coverLetterSlice] Clearing cover letter state')
      state.coverLetter = null
      state.error = null
      state.loading = false
    },
    setCoverLetter(state, action) {
      console.log('📝 [coverLetterSlice] Setting cover letter:', action.payload)
      state.coverLetter = action.payload
      state.error = null
      state.loading = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateCoverLetter.pending, (state) => {
        console.log('⏳ [coverLetterSlice] Cover letter generation pending...')
        state.loading = true
        state.error = null
        state.coverLetter = null
      })
      .addCase(generateCoverLetter.fulfilled, (state, action) => {
        console.log('✅ [coverLetterSlice] Cover letter generation fulfilled:', action.payload.coverLetter)
        state.loading = false
        state.error = null
        state.coverLetter = action.payload.coverLetter
      })
      .addCase(generateCoverLetter.rejected, (state, action) => {
        console.error('❌ [coverLetterSlice] Cover letter generation rejected:', action.payload)
        state.loading = false
        state.error = action.payload || "Failed to generate cover letter"
        state.coverLetter = null
      })
  }
})

export const { clearCoverLetter, setCoverLetter } = coverLetterSlice.actions
export default coverLetterSlice.reducer
