import React from "react"

interface LandingPageLoggedInProps {
  user: {
    email?: string
    full_name?: string
    name?: string
    avatar_url?: string
    [key: string]: any
  }
}

export default function LandingPageLoggedIn({ user }: LandingPageLoggedInProps) {
  // Try to get a display name
  const displayName =
    user?.full_name ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "User")

  // Use avatar_url if available, else fallback to a default image
  const avatarUrl =
    user?.avatar_url ||
    "/assets/default-profile.png" // Make sure this exists in your public/assets

  // Open profile handler (customize as needed)
  const handleOpenProfile = () => {
    // Example: open dashboard or profile page
    window.open("/tabs/dashboard.html", "_blank")
  }

  return (
    <div
      style={{
        background: "#15544B",
        borderRadius: "0.5rem 0.5rem 0 0",
        padding: "2rem 1rem 0 1rem",
        textAlign: "center",
      }}
    >
      <img
        src="/assets/upwex-logo.png"
        alt="Upwex Logo"
        style={{ width: 120, margin: "0 auto 1.5rem auto", display: "block" }}
      />
      <div
        style={{
          background: "#fff",
          borderRadius: "1rem",
          margin: "0 auto",
          marginTop: "-3rem",
          padding: "2.5rem 1rem 2rem 1rem",
          maxWidth: 320,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <img
          src={avatarUrl}
          alt="Profile"
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            objectFit: "cover",
            border: "4px solid #fff",
            marginTop: "-60px",
            marginBottom: "1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            background: "#eee",
          }}
        />
        <div
          style={{
            fontWeight: 700,
            fontSize: "1.5rem",
            marginBottom: "1.5rem",
            color: "#222",
          }}
        >
          {displayName}
        </div>
        <button
          onClick={handleOpenProfile}
          style={{
            width: "100%",
            background: "#15544B",
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.75rem 0",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
            marginTop: "0.5rem",
          }}
        >
          Open Profile
        </button>
      </div>
    </div>
  )
}
