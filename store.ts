import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from "redux"
import profileReducer from "./Slice/profileSlice"
import authReducer from "./Slice/authSlice"
import sidepanelReducer from "./Slice/sidepanelSlice"

const rootReducer = combineReducers({
  profile: profileReducer,
  auth: authReducer,
  sidepanel: sidepanelReducer,
})

export const store = configureStore({
  reducer: rootReducer,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
