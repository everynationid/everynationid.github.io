document.addEventListener('DOMContentLoaded', async () => {
    // Load content
    const response = await fetch('content.json');
    const content = await response.json();
    
    // Populate header
    document.querySelector('.main-header').innerHTML = `
        <h1>${content.churchName}</h1>
        <p>${content.tagline}</p>
    `;
    
    // Populate navigation
    const nav = document.querySelector('.main-nav');
    content.menu.forEach(item => {
        nav.innerHTML += `<a href="${item.link}">${item.title}</a>`;
    });
    
    // Populate main content
    const main = document.querySelector('.content-area');
    content.sections.forEach(section => {
        main.innerHTML += `
            <div class="content-card">
                <h2>${section.title}</h2>
                <div>${section.content}</div>
            </div>
        `;
    });
    
    // Register Service Worker
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js');
    }
});