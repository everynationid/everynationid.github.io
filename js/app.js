// Import necessary modules (assuming these are defined elsewhere)
import * as contentLoader from "./contentLoader.js"
import * as auth from "./auth.js"
import * as config from "./config.js"

// Main application script
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Initialize GitHub repository information
    initGitHubInfo()

    // Load content
    await contentLoader.loadContent()

    // Check if user is authenticated
    if (auth.isAuthenticated) {
      // Check if user is admin
      if (auth.isAdmin) {
        // Show admin button
        const adminButton = document.getElementById("admin-button")
        if (adminButton) {
          adminButton.classList.remove("hidden")
        }
      }
    }
  } catch (error) {
    console.error("Error initializing application:", error)
  }
})

// Initialize GitHub repository information
function initGitHubInfo() {
  // Get repository information from URL
  const url = window.location.href

  // Check if URL contains github.io
  if (url.includes("github.io")) {
    // Extract username and repository name from URL
    // Format: https://username.github.io/repository/
    const match = url.match(/https?:\/\/([^.]+)\.github\.io\/([^/]+)/)

    if (match && match.length === 3) {
      const username = match[1]
      const repository = match[2]

      // Update GitHub configuration
      config.github.owner = username
      config.github.repo = repository

      console.log(`GitHub repository detected: ${username}/${repository}`)
    }
  }
}

// Handle smooth scrolling for anchor links
document.addEventListener("click", (event) => {
  const target = event.target

  // Check if clicked element is an anchor link
  if (target.tagName === "A" && target.getAttribute("href").startsWith("#")) {
    // Prevent default behavior
    event.preventDefault()

    // Get target element
    const targetId = target.getAttribute("href").substring(1)
    const targetElement = document.getElementById(targetId)

    // Scroll to target element
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80, // Adjust for header height
        behavior: "smooth",
      })

      // Close mobile menu if open
      const navMenu = document.querySelector(".nav-menu")
      const mobileMenuBtn = document.querySelector(".mobile-menu-btn")

      if (navMenu && navMenu.classList.contains("active")) {
        navMenu.classList.remove("active")
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>'
      }
    }
  }
})

// Handle scroll events
window.addEventListener("scroll", () => {
  // Get header element
  const header = document.getElementById("header")

  // Add/remove class based on scroll position
  if (window.scrollY > 50) {
    header.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)"
  } else {
    header.style.boxShadow = "none"
  }
})
