document.addEventListener('DOMContentLoaded', async () => {
    // Handle initial route
    const initialPath = window.location.pathname;
    await loadPageContent(initialPath);

    // Register navigation handler
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Register Service Worker
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js');
    }
});

async function handleNavigation(event) {
    event.preventDefault();
    const path = new URL(event.target.href).pathname;
    window.history.pushState({}, '', path);
    await loadPageContent(path);
}

async function loadPageContent(path) {
    const response = await fetch('content.json');
    const content = await response.json();
    
    // Clear existing content
    document.querySelector('.content-area').innerHTML = '';
    
    // Determine which page to show
    const page = path === '/' ? 'home' : path.slice(1);
    const pageData = content.pages[page] || content.pages['home'];
    
    // Render content
    pageData.sections.forEach(section => {
        const sectionHTML = createSectionHTML(section);
        document.querySelector('.content-area').innerHTML += sectionHTML;
    });
    
    // Update active nav item
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === path);
    });
}

function createSectionHTML(section) {
    let contentHTML = section.content;
    
    if(section.contacts) {
        contentHTML += '<ul class="contact-list">';
        section.contacts.forEach(contact => {
            contentHTML += `<li><strong>${contact.type}:</strong> ${contact.value}</li>`;
        });
        contentHTML += '</ul>';
    }
    
    if(section.serviceTimes) {
        contentHTML += '<ul class="service-times">';
        section.serviceTimes.forEach(time => {
            contentHTML += `<li>${time}</li>`;
        });
        contentHTML += '</ul>';
    }
    
    return `
        <div class="content-card">
            <h2>${section.title}</h2>
            <div>${contentHTML}</div>
            ${section.address ? `<p class="address">${section.address}</p>` : ''}
        </div>
    `;
}

// Handle browser back/forward
window.addEventListener('popstate', async () => {
    await loadPageContent(window.location.pathname);
});