document.addEventListener('DOMContentLoaded', async () => {
    // Initial load
    await loadFullLayout(window.location.pathname);
    
    // Handle navigation
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Service Worker
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js');
    }
});

async function handleNavigation(event) {
    event.preventDefault();
    const path = new URL(event.target.href).pathname;
    window.history.pushState({}, '', path);
    await loadFullLayout(path);
}

async function loadFullLayout(path) {
    const response = await fetch('content.json');
    const content = await response.json();
    
    // Update header
    document.querySelector('.main-header').innerHTML = `
        <h1>${content.churchName}</h1>
        <p>${content.tagline}</p>
    `;
    
    // Update navigation
    const nav = document.querySelector('.main-nav');
    nav.innerHTML = '';
    content.menu.forEach(item => {
        nav.innerHTML += `<a href="${item.link}">${item.title}</a>`;
    });
    
    // Update content
    const page = path === '/' ? 'home' : path.slice(1);
    const pageData = content.pages[page] || content.pages['home'];
    const contentArea = document.querySelector('.content-area');
    contentArea.innerHTML = '';
    
    pageData.sections.forEach(section => {
        contentArea.innerHTML += createSectionHTML(section);
    });
    
    // Re-attach navigation handlers
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Update active state
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === path);
    });
}

// Keep existing createSectionHTML and other functions



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