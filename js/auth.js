// Authentication module for Google OAuth
class Auth {
  constructor() {
    this.isAuthenticated = false
    this.user = null
    this.token = null
    this.admins = []
    this.isAdmin = false

    // Load authentication state from localStorage
    this.loadAuthState()

    // Initialize Google OAuth
    this.initGoogleAuth()
  }

  // Load authentication state from localStorage
  loadAuthState() {
    const authState = localStorage.getItem("authState")
    if (authState) {
      const { isAuthenticated, user, token, isAdmin } = JSON.parse(authState)
      this.isAuthenticated = isAuthenticated
      this.user = user
      this.token = token
      this.isAdmin = isAdmin
    }
  }

  // Save authentication state to localStorage
  saveAuthState() {
    const authState = {
      isAuthenticated: this.isAuthenticated,
      user: this.user,
      token: this.token,
      isAdmin: this.isAdmin,
    }
    localStorage.setItem("authState", JSON.stringify(authState))
  }

  // Initialize Google OAuth
  async initGoogleAuth() {
    // Load Google API script
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    // Wait for script to load
    await new Promise((resolve) => {
      script.onload = resolve
    })

    // Load admin list
    await this.loadAdmins()

    // Check if user is already authenticated
    if (this.isAuthenticated) {
      this.checkAdminStatus()
    }
  }

  // Load admin list from GitHub
  async loadAdmins() {
    try {
      // Try to fetch admins.json from GitHub
      const response = await fetch(
        `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${config.github.adminFile}?ref=${config.github.branch}`,
      )

      if (response.ok) {
        const data = await response.json()
        const content = atob(data.content)
        this.admins = JSON.parse(content)
      } else {
        // If file doesn't exist, create default admin list
        this.admins = []
        console.log("Admin file not found. Creating default admin list.")
      }
    } catch (error) {
      console.error("Error loading admin list:", error)
      this.admins = []
    }
  }

  // Check if user is an admin
  checkAdminStatus() {
    if (!this.isAuthenticated || !this.user || !this.user.email) {
      this.isAdmin = false
      return false
    }

    // Check if user's email is in the admin list
    this.isAdmin = this.admins.includes(this.user.email)
    this.saveAuthState()

    // Show/hide admin button
    const adminButton = document.getElementById("admin-button")
    if (adminButton) {
      adminButton.classList.toggle("hidden", !this.isAdmin)
    }

    return this.isAdmin
  }

  // Initialize Google Sign-In
  initGoogleSignIn(buttonId, callback) {
    if (!window.google) {
      console.error("Google API not loaded")
      return
    }

    google.accounts.id.initialize({
      client_id: config.googleClientId,
      callback: this.handleGoogleSignIn.bind(this, callback),
    })

    google.accounts.id.renderButton(document.getElementById(buttonId), { theme: "outline", size: "large", width: 250 })
  }

  // Handle Google Sign-In response
  handleGoogleSignIn(callback, response) {
    // Parse JWT token
    const payload = this.parseJwt(response.credential)

    // Set authentication state
    this.isAuthenticated = true
    this.user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    }
    this.token = response.credential

    // Check if user is an admin
    this.checkAdminStatus()

    // Save authentication state
    this.saveAuthState()

    // Call callback function
    if (typeof callback === "function") {
      callback(this.user, this.isAdmin)
    }
  }

  // Parse JWT token
  parseJwt(token) {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join(""),
    )

    return JSON.parse(jsonPayload)
  }

  // Sign out
  signOut(callback) {
    this.isAuthenticated = false
    this.user = null
    this.token = null
    this.isAdmin = false

    // Clear authentication state
    localStorage.removeItem("authState")

    // Hide admin button
    const adminButton = document.getElementById("admin-button")
    if (adminButton) {
      adminButton.classList.add("hidden")
    }

    // Call callback function
    if (typeof callback === "function") {
      callback()
    }
  }

  // Add admin
  async addAdmin(email) {
    if (!this.isAdmin) {
      throw new Error("Unauthorized")
    }

    // Check if email is already in admin list
    if (this.admins.includes(email)) {
      return
    }

    // Add email to admin list
    this.admins.push(email)

    // Save admin list to GitHub
    await this.saveAdmins()
  }

  // Remove admin
  async removeAdmin(email) {
    if (!this.isAdmin) {
      throw new Error("Unauthorized")
    }

    // Remove email from admin list
    this.admins = this.admins.filter((admin) => admin !== email)

    // Save admin list to GitHub
    await this.saveAdmins()
  }

  // Save admin list to GitHub
  async saveAdmins() {
    if (!this.isAdmin) {
      throw new Error("Unauthorized")
    }

    try {
      // Convert admin list to JSON
      const content = JSON.stringify(this.admins, null, 2)

      // Encode content to base64
      const encodedContent = btoa(content)

      // Check if file already exists
      let sha = ""
      try {
        const response = await fetch(
          `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${config.github.adminFile}?ref=${config.github.branch}`,
        )
        if (response.ok) {
          const data = await response.json()
          sha = data.sha
        }
      } catch (error) {
        console.log("Admin file does not exist yet")
      }

      // Prepare request data
      const requestData = {
        message: "Update admin list",
        content: encodedContent,
        branch: config.github.branch,
      }

      // Add sha if file exists
      if (sha) {
        requestData.sha = sha
      }

      // Save file to GitHub
      const response = await fetch(
        `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${config.github.adminFile}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to save admin list")
      }

      return true
    } catch (error) {
      console.error("Error saving admin list:", error)
      throw error
    }
  }
}

// Create auth instance
const auth = new Auth()
