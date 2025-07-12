import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from "redux"
import profileReducer from "./Slice/profileSlice"
import authReducer from "./Slice/authSlice"
import sidepanelReducer from "./Slice/sidepanelSlice"
import coverLetterReducer from "./Slice/coverLetterSlice"

const rootReducer = combineReducers({
  profile: profileReducer,
  auth: authReducer,
  sidepanel: sidepanelReducer,
  coverLetter: coverLetterReducer,
})

export const store = configureStore({
  reducer: rootReducer,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
