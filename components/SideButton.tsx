import React from "react"
import { createRoot } from "react-dom/client"
import "~/style.css"

const SideButton = () => (
  <button
    className="fixed top-1/2 right-0 z-[9999] bg-green-600 text-white font-bold px-4 py-3 rounded-l-lg shadow-lg cursor-pointer transform -translate-y-1/2 hover:bg-green-700 transition-all writing-vertical-rl"
    style={{ writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "2px" }}
    onClick={() => alert("Side button clicked!")}
  >
   YONI
  </button>
)

export const mountSideButton = () => {
  if (document.getElementById("plasmo-upwork-sidebutton")) return

  const container = document.createElement("div")
  container.id = "plasmo-upwork-sidebutton"
  document.body.appendChild(container)

  const root = createRoot(container)
  root.render(<SideButton />)
} 