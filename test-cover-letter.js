// Test script for cover letter generation
// Run this in the browser console to test the data flow

console.log('🧪 Testing Cover Letter Generation...')

// Mock data structure that matches what we expect from the extension
const testPayload = {
  jobDetailsHtml: "<div class=\"air3-card\"><h3>Need to finish the web app demo quickly (Next JS)</h3><ul><li><div>Full Stack Development</div></li><li><small>Posted <span itemprop=\"datePosted\">Jul 11, 2025</span></small></li></ul><div class=\"description\">We need to finish the web app demo quickly! More than half is done. We also need to fix everything according to the layout and make a minimal connection to the backend. Everything must be done by this evening (Europe time).<br>IMPORTANT: Must match the prototype!<br><br>Design: https://www.figma.com/design/sample<br>Prototype: https://www.figma.com/proto/sample</div><div><strong>Intermediate</strong></div><div><strong>$20</strong></div><div><strong>Less than 1 month</strong></div><div><h4>Skills and expertise</h4><ul><li>TypeScript</li><li>Next.js</li><li>JavaScript</li><li>Figma</li></ul></div></div>",
  timestamp: "2025-07-11T12:38:49.430Z",
  url: "https://www.upwork.com/nx/proposals/job/~021943556425581628649/apply/",
  userId: "d659a6e9-fd98-4ae1-bacb-a376af3efe8a",
  profile: {
    name: "Nebiyu Z.",
    role: "Full Stack Developer",
    location: "Addis Ababa",
    hourly_rate: 15,
    about: "🚀 Results-Driven Full Stack Developer specializing in modern, responsive web applications. I deliver scalable solutions with clean code and performance optimization. I'm highly collaborative and committed to project success.",
    image: "https://www.upwork.com/profile-portraits/sample",
    upwork_user_id: "~01ea6382b1889bdb02",
    user_id: "d659a6e9-fd98-4ae1-bacb-a376af3efe8a"
  },
  userProfile: {
    certifications: [
      "AWS Certified Cloud Practitioner",
      "Kuraz Tech company Backend Intern"
    ],
    experience: [
      {
        company: "Kuraz Tech",
        description: "Working as a backend developer, collaborating with cross-functional teams."
      },
      {
        company: "Intern Backend Developer",
        description: "Currently interning at Kuraz Tech, contributing to various internal platforms."
      }
    ]
  },
  skills: [
    "HTML", "CSS", "JavaScript", "Bootstrap", "Tailwind CSS",
    "React", "TypeScript", "PHP", "Laravel", "MySQL",
    "MongoDB", "ExpressJS", "Node.js", "Next.js", "Material UI"
  ],
  workHistory: [
    {
      project_title: "Ecommerce Website",
      rating: 5,
      feedback: "I had a great experience working with Nebiyu Zewge on the development of our ecommerce site. The end result was clean, fast, and highly functional."
    }
  ]
}

console.log('📦 Test payload structure:', JSON.stringify(testPayload, null, 2))

// Test the n8n webhook directly
async function testN8nWebhook() {
  try {
    console.log('🚀 Testing n8n webhook directly...')
    
    const response = await fetch(
      "https://n8n.tebita.com/webhook/generate-cover-letter",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(testPayload)
      }
    );
    
    console.log('📡 Response status:', response.status)
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ HTTP Error:', response.status, errorText)
      return
    }
    
    const data = await response.json();
    console.log('📥 Raw response from n8n:', JSON.stringify(data, null, 2))

    // Test different response formats
    if (Array.isArray(data) && data.length > 0 && typeof data[0].output === "string") {
      console.log('✅ Successfully extracted cover letter from array format:', data[0].output)
    } else if (typeof data.coverLetter === "string") {
      console.log('✅ Successfully extracted cover letter from object format:', data.coverLetter)
    } else if (typeof data === "string") {
      console.log('✅ Successfully extracted cover letter from string format:', data)
    } else {
      console.error('❌ Invalid response format:', data)
    }
    
  } catch (err) {
    console.error('💥 Error testing n8n webhook:', err)
  }
}

// Test the extension's cover letter generation
async function testExtensionCoverLetter() {
  try {
    console.log('🔧 Testing extension cover letter generation...')
    
    // Simulate the extension's message flow
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: "GENERATE_COVER_LETTER",
        payload: testPayload
      }, (response) => {
        console.log('📡 Extension response:', response)
      })
    } else {
      console.log('⚠️ Chrome extension API not available in this context')
    }
    
  } catch (err) {
    console.error('💥 Error testing extension:', err)
  }
}

// Run tests
console.log('\n🧪 Running tests...\n')

// Test 1: Direct n8n webhook
testN8nWebhook()

// Test 2: Extension flow (if available)
setTimeout(() => {
  testExtensionCoverLetter()
}, 1000)

console.log('\n✅ Tests initiated. Check console for results.') 