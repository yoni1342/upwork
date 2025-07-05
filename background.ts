import { store } from "./store"
import { setProfile, sendProfileToSupabase } from "./Slice/profileSlice"

// Handle extension icon click to open sidepanel
if (typeof chrome !== 'undefined' && chrome.action) {
  chrome.action.onClicked.addListener((tab) => {
    // Open the sidepanel when extension icon is clicked
    if (chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel.open({ windowId: tab.windowId })
    }
  })
}

// Listen for messages from content scripts
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SCRAPED_PROFILE' && message.payload) {
      console.log("Background received profile:", message.payload)
      // Dispatch Redux actions
      store.dispatch(setProfile(message.payload))
      store.dispatch(sendProfileToSupabase(message.payload))
        .then((result) => {
          console.log("Supabase insert result:", result)
        })
        .catch((err) => {
          console.error("Supabase insert error:", err)
        })
      sendResponse({ status: 'Profile received and processing started.' })
    }
    // Handle Redux state requests from UI
    if (message.type === 'REDUX_GET_STATE') {
      sendResponse({ state: store.getState() })
      return true
    }
    // Handle Redux action dispatch from UI (for simple actions only)
    if (message.type === 'REDUX_DISPATCH_ACTION') {
      store.dispatch(message.action)
      chrome.runtime.sendMessage({ type: 'REDUX_STATE_UPDATED', state: store.getState() })
      sendResponse({ status: 'Action dispatched' })
      return true
    }
    // Handle login request from UI
    if (message.type === 'LOGIN_REQUEST') {
      const { email, password } = message.payload
      store.dispatch(require('./Slice/authSlice').signInWithEmail({ email, password }))
        .then(() => {
          chrome.runtime.sendMessage({ type: 'REDUX_STATE_UPDATED', state: store.getState() })
          sendResponse({ status: 'Login attempted' })
        })
      return true // async
    }
    // Handle registration request from UI
    if (message.type === 'REGISTER_REQUEST') {
      const { email, password } = message.payload
      store.dispatch(require('./Slice/authSlice').signUpWithEmail({ email, password }))
        .then(() => {
          chrome.runtime.sendMessage({ type: 'REDUX_STATE_UPDATED', state: store.getState() })
          sendResponse({ status: 'Registration attempted' })
        })
      return true // async
    }
    // Handle password reset request from UI
    if (message.type === 'RESET_PASSWORD_REQUEST') {
      const { email } = message.payload
      store.dispatch(require('./Slice/authSlice').sendResetEmail(email))
        .then(() => {
          chrome.runtime.sendMessage({ type: 'REDUX_STATE_UPDATED', state: store.getState() })
          sendResponse({ status: 'Reset attempted' })
        })
      return true // async
    }
    // Handle sign out request from UI
    if (message.type === 'SIGNOUT_REQUEST') {
      store.dispatch(require('./Slice/authSlice').signOutUser())
        .then(() => {
          chrome.runtime.sendMessage({ type: 'REDUX_STATE_UPDATED', state: store.getState() })
          sendResponse({ status: 'Sign out attempted' })
        })
      return true // async
    }
    // Return true to indicate async response if needed
    return false
  })
}
