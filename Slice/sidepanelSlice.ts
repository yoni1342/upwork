import { createSlice } from "@reduxjs/toolkit"

const sidepanelSlice = createSlice({
  name: "sidepanel",
  initialState: {
    showSidepanel: true, // Default to showing sidepanel
  },
  reducers: {
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
})

export const { hideSidepanel, showSidepanel, toggleSidepanel } = sidepanelSlice.actions
export default sidepanelSlice.reducer 