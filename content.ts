console.log("🟢 Plasmo content.ts loaded!"); // Add this at the very top

import type { PlasmoCSConfig } from "plasmo"
import { supabase } from "./supabaseClient"

// Plasmo content script config
export const config: PlasmoCSConfig = {
  matches: ["https://www.upwork.com/freelancers/*"],
  run_at: "document_end",
  // If you need to access the page's window object, uncomment the next line:
  // world: "MAIN"
}

console.log("🟢 Upwork scraper loaded!")

const extractProfileData = async () => {
  try {
    const name = document.querySelector("h1")?.textContent?.trim()
    const title = document.querySelector("h2")?.textContent?.trim()
    const about = document.querySelector('[data-test="freelancer-description"]')?.textContent?.trim()
    const skills = Array.from(
      document.querySelectorAll('[data-test="skill-tag"]')
    ).map((el) => el.textContent?.trim()).filter(Boolean)
    const rate = document.querySelector('[data-test="rate"]')?.textContent?.trim()

    const data = {
      name,
      title,
      about,
      skills,
      rate,
    }

    // Validate that critical data exists
    if (!name || !title) {
      console.warn("Missing key profile data. Aborting.")
      return
    }

    // Send to background script or directly to Supabase
    console.log("Extracted Profile Data:", data)

    // Send to Supabase using supabase-js client
    const { error, status } = await supabase
      .from("profile")
      .insert([data])

    if (error) {
      console.error("Error sending data to Supabase:", error)
    } else {
      console.log("Data sent to Supabase, status:", status)
    }
  } catch (err) {
    console.error("Error extracting profile data:", err)
  }
}

// Function to set up the MutationObserver for profile data
function setupProfileScraper() {
  const target = document.body
  const observer = new MutationObserver(() => {
    const name = document.querySelector("h1")?.textContent?.trim()
    const title = document.querySelector("h2")?.textContent?.trim()
    if (name && title) {
      observer.disconnect()
      extractProfileData()
    }
  })
  observer.observe(target, { childList: true, subtree: true })
}

// SPA navigation handling: re-run setupProfileScraper on URL change
let lastUrl = location.href
const urlObserver = new MutationObserver(() => {
  const url = location.href
  if (url !== lastUrl) {
    lastUrl = url
    setupProfileScraper()
  }
})
urlObserver.observe(document, { subtree: true, childList: true })

// Initial run
if (document.readyState === "complete" || document.readyState === "interactive") {
  setupProfileScraper()
} else {
  window.addEventListener("DOMContentLoaded", setupProfileScraper)
}
