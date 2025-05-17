// Content loader module
class ContentLoader {
  constructor() {
    this.content = null
    this.isLoaded = false
  }

  // Load content from GitHub or localStorage
  async loadContent() {
    try {
      // Try to load content from localStorage first (for offline support)
      const cachedContent = localStorage.getItem("siteContent")
      if (cachedContent) {
        this.content = JSON.parse(cachedContent)
        this.isLoaded = true
        this.renderContent()
      }

      // Try to fetch content.json from GitHub
      const response = await fetch(
        `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${config.github.contentFile}?ref=${config.github.branch}`,
      )

      if (response.ok) {
        const data = await response.json()
        const content = atob(data.content)
        this.content = JSON.parse(content)

        // Cache content in localStorage
        localStorage.setItem("siteContent", content)
      } else {
        // If file doesn't exist, use default content
        this.content = config.defaultContent
        console.log("Content file not found. Using default content.")
      }

      this.isLoaded = true
      this.renderContent()
      return this.content
    } catch (error) {
      console.error("Error loading content:", error)

      // If error, use default content
      this.content = config.defaultContent
      this.isLoaded = true
      this.renderContent()
      return this.content
    }
  }

  // Render content to the page
  renderContent() {
    if (!this.isLoaded || !this.content) {
      return
    }

    // Render header
    this.renderHeader()

    // Render hero section
    this.renderHero()

    // Render about section
    this.renderAbout()

    // Render services section
    this.renderServices()

    // Render events section
    this.renderEvents()

    // Render connect section
    this.renderConnect()

    // Render giving section
    this.renderGiving()

    // Render footer
    this.renderFooter()
  }

  // Render header
  renderHeader() {
    const header = document.getElementById("header")
    if (!header || !this.content.header) return

    header.innerHTML = `
      <div class="container header-container">
        <div class="logo">
          <a href="#hero">
            <img src="${this.content.header.logo}" alt="${config.siteName}">
          </a>
        </div>
        <nav>
          <ul class="nav-menu">
            ${this.content.header.menuItems
              .map(
                (item) => `
              <li class="nav-item">
                <a href="${item.url}" class="nav-link">${item.text}</a>
              </li>
            `,
              )
              .join("")}
          </ul>
          <button class="mobile-menu-btn">
            <i class="fas fa-bars"></i>
          </button>
        </nav>
      </div>
    `

    // Add event listener for mobile menu
    const mobileMenuBtn = header.querySelector(".mobile-menu-btn")
    const navMenu = header.querySelector(".nav-menu")

    if (mobileMenuBtn && navMenu) {
      mobileMenuBtn.addEventListener("click", () => {
        navMenu.classList.toggle("active")
        mobileMenuBtn.innerHTML = navMenu.classList.contains("active")
          ? '<i class="fas fa-times"></i>'
          : '<i class="fas fa-bars"></i>'
      })
    }
  }

  // Render hero section
  renderHero() {
    const hero = document.getElementById("hero")
    if (!hero || !this.content.hero) return

    hero.style.backgroundImage = `url(${this.content.hero.backgroundImage})`

    hero.innerHTML = `
      <div class="hero-overlay"></div>
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">${this.content.hero.title}</h1>
          <p class="hero-subtitle">${this.content.hero.subtitle}</p>
          <div class="hero-buttons">
            ${this.content.hero.buttons
              .map(
                (button) => `
              <a href="${button.url}" class="btn ${button.primary ? "" : "btn-secondary"}">${button.text}</a>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `
  }

  // Render about section
  renderAbout() {
    const about = document.getElementById("about")
    if (!about || !this.content.about) return

    about.innerHTML = `
      <div class="container">
        <h2 class="section-title">${this.content.about.title}</h2>
        <p class="section-subtitle">${this.content.about.subtitle}</p>
        <div class="about-content">
          <div class="about-image">
            <img src="${this.content.about.image}" alt="${this.content.about.title}">
          </div>
          <div class="about-text">
            ${this.content.about.content}
          </div>
        </div>
      </div>
    `
  }

  // Render services section
  renderServices() {
    const services = document.getElementById("services")
    if (!services || !this.content.services) return

    services.innerHTML = `
      <div class="container">
        <h2 class="section-title">${this.content.services.title}</h2>
        <p class="section-subtitle">${this.content.services.subtitle}</p>
        <div class="services-grid">
          ${this.content.services.items
            .map(
              (item) => `
            <div class="service-card">
              <div class="service-image">
                <img src="${item.image}" alt="${item.title}">
              </div>
              <div class="service-content">
                <h3 class="service-title">${item.title}</h3>
                <p class="service-description">${item.description}</p>
                <a href="${item.button.url}" class="btn">${item.button.text}</a>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `
  }

  // Render events section
  renderEvents() {
    const events = document.getElementById("events")
    if (!events || !this.content.events) return

    events.innerHTML = `
      <div class="container">
        <h2 class="section-title">${this.content.events.title}</h2>
        <p class="section-subtitle">${this.content.events.subtitle}</p>
        <div class="events-grid">
          ${this.content.events.items
            .map(
              (item) => `
            <div class="event-card">
              <div class="event-image">
                <img src="${item.image}" alt="${item.title}">
              </div>
              <div class="event-content">
                <span class="event-date">${item.date}</span>
                <h3 class="event-title">${item.title}</h3>
                <p class="event-description">${item.description}</p>
                <a href="${item.button.url}" class="btn">${item.button.text}</a>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `
  }

  // Render connect section
  renderConnect() {
    const connect = document.getElementById("connect")
    if (!connect || !this.content.connect) return

    connect.innerHTML = `
      <div class="container">
        <div class="connect-content">
          <h2 class="section-title">${this.content.connect.title}</h2>
          <p class="section-subtitle">${this.content.connect.subtitle}</p>
          <div class="connect-options">
            ${this.content.connect.options
              .map(
                (option) => `
              <div class="connect-option">
                <div class="connect-icon">
                  <i class="${option.icon}"></i>
                </div>
                <h3 class="connect-title">${option.title}</h3>
                <p class="connect-description">${option.description}</p>
                <a href="${option.button.url}" class="btn">${option.button.text}</a>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `
  }

  // Render giving section
  renderGiving() {
    const giving = document.getElementById("giving")
    if (!giving || !this.content.giving) return

    giving.innerHTML = `
      <div class="container">
        <div class="giving-content">
          <h2 class="section-title">${this.content.giving.title}</h2>
          <p class="section-subtitle">${this.content.giving.subtitle}</p>
          <p>${this.content.giving.content}</p>
          <div class="giving-options">
            ${this.content.giving.options
              .map(
                (option) => `
              <div class="giving-option">
                <div class="giving-icon">
                  <i class="${option.icon}"></i>
                </div>
                <h3 class="giving-title">${option.title}</h3>
                <p class="giving-description">${option.description}</p>
                ${
                  option.button
                    ? `<a href="${option.button.url}" class="btn">${option.button.text}</a>`
                    : option.content
                      ? `<div class="giving-details">${option.content}</div>`
                      : ""
                }
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `
  }

  // Render footer
  renderFooter() {
    const footer = document.getElementById("footer")
    if (!footer || !this.content.footer) return

    footer.innerHTML = `
      <div class="container">
        <div class="footer-container">
          <div class="footer-about">
            <div class="footer-logo">
              <img src="${this.content.footer.logo}" alt="${config.siteName}">
            </div>
            <p>${this.content.footer.about}</p>
            <div class="social-links">
              ${this.content.footer.socialLinks
                .map(
                  (link) => `
                <a href="${link.url}" class="social-link" target="_blank" rel="noopener noreferrer">
                  <i class="${link.icon}"></i>
                </a>
              `,
                )
                .join("")}
            </div>
          </div>
          <div class="footer-links-container">
            <h3 class="footer-title">Quick Links</h3>
            <ul class="footer-links">
              ${this.content.footer.quickLinks
                .map(
                  (link) => `
                <li class="footer-link">
                  <a href="${link.url}">${link.text}</a>
                </li>
              `,
                )
                .join("")}
            </ul>
          </div>
          <div class="footer-contact">
            <h3 class="footer-title">Contact Us</h3>
            <div class="footer-contact-item">
              <div class="footer-contact-icon">
                <i class="fas fa-map-marker-alt"></i>
              </div>
              <div>${this.content.footer.contact.address}</div>
            </div>
            <div class="footer-contact-item">
              <div class="footer-contact-icon">
                <i class="fas fa-phone"></i>
              </div>
              <div>${this.content.footer.contact.phone}</div>
            </div>
            <div class="footer-contact-item">
              <div class="footer-contact-icon">
                <i class="fas fa-envelope"></i>
              </div>
              <div>${this.content.footer.contact.email}</div>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>${this.content.footer.copyright}</p>
        </div>
      </div>
    `
  }

  // Save content to GitHub
  async saveContent(newContent) {
    if (!auth.isAdmin) {
      throw new Error("Unauthorized")
    }

    try {
      // Convert content to JSON
      const content = JSON.stringify(newContent, null, 2)

      // Encode content to base64
      const encodedContent = btoa(content)

      // Check if file already exists
      let sha = ""
      try {
        const response = await fetch(
          `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${config.github.contentFile}?ref=${config.github.branch}`,
        )
        if (response.ok) {
          const data = await response.json()
          sha = data.sha
        }
      } catch (error) {
        console.log("Content file does not exist yet")
      }

      // Prepare request data
      const requestData = {
        message: "Update website content",
        content: encodedContent,
        branch: config.github.branch,
      }

      // Add sha if file exists
      if (sha) {
        requestData.sha = sha
      }

      // Save file to GitHub
      const response = await fetch(
        `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${config.github.contentFile}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${auth.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to save content")
      }

      // Update local content
      this.content = newContent

      // Cache content in localStorage
      localStorage.setItem("siteContent", content)

      // Render updated content
      this.renderContent()

      return true
    } catch (error) {
      console.error("Error saving content:", error)
      throw error
    }
  }
}

// Create content loader instance
const contentLoader = new ContentLoader()
