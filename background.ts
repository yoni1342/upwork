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
      console.log("LOGIN_REQUEST received", { email })
      store.dispatch(require('./Slice/authSlice').signInWithEmail({ email, password }))
        .then((result: any) => {
          console.log("signInWithEmail result:", result)
          store.dispatch(require('./Slice/authSlice').checkCurrentUser())
            .then((checkResult: any) => {
              console.log("checkCurrentUser result:", checkResult)
              setTimeout(() => {
                const state = store.getState()
                console.log("Redux state after login:", state)
                chrome.runtime.sendMessage({ type: 'REDUX_STATE_UPDATED', state })
                sendResponse({ status: 'Login attempted', state })
              }, 100)
            })
            .catch((err: any) => {
              console.error("checkCurrentUser error:", err)
              sendResponse({ status: 'Login attempted', error: err })
            })
        })
        .catch((err: any) => {
          console.error("signInWithEmail error:", err)
          sendResponse({ status: 'Login error', error: err })
        })
      return true // async response
    }

    // Handle registration request from UI
    if (message.type === 'REGISTER_REQUEST') {
      const { email, password } = message.payload
      store.dispatch(require('./Slice/authSlice').signUpWithEmail({ email, password }))
        .then(() => {
          setTimeout(() => {
            chrome.runtime.sendMessage({ type: 'REDUX_STATE_UPDATED', state: store.getState() })
            sendResponse({ status: 'Registration attempted' })
          }, 100)
        })
      return true // async
    }
    // Handle password reset request from UI
    if (message.type === 'RESET_PASSWORD_REQUEST') {
      const { email } = message.payload
      store.dispatch(require('./Slice/authSlice').sendResetEmail(email))
        .then(() => {
          setTimeout(() => {
            chrome.runtime.sendMessage({ type: 'REDUX_STATE_UPDATED', state: store.getState() })
            sendResponse({ status: 'Reset attempted' })
          }, 100)
        })
      return true // async
    }
    // Handle sign out request from UI
    if (message.type === 'SIGNOUT_REQUEST') {
      store.dispatch(require('./Slice/authSlice').signOutUser())
        .then(() => {
          setTimeout(() => {
            chrome.runtime.sendMessage({ type: 'REDUX_STATE_UPDATED', state: store.getState() })
            sendResponse({ status: 'Sign out attempted' })
          }, 100)
        })
      return true // async
    }
    // Relay SHOW_LANDING_PAGE to all extension views and open side panel
    if (message.type === 'SHOW_LANDING_PAGE') {
      if (chrome.sidePanel && chrome.sidePanel.open && sender && sender.tab && sender.tab.windowId) {
        chrome.sidePanel.open({ windowId: sender.tab.windowId }).then(() => {
          chrome.runtime.sendMessage({ type: 'SHOW_LANDING_PAGE' })
        })
      } else {
        chrome.runtime.sendMessage({ type: 'SHOW_LANDING_PAGE' })
      }
      return false
    }
    // Relay SHOW_SYNCH_PROFILE to all extension views and open side panel
    if (message.type === 'SHOW_SYNCH_PROFILE') {
      if (chrome.sidePanel && chrome.sidePanel.open && sender && sender.tab && sender.tab.windowId) {
        chrome.sidePanel.open({ windowId: sender.tab.windowId }).then(() => {
          setTimeout(() => {
            chrome.runtime.sendMessage({ type: 'SHOW_SYNCH_PROFILE' })
          }, 300)
        })
      } else {
        chrome.runtime.sendMessage({ type: 'SHOW_SYNCH_PROFILE' })
      }
      return false
    }
    // Relay SHOW_SETTING to all extension views and open side panel
    if (message.type === 'SHOW_SETTING') {
      if (chrome.sidePanel && chrome.sidePanel.open && sender && sender.tab && sender.tab.windowId) {
        chrome.sidePanel.open({ windowId: sender.tab.windowId }).then(() => {
          setTimeout(() => {
            chrome.runtime.sendMessage({ type: 'SHOW_SETTING' })
          }, 300)
        })
      } else {
        chrome.runtime.sendMessage({ type: 'SHOW_SETTING' })
      }
      return false
    }
    // Return true to indicate async response if needed
    return false
  })
}
