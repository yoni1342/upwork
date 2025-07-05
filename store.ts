import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from "redux"
import profileReducer from "./Slice/profileSlice"
import authReducer from "./Slice/authSlice"

const rootReducer = combineReducers({
  profile: profileReducer,
  auth: authReducer,
})

export const store = configureStore({
  reducer: rootReducer,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
