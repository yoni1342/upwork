// content/upwork_scraper.ts
import type { PlasmoCSConfig } from "plasmo"
import { mountBanner } from "~/components/banner"
import { mountSideButton } from "~/components/SideButton"

export const config: PlasmoCSConfig = {
  matches: ["https://www.upwork.com/*"],
  run_at: "document_idle"
}

export {}

console.log("🟢 upwork_scraper.ts loaded!")

function waitForSelector(selector: string, timeout = 13000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector)
    if (el) return resolve(el)

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector)
      if (el) {
        observer.disconnect()
        resolve(el)
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    setTimeout(() => {
      observer.disconnect()
      reject(`Timeout waiting for selector: ${selector}`)
    }, timeout)
  })
}

// Inject the banner when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountBanner)
} else {
  mountBanner()
}

// Inject the side button when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountSideButton)
} else {
  mountSideButton()
}

async function scrapeAndLogProfile() {
  try {
    await waitForSelector('h2[itemprop="name"]')

    // Wait for the skills list to appear as well
    let skills: string[] | null = null
    try {
      await waitForSelector('ul.d-flex.list-unstyled.flex-wrap-wrap.mb-0.air3-token-wrap', 3000)
    } catch { /* no-op */ } // ignore timeout, skills may not exist
    const skillsNodeList = document.querySelectorAll('ul.d-flex.list-unstyled.flex-wrap-wrap.mb-0.air3-token-wrap li .skill-name')
    skills = skillsNodeList.length > 0 ? Array.from(skillsNodeList).map(span => span.textContent.trim()) : null

    // Certifications
    let certifications: string[] | null = null
    try {
      await waitForSelector('div[data-testid="certificate-wrapper"]', 3000)
    } catch { /* no-op */ } // ignore timeout, certifications may not exist
    const certNodeList = document.querySelectorAll('div[data-testid="certificate-wrapper"]')
    certifications = certNodeList.length > 0 ? Array.from(certNodeList).map(wrapper => {
      const cert =
        wrapper.querySelector('h4')?.textContent?.trim() ||
        wrapper.querySelector('strong')?.textContent?.trim() ||
        wrapper.querySelector('span')?.textContent?.trim() ||
        ''
      return cert
    }).filter(Boolean) : null

    // Work history
    let workHistory: { projectTitle: string; rating: string; feedback: string }[] | null = null
    try {
      await waitForSelector('.assignments-item.air3-card-section.py-0.legacy', 3000)
    } catch { /* no-op */ } // ignore timeout, work history may not exist
    const workNodeList = document.querySelectorAll('.assignments-item.air3-card-section.py-0.legacy')
    workHistory = workNodeList.length > 0 ? Array.from(workNodeList).map(card => {
      const projectTitle =
        card.querySelector('h4')?.textContent?.trim() ||
        card.querySelector('h3')?.textContent?.trim() ||
        card.querySelector('.text-base.mb-2x')?.textContent?.trim() ||
        card.querySelector('.job-title-selector')?.textContent?.trim() ||
        ''
      const rating = card.querySelector('.air3-rating-value-text')?.textContent?.trim() || ''
      const feedback =
        card.querySelector('[id^="air3-truncation-"]')?.textContent?.trim() ||
        card.querySelector('.break')?.textContent?.trim() ||
        ''
      return { projectTitle, rating, feedback }
    }) : null

    // Experience
    let experience: { titleCompany: string; description: string }[] | null = null
    try {
      await waitForSelector('section.air3-card-section, .air3-card-section.px-0', 3000)
    } catch { /* no-op */ } // ignore timeout, experience may not exist
    const expNodeList = document.querySelectorAll('section.air3-card-section, .air3-card-section.px-0')
    experience = expNodeList.length > 0 ? Array.from(expNodeList).map(card => {
      const titleCompany = card.querySelector('h4[role="presentation"], h4.my-0')?.textContent?.trim() || ''
      const description = card.querySelector('.air3-line-clamp-wrapper, [data-ev-sublocation="line_clamp"]')?.textContent?.trim() || ''
      return { titleCompany, description }
    }).filter(item => item.titleCompany && item.description) : null

    // Extract Upwork user ID from URL
    const match = window.location.href.match(/~[a-zA-Z0-9]+/)
    const upworkUserId = match ? match[0] : null
    console.log("🆔 Upwork User ID:", upworkUserId)

    // ✅ Final structured output
    const scrapedProfile = {
      image: (document.querySelector('img.air3-avatar.air3-avatar-88') as HTMLImageElement)?.src || null,
      name: document.querySelector('h2[itemprop="name"]')?.textContent?.trim() || null,
      location: document.querySelector('span.d-inline-block.vertical-align-middle.ellipsis')?.textContent?.trim() || null,
      about: document.querySelector('span.text-pre-line.break')?.textContent?.trim() || null,
      hourlyRate: document.querySelector('h3.my-6x.h5')?.textContent?.trim() || null,
      role: document.querySelector('h2.mb-0.h4')?.textContent?.trim() || null,
      skills,
      certifications,
      workHistory,
      experience,
      upworkUserId
    }

    console.log("🟢 Scraped Profile:", scrapedProfile)

    // Get user_id from background and send with profile
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'GET_CURRENT_USER' }, (response) => {
        const userId = response?.user?.id || null
        const profileWithUserId = { ...scrapedProfile, user_id: userId }
        console.log("🟢 Scraped Profile with user_id:", profileWithUserId)
        // Send to backend
        chrome.runtime.sendMessage({ type: 'SCRAPED_PROFILE', payload: profileWithUserId })
      })
    }

  } catch (err) {
    console.error("❌ Failed to scrape profile:", err)
  }
}

function scrapeJobDetails() {
    console.log('🔍 [content] Starting job details scraping...')
    
    // Find the exact job details element with the correct heading
    const jobDetailsElement = Array.from(document.querySelectorAll('.air3-card.air3-card-outline.my-6x.py-0')).find(el => {
        const header = el.querySelector('header h2');
        return header && header.textContent.trim() === 'Job details';
    });

    if (!jobDetailsElement) {
        console.error('❌ [content] Job details element not found')
        return null;
    }

    console.log('✅ [content] Job details element found')

    // Get the raw HTML string of the element
    const rawHtml = jobDetailsElement.outerHTML;
    console.log('📄 [content] Raw HTML length:', rawHtml.length)
    console.log('📄 [content] Raw HTML preview:', rawHtml.substring(0, 200) + '...')

    const result = {
        jobDetailsHtml: rawHtml,
        url: window.location.href,
        timestamp: new Date().toISOString()
    };
    
    console.log('📦 [content] Job details result:', result)
    return result;
}

// Function to handle Generate Cover Letter button click
function handleGenerateCoverLetter() {
  // Notify the extension UI (sidepanel/popup) to open the modal
  chrome.runtime.sendMessage({ type: "OPEN_COVER_LETTER_MODAL" })
}

async function injectGenerateCoverLetterButton() {
  // Wait for the cover letter area to appear (up to 10 seconds)
  let coverLetterArea = null;
  try {
    coverLetterArea = await waitForSelector('div.cover-letter-area.mt-6x.mt-md-10x', 10000);
  } catch {
    console.log('Cover letter area not found (timeout)');
    return;
  }
  if (!coverLetterArea) {
    console.log('Cover letter area not found');
    return;
  }
  // Check if button already exists
  const existingButton = document.querySelector('.cover-letter-button-container');
  if (existingButton) {
    console.log('Generate Cover Letter button already exists');
    return;
  }
  // Create the button container
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'cover-letter-button-container';
  buttonContainer.style.cssText = 'text-align: right; margin-top: 10px;';
  // Create the button
  const generateButton = document.createElement('button');
  generateButton.className = 'air3-btn air3-btn-primary';
  generateButton.textContent = 'Generate Cover Letter';
  // Add click handler
  generateButton.addEventListener('click', handleGenerateCoverLetter);
  // Add button to container
  buttonContainer.appendChild(generateButton);
  // Insert the button container after the textarea
  const textareaContainer = coverLetterArea.querySelector('.textarea-wrapper');
  if (textareaContainer) {
    console.log('Found textarea container, inserting button');
    // Insert after the textarea container but before the cover-letter-info div
    const infoDiv = coverLetterArea.querySelector('.cover-letter-info');
    if (infoDiv) {
      coverLetterArea.insertBefore(buttonContainer, infoDiv);
    } else {
      textareaContainer.parentNode.insertBefore(buttonContainer, textareaContainer.nextSibling);
    }
  } else {
    console.log('Textarea container not found, trying alternative insertion');
    // Try to insert directly after the cover letter area
    coverLetterArea.appendChild(buttonContainer);
  }
  console.log('Generate Cover Letter button injected successfully');
}

// Inject the button when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectGenerateCoverLetterButton);
} else {
  injectGenerateCoverLetterButton();
}

// Listen for SCRAPE_PROFILE message to trigger scraping
chrome.runtime?.onMessage?.addListener((msg, sender, sendResponse) => {
  console.log('📨 [content] Received message:', msg.type)
  
  if (msg.type === "SCRAPE_PROFILE") {
    console.log('👤 [content] Scraping profile...')
    scrapeAndLogProfile()
  }
  if (msg.type === "SCRAPE_JOB_DETAILS") {
    console.log('📋 [content] Scraping job details...')
    const details = scrapeJobDetails();
    console.log('📋 [content] Job details scraped:', details)
    sendResponse({ details });
  }
  if (msg.type === "shiftPageRight") {
    document.body.style.transition = "margin-left 0.3s ease"
    document.body.style.marginLeft = "350px"
  }
  if (msg.type === "resetPage") {
    document.body.style.marginLeft = "0px"
  }
})
