// content/upwork_scraper.ts
import type { PlasmoCSConfig } from "plasmo"
import { mountBanner } from "~/components/banner"
import { mountSideButton } from "~/components/SideButton"

export const config: PlasmoCSConfig = {
  matches: ["https://www.upwork.com/freelancers/*"],
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
    } catch (e) {}
    const skillsNodeList = document.querySelectorAll('ul.d-flex.list-unstyled.flex-wrap-wrap.mb-0.air3-token-wrap li .skill-name')
    skills = skillsNodeList.length > 0 ? Array.from(skillsNodeList).map(span => span.textContent.trim()) : null

    // Certifications
    let certifications: string[] | null = null
    try {
      await waitForSelector('div[data-testid="certificate-wrapper"]', 3000)
    } catch (e) {}
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
    } catch (e) {}
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
    } catch (e) {}
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
      imag: (document.querySelector('img.air3-avatar.air3-avatar-88') as HTMLImageElement)?.src || null,
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

    // Send to background for Redux/Supabase
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'SCRAPED_PROFILE', payload: scrapedProfile })
    }

  } catch (err) {
    console.error("❌ Failed to scrape profile:", err)
  }
}

// Listen for SCRAPE_PROFILE message to trigger scraping
chrome.runtime?.onMessage?.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SCRAPE_PROFILE") {
    scrapeAndLogProfile()
  }
  if (msg.type === "shiftPageRight") {
    document.body.style.transition = "margin-left 0.3s ease"
    document.body.style.marginLeft = "350px"
  }
  if (msg.type === "resetPage") {
    document.body.style.marginLeft = "0px"
  }
})
