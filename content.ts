// content/upwork_scraper.ts
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.upwork.com/freelancers/*"],
  run_at: "document_idle"
}

export {}

console.log("🟢 upwork_scraper.ts loaded!")

function waitForSelector(selector: string, timeout = 15000): Promise<Element> {
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

async function scrapeAndLogProfile() {
  try {
    await waitForSelector('h2[itemprop="name"]')

    // Wait for the skills list to appear as well
    await waitForSelector('ul.d-flex.list-unstyled.flex-wrap-wrap.mb-0.air3-token-wrap', 10000)

    const name = document.querySelector('h2[itemprop="name"]')?.textContent?.trim() || null
    const location = document.querySelector('span.d-inline-block.vertical-align-middle.ellipsis')?.textContent?.trim() || null
    const role = document.querySelector('h2.mb-0.h4')?.textContent?.trim() || null
    const hourlyRate = document.querySelector('h3.my-6x.h5')?.textContent?.trim() || null
    const about = document.querySelector('span.text-pre-line.break')?.textContent?.trim() || null

    // Now the skills list should be loaded
    const skills = Array.from(
      document.querySelectorAll('ul.d-flex.list-unstyled.flex-wrap-wrap.mb-0.air3-token-wrap li .skill-name')
    ).map(span => span.textContent.trim())

    

    // Wait for certifications to appear
    await waitForSelector('div[data-testid="certificate-wrapper"]', 10000)
    const certifications = Array.from(
      document.querySelectorAll('div[data-testid="certificate-wrapper"]')
    ).map(wrapper => {
      // Try to get the certificate name from h4 or strong or span
      const cert =
        wrapper.querySelector('h4')?.textContent?.trim() ||
        wrapper.querySelector('strong')?.textContent?.trim() ||
        wrapper.querySelector('span')?.textContent?.trim() ||
        ''
      return cert
    }).filter(Boolean)

    // Wait for work history to appear
    await waitForSelector('.assignments-item.air3-card-section.py-0.legacy', 10000)
    const workHistory = Array.from(
      document.querySelectorAll('.assignments-item.air3-card-section.py-0.legacy')
    ).map(card => {
      const projectTitle =
        card.querySelector('h4')?.textContent?.trim() ||
        card.querySelector('h3')?.textContent?.trim() ||
        card.querySelector('.text-base.mb-2x')?.textContent?.trim() ||
        card.querySelector('.job-title-selector')?.textContent?.trim() ||
        ''
      const rating = card.querySelector('.air3-rating-value-text')?.textContent?.trim() || ''
      // Try to get feedback from multiple possible selectors
      const feedback =
        card.querySelector('[id^="air3-truncation-"]')?.textContent?.trim() ||
        card.querySelector('.break')?.textContent?.trim() ||
        ''
      return { projectTitle, rating, feedback }
    })

    const experience = Array.from(
      document.querySelectorAll('section.air3-card-section, .air3-card-section.px-0')
    ).map(card => {
      const titleCompany = card.querySelector('h4[role="presentation"], h4.my-0')?.textContent?.trim() || ''
      const description = card.querySelector('.air3-line-clamp-wrapper, [data-ev-sublocation="line_clamp"]')?.textContent?.trim() || ''
      return { titleCompany, description }
    }).filter(item => item.titleCompany && item.description)

    // ✅ Final structured output
    const scrapedProfile = {
      name,
      location,
      about,
      hourlyRate,
      role,
      skills,
      certifications,
      workHistory,
      experience
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

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", scrapeAndLogProfile)
} else {
  scrapeAndLogProfile()
}
