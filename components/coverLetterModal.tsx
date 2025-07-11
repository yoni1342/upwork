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
    setFetching(true)
    // 1. Get job details from content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id
      if (!tabId) return setFetching(false)
      chrome.tabs.sendMessage(tabId, { type: "SCRAPE_JOB_DETAILS" }, (response) => {
        if (!response?.details) {
          setFetching(false)
          return
        }
        const jobDetails = response.details
        // 2. Get user profile from background Redux
        chrome.runtime.sendMessage({ type: "REDUX_GET_STATE" }, (reduxResponse) => {
          const state = reduxResponse?.state
          const userProfile = state?.profile?.fetchedProfile || state?.profile?.profile
          const userId = state?.auth?.user?.id || ""
          if (!userProfile || !userId) {
            setFetching(false)
            return
          }
          // 3. Send both to background to generate cover letter
          console.log('Sending to background:', {
            jobDetailsHtml: jobDetails.jobDetailsHtml,
            url: jobDetails.url,
            userId,
            timestamp: jobDetails.timestamp,
            userProfile
          })
          chrome.runtime.sendMessage({
            type: "LOG_TO_BACKGROUND",
            payload: {
              jobDetailsHtml: jobDetails.jobDetailsHtml,
              url: jobDetails.url,
              userId,
              timestamp: jobDetails.timestamp,
              userProfile
            }
          })
          chrome.runtime.sendMessage({
            type: "GENERATE_COVER_LETTER",
            payload: {
              jobDetailsHtml: jobDetails.jobDetailsHtml,
              url: jobDetails.url,
              userId,
              timestamp: jobDetails.timestamp,
              userProfile
            }
          })
          setFetching(false)
        })
      })
    })
    return () => {
      dispatch(clearCoverLetter())
    }
  }, [dispatch])

  // Listen for COVER_LETTER_GENERATED from background
  useEffect(() => {
    function handleMessage(message) {
      if (message.type === "COVER_LETTER_GENERATED" && message.coverLetter) {
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
      navigator.clipboard.writeText(coverLetter)
      // TODO: show notification
    }
  }

  const handleInsert = () => {
    if (coverLetter) {
      // Try to find the cover letter textarea and insert
      const textarea = document.querySelector('.air3-textarea.inner-textarea') as HTMLTextAreaElement | null
      if (textarea) {
        textarea.value = coverLetter
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
        // TODO: show notification
        onClose()
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
