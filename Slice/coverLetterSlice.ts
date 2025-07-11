import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Payload for the thunk
interface GenerateCoverLetterPayload {
  jobDetailsHtml: string
  url: string
  userId: string
  timestamp: string
  userProfile: unknown // Accept any shape for now
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
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();

      // Handle array response with output property
      if (Array.isArray(data) && data.length > 0 && typeof data[0].output === "string") {
        return { coverLetter: data[0].output };
      }

      // Optionally handle old format
      if (typeof data.coverLetter === "string") {
        return { coverLetter: data.coverLetter };
      }

      throw new Error("Invalid response format: missing `output` in array or `coverLetter` in object");
    } catch (err: unknown) {
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
      state.coverLetter = null
      state.error = null
      state.loading = false
    },
    setCoverLetter(state, action) {
      state.coverLetter = action.payload
      state.error = null
      state.loading = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateCoverLetter.pending, (state) => {
        state.loading = true
        state.error = null
        state.coverLetter = null
      })
      .addCase(generateCoverLetter.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.coverLetter = action.payload.coverLetter // ✅ correct key
      })
      .addCase(generateCoverLetter.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to generate cover letter"
        state.coverLetter = null
      })
  }
})

export const { clearCoverLetter, setCoverLetter } = coverLetterSlice.actions
export default coverLetterSlice.reducer
