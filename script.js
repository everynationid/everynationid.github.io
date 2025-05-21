// Add at the top of the file
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

    // Service Worker
    if('serviceWorker' in navigator) {
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

        // Get content area reference once
        const contentArea = document.querySelector('.content-area');
        if (!contentArea) {
            console.error('Content area element not found');
            return;
        }

        // Store locations for search
        allLocations = content.pages?.locations?.sections || [];

        // Clear existing content
        contentArea.innerHTML = '';
               // Determine which page to show
        const pagePath = path === '/' ? 'home' : path.slice(1).split('#')[0];
        const pageData = content.pages?.[pagePath] || content.pages?.['home'];

        // In page content loading
        // // Update the home page rendering in loadFullLayout
if (pagePath === 'home') {
    // Clear existing content first
    contentArea.innerHTML = '';
    
    // Add hero section if exists
    if (content.pages?.home?.hero) {
        const heroHTML = `
            <section class="hero" style="background-image: linear-gradient(rgba(0,0,0,0.4)), url('${content.pages.home.hero.image}')">
                <div class="hero-content">
                    <h1>${content.pages.home.hero.heading || content.churchName}</h1>
                    <p>${content.pages.home.hero.tagline || content.tagline}</p>
                </div>
            </section>
        `;
        contentArea.innerHTML += heroHTML;
    }

    // Then add sections normally...
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

 


        // In loadFullLayout function, after creating search container
        // if (path === '/locations') {
        // Add scroll listener
window.addEventListener('scroll', () => {
    const searchContainer = document.querySelector('.search-container');
    if (window.scrollY > 100) {
        searchContainer.classList.add('scrolled');
    } else {
        searchContainer.classList.remove('scrolled');
    }
});

        // Add page-specific content (after search container for locations)
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


        // In loadFullLayout function, update active state logic
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

// Moved outside the loadFullLayout function


function renderLocations(locations) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = locations.map(location => `
        <div class="location-card">
            <h3>${location.name}</h3>
            <div class="location-details">
                ${location.address ? `<p class="address">📍 ${location.address}</p>` : ''}
                ${location.phone ? `<p class="phone">📞 <a href="tel:${location.phone}">${location.phone}</a></p>` : ''}
                ${location.link ? `<a href="${location.link}" class="map-link" target="_blank">View on Map</a>` : ''}
            </div>
        </div>
    `).join('');
}



function createSectionHTML(section) {
    if (!section) return '';
    
    let contentHTML = section.content || '';
    
    // Handle contact lists
    if (section.contacts && Array.isArray(section.contacts)) {
        contentHTML += '<ul class="contact-list">';
        section.contacts.forEach(contact => {
            contentHTML += `<li><strong>${contact.type}:</strong> ${contact.value}</li>`;
        });
        contentHTML += '</ul>';
    }
    
    // Add location-specific fields
    if (section.address) {
        contentHTML += `<p class="location-address">📍 ${section.address}</p>`;
    }
    
    if (section.link) {
        contentHTML += `<a href="${section.link}" target="_blank" rel="noopener" class="map-link">View on Map</a>`;
    }
    
    if (section.phone) {
        contentHTML += `<p class="location-phone">📞 ${section.phone}</p>`;
    }
    
    // Handle service times
    if (section.serviceTimes && Array.isArray(section.serviceTimes)) {
        contentHTML += '<div class="service-times"><h3>Service Times:</h3><ul>';
        section.serviceTimes.forEach(time => {
            contentHTML += `<li>${time}</li>`;
        });
        contentHTML += '</ul></div>';


    // Only show map link for location sections
    if (section.link && window.location.pathname === '/locations') {
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
    // Update createSectionHTML to include data attributes

    return `
        <div class="content-card location-card" 
             data-search="${section.title} ${section.address} ${section.phone}">
            <!-- existing content -->
        </div>
    `;

}



function filterLocations(query) {
    const filtered = allLocations.filter(location => {
        const searchText = `${location.name} ${location.address} ${location.phone}`.toLowerCase();
        return searchText.includes(query);
    });
    
    const contentArea = document.querySelector('.content-area');
    contentArea.innerHTML = document.querySelector('.search-container').outerHTML;
    
    filtered.forEach(location => {
        contentArea.innerHTML += createSectionHTML(location);
    });
}



// Handle browser back/forward
window.addEventListener('popstate', async () => {
    await loadFullLayout(window.location.pathname);
});




//back to top button behavior
// Modify back to top button initialization
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