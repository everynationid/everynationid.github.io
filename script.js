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
        if (!link) return;
        
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
        
        // Determine which page to show
        const pagePath = path === '/' ? 'home' : path.slice(1).split('#')[0];
        const pageData = content.pages?.[pagePath] || content.pages?.['home'];
        
        // Clear existing content
        const contentArea = document.querySelector('.content-area');
        contentArea.innerHTML = '';
        
        // Add sections
        if (pageData && pageData.sections && Array.isArray(pageData.sections)) {
            pageData.sections.forEach((section, index) => {
                const sectionElement = document.createElement('div');
                sectionElement.className = 'content-card';
                sectionElement.id = `section-${index}`;
                sectionElement.innerHTML = createSectionHTML(section);
                contentArea.appendChild(sectionElement);
            });
        } else {
            contentArea.innerHTML = '<div class="content-card"><h2>Content Not Found</h2><p>The requested page could not be found.</p></div>';
        }
        
        // Update active state
        document.querySelectorAll('.main-nav a').forEach(link => {
            // Remove the hash part for comparison
            const currentPath = window.location.pathname;
            const linkPath = new URL(link.href, window.location.origin).pathname;
            link.classList.toggle('active', linkPath === currentPath);
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
        document.querySelector('.content-area').innerHTML = `
            <div class="content-card error">
                <h2>Error Loading Content</h2>
                <p>Unable to load page content. Please try again later.</p>
            </div>
        `;
    }
}

function createSectionHTML(section) {
    if (!section) return '';
    
    let contentHTML = section.content || '';
    
    if (section.contacts && Array.isArray(section.contacts)) {
        contentHTML += '<ul class="contact-list">';
        section.contacts.forEach(contact => {
            contentHTML += `<li><strong>${contact.type || ''}:</strong> ${contact.value || ''}</li>`;
        });
        contentHTML += '</ul>';
    }
    
    if (section.serviceTimes && Array.isArray(section.serviceTimes)) {
        contentHTML += '<ul class="service-times">';
        section.serviceTimes.forEach(time => {
            contentHTML += `<li>${time}</li>`;
        });
        contentHTML += '</ul>';
    }
    
    return `
        <h2>${section.title || 'Section'}</h2>
        <div class="section-content">${contentHTML}</div>
        ${section.address ? `<p class="address">${section.address}</p>` : ''}
    `;
}

// Handle browser back/forward
window.addEventListener('popstate', async () => {
    await loadFullLayout(window.location.pathname);
});