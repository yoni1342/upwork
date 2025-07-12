import React from "react"
import { createRoot } from "react-dom/client"
import "~/style.css" // ✅ Make sure your global tailwind styles are loaded

// Banner Component
const Banner = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-green-600 text-white py-2 px-4 text-center text-base font-semibold shadow-md flex items-center justify-center">
      <span className="flex-1">🔔 You're using your AI-powered Upwork Extension!!</span>
      <button
        className="absolute right-4 top-1 text-white text-xl font-bold hover:text-gray-200 focus:outline-none"
        onClick={() => {
          const el = document.getElementById("plasmo-upwork-banner")
          if (el) el.remove()
        }}
        aria-label="Close banner"
      >
        ×
      </button>
    </div>
  )
}

// Mount into DOM
export const mountBanner = () => {
  // Prevent injecting twice
  if (document.getElementById("plasmo-upwork-banner")) return

  const container = document.createElement("div")
  container.id = "plasmo-upwork-banner"
  document.body.prepend(container)

  const root = createRoot(container)
  root.render(<Banner />)
}

// Tell Plasmo to inject this script on Upwork pages
export const config = {
  matches: ["https://www.upwork.com/*"],
  run_at: "document_idle"
}
