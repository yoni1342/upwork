import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "../store"
import { clearCoverLetter, setCoverLetter } from "../Slice/coverLetterSlice"

interface CoverLetterModalProps {
  onClose: () => void
}

const CoverLetterModal: React.FC<CoverLetterModalProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error, coverLetter } = useSelector((state: RootState) => state.coverLetter)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    console.log('🎯 [coverLetterModal] Modal opened, starting data collection...')
    setFetching(true)
    
    // 1. Get job details from content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id
      if (!tabId) {
        console.error('❌ [coverLetterModal] No active tab found')
        setFetching(false)
        return
      }
      
      console.log('📋 [coverLetterModal] Requesting job details from content script...')
      chrome.tabs.sendMessage(tabId, { type: "SCRAPE_JOB_DETAILS" }, (response) => {
        if (!response?.details) {
          console.error('❌ [coverLetterModal] No job details received from content script')
          setFetching(false)
          return
        }
        
        const jobDetails = response.details
        console.log('📋 [coverLetterModal] Job details received:', jobDetails)
        
        // 2. Get user profile from background Redux
        console.log('👤 [coverLetterModal] Requesting user profile from background...')
        chrome.runtime.sendMessage({ type: "REDUX_GET_STATE" }, (reduxResponse) => {
          const state = reduxResponse?.state
          console.log('🏪 [coverLetterModal] Redux state received:', state)
          
          const userProfile = state?.profile?.fetchedProfile || state?.profile?.profile
          const userId = state?.auth?.user?.id || ""
          
          if (!userProfile || !userId) {
            console.error('❌ [coverLetterModal] Missing user profile or userId:', { userProfile, userId })
            setFetching(false)
            return
          }
          
          // 3. Structure the payload according to the expected format
          const payload = {
            jobDetailsHtml: jobDetails.jobDetailsHtml,
            url: jobDetails.url,
            userId,
            timestamp: jobDetails.timestamp,
            profile: {
              name: userProfile.name || "Unknown",
              role: userProfile.role || "Developer",
              location: userProfile.location || "Unknown",
              hourly_rate: userProfile.hourly_rate || 0,
              about: userProfile.about || "",
              image: userProfile.image || "",
              upwork_user_id: userProfile.upwork_user_id || "",
              user_id: userProfile.user_id || userId
            },
            userProfile: {
              certifications: userProfile.certifications || [],
              experience: userProfile.experience || []
            },
            skills: userProfile.skills || [],
            workHistory: userProfile.workHistory || []
          }
          
          console.log('📦 [coverLetterModal] Structured payload:', JSON.stringify(payload, null, 2))
          
          // 4. Send to background to generate cover letter
          console.log('🚀 [coverLetterModal] Sending GENERATE_COVER_LETTER to background...')
          chrome.runtime.sendMessage({
            type: "GENERATE_COVER_LETTER",
            payload
          }, (response) => {
            console.log('📡 [coverLetterModal] Background response:', response)
            setFetching(false)
          })
        })
      })
    })
    
    return () => {
      console.log('🧹 [coverLetterModal] Modal closing, clearing cover letter state')
      dispatch(clearCoverLetter())
    }
  }, [dispatch])

  // Listen for COVER_LETTER_GENERATED from background
  useEffect(() => {
    function handleMessage(message) {
      console.log('📨 [coverLetterModal] Received message:', message)
      if (message.type === "COVER_LETTER_GENERATED" && message.coverLetter) {
        console.log('✅ [coverLetterModal] Cover letter received from background:', message.coverLetter)
        dispatch(setCoverLetter(message.coverLetter))
      }
    }
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(handleMessage)
      return () => chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [dispatch])

  const handleCopy = () => {
    if (coverLetter) {
      console.log('📋 [coverLetterModal] Copying cover letter to clipboard')
      navigator.clipboard.writeText(coverLetter)
      // TODO: show notification
    }
  }

  const handleInsert = () => {
    if (coverLetter) {
      console.log('📝 [coverLetterModal] Attempting to insert cover letter into textarea')
      // Try to find the cover letter textarea and insert
      const textarea = document.querySelector('.air3-textarea.inner-textarea') as HTMLTextAreaElement | null
      if (textarea) {
        textarea.value = coverLetter
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
        console.log('✅ [coverLetterModal] Cover letter inserted into textarea')
        // TODO: show notification
        onClose()
      } else {
        console.warn('⚠️ [coverLetterModal] Textarea not found for insertion')
      }
    }
  }

  return (
    <div className="cover-letter-modal-overlay">
      <div className="cover-letter-modal">
        <button className="close-btn" onClick={onClose}>&times;</button>
        {(loading || fetching) && (
          <div className="loading-container">
            <div className="spinner" />
            <p>Generating your cover letter...</p>
          </div>
        )}
        {error && !fetching && (
          <div className="error-container">
            <p>{error}</p>
          </div>
        )}
        {coverLetter && !loading && !fetching && !error && (
          <div className="cover-letter-content">
            <pre className="cover-letter-text">{coverLetter}</pre>
            <button onClick={handleCopy}>Copy to Clipboard</button>
            <button onClick={handleInsert}>Insert into Application</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CoverLetterModal
