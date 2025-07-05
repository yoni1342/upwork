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
    // Return true to indicate async response if needed
    return false
  })
}
