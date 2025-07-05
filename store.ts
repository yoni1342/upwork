import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from "redux"
import profileReducer from "./Slice/profileSlice"

const rootReducer = combineReducers({
  profile: profileReducer,
})

export const store = configureStore({
  reducer: rootReducer,
})
