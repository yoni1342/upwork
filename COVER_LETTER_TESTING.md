# Cover Letter Generation Testing Guide

## Overview
This document explains the updated cover letter generation system and how to test it.

## Changes Made

### 1. Updated Payload Structure
The payload sent to n8n now matches the expected format:

```typescript
{
  jobDetailsHtml: string,
  url: string,
  userId: string,
  timestamp: string,
  profile: {
    name: string,
    role: string,
    location: string,
    hourly_rate: number,
    about: string,
    image: string,
    upwork_user_id: string,
    user_id: string
  },
  userProfile: {
    certifications: string[],
    experience: Array<{company: string, description: string}>
  },
  skills: string[],
  workHistory: Array<{project_title: string, rating: number, feedback: string}>
}
```

### 2. Enhanced Response Handling
The system now handles multiple response formats from n8n:
- Array format: `[{output: "cover letter text"}]`
- Object format: `{coverLetter: "cover letter text"}`
- String format: `"cover letter text"`

### 3. Comprehensive Logging
Added detailed console logging throughout the entire flow:
- Content script scraping
- Modal data collection
- Background processing
- n8n API calls
- Response handling

## Testing Steps

### 1. Load the Extension
1. Open Chrome Extensions page (`chrome://extensions/`)
2. Enable Developer mode
3. Load unpacked extension from your project folder
4. Navigate to an Upwork job application page

### 2. Check Console Logs
Open Chrome DevTools and check the console for logs with these prefixes:
- `🔍 [content]` - Content script operations
- `🎯 [coverLetterModal]` - Modal operations
- `🎯 [background]` - Background script operations
- `🚀 [coverLetterSlice]` - Redux slice operations

### 3. Test the Flow
1. Click the "Generate Cover Letter" button on the job page
2. Watch the console for the complete data flow
3. Check if the modal opens and shows the generated cover letter

### 4. Use Test Script
Run the `test-cover-letter.js` script in the browser console to test the n8n webhook directly:

```javascript
// Copy and paste the content of test-cover-letter.js into the console
```

## Debugging Common Issues

### Issue: "No job details received"
- Check if you're on a job application page
- Verify the content script is loaded
- Check for console errors in the content script

### Issue: "Missing user profile"
- Ensure user is logged in
- Check if profile has been scraped
- Verify Redux state contains profile data

### Issue: "n8n API error"
- Check network tab for failed requests
- Verify the webhook URL is correct
- Check n8n server logs

### Issue: "Invalid response format"
- Check the actual response from n8n
- Verify the response matches expected format
- Update response handling if needed

## Expected Console Output

When working correctly, you should see logs like:

```
🔍 [content] Starting job details scraping...
✅ [content] Job details element found
📦 [content] Job details result: {...}
🎯 [coverLetterModal] Modal opened, starting data collection...
📋 [coverLetterModal] Job details received: {...}
👤 [coverLetterModal] Requesting user profile from background...
📦 [coverLetterModal] Structured payload: {...}
🚀 [coverLetterModal] Sending GENERATE_COVER_LETTER to background...
🎯 [background] GENERATE_COVER_LETTER received: {...}
🚀 [coverLetterSlice] Starting cover letter generation...
📤 [coverLetterSlice] Payload being sent to n8n: {...}
📡 [coverLetterSlice] Response status: 200
📥 [coverLetterSlice] Raw response from n8n: {...}
✅ [coverLetterSlice] Successfully extracted cover letter from array format
✅ [coverLetterSlice] Cover letter generation fulfilled: {...}
✅ [background] n8n success - cover letter generated: {...}
📨 [coverLetterModal] Received message: COVER_LETTER_GENERATED
✅ [coverLetterModal] Cover letter received from background: {...}
```

## Troubleshooting

If you encounter issues:

1. **Check all console logs** - Look for error messages and missing steps
2. **Verify data structure** - Ensure the payload matches the expected format
3. **Test n8n directly** - Use the test script to verify the webhook works
4. **Check network requests** - Verify API calls are being made correctly
5. **Restart the extension** - Sometimes a reload is needed after changes

## Notes

- The system now properly structures the data before sending to n8n
- Comprehensive logging helps identify where issues occur
- The response handling is more robust and handles multiple formats
- The background script properly relays responses back to the modal 