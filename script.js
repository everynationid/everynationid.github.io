// Store all locations for search functionality
let allLocations = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Handle redirect from 404.html
    if (sessionStorage.redirect) {
        const path = sessionStorage.redirect;
        delete sessionStorage.redirect;
        window.history.replaceState({}, '', path);
    }

    // Initial load
    await loadFullLayout(window.location.pathname);

    // Handle navigation
    document.addEventListener('click', (event) => {
        // Find closest anchor tag if clicked on a child element
        const link = event.target.closest('a');
        if (!link || link.origin !== window.location.origin) return;
        
        // Remove active class from all links first
        document.querySelectorAll('.main-nav a').forEach(l => l.classList.remove('active'));
        
        // Then add to clicked link
        link.classList.add('active');
        
        // Skip if it's not an internal link
        if (link.origin !== window.location.origin) return;
        
        // Handle hash links specially
        if (link.hash && link.pathname === window.location.pathname) {
            // Let the browser handle the hash scroll naturally
            return;
        }
        
        event.preventDefault();
        const path = link.pathname;
        window.history.pushState({}, '', path + (link.hash || ''));
        loadFullLayout(path);
        
        // Handle hash scrolling after page load
        if (link.hash) {
            setTimeout(() => {
                const element = document.querySelector(link.hash);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    });

    // Setup back to top button
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Service Worker registration
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('sw.js');
            console.log('Service worker registered:', registration);
        } catch (error) {
            console.error('Service worker registration failed:', error);
        }
    }
});

async function loadFullLayout(path) {
    try {
        const response = await fetch('content.json');
        if (!response.ok) throw new Error(`Failed to load content: ${response.status}`);
        const content = await response.json();

        // Get content area reference
        const contentArea = document.querySelector('.content-area');
        if (!contentArea) {
            console.error('Content area element not found');
            return;
        }

        // Show loading indicator
        contentArea.innerHTML = '<div class="loading-spinner"></div>';

        // Store locations for search
        allLocations = content.pages?.locations?.sections || [];

        // Determine which page to show
        const pagePath = path === '/' ? 'home' : path.slice(1).split('#')[0];
        const pageData = content.pages?.[pagePath] || content.pages?.['home'];

        // Update header
        document.querySelector('.main-header').innerHTML = `
            <h1>${content.churchName || 'Church Website'}</h1>
            <p>${content.tagline || ''}</p>
        `;

        // Update navigation
        const nav = document.querySelector('.main-nav');
        nav.innerHTML = '';
        if (content.menu && Array.isArray(content.menu)) {
            content.menu.forEach(item => {
                nav.innerHTML += `<a href="${item.link}">${item.title}</a>`;
            });
        }

        // Update footer
        const footer = document.querySelector('.main-footer');
        if (footer) {
            footer.innerHTML = `
                <p>${content.footer?.text || `&copy; ${new Date().getFullYear()} ${content.churchName || 'Church Website'}`}</p>
                ${content.footer?.socialMedia ? 
                    `<div class="social-links">
                        ${content.footer.socialMedia.map(social => 
                            `<a href="${social.link}" target="_blank" rel="noopener noreferrer">${social.platform}</a>`
                        ).join('')}
                    </div>` : ''
                }
            `;
        }

        // Clear existing content
        contentArea.innerHTML = '';

        // Handle home page - add hero section
        if (pagePath === 'home') {
            // Add hero section if exists
            if (content.pages?.home?.hero) {
                const heroHTML = `
                    <section class="hero" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${content.pages.home.hero.image || 'default-hero.jpg'}')">
                        <div class="hero-content">
                            <h1>${content.pages.home.hero.heading || content.churchName}</h1>
                            <p>${content.pages.home.hero.tagline || content.tagline}</p>
                        </div>
                    </section>
                `;
                contentArea.innerHTML += heroHTML;
            }
        }

        // Handle locations page differently
        if (path === '/locations') {
            // Add search interface
            contentArea.innerHTML = `
                <div class="search-container">
                    <input type="text" 
                           id="locationSearch" 
                           placeholder="Search locations..." 
                           class="search-input"
                           aria-label="Search locations">
                    <div id="searchResults" class="locations-list"></div>
                </div>
            `;

            // Add scroll listener for search container
            window.addEventListener('scroll', () => {
                const searchContainer = document.querySelector('.search-container');
                if (searchContainer) {
                    if (window.scrollY > 100) {
                        searchContainer.classList.add('scrolled');
                    } else {
                        searchContainer.classList.remove('scrolled');
                    }
                }
            });

            // Initial render of all locations
            renderLocations(allLocations);

            // Add search functionality
            document.getElementById('locationSearch').addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const filtered = allLocations.filter(location => {
                    const searchText = `${location.name} ${location.address} ${location.phone}`.toLowerCase();
                    return searchText.includes(query);
                });
                renderLocations(filtered);
            });

            // Skip regular content rendering
            return;
        }

        // Add page-specific content
        if (pageData && pageData.sections && Array.isArray(pageData.sections)) {
            pageData.sections.forEach((section, index) => {
                const sectionElement = document.createElement('div');
                sectionElement.className = 'content-card';
                sectionElement.id = `section-${index}`;
                sectionElement.innerHTML = createSectionHTML(section);
                contentArea.appendChild(sectionElement);
            });
        } else if (path !== '/locations') {  // Only show error if not on locations page
            contentArea.innerHTML = '<div class="content-card"><h2>Content Not Found</h2><p>The requested page could not be found.</p></div>';
        }

        // Update active state for navigation
        document.querySelectorAll('.main-nav a').forEach(link => {
            // Get clean path without hash
            const currentPath = window.location.pathname;
            const linkPath = new URL(link.href).pathname;
            
            // Remove any existing active class first
            link.classList.remove('active');
            
            // Special case for home page
            if (linkPath === '/' && currentPath === '/') {
                link.classList.add('active');
            }
            // Match exact path for other pages
            else if (linkPath === currentPath) {
                link.classList.add('active');
            }
        });

        // Handle hash link scrolling
        if (window.location.hash) {
            setTimeout(() => {
                const element = document.querySelector(window.location.hash);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }

    } catch (error) {
        console.error('Error loading content:', error);
        const contentArea = document.querySelector('.content-area');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="content-card error">
                    <h2>Error Loading Content</h2>
                    <p>Unable to load page content. Please try again later.</p>
                </div>
            `;
        }
    }
}

function renderLocations(locations) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = locations.map(location => `
        <div class="location-card" data-search="${location.name} ${location.address} ${location.phone}">
            <h3>${location.name}</h3>
            <div class="location-details">
                ${location.address ? `<p class="address">📍 ${location.address}</p>` : ''}
                ${location.phone ? `
                <div class="phone-wrapper">
                    <p class="phone">📞 <a href="tel:${location.phone}" class="tel-link">${location.phone}</a>
                    <a href="https://wa.me/${location.phone.replace(/[^0-9]/g, '')}" class="whatsapp-link" target="_blank" rel="noopener">WhatsApp</a>
                    </p>
                </div>` : ''}
                ${location.serviceTimes && location.serviceTimes.length > 0 ? `
                    <div class="service-times">
                        <h3>Service Times:</h3>
                        <ul>${location.serviceTimes.map(time => `<li>${time}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                ${location.link ? `<a href="${location.link}" class="map-link" target="_blank" rel="noopener">
                    <span class="map-icon">📍</span> View on Map
                </a>` : ''}
            </div>
        </div>
    `).join('');
}

function createSectionHTML(section) {
    if (!section) return '';
    
    let contentHTML = section.content || '';
    
    // Add link if exists in the section
    if (section.link && section.linkText) {
        contentHTML += `
            <a href="${section.link}" class="content-link" target="_blank" rel="noopener noreferrer">
                ${section.linkText}
            </a>
        `;
    }
    
    // Handle contact lists with links
    if (section.contacts && Array.isArray(section.contacts)) {
        contentHTML += '<ul class="contact-list">';
        section.contacts.forEach(contact => {
            if (contact.type === 'whatsapp' && contact.link) {
                contentHTML += `
                    <li>
                        <strong>${contact.type}:</strong> ${contact.value}
                        <a href="${contact.link}" class="whatsapp-link" target="_blank" rel="noopener noreferrer">
                            Chat on WhatsApp
                        </a>
                    </li>`;
            } else if (contact.type === 'email') {
                contentHTML += `<li><strong>${contact.type}:</strong> <a href="mailto:${contact.value}">${contact.value}</a></li>`;
            } else if (contact.type === 'phone') {
                contentHTML += `<li><strong>${contact.type}:</strong> <a href="tel:${contact.value}">${contact.value}</a></li>`;
            } else {
                contentHTML += `<li><strong>${contact.type}:</strong> ${contact.value}</li>`;
            }
        });
        contentHTML += '</ul>';
    }
    
    // Handle buttons - new feature
    if (section.buttons && Array.isArray(section.buttons)) {
        contentHTML += '<div class="button-container">';
        section.buttons.forEach(button => {
            contentHTML += `
                <a href="${button.link}" class="button-link" ${button.external ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                    ${button.text}
                </a>
            `;
        });
        contentHTML += '</div>';
    }
    
    // Add location-specific fields
    if (section.address) {
        contentHTML += `<p class="location-address">📍 ${section.address}</p>`;
    }
    
    if (section.phone) {
        contentHTML += `<p class="location-phone">📞 <a href="tel:${section.phone}">${section.phone}</a></p>`;
    }
    
    // Handle service times
    if (section.serviceTimes && Array.isArray(section.serviceTimes)) {
        contentHTML += '<div class="service-times"><h3>Service Times:</h3><ul>';
        section.serviceTimes.forEach(time => {
            contentHTML += `<li>${time}</li>`;
        });
        contentHTML += '</ul></div>';
    }
    
    // Only show map link for location sections
    if (section.link) {
        contentHTML += `
            <div class="map-link-container">
                <a href="${section.link}" 
                   target="_blank" 
                   rel="noopener" 
                   class="map-link">
                   <span class="map-icon">📍</span> View on Map
                </a>
            </div>
        `;
    }
    
    return `
        <div class="content-card">
            <h2>${section.title || 'Section'}</h2>
            <div class="section-content">
                ${contentHTML}
                ${section.name ? `<p class="location-name">${section.name}</p>` : ''}
            </div>
        </div>
    `;
}

// Handle browser back/forward
window.addEventListener('popstate', async () => {
    await loadFullLayout(window.location.pathname);
});


// For sticky header
document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('header');
  if (header && content.header.sticky) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 0) {
        header.classList.add('sticky');
      } else {
        header.classList.remove('sticky');
      }
    });
  }
  
  // For activating locations button on scroll
  const locationsMenuItem = document.querySelector('[data-link="/locations"]');
  const locationsSection = document.getElementById('locations-section');
  
  if (locationsMenuItem && locationsSection && window.location.pathname === '/locations') {
    window.addEventListener('scroll', function() {
      const sectionRect = locationsSection.getBoundingClientRect();
      
      // Check if section is in viewport
      if (sectionRect.top <= window.innerHeight && 
          sectionRect.bottom >= 0) {
        // Find any active menu items and remove active class
        document.querySelectorAll('.nav-item.active').forEach(item => {
          item.classList.remove('active');
        });
        // Add active class to locations menu item
        locationsMenuItem.classList.add('active'); 
      }
    });
  }
  
  // For sticky search bar on locations page
  const searchBar = document.querySelector('.search-bar');
  if (searchBar && content.pages.locations.searchBar?.sticky && 
      window.location.pathname === '/locations') {
    
    const searchBarOffset = searchBar.offsetTop;
    
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > searchBarOffset) {
        searchBar.classList.add('sticky-search');
      } else {
        searchBar.classList.remove('sticky-search');
      }
    });
  }
  
  // Parse locations data from content.json and setup search functionality
  if (window.location.pathname === '/locations') {
    const searchInput = document.querySelector('.search-bar input');
    const locationCards = document.querySelectorAll('.location-card');
    
    if (searchInput) {
      searchInput.placeholder = content.pages.locations.searchBar?.placeholder || 'Search locations';
      
      searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        locationCards.forEach(card => {
          const locationName = card.querySelector('.location-name').textContent.toLowerCase();
          const locationAddress = card.querySelector('.location-address').textContent.toLowerCase();
          
          if (locationName.includes(searchTerm) || locationAddress.includes(searchTerm)) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    }
  }
});

// Function to highlight active menu item based on current page or scroll position
function updateActiveMenuItem() {
  const currentPath = window.location.pathname;
  const menuItems = document.querySelectorAll('.nav-item');
  
  menuItems.forEach(item => {
    const itemLink = item.getAttribute('data-link');
    
    if (itemLink === currentPath) {
      item.classList.add('active');
    } else {
      // Only remove active class if the item doesn't have activeOnScroll
      const menuData = content.menu.find(m => m.link === itemLink);
      if (!menuData?.activeOnScroll || currentPath !== '/locations') {
        item.classList.remove('active');
      }
    }
  });
}

// Call this function on page load and on scroll events
document.addEventListener('DOMContentLoaded', updateActiveMenuItem);
window.addEventListener('scroll', updateActiveMenuItem);