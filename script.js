// Mock token storage
let currentUser = null
let authToken = null

// Generate a mock JWT token
function generateMockToken(email) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload = btoa(
    JSON.stringify({
      email: email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiry
      iat: Math.floor(Date.now() / 1000),
    }),
  )
  const signature = btoa("mock-signature-" + Math.random().toString(36).substr(2, 9))

  return `${header}.${payload}.${signature}`
}

// Show login form
function showLogin() {
  document.getElementById("loginForm").classList.remove("hidden")
  document.getElementById("signupForm").classList.add("hidden")
  document.querySelectorAll(".tab-btn")[0].classList.add("active")
  document.querySelectorAll(".tab-btn")[1].classList.remove("active")
}

// Show signup form
function showSignup() {
  document.getElementById("signupForm").classList.remove("hidden")
  document.getElementById("loginForm").classList.add("hidden")
  document.querySelectorAll(".tab-btn")[1].classList.add("active")
  document.querySelectorAll(".tab-btn")[0].classList.remove("active")
}

// Handle login
function handleLogin(event) {
  event.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  // Mock authentication
  if (email && password) {
    currentUser = {
      email: email,
      name: email.split("@")[0],
    }

    authToken = generateMockToken(email)

    // Store in localStorage (mock)
    localStorage.setItem("authToken", authToken)
    localStorage.setItem("currentUser", JSON.stringify(currentUser))

    showDashboard()
  }
}

// Handle signup
function handleSignup(event) {
  event.preventDefault()

  const name = document.getElementById("signupName").value
  const email = document.getElementById("signupEmail").value
  const password = document.getElementById("signupPassword").value

  // Mock registration
  if (name && email && password) {
    currentUser = {
      email: email,
      name: name,
    }

    authToken = generateMockToken(email)

    // Store in localStorage (mock)
    localStorage.setItem("authToken", authToken)
    localStorage.setItem("currentUser", JSON.stringify(currentUser))

    showDashboard()
  }
}

// Show dashboard
function showDashboard() {
  document.getElementById("loginForm").classList.add("hidden")
  document.getElementById("signupForm").classList.add("hidden")
  document.getElementById("dashboard").classList.remove("hidden")

  // Update dashboard info
  document.getElementById("tokenValue").textContent = authToken.substring(0, 50) + "..."
  document.getElementById("userName").textContent = currentUser.name

  // Calculate expiry
  const payload = JSON.parse(atob(authToken.split(".")[1]))
  const expiryDate = new Date(payload.exp * 1000)
  document.getElementById("tokenExpiry").textContent = expiryDate.toLocaleString()
}

// Logout
function logout() {
  currentUser = null
  authToken = null
  localStorage.removeItem("authToken")
  localStorage.removeItem("currentUser")

  document.getElementById("dashboard").classList.add("hidden")
  showLogin()

  // Clear forms
  document.getElementById("loginEmail").value = ""
  document.getElementById("loginPassword").value = ""
  document.getElementById("signupName").value = ""
  document.getElementById("signupEmail").value = ""
  document.getElementById("signupPassword").value = ""
}

// Check for existing session on page load
window.addEventListener("load", () => {
  const storedToken = localStorage.getItem("authToken")
  const storedUser = localStorage.getItem("currentUser")

  if (storedToken && storedUser) {
    authToken = storedToken
    currentUser = JSON.parse(storedUser)

    // Check if token is expired
    const payload = JSON.parse(atob(authToken.split(".")[1]))
    const now = Math.floor(Date.now() / 1000)

    if (payload.exp > now) {
      showDashboard()
    } else {
      logout()
    }
  }
})
