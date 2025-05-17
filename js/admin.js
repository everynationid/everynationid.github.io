// Import necessary modules (assuming these are defined elsewhere)
import { auth } from "./auth.js" // Correct the path if needed
import { contentLoader } from "./contentLoader.js" // Correct the path if needed

// Admin module
class Admin {
  constructor() {
    this.isOpen = false
    this.currentSection = null
    this.editingItem = null

    // Initialize admin panel
    this.initAdminPanel()
  }

  // Initialize admin panel
  initAdminPanel() {
    // Get admin panel element
    const adminPanel = document.getElementById("admin-panel")
    if (!adminPanel) return

    // Get admin button element
    const adminButton = document.getElementById("admin-button")
    if (!adminButton) return

    // Add click event to admin button
    const adminLoginButton = document.getElementById("admin-login")
    if (adminLoginButton) {
      adminLoginButton.addEventListener("click", () => {
        this.openAdminPanel()
      })
    }
  }

  // Open admin panel
  openAdminPanel() {
    // Check if user is authenticated
    if (!auth.isAuthenticated) {
      this.showLoginPanel()
      return
    }

    // Check if user is admin
    if (!auth.isAdmin) {
      this.showUnauthorizedPanel()
      return
    }

    // Get admin panel element
    const adminPanel = document.getElementById("admin-panel")
    if (!adminPanel) return

    // Create admin panel content
    adminPanel.innerHTML = `
      <div class="admin-header">
        <h2 class="admin-title">Admin Panel</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-content">
        <div class="admin-section">
          <h3 class="admin-section-title">Website Content</h3>
          <p>Select a section to edit:</p>
          <div class="admin-section-buttons">
            <button class="btn admin-section-btn" data-section="header">Header</button>
            <button class="btn admin-section-btn" data-section="hero">Hero</button>
            <button class="btn admin-section-btn" data-section="about">About</button>
            <button class="btn admin-section-btn" data-section="services">Services</button>
            <button class="btn admin-section-btn" data-section="events">Events</button>
            <button class="btn admin-section-btn" data-section="connect">Connect</button>
            <button class="btn admin-section-btn" data-section="giving">Giving</button>
            <button class="btn admin-section-btn" data-section="footer">Footer</button>
          </div>
        </div>
        <div class="admin-section">
          <h3 class="admin-section-title">Admin Management</h3>
          <div class="admin-form-group">
            <label class="admin-label" for="admin-email">Add Admin (Email):</label>
            <div style="display: flex; gap: 10px;">
              <input type="email" id="admin-email" class="admin-input" placeholder="Enter email address">
              <button class="btn admin-add-btn" id="add-admin-btn">Add</button>
            </div>
          </div>
          <div id="admin-list">
            <div class="loading">
              <div class="spinner"></div>
            </div>
          </div>
        </div>
      </div>
    `

    // Show admin panel
    adminPanel.classList.add("active")
    this.isOpen = true

    // Add event listener for close button
    const closeButton = document.getElementById("admin-close")
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        this.closeAdminPanel()
      })
    }

    // Add event listeners for section buttons
    const sectionButtons = adminPanel.querySelectorAll(".admin-section-btn")
    sectionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const section = button.dataset.section
        this.showSectionEditor(section)
      })
    })

    // Add event listener for add admin button
    const addAdminButton = document.getElementById("add-admin-btn")
    if (addAdminButton) {
      addAdminButton.addEventListener("click", () => {
        this.addAdmin()
      })
    }

    // Load admin list
    this.loadAdminList()
  }

  // Close admin panel
  closeAdminPanel() {
    // Get admin panel element
    const adminPanel = document.getElementById("admin-panel")
    if (!adminPanel) return

    // Hide admin panel
    adminPanel.classList.remove("active")
    this.isOpen = false

    // Reset current section and editing item
    this.currentSection = null
    this.editingItem = null
  }

  // Show login panel
  showLoginPanel() {
    // Get admin panel element
    const adminPanel = document.getElementById("admin-panel")
    if (!adminPanel) return

    // Create login panel content
    adminPanel.innerHTML = `
      <div class="admin-header">
        <h2 class="admin-title">Admin Login</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-login-container">
        <h2 class="admin-login-title">Sign in with Google</h2>
        <div id="google-signin"></div>
      </div>
    `

    // Show admin panel
    adminPanel.classList.add("active")
    this.isOpen = true

    // Add event listener for close button
    const closeButton = document.getElementById("admin-close")
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        this.closeAdminPanel()
      })
    }

    // Initialize Google Sign-In
    auth.initGoogleSignIn("google-signin", (user, isAdmin) => {
      if (isAdmin) {
        this.openAdminPanel()
      } else {
        this.showUnauthorizedPanel()
      }
    })
  }

  // Show unauthorized panel
  showUnauthorizedPanel() {
    // Get admin panel element
    const adminPanel = document.getElementById("admin-panel")
    if (!adminPanel) return

    // Create unauthorized panel content
    adminPanel.innerHTML = `
      <div class="admin-header">
        <h2 class="admin-title">Unauthorized</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-login-container">
        <h2 class="admin-login-title">You are not authorized to access the admin panel</h2>
        <p>Please contact the website administrator to request access.</p>
        <button class="btn admin-cancel-btn" id="admin-signout">Sign Out</button>
      </div>
    `

    // Show admin panel
    adminPanel.classList.add("active")
    this.isOpen = true

    // Add event listener for close button
    const closeButton = document.getElementById("admin-close")
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        this.closeAdminPanel()
      })
    }

    // Add event listener for sign out button
    const signOutButton = document.getElementById("admin-signout")
    if (signOutButton) {
      signOutButton.addEventListener("click", () => {
        auth.signOut(() => {
          this.closeAdminPanel()
        })
      })
    }
  }

  // Load admin list
  async loadAdminList() {
    // Get admin list element
    const adminList = document.getElementById("admin-list")
    if (!adminList) return

    // Check if user is admin
    if (!auth.isAdmin) {
      adminList.innerHTML = "<p>You are not authorized to view the admin list.</p>"
      return
    }

    try {
      // Load admin list
      await auth.loadAdmins()

      // Create admin list HTML
      let html = ""

      if (auth.admins.length === 0) {
        html = "<p>No admins found.</p>"
      } else {
        html = '<ul class="admin-items">'
        auth.admins.forEach((admin) => {
          html += `
            <li class="admin-item">
              <div class="admin-item-header">
                <span class="admin-item-title">${admin}</span>
                <div class="admin-item-actions">
                  <button class="admin-delete-btn" data-admin="${admin}">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </li>
          `
        })
        html += "</ul>"
      }

      // Update admin list
      adminList.innerHTML = html

      // Add event listeners for delete buttons
      const deleteButtons = adminList.querySelectorAll(".admin-delete-btn")
      deleteButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const admin = button.dataset.admin
          this.removeAdmin(admin)
        })
      })
    } catch (error) {
      console.error("Error loading admin list:", error)
      adminList.innerHTML = "<p>Error loading admin list. Please try again.</p>"
    }
  }

  // Add admin
  async addAdmin() {
    // Check if user is admin
    if (!auth.isAdmin) {
      this.showNotification("You are not authorized to add admins.", "error")
      return
    }

    // Get email input
    const emailInput = document.getElementById("admin-email")
    if (!emailInput) return

    // Get email value
    const email = emailInput.value.trim()

    // Validate email
    if (!email) {
      this.showNotification("Please enter an email address.", "error")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      this.showNotification("Please enter a valid email address.", "error")
      return
    }

    try {
      // Add admin
      await auth.addAdmin(email)

      // Show success notification
      this.showNotification("Admin added successfully.", "success")

      // Clear email input
      emailInput.value = ""

      // Reload admin list
      this.loadAdminList()
    } catch (error) {
      console.error("Error adding admin:", error)
      this.showNotification("Error adding admin. Please try again.", "error")
    }
  }

  // Remove admin
  async removeAdmin(email) {
    // Check if user is admin
    if (!auth.isAdmin) {
      this.showNotification("You are not authorized to remove admins.", "error")
      return
    }

    // Confirm removal
    if (!confirm(`Are you sure you want to remove ${email} as an admin?`)) {
      return
    }

    try {
      // Remove admin
      await auth.removeAdmin(email)

      // Show success notification
      this.showNotification("Admin removed successfully.", "success")

      // Reload admin list
      this.loadAdminList()
    } catch (error) {
      console.error("Error removing admin:", error)
      this.showNotification("Error removing admin. Please try again.", "error")
    }
  }

  // Show section editor
  showSectionEditor(section) {
    // Check if user is admin
    if (!auth.isAdmin) {
      this.showNotification("You are not authorized to edit content.", "error")
      return
    }

    // Set current section
    this.currentSection = section

    // Get admin content element
    const adminContent = document.querySelector(".admin-content")
    if (!adminContent) return

    // Create section editor based on section type
    let html = ""

    switch (section) {
      case "header":
        html = this.createHeaderEditor()
        break
      case "hero":
        html = this.createHeroEditor()
        break
      case "about":
        html = this.createAboutEditor()
        break
      case "services":
        html = this.createServicesEditor()
        break
      case "events":
        html = this.createEventsEditor()
        break
      case "connect":
        html = this.createConnectEditor()
        break
      case "giving":
        html = this.createGivingEditor()
        break
      case "footer":
        html = this.createFooterEditor()
        break
      default:
        html = "<p>Invalid section.</p>"
    }

    // Update admin content
    adminContent.innerHTML = html

    // Add event listeners for back button
    const backButton = adminContent.querySelector("#admin-back")
    if (backButton) {
      backButton.addEventListener("click", () => {
        this.openAdminPanel()
      })
    }

    // Add event listeners for save button
    const saveButton = adminContent.querySelector("#admin-save")
    if (saveButton) {
      saveButton.addEventListener("click", () => {
        this.saveSection()
      })
    }

    // Add event listeners for add item button
    const addItemButton = adminContent.querySelector("#admin-add-item")
    if (addItemButton) {
      addItemButton.addEventListener("click", () => {
        this.showItemEditor()
      })
    }

    // Add event listeners for edit item buttons
    const editButtons = adminContent.querySelectorAll(".admin-edit-btn")
    editButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number.parseInt(button.dataset.index)
        this.showItemEditor(index)
      })
    })

    // Add event listeners for delete item buttons
    const deleteButtons = adminContent.querySelectorAll(".admin-delete-btn")
    deleteButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number.parseInt(button.dataset.index)
        this.deleteItem(index)
      })
    })
  }

  // Create header editor
  createHeaderEditor() {
    const header = contentLoader.content.header

    return `
      <div class="admin-header">
        <h2 class="admin-title">Edit Header</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-section">
        <button class="btn admin-cancel-btn" id="admin-back">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        
        <div class="admin-form-group">
          <label class="admin-label" for="header-logo">Logo URL:</label>
          <input type="text" id="header-logo" class="admin-input" value="${header.logo}">
        </div>
        
        <h3 class="admin-section-title">Menu Items</h3>
        <button class="btn admin-add-btn" id="admin-add-item">
          <i class="fas fa-plus"></i> Add Menu Item
        </button>
        
        <div id="menu-items">
          ${header.menuItems
            .map(
              (item, index) => `
            <div class="admin-item">
              <div class="admin-item-header">
                <span class="admin-item-title">${item.text}</span>
                <div class="admin-item-actions">
                  <button class="admin-edit-btn" data-index="${index}">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="admin-delete-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div class="admin-button-group">
          <button class="btn admin-save-btn" id="admin-save">Save Changes</button>
        </div>
      </div>
    `
  }

  // Create hero editor
  createHeroEditor() {
    const hero = contentLoader.content.hero

    return `
      <div class="admin-header">
        <h2 class="admin-title">Edit Hero</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-section">
        <button class="btn admin-cancel-btn" id="admin-back">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        
        <div class="admin-form-group">
          <label class="admin-label" for="hero-bg">Background Image URL:</label>
          <input type="text" id="hero-bg" class="admin-input" value="${hero.backgroundImage}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="hero-title">Title:</label>
          <input type="text" id="hero-title" class="admin-input" value="${hero.title}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="hero-subtitle">Subtitle:</label>
          <input type="text" id="hero-subtitle" class="admin-input" value="${hero.subtitle}">
        </div>
        
        <h3 class="admin-section-title">Buttons</h3>
        <button class="btn admin-add-btn" id="admin-add-item">
          <i class="fas fa-plus"></i> Add Button
        </button>
        
        <div id="hero-buttons">
          ${hero.buttons
            .map(
              (button, index) => `
            <div class="admin-item">
              <div class="admin-item-header">
                <span class="admin-item-title">${button.text}</span>
                <div class="admin-item-actions">
                  <button class="admin-edit-btn" data-index="${index}">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="admin-delete-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div class="admin-button-group">
          <button class="btn admin-save-btn" id="admin-save">Save Changes</button>
        </div>
      </div>
    `
  }

  // Create about editor
  createAboutEditor() {
    const about = contentLoader.content.about

    return `
      <div class="admin-header">
        <h2 class="admin-title">Edit About</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-section">
        <button class="btn admin-cancel-btn" id="admin-back">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        
        <div class="admin-form-group">
          <label class="admin-label" for="about-title">Title:</label>
          <input type="text" id="about-title" class="admin-input" value="${about.title}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="about-subtitle">Subtitle:</label>
          <input type="text" id="about-subtitle" class="admin-input" value="${about.subtitle}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="about-image">Image URL:</label>
          <input type="text" id="about-image" class="admin-input" value="${about.image}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="about-content">Content (HTML):</label>
          <textarea id="about-content" class="admin-textarea">${about.content}</textarea>
        </div>
        
        <div class="admin-button-group">
          <button class="btn admin-save-btn" id="admin-save">Save Changes</button>
        </div>
      </div>
    `
  }

  // Create services editor
  createServicesEditor() {
    const services = contentLoader.content.services

    return `
      <div class="admin-header">
        <h2 class="admin-title">Edit Services</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-section">
        <button class="btn admin-cancel-btn" id="admin-back">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        
        <div class="admin-form-group">
          <label class="admin-label" for="services-title">Title:</label>
          <input type="text" id="services-title" class="admin-input" value="${services.title}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="services-subtitle">Subtitle:</label>
          <input type="text" id="services-subtitle" class="admin-input" value="${services.subtitle}">
        </div>
        
        <h3 class="admin-section-title">Service Items</h3>
        <button class="btn admin-add-btn" id="admin-add-item">
          <i class="fas fa-plus"></i> Add Service
        </button>
        
        <div id="service-items">
          ${services.items
            .map(
              (item, index) => `
            <div class="admin-item">
              <div class="admin-item-header">
                <span class="admin-item-title">${item.title}</span>
                <div class="admin-item-actions">
                  <button class="admin-edit-btn" data-index="${index}">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="admin-delete-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div class="admin-button-group">
          <button class="btn admin-save-btn" id="admin-save">Save Changes</button>
        </div>
      </div>
    `
  }

  // Create events editor
  createEventsEditor() {
    const events = contentLoader.content.events

    return `
      <div class="admin-header">
        <h2 class="admin-title">Edit Events</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-section">
        <button class="btn admin-cancel-btn" id="admin-back">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        
        <div class="admin-form-group">
          <label class="admin-label" for="events-title">Title:</label>
          <input type="text" id="events-title" class="admin-input" value="${events.title}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="events-subtitle">Subtitle:</label>
          <input type="text" id="events-subtitle" class="admin-input" value="${events.subtitle}">
        </div>
        
        <h3 class="admin-section-title">Event Items</h3>
        <button class="btn admin-add-btn" id="admin-add-item">
          <i class="fas fa-plus"></i> Add Event
        </button>
        
        <div id="event-items">
          ${events.items
            .map(
              (item, index) => `
            <div class="admin-item">
              <div class="admin-item-header">
                <span class="admin-item-title">${item.title}</span>
                <div class="admin-item-actions">
                  <button class="admin-edit-btn" data-index="${index}">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="admin-delete-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div class="admin-button-group">
          <button class="btn admin-save-btn" id="admin-save">Save Changes</button>
        </div>
      </div>
    `
  }

  // Create connect editor
  createConnectEditor() {
    const connect = contentLoader.content.connect

    return `
      <div class="admin-header">
        <h2 class="admin-title">Edit Connect</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-section">
        <button class="btn admin-cancel-btn" id="admin-back">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        
        <div class="admin-form-group">
          <label class="admin-label" for="connect-title">Title:</label>
          <input type="text" id="connect-title" class="admin-input" value="${connect.title}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="connect-subtitle">Subtitle:</label>
          <input type="text" id="connect-subtitle" class="admin-input" value="${connect.subtitle}">
        </div>
        
        <h3 class="admin-section-title">Connect Options</h3>
        <button class="btn admin-add-btn" id="admin-add-item">
          <i class="fas fa-plus"></i> Add Option
        </button>
        
        <div id="connect-options">
          ${connect.options
            .map(
              (option, index) => `
            <div class="admin-item">
              <div class="admin-item-header">
                <span class="admin-item-title">${option.title}</span>
                <div class="admin-item-actions">
                  <button class="admin-edit-btn" data-index="${index}">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="admin-delete-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div class="admin-button-group">
          <button class="btn admin-save-btn" id="admin-save">Save Changes</button>
        </div>
      </div>
    `
  }

  // Create giving editor
  createGivingEditor() {
    const giving = contentLoader.content.giving

    return `
      <div class="admin-header">
        <h2 class="admin-title">Edit Giving</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-section">
        <button class="btn admin-cancel-btn" id="admin-back">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        
        <div class="admin-form-group">
          <label class="admin-label" for="giving-title">Title:</label>
          <input type="text" id="giving-title" class="admin-input" value="${giving.title}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="giving-subtitle">Subtitle:</label>
          <input type="text" id="giving-subtitle" class="admin-input" value="${giving.subtitle}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="giving-content">Content:</label>
          <textarea id="giving-content" class="admin-textarea">${giving.content}</textarea>
        </div>
        
        <h3 class="admin-section-title">Giving Options</h3>
        <button class="btn admin-add-btn" id="admin-add-item">
          <i class="fas fa-plus"></i> Add Option
        </button>
        
        <div id="giving-options">
          ${giving.options
            .map(
              (option, index) => `
            <div class="admin-item">
              <div class="admin-item-header">
                <span class="admin-item-title">${option.title}</span>
                <div class="admin-item-actions">
                  <button class="admin-edit-btn" data-index="${index}">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="admin-delete-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div class="admin-button-group">
          <button class="btn admin-save-btn" id="admin-save">Save Changes</button>
        </div>
      </div>
    `
  }

  // Create footer editor
  createFooterEditor() {
    const footer = contentLoader.content.footer

    return `
      <div class="admin-header">
        <h2 class="admin-title">Edit Footer</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-section">
        <button class="btn admin-cancel-btn" id="admin-back">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        
        <div class="admin-form-group">
          <label class="admin-label" for="footer-logo">Logo URL:</label>
          <input type="text" id="footer-logo" class="admin-input" value="${footer.logo}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="footer-about">About Text:</label>
          <textarea id="footer-about" class="admin-textarea">${footer.about}</textarea>
        </div>
        
        <h3 class="admin-section-title">Contact Information</h3>
        
        <div class="admin-form-group">
          <label class="admin-label" for="footer-address">Address:</label>
          <input type="text" id="footer-address" class="admin-input" value="${footer.contact.address}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="footer-phone">Phone:</label>
          <input type="text" id="footer-phone" class="admin-input" value="${footer.contact.phone}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="footer-email">Email:</label>
          <input type="email" id="footer-email" class="admin-input" value="${footer.contact.email}">
        </div>
        
        <h3 class="admin-section-title">Quick Links</h3>
        <button class="btn admin-add-btn" id="admin-add-item" data-type="quickLinks">
          <i class="fas fa-plus"></i> Add Quick Link
        </button>
        
        <div id="quick-links">
          ${footer.quickLinks
            .map(
              (link, index) => `
            <div class="admin-item">
              <div class="admin-item-header">
                <span class="admin-item-title">${link.text}</span>
                <div class="admin-item-actions">
                  <button class="admin-edit-btn" data-index="${index}" data-type="quickLinks">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="admin-delete-btn" data-index="${index}" data-type="quickLinks">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <h3 class="admin-section-title">Social Links</h3>
        <button class="btn admin-add-btn" id="admin-add-item" data-type="socialLinks">
          <i class="fas fa-plus"></i> Add Social Link
        </button>
        
        <div id="social-links">
          ${footer.socialLinks
            .map(
              (link, index) => `
            <div class="admin-item">
              <div class="admin-item-header">
                <span class="admin-item-title"><i class="${link.icon}"></i> ${link.url}</span>
                <div class="admin-item-actions">
                  <button class="admin-edit-btn" data-index="${index}" data-type="socialLinks">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="admin-delete-btn" data-index="${index}" data-type="socialLinks">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="footer-copyright">Copyright Text:</label>
          <input type="text" id="footer-copyright" class="admin-input" value="${footer.copyright}">
        </div>
        
        <div class="admin-button-group">
          <button class="btn admin-save-btn" id="admin-save">Save Changes</button>
        </div>
      </div>
    `
  }

  // Show item editor
  showItemEditor(index = null) {
    // Check if user is admin
    if (!auth.isAdmin) {
      this.showNotification("You are not authorized to edit content.", "error")
      return
    }

    // Set editing item
    this.editingItem = index !== null ? index : null

    // Get admin content element
    const adminContent = document.querySelector(".admin-content")
    if (!adminContent) return

    // Get item data
    let item = null
    let itemType = ""

    switch (this.currentSection) {
      case "header":
        itemType = "menuItem"
        item = index !== null ? contentLoader.content.header.menuItems[index] : { text: "", url: "" }
        break
      case "hero":
        itemType = "button"
        item = index !== null ? contentLoader.content.hero.buttons[index] : { text: "", url: "", primary: true }
        break
      case "services":
        itemType = "service"
        item =
          index !== null
            ? contentLoader.content.services.items[index]
            : { title: "", image: "", description: "", button: { text: "", url: "" } }
        break
      case "events":
        itemType = "event"
        item =
          index !== null
            ? contentLoader.content.events.items[index]
            : { title: "", image: "", date: "", description: "", button: { text: "", url: "" } }
        break
      case "connect":
        itemType = "connectOption"
        item =
          index !== null
            ? contentLoader.content.connect.options[index]
            : { title: "", icon: "", description: "", button: { text: "", url: "" } }
        break
      case "giving":
        itemType = "givingOption"
        item =
          index !== null
            ? contentLoader.content.giving.options[index]
            : { title: "", icon: "", description: "", content: "", button: { text: "", url: "" } }
        break
      case "footer":
        // Handle footer items separately
        if (adminContent.querySelector('#admin-add-item[data-type="quickLinks"]')) {
          itemType = "quickLink"
          item = index !== null ? contentLoader.content.footer.quickLinks[index] : { text: "", url: "" }
        } else if (adminContent.querySelector('#admin-add-item[data-type="socialLinks"]')) {
          itemType = "socialLink"
          item = index !== null ? contentLoader.content.footer.socialLinks[index] : { icon: "", url: "" }
        }
        break
      default:
        this.showNotification("Invalid section.", "error")
        return
    }

    // Create item editor based on item type
    let html = ""

    switch (itemType) {
      case "menuItem":
        html = this.createMenuItemEditor(item, index)
        break
      case "button":
        html = this.createButtonEditor(item, index)
        break
      case "service":
        html = this.createServiceEditor(item, index)
        break
      case "event":
        html = this.createEventEditor(item, index)
        break
      case "connectOption":
        html = this.createConnectOptionEditor(item, index)
        break
      case "givingOption":
        html = this.createGivingOptionEditor(item, index)
        break
      case "quickLink":
        html = this.createQuickLinkEditor(item, index)
        break
      case "socialLink":
        html = this.createSocialLinkEditor(item, index)
        break
      default:
        html = "<p>Invalid item type.</p>"
    }

    // Update admin content
    adminContent.innerHTML = html

    // Add event listeners for back button
    const backButton = adminContent.querySelector("#admin-back")
    if (backButton) {
      backButton.addEventListener("click", () => {
        this.showSectionEditor(this.currentSection)
      })
    }

    // Add event listeners for save button
    const saveButton = adminContent.querySelector("#admin-save-item")
    if (saveButton) {
      saveButton.addEventListener("click", () => {
        this.saveItem()
      })
    }
  }

  // Create menu item editor
  createMenuItemEditor(item, index) {
    return `
      <div class="admin-header">
        <h2 class="admin-title">${index !== null ? "Edit" : "Add"} Menu Item</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-section">
        <button class="btn admin-cancel-btn" id="admin-back">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        
        <div class="admin-form-group">
          <label class="admin-label" for="menu-item-text">Text:</label>
          <input type="text" id="menu-item-text" class="admin-input" value="${item.text}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="menu-item-url">URL:</label>
          <input type="text" id="menu-item-url" class="admin-input" value="${item.url}">
        </div>
        
        <div class="admin-button-group">
          <button class="btn admin-save-btn" id="admin-save-item">Save</button>
        </div>
      </div>
    `
  }

  // Create button editor
  createButtonEditor(item, index) {
    return `
      <div class="admin-header">
        <h2 class="admin-title">${index !== null ? "Edit" : "Add"} Button</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-section">
        <button class="btn admin-cancel-btn" id="admin-back">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        
        <div class="admin-form-group">
          <label class="admin-label" for="button-text">Text:</label>
          <input type="text" id="button-text" class="admin-input" value="${item.text}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="button-url">URL:</label>
          <input type="text" id="button-url" class="admin-input" value="${item.url}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="button-primary">Primary Button:</label>
          <select id="button-primary" class="admin-select">
            <option value="true" ${item.primary ? "selected" : ""}>Yes</option>
            <option value="false" ${!item.primary ? "selected" : ""}>No</option>
          </select>
        </div>
        
        <div class="admin-button-group">
          <button class="btn admin-save-btn" id="admin-save-item">Save</button>
        </div>
      </div>
    `
  }

  // Create service editor
  createServiceEditor(item, index) {
    return `
      <div class="admin-header">
        <h2 class="admin-title">${index !== null ? "Edit" : "Add"} Service</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-section">
        <button class="btn admin-cancel-btn" id="admin-back">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        
        <div class="admin-form-group">
          <label class="admin-label" for="service-title">Title:</label>
          <input type="text" id="service-title" class="admin-input" value="${item.title}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="service-image">Image URL:</label>
          <input type="text" id="service-image" class="admin-input" value="${item.image}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="service-description">Description:</label>
          <textarea id="service-description" class="admin-textarea">${item.description}</textarea>
        </div>
        
        <h3 class="admin-section-title">Button</h3>
        
        <div class="admin-form-group">
          <label class="admin-label" for="service-button-text">Button Text:</label>
          <input type="text" id="service-button-text" class="admin-input" value="${item.button.text}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="service-button-url">Button URL:</label>
          <input type="text" id="service-button-url" class="admin-input" value="${item.button.url}">
        </div>
        
        <div class="admin-button-group">
          <button class="btn admin-save-btn" id="admin-save-item">Save</button>
        </div>
      </div>
    `
  }

  // Create event editor
  createEventEditor(item, index) {
    return `
      <div class="admin-header">
        <h2 class="admin-title">${index !== null ? "Edit" : "Add"} Event</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-section">
        <button class="btn admin-cancel-btn" id="admin-back">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        
        <div class="admin-form-group">
          <label class="admin-label" for="event-title">Title:</label>
          <input type="text" id="event-title" class="admin-input" value="${item.title}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="event-image">Image URL:</label>
          <input type="text" id="event-image" class="admin-input" value="${item.image}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="event-date">Date:</label>
          <input type="text" id="event-date" class="admin-input" value="${item.date}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="event-description">Description:</label>
          <textarea id="event-description" class="admin-textarea">${item.description}</textarea>
        </div>
        
        <h3 class="admin-section-title">Button</h3>
        
        <div class="admin-form-group">
          <label class="admin-label" for="event-button-text">Button Text:</label>
          <input type="text" id="event-button-text" class="admin-input" value="${item.button.text}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="event-button-url">Button URL:</label>
          <input type="text" id="event-button-url" class="admin-input" value="${item.button.url}">
        </div>
        
        <div class="admin-button-group">
          <button class="btn admin-save-btn" id="admin-save-item">Save</button>
        </div>
      </div>
    `
  }

  // Create connect option editor
  createConnectOptionEditor(item, index) {
    return `
      <div class="admin-header">
        <h2 class="admin-title">${index !== null ? "Edit" : "Add"} Connect Option</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-section">
        <button class="btn admin-cancel-btn" id="admin-back">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        
        <div class="admin-form-group">
          <label class="admin-label" for="connect-option-title">Title:</label>
          <input type="text" id="connect-option-title" class="admin-input" value="${item.title}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="connect-option-icon">Icon Class (Font Awesome):</label>
          <input type="text" id="connect-option-icon" class="admin-input" value="${item.icon}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="connect-option-description">Description:</label>
          <textarea id="connect-option-description" class="admin-textarea">${item.description}</textarea>
        </div>
        
        <h3 class="admin-section-title">Button</h3>
        
        <div class="admin-form-group">
          <label class="admin-label" for="connect-option-button-text">Button Text:</label>
          <input type="text" id="connect-option-button-text" class="admin-input" value="${item.button.text}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="connect-option-button-url">Button URL:</label>
          <input type="text" id="connect-option-button-url" class="admin-input" value="${item.button.url}">
        </div>
        
        <div class="admin-button-group">
          <button class="btn admin-save-btn" id="admin-save-item">Save</button>
        </div>
      </div>
    `
  }

  // Create giving option editor
  createGivingOptionEditor(item, index) {
    return `
      <div class="admin-header">
        <h2 class="admin-title">${index !== null ? "Edit" : "Add"} Giving Option</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-section">
        <button class="btn admin-cancel-btn" id="admin-back">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        
        <div class="admin-form-group">
          <label class="admin-label" for="giving-option-title">Title:</label>
          <input type="text" id="giving-option-title" class="admin-input" value="${item.title}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="giving-option-icon">Icon Class (Font Awesome):</label>
          <input type="text" id="giving-option-icon" class="admin-input" value="${item.icon}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="giving-option-description">Description:</label>
          <textarea id="giving-option-description" class="admin-textarea">${item.description}</textarea>
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="giving-option-content">Additional Content (HTML):</label>
          <textarea id="giving-option-content" class="admin-textarea">${item.content || ""}</textarea>
        </div>
        
        <h3 class="admin-section-title">Button (Optional)</h3>
        
        <div class="admin-form-group">
          <label class="admin-label" for="giving-option-button-text">Button Text:</label>
          <input type="text" id="giving-option-button-text" class="admin-input" value="${item.button ? item.button.text : ""}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="giving-option-button-url">Button URL:</label>
          <input type="text" id="giving-option-button-url" class="admin-input" value="${item.button ? item.button.url : ""}">
        </div>
        
        <div class="admin-button-group">
          <button class="btn admin-save-btn" id="admin-save-item">Save</button>
        </div>
      </div>
    `
  }

  // Create quick link editor
  createQuickLinkEditor(item, index) {
    return `
      <div class="admin-header">
        <h2 class="admin-title">${index !== null ? "Edit" : "Add"} Quick Link</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-section">
        <button class="btn admin-cancel-btn" id="admin-back">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        
        <div class="admin-form-group">
          <label class="admin-label" for="quick-link-text">Text:</label>
          <input type="text" id="quick-link-text" class="admin-input" value="${item.text}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="quick-link-url">URL:</label>
          <input type="text" id="quick-link-url" class="admin-input" value="${item.url}">
        </div>
        
        <div class="admin-button-group">
          <button class="btn admin-save-btn" id="admin-save-item">Save</button>
        </div>
      </div>
    `
  }

  // Create social link editor
  createSocialLinkEditor(item, index) {
    return `
      <div class="admin-header">
        <h2 class="admin-title">${index !== null ? "Edit" : "Add"} Social Link</h2>
        <button class="admin-close" id="admin-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="admin-section">
        <button class="btn admin-cancel-btn" id="admin-back">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        
        <div class="admin-form-group">
          <label class="admin-label" for="social-link-icon">Icon Class (Font Awesome):</label>
          <input type="text" id="social-link-icon" class="admin-input" value="${item.icon}">
        </div>
        
        <div class="admin-form-group">
          <label class="admin-label" for="social-link-url">URL:</label>
          <input type="text" id="social-link-url" class="admin-input" value="${item.url}">
        </div>
        
        <div class="admin-button-group">
          <button class="btn admin-save-btn" id="admin-save-item">Save</button>
        </div>
      </div>
    `
  }

  // Save section
  async saveSection() {
    // Check if user is admin
    if (!auth.isAdmin) {
      this.showNotification("You are not authorized to edit content.", "error")
      return
    }

    try {
      // Create a copy of the content
      const newContent = JSON.parse(JSON.stringify(contentLoader.content))

      // Update content based on section
      switch (this.currentSection) {
        case "header":
          newContent.header.logo = document.getElementById("header-logo").value
          break
        case "hero":
          newContent.hero.backgroundImage = document.getElementById("hero-bg").value
          newContent.hero.title = document.getElementById("hero-title").value
          newContent.hero.subtitle = document.getElementById("hero-subtitle").value
          break
        case "about":
          newContent.about.title = document.getElementById("about-title").value
          newContent.about.subtitle = document.getElementById("about-subtitle").value
          newContent.about.image = document.getElementById("about-image").value
          newContent.about.content = document.getElementById("about-content").value
          break
        case "services":
          newContent.services.title = document.getElementById("services-title").value
          newContent.services.subtitle = document.getElementById("services-subtitle").value
          break
        case "events":
          newContent.events.title = document.getElementById("events-title").value
          newContent.events.subtitle = document.getElementById("events-subtitle").value
          break
        case "connect":
          newContent.connect.title = document.getElementById("connect-title").value
          newContent.connect.subtitle = document.getElementById("connect-subtitle").value
          break
        case "giving":
          newContent.giving.title = document.getElementById("giving-title").value
          newContent.giving.subtitle = document.getElementById("giving-subtitle").value
          newContent.giving.content = document.getElementById("giving-content").value
          break
        case "footer":
          newContent.footer.logo = document.getElementById("footer-logo").value
          newContent.footer.about = document.getElementById("footer-about").value
          newContent.footer.contact.address = document.getElementById("footer-address").value
          newContent.footer.contact.phone = document.getElementById("footer-phone").value
          newContent.footer.contact.email = document.getElementById("footer-email").value
          newContent.footer.copyright = document.getElementById("footer-copyright").value
          break
        default:
          this.showNotification("Invalid section.", "error")
          return
      }

      // Save content
      await contentLoader.saveContent(newContent)

      // Show success notification
      this.showNotification("Content saved successfully.", "success")

      // Reload admin panel
      this.openAdminPanel()
    } catch (error) {
      console.error("Error saving content:", error)
      this.showNotification("Error saving content. Please try again.", "error")
    }
  }

  // Save item
  async saveItem() {
    // Check if user is admin
    if (!auth.isAdmin) {
      this.showNotification("You are not authorized to edit content.", "error")
      return
    }

    try {
      // Create a copy of the content
      const newContent = JSON.parse(JSON.stringify(contentLoader.content))

      // Update content based on section and item type
      switch (this.currentSection) {
        case "header":
          const menuItem = {
            text: document.getElementById("menu-item-text").value,
            url: document.getElementById("menu-item-url").value,
          }

          if (this.editingItem !== null) {
            newContent.header.menuItems[this.editingItem] = menuItem
          } else {
            newContent.header.menuItems.push(menuItem)
          }
          break
        case "hero":
          const button = {
            text: document.getElementById("button-text").value,
            url: document.getElementById("button-url").value,
            primary: document.getElementById("button-primary").value === "true",
          }

          if (this.editingItem !== null) {
            newContent.hero.buttons[this.editingItem] = button
          } else {
            newContent.hero.buttons.push(button)
          }
          break
        case "services":
          const service = {
            title: document.getElementById("service-title").value,
            image: document.getElementById("service-image").value,
            description: document.getElementById("service-description").value,
            button: {
              text: document.getElementById("service-button-text").value,
              url: document.getElementById("service-button-url").value,
            },
          }

          if (this.editingItem !== null) {
            newContent.services.items[this.editingItem] = service
          } else {
            newContent.services.items.push(service)
          }
          break
        case "events":
          const event = {
            title: document.getElementById("event-title").value,
            image: document.getElementById("event-image").value,
            date: document.getElementById("event-date").value,
            description: document.getElementById("event-description").value,
            button: {
              text: document.getElementById("event-button-text").value,
              url: document.getElementById("event-button-url").value,
            },
          }

          if (this.editingItem !== null) {
            newContent.events.items[this.editingItem] = event
          } else {
            newContent.events.items.push(event)
          }
          break
        case "connect":
          const connectOption = {
            title: document.getElementById("connect-option-title").value,
            icon: document.getElementById("connect-option-icon").value,
            description: document.getElementById("connect-option-description").value,
            button: {
              text: document.getElementById("connect-option-button-text").value,
              url: document.getElementById("connect-option-button-url").value,
            },
          }

          if (this.editingItem !== null) {
            newContent.connect.options[this.editingItem] = connectOption
          } else {
            newContent.connect.options.push(connectOption)
          }
          break
        case "giving":
          const givingOption = {
            title: document.getElementById("giving-option-title").value,
            icon: document.getElementById("giving-option-icon").value,
            description: document.getElementById("giving-option-description").value,
            content: document.getElementById("giving-option-content").value,
          }

          // Add button if text and URL are provided
          const buttonText = document.getElementById("giving-option-button-text").value
          const buttonUrl = document.getElementById("giving-option-button-url").value

          if (buttonText && buttonUrl) {
            givingOption.button = {
              text: buttonText,
              url: buttonUrl,
            }
          }

          if (this.editingItem !== null) {
            newContent.giving.options[this.editingItem] = givingOption
          } else {
            newContent.giving.options.push(givingOption)
          }
          break
        case "footer":
          // Handle footer items separately
          if (document.getElementById("quick-link-text")) {
            const quickLink = {
              text: document.getElementById("quick-link-text").value,
              url: document.getElementById("quick-link-url").value,
            }

            if (this.editingItem !== null) {
              newContent.footer.quickLinks[this.editingItem] = quickLink
            } else {
              newContent.footer.quickLinks.push(quickLink)
            }
          } else if (document.getElementById("social-link-icon")) {
            const socialLink = {
              icon: document.getElementById("social-link-icon").value,
              url: document.getElementById("social-link-url").value,
            }

            if (this.editingItem !== null) {
              newContent.footer.socialLinks[this.editingItem] = socialLink
            } else {
              newContent.footer.socialLinks.push(socialLink)
            }
          }
          break
        default:
          this.showNotification("Invalid section.", "error")
          return
      }

      // Save content
      await contentLoader.saveContent(newContent)

      // Show success notification
      this.showNotification("Item saved successfully.", "success")

      // Show section editor
      this.showSectionEditor(this.currentSection)
    } catch (error) {
      console.error("Error saving item:", error)
      this.showNotification("Error saving item. Please try again.", "error")
    }
  }

  // Delete item
  async deleteItem(index) {
    // Check if user is admin
    if (!auth.isAdmin) {
      this.showNotification("You are not authorized to delete content.", "error")
      return
    }

    // Confirm deletion
    if (!confirm("Are you sure you want to delete this item?")) {
      return
    }

    try {
      // Create a copy of the content
      const newContent = JSON.parse(JSON.stringify(contentLoader.content))

      // Delete item based on section
      switch (this.currentSection) {
        case "header":
          newContent.header.menuItems.splice(index, 1)
          break
        case "hero":
          newContent.hero.buttons.splice(index, 1)
          break
        case "services":
          newContent.services.items.splice(index, 1)
          break
        case "events":
          newContent.events.items.splice(index, 1)
          break
        case "connect":
          newContent.connect.options.splice(index, 1)
          break
        case "giving":
          newContent.giving.options.splice(index, 1)
          break
        case "footer":
          // Handle footer items separately
          const deleteButton = document.querySelector(`.admin-delete-btn[data-index="${index}"]`)
          if (deleteButton) {
            const type = deleteButton.dataset.type

            if (type === "quickLinks") {
              newContent.footer.quickLinks.splice(index, 1)
            } else if (type === "socialLinks") {
              newContent.footer.socialLinks.splice(index, 1)
            }
          }
          break
        default:
          this.showNotification("Invalid section.", "error")
          return
      }

      // Save content
      await contentLoader.saveContent(newContent)

      // Show success notification
      this.showNotification("Item deleted successfully.", "success")

      // Show section editor
      this.showSectionEditor(this.currentSection)
    } catch (error) {
      console.error("Error deleting item:", error)
      this.showNotification("Error deleting item. Please try again.", "error")
    }
  }

  // Show notification
  showNotification(message, type = "success") {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message

    // Add notification to body
    document.body.appendChild(notification)

    // Show notification
    setTimeout(() => {
      notification.classList.add("show")
    }, 10)

    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show")

      // Remove notification after animation
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }
}

// Create admin instance
const admin = new Admin()
