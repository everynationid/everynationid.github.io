let allLocations = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Back to Top Button
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            backToTopButton.classList.toggle('visible', window.scrollY > 300);
        });
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Initial load
    await loadFullLayout(window.location.pathname);

    // Navigation handler
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!link || link.origin !== window.location.origin) return;

        event.preventDefault();
        const path = link.pathname;
        
        // Update active state
        document.querySelectorAll('.main-nav a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Handle navigation
        window.history.pushState({}, '', path);
        loadFullLayout(path);
    });
});

async function loadFullLayout(path) {
    try {
        const response = await fetch('content.json');
        const content = await response.json();
        const contentArea = document.querySelector('.content-area');
        
        // Clear content
        contentArea.innerHTML = '<div class="loading-spinner"></div>';

        // Load page-specific content
        const pagePath = path === '/' ? 'home' : path.slice(1);
        const pageData = content.pages[pagePath] || content.pages.home;

        // Header
        document.querySelector('.main-header').innerHTML = `
            <h1>${content.churchName}</h1>
            <p>${content.tagline}</p>
        `;

        // Navigation
        const nav = document.querySelector('.main-nav');
        nav.innerHTML = content.menu.map(item => `
            <a href="${item.link}" ${path === item.link ? 'class="active"' : ''}>${item.title}</a>
        `).join('');

        // Hero Section
        if (pagePath === 'home' && content.pages.home.hero) {
            contentArea.innerHTML = `
                <section class="hero" style="background-image: linear-gradient(rgba(0,0,0,0.4)), url('${content.pages.home.hero.image}')">
                    <div class="hero-content">
                        <h1>${content.pages.home.hero.heading}</h1>
                        <p>${content.pages.home.hero.tagline}</p>
                    </div>
                </section>
            `;
        }

        // Locations Page
        if (pagePath === 'locations') {
            allLocations = content.pages.locations.sections;
            contentArea.innerHTML = `
                <div class="search-container">
                    <input type="text" id="locationSearch" placeholder="Search locations...">
                    <div id="searchResults" class="locations-list"></div>
                </div>
            `;
            document.getElementById('locationSearch').addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const filtered = allLocations.filter(location => 
                    `${location.name} ${location.address} ${location.phone}`.toLowerCase().includes(query)
                );
                renderLocations(filtered);
            });
            renderLocations(allLocations);
        }

        // Other Pages
        else {
            contentArea.innerHTML = pageData.sections.map(section => `
                <div class="content-card">
                    <h2>${section.title}</h2>
                    <div class="section-content">${section.content}</div>
                </div>
            `).join('');
        }

    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.content-area').innerHTML = `
            <div class="error">Error loading content. Please refresh the page.</div>
        `;
    }
}

function renderLocations(locations) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = locations.map(location => `
        <div class="location-card">
            <h3>${location.name}</h3>
            <p class="address">📍 ${location.address}</p>
            <p class="phone">📞 <a href="tel:${location.phone}">${location.phone}</a></p>
            <a href="${location.link}" class="map-link" target="_blank">View on Map</a>
        </div>
    `).join('');
}