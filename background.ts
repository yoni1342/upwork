import { store } from "./store"
import { setProfile, sendProfileToSupabase, fetchProfileFromSupabase } from "./Slice/profileSlice"
import { signInWithEmail, checkCurrentUser, signUpWithEmail, sendResetEmail, signOutUser } from "./Slice/authSlice"
import { generateCoverLetter } from "./Slice/coverLetterSlice"

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
        .then((result: unknown) => {
          console.log("Supabase insert result:", result)
        })
        .catch((err: unknown) => {
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
      store.dispatch(signInWithEmail({ email, password }))
        .then((result: unknown) => {
          console.log("signInWithEmail result:", result)
          store.dispatch(checkCurrentUser())
            .then((checkResult: unknown) => {
              console.log("checkCurrentUser result:", checkResult)
              setTimeout(() => {
                const state = store.getState()
                console.log("Redux state after login:", state)
                chrome.runtime.sendMessage({ type: 'REDUX_STATE_UPDATED', state })
                sendResponse({ status: 'Login attempted', state })
              }, 100)
            })
            .catch((err: unknown) => {
              console.error("checkCurrentUser error:", err)
              sendResponse({ status: 'Login attempted', error: err })
            })
        })
        .catch((err: unknown) => {
          console.error("signInWithEmail error:", err)
          sendResponse({ status: 'Login error', error: err })
        })
      return true // async response
    }

    // Handle registration request from UI
    if (message.type === 'REGISTER_REQUEST') {
      const { email, password } = message.payload
      store.dispatch(signUpWithEmail({ email, password }))
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
      store.dispatch(sendResetEmail(email))
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
      store.dispatch(signOutUser())
        .then(() => {
          setTimeout(() => {
            chrome.runtime.sendMessage({ type: 'REDUX_STATE_UPDATED', state: store.getState() })
            sendResponse({ status: 'Sign out attempted' })
          }, 100)
        })
      return true // async
    }
    // Handle GENERATE_COVER_LETTER from UI/modal
    if (message.type === 'GENERATE_COVER_LETTER') {
      console.log('🎯 [background] GENERATE_COVER_LETTER received:', message.payload)
      const { jobDetailsHtml, url, userId, timestamp, profile, userProfile, skills, workHistory } = message.payload
      
      // Console log the structured payload
      console.log('📦 [background] Structured payload for n8n:', {
        jobDetailsHtml: jobDetailsHtml?.substring(0, 100) + '...',
        url,
        userId,
        timestamp,
        profile,
        userProfile,
        skills,
        workHistory
      })
      
      store.dispatch(generateCoverLetter({
        jobDetailsHtml,
        url,
        userId,
        timestamp,
        profile,
        userProfile,
        skills,
        workHistory
      }))
        .then((result) => {
          console.log('📡 [background] generateCoverLetter result:', result)
          
          if (result && result.type && result.type.endsWith('/fulfilled')) {
            if (result.payload && typeof result.payload === 'object' && 'coverLetter' in result.payload) {
              console.log('✅ [background] n8n success - cover letter generated:', result.payload.coverLetter)
              
              // Send the cover letter back to the modal
              chrome.runtime.sendMessage({ 
                type: "COVER_LETTER_GENERATED", 
                coverLetter: result.payload.coverLetter 
              })
              
              sendResponse({ 
                status: 'Cover letter generated successfully',
                coverLetter: result.payload.coverLetter
              })
            } else {
              console.log('⚠️ [background] n8n success but unexpected payload format:', result.payload)
              sendResponse({ 
                status: 'Cover letter generated but with unexpected format',
                payload: result.payload
              })
            }
          } else if (result && result.type && result.type.endsWith('/rejected')) {
            console.error('❌ [background] n8n error:', result.payload)
            sendResponse({ 
              status: 'Cover letter generation failed',
              error: result.payload
            })
          } else {
            console.log('❓ [background] n8n unknown result:', result)
            sendResponse({ 
              status: 'Unknown result from cover letter generation',
              result
            })
          }
        })
        .catch((err) => {
          console.error('💥 [background] n8n dispatch error:', err)
          sendResponse({ 
            status: 'Cover letter generation error',
            error: err
          })
        })
      return true
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
    // Handle GET_CURRENT_USER request from content script
    if (message.type === 'GET_CURRENT_USER') {
      const state = store.getState()
      sendResponse({ user: state.auth?.user })
      return true
    }
    // Handle FETCH_PROFILE request from UI
    if (message.type === 'FETCH_PROFILE') {
      const { user_id } = message.payload
      store.dispatch(fetchProfileFromSupabase(user_id))
        .then((result: unknown) => {
          // @ts-expect-error result type is unknown and may not have payload/error properties
          sendResponse({ status: 'Profile fetched', data: result.payload, error: result.error })
        })
        .catch((err: unknown) => {
          sendResponse({ status: 'Profile fetch error', error: err })
        })
      return true // async
    }
    // Relay OPEN_COVER_LETTER_MODAL to all extension views and open side panel
    if (message.type === 'OPEN_COVER_LETTER_MODAL') {
      if (chrome.sidePanel && chrome.sidePanel.open && sender && sender.tab && sender.tab.windowId) {
        chrome.sidePanel.open({ windowId: sender.tab.windowId }).then(() => {
          setTimeout(() => {
            chrome.runtime.sendMessage({ type: 'OPEN_COVER_LETTER_MODAL' })
          }, 300)
        })
      } else {
        chrome.runtime.sendMessage({ type: 'OPEN_COVER_LETTER_MODAL' })
      }
      sendResponse({ status: 'relayed' });
      return false;
    }

    // Return true to indicate async response if needed
    return false
  })
}
