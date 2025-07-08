import React, { useState } from "react"
import { createRoot } from "react-dom/client"
import "~/style.css"

const PersonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 1115 0v.75A2.25 2.25 0 0117.25 22.5h-10.5A2.25 2.25 0 014.5 20.25v-.75z" />
  </svg>
)

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.149c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.019.94-1.11l.894-.149c.424-.071.765-.384.93-.781.165-.398.142-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.774-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.806.272 1.204.107.397-.165.71-.505.78-.929l.149-.894z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const IconWithTooltip = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="bg-white rounded-full shadow-lg p-2 text-green-600 hover:bg-green-100 transition-colors">
        {icon}
      </div>
      <span
        className={`absolute left-[-110%] whitespace-nowrap bg-gray-800 text-white text-xs rounded px-2 py-1 ml-2 transition-all duration-300 ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'} pointer-events-none`}
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      >
        {label}
      </span>
    </div>
  )
}

const SideButton = () => {
  const [hovered, setHovered] = useState(false)

  // Open login page in a new tab (like LandingPage)
  const handleProfileClick = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: 'SHOW_SYNCH_PROFILE' })
    }
  }
  const handleSettingsClick = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: 'SHOW_SETTING' })
    }
  }

  return (
    <div
      className="fixed top-1/2 right-0 z-[9999] flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ transform: 'translateY(-50%)' }}
    >
      {/* Icons appear in place of button when hovered */}
      <div
        className={`flex flex-col gap-3 transition-all duration-500 ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'} mr-3`}
        style={{ minWidth: hovered ? '48px' : '0px' }}
      >
        {hovered && (
          <>
            <IconWithTooltip icon={<PersonIcon />} label="Profile" onClick={handleProfileClick} />
            <IconWithTooltip icon={<SettingsIcon />} label="Settings" onClick={handleSettingsClick} />
          </>
        )}
      </div>
      {/* Button only visible when not hovered */}
      {!hovered && (
        <button
          className="bg-green-600 text-white font-bold px-4 py-3 rounded-l-lg shadow-lg cursor-pointer hover:bg-green-700 transition-all writing-vertical-rl"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "2px" }}
          onClick={() => alert("Side button clicked!")}
        >
          YONI
        </button>
      )}
    </div>
  )
}

export const mountSideButton = () => {
  if (document.getElementById("plasmo-upwork-sidebutton")) return

  const container = document.createElement("div")
  container.id = "plasmo-upwork-sidebutton"
  document.body.appendChild(container)

  const root = createRoot(container)
  root.render(<SideButton />)
} 