let currentToken = null;
let gitHubToken = null;
let contentData = null;
let currentPage = 'home';
const REPO_OWNER = 'everynationid'; // Update this with your GitHub username
const REPO_NAME = 'everynationid.github.io'; // Update this with your repository name

/**
 * Initialize Google Authentication
 */
function initGoogleAuth() {
    if (typeof google === 'undefined') {
        console.error('Google API not loaded');
        document.getElementById('auth-error').style.display = 'block';
        document.getElementById('auth-error').textContent = 'Error: Google Authentication API not loaded';
        return;
    }

    try {
        google.accounts.id.initialize({
            client_id: '106460328171-7b5ahj0vh6t446bqndkn10hs35pi21a5.apps.googleusercontent.com',
            callback: handleCredentialResponse,
            auto_select: false
        });
        
        const authContainer = document.getElementById('auth-container');
        if (authContainer) {
            google.accounts.id.renderButton(
                authContainer,
                { theme: "filled_blue", size: "large", text: "signin_with", shape: "rectangular" }
            );
        } else {
            console.error('Auth container not found');
        }
    } catch (error) {
        console.error('Error initializing Google Auth:', error);
        document.getElementById('auth-error').style.display = 'block';
        document.getElementById('auth-error').textContent = 'Error initializing authentication: ' + error.message;
    }
}

/**
 * Verify Google token with the OAuth API
 * @param {string} token - Google ID token
 * @returns {Promise<object|null>} Token payload or null on failure
 */
async function verifyGoogleToken(token) {
    try {
        const response = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + token);
        
        if (!response.ok) {
            throw new Error(`Token verification failed: ${response.status} ${response.statusText}`);
        }
        
        const payload = await response.json();
        
        // Optional domain verification
        // Commenting out strict domain check to allow testing, but you can uncomment
        // if you want to restrict access to specific domains
        /*
        if(payload.hd !== 'everynationid.github.io' && payload.hd !== 'everynation.id') {
            throw new Error('Unauthorized domain: ' + (payload.hd || 'no domain'));
        }
        */
        
        console.log('Authentication successful for:', payload.email);
        return payload;
    } catch (error) {
        console.error('Authentication error:', error);
        document.getElementById('auth-error').style.display = 'block';
        document.getElementById('auth-error').textContent = 'Authentication failed: ' + error.message;
        return null;
    }
}

/**
 * Handle the credential response from Google
 * @param {object} response - Google credential response
 */
function handleCredentialResponse(response) {
    document.getElementById('auth-status').textContent = 'Verifying credentials...';
    
    verifyGoogleToken(response.credential).then(payload => {
        if(payload) {
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('auth-error').style.display = 'none';
            document.getElementById('token-ui').style.display = 'block';
            document.getElementById('auth-status').textContent = 'Authenticated as: ' + payload.email;
            currentToken = response.credential;
        }
    });
}

/**
 * Store GitHub token and proceed to the editor
 */
function storeToken() {
    gitHubToken = document.getElementById('githubToken').value.trim();
    
    if (!gitHubToken) {
        document.getElementById('token-error').textContent = 'GitHub token is required';
        document.getElementById('token-error').style.display = 'block';
        return;
    }
    
    document.getElementById('token-ui').style.display = 'none';
    document.getElementById('editor').style.display = 'block';
    document.getElementById('loading-indicator').style.display = 'block';
    
    loadContent().catch(error => {
        console.error('Error during content loading:', error);
        document.getElementById('editor').innerHTML = `
            <div class="error-message">
                <h3>Error Loading Content</h3>
                <p>${error.message}</p>
                <button onclick="window.location.reload()">Retry</button>
            </div>
        `;
    });
}

/**
 * Load content from the GitHub repository
 */
async function loadContent() {
    try {
        document.getElementById('loading-indicator').style.display = 'block';
        
        // First try to fetch from the repository to test GitHub token
        try {
            const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/content.json`, {
                headers: {
                    'Authorization': `token ${gitHubToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const contentStr = atob(data.content);
            contentData = JSON.parse(contentStr);
        } catch (gitHubError) {
            console.warn('GitHub fetch failed, falling back to local content:', gitHubError);
            
            // Fallback to local content.json
            const response = await fetch('../content.json');
            if (!response.ok) {
                throw new Error(`Failed to load content: ${response.status} ${response.statusText}`);
            }
            contentData = await response.json();
        }
        
        // Set up page navigation
        document.getElementById('page-nav').innerHTML = '';
        Object.keys(contentData.pages || {}).forEach(page => {
            const button = document.createElement('button');
            button.textContent = page.charAt(0).toUpperCase() + page.slice(1);
            button.onclick = () => showPage(page);
            document.getElementById('page-nav').appendChild(button);
        });
        
        // Show the first page by default
        const firstPage = Object.keys(contentData.pages || {})[0] || 'home';
        showPage(firstPage);
        
        // Populate general settings
        document.getElementById('churchName').value = contentData.churchName || '';
        document.getElementById('tagline').value = contentData.tagline || '';
        
        // Update menu items
        renderMenuItems();
        
        document.getElementById('loading-indicator').style.display = 'none';
    } catch (error) {
        document.getElementById('loading-indicator').style.display = 'none';
        console.error('Loading error:', error);
        throw new Error('Failed to load content: ' + error.message);
    }
}

/**
 * Render menu items in the editor
 */
function renderMenuItems() {
    const menuContainer = document.getElementById('menuItems');
    menuContainer.innerHTML = '';
    
    if (!contentData.menu || !Array.isArray(contentData.menu)) {
        contentData.menu = [];
    }
    
    contentData.menu.forEach((item, index) => {
        const menuItemDiv = document.createElement('div');
        menuItemDiv.className = 'menu-item';
        menuItemDiv.innerHTML = `
            <input type="text" placeholder="Title" value="${item.title || ''}" 
                   onchange="updateMenu(${index}, 'title', this.value)">
            <input type="text" placeholder="Link" value="${item.link || ''}" 
                   onchange="updateMenu(${index}, 'link', this.value)">
            <button class="remove-btn" onclick="removeMenu(${index})">×</button>
        `;
        menuContainer.appendChild(menuItemDiv);
    });
    
    // Add a button to add new menu items
    const addButton = document.createElement('button');
    addButton.textContent = '+ Add Menu Item';
    addButton.className = 'add-button';
    addButton.onclick = addMenuItem;
    menuContainer.appendChild(addButton);
}

/**
 * Add a new menu item
 */
function addMenuItem() {
    if (!contentData.menu) {
        contentData.menu = [];
    }
    
    contentData.menu.push({
        title: 'New Item',
        link: '#'
    });
    
    renderMenuItems();
}

/**
 * Update a menu item property
 * @param {number} index - Menu item index
 * @param {string} field - Field name (title or link)
 * @param {string} value - New value
 */
function updateMenu(index, field, value) {
    if (contentData.menu && contentData.menu[index]) {
        contentData.menu[index][field] = value;
    }
}

/**
 * Remove a menu item
 * @param {number} index - Menu item index to remove
 */
function removeMenu(index) {
    if (contentData.menu && contentData.menu[index]) {
        contentData.menu.splice(index, 1);
        renderMenuItems();
    }
}

/**
 * Show a specific page in the editor
 * @param {string} page - Page name
 */
function showPage(page) {
    currentPage = page;
    
    // Highlight the active page button
    document.querySelectorAll('#page-nav button').forEach(button => {
        button.classList.toggle('active', button.textContent.toLowerCase() === page);
    });
    
    renderPageEditor();
}

/**
 * Render the page editor for the current page
 */
function renderPageEditor() {
    if (!contentData.pages) {
        contentData.pages = {};
    }
    
    if (!contentData.pages[currentPage]) {
        contentData.pages[currentPage] = {
            sections: []
        };
    }
    
    const pageData = contentData.pages[currentPage];
    const editor = document.getElementById('page-editor');
    
    editor.innerHTML = `
        <h2>Editing: ${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} Page</h2>
        <div id="sections-container"></div>
        <button class="add-button" onclick="addSection()">+ Add New Section</button>
    `;
    
    const sectionsContainer = document.getElementById('sections-container');
    
    if (!pageData.sections || !Array.isArray(pageData.sections)) {
        pageData.sections = [];
    }
    
    pageData.sections.forEach((section, index) => {
        const sectionEditor = document.createElement('div');
        sectionEditor.className = 'section-editor';
        
        let additionalFields = '';
        
        // Add fields based on section properties
        if (section.address !== undefined) {
            additionalFields += `
                <div class="field-group">
                    <label>Address:</label>
                    <input type="text" value="${section.address || ''}" 
                        onchange="updateSectionField(${index}, 'address', this.value)">
                </div>
            `;
        }
        
        // Add service times editor if applicable
        if (section.serviceTimes && Array.isArray(section.serviceTimes)) {
            additionalFields += `
                <div class="field-group">
                    <label>Service Times:</label>
                    <div id="service-times-${index}" class="service-times-editor">
                        ${section.serviceTimes.map((time, timeIndex) => `
                            <div class="service-time-item">
                                <input type="text" value="${time || ''}" 
                                    onchange="updateServiceTime(${index}, ${timeIndex}, this.value)">
                                <button class="remove-btn" onclick="removeServiceTime(${index}, ${timeIndex})">×</button>
                            </div>
                        `).join('')}
                        <button class="add-button small" onclick="addServiceTime(${index})">+ Add Time</button>
                    </div>
                </div>
            `;
        }
        
        // Add contacts editor if applicable
        if (section.contacts && Array.isArray(section.contacts)) {
            additionalFields += `
                <div class="field-group">
                    <label>Contact Information:</label>
                    <div id="contacts-${index}" class="contacts-editor">
                        ${section.contacts.map((contact, contactIndex) => `
                            <div class="contact-item">
                                <input type="text" placeholder="Type" value="${contact.type || ''}" 
                                    onchange="updateContactField(${index}, ${contactIndex}, 'type', this.value)">
                                <input type="text" placeholder="Value" value="${contact.value || ''}" 
                                    onchange="updateContactField(${index}, ${contactIndex}, 'value', this.value)">
                                <button class="remove-btn" onclick="removeContact(${index}, ${contactIndex})">×</button>
                            </div>
                        `).join('')}
                        <button class="add-button small" onclick="addContact(${index})">+ Add Contact</button>
                    </div>
                </div>
            `;
        }
        
        sectionEditor.innerHTML = `
            <div class="section-header">
                <h3>Section ${index + 1}</h3>
                <button class="remove-btn" onclick="removeSection(${index})">Delete</button>
            </div>
            <div class="field-group">
                <label>Title:</label>
                <input type="text" value="${section.title || ''}" 
                    onchange="updateSectionField(${index}, 'title', this.value)">
            </div>
            <div class="field-group">
                <label>Content:</label>
                <textarea rows="6" 
                    onchange="updateSectionField(${index}, 'content', this.value)">${section.content || ''}</textarea>
                <small>HTML formatting is supported</small>
            </div>
            ${additionalFields}
            <div class="section-actions">
                <button onclick="moveSectionUp(${index})" ${index === 0 ? 'disabled' : ''}>Move Up</button>
                <button onclick="moveSectionDown(${index})" ${index === pageData.sections.length - 1 ? 'disabled' : ''}>Move Down</button>
                <button onclick="addSpecialField(${index})">Add Special Field</button>
            </div>
        `;
        
        sectionsContainer.appendChild(sectionEditor);
    });
    
    // Add a message if no sections
    if (pageData.sections.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No sections yet. Click "Add New Section" to create content.';
        sectionsContainer.appendChild(emptyMessage);
    }
}

/**
 * Update a section field
 * @param {number} sectionIndex - Section index
 * @param {string} field - Field name
 * @param {string} value - New value
 */
function updateSectionField(sectionIndex, field, value) {
    const pageData = contentData.pages[currentPage];
    if (pageData.sections && pageData.sections[sectionIndex]) {
        pageData.sections[sectionIndex][field] = value;
    }
}

/**
 * Add a new section to the current page
 */
function addSection() {
    const pageData = contentData.pages[currentPage];
    
    if (!pageData.sections) {
        pageData.sections = [];
    }
    
    pageData.sections.push({
        title: "New Section",
        content: "Add your content here"
    });
    
    renderPageEditor();
}

/**
 * Remove a section from the current page
 * @param {number} index - Section index to remove
 */
function removeSection(index) {
    const pageData = contentData.pages[currentPage];
    
    if (pageData.sections && pageData.sections[index]) {
        if (confirm('Are you sure you want to delete this section?')) {
            pageData.sections.splice(index, 1);
            renderPageEditor();
        }
    }
}

/**
 * Move a section up in order
 * @param {number} index - Section index to move
 */
function moveSectionUp(index) {
    const pageData = contentData.pages[currentPage];
    
    if (index > 0 && pageData.sections && pageData.sections[index]) {
        const temp = pageData.sections[index];
        pageData.sections[index] = pageData.sections[index - 1];
        pageData.sections[index - 1] = temp;
        renderPageEditor();
    }
}

/**
 * Move a section down in order
 * @param {number} index - Section index to move
 */
function moveSectionDown(index) {
    const pageData = contentData.pages[currentPage];
    
    if (pageData.sections && 
        pageData.sections[index] && 
        index < pageData.sections.length - 1) {
        const temp = pageData.sections[index];
        pageData.sections[index] = pageData.sections[index + 1];
        pageData.sections[index + 1] = temp;
        renderPageEditor();
    }
}

/**
 * Add a special field to a section (address, service times, or contacts)
 * @param {number} index - Section index
 */
function addSpecialField(index) {
    const pageData = contentData.pages[currentPage];
    if (!pageData.sections || !pageData.sections[index]) return;
    
    const section = pageData.sections[index];
    const fieldType = prompt('What type of field do you want to add? (address, serviceTimes, contacts)');
    
    if (!fieldType) return;
    
    switch (fieldType.toLowerCase()) {
        case 'address':
            section.address = '';
            break;
        case 'servicetimes':
            section.serviceTimes = ['Sunday 10:00 AM'];
            break;
        case 'contacts':
            section.contacts = [{ type: 'email', value: 'example@example.com' }];
            break;
        default:
            alert('Unknown field type. Please use address, serviceTimes, or contacts.');
            return;
    }
    
    renderPageEditor();
}

/**
 * Add a new service time to a section
 * @param {number} sectionIndex - Section index
 */
function addServiceTime(sectionIndex) {
    const pageData = contentData.pages[currentPage];
    if (!pageData.sections || !pageData.sections[sectionIndex]) return;
    
    const section = pageData.sections[sectionIndex];
    
    if (!section.serviceTimes) {
        section.serviceTimes = [];
    }
    
    section.serviceTimes.push('New Service Time');
    renderPageEditor();
}

/**
 * Update a service time value
 * @param {number} sectionIndex - Section index
 * @param {number} timeIndex - Time index
 * @param {string} value - New time value
 */
function updateServiceTime(sectionIndex, timeIndex, value) {
    const pageData = contentData.pages[currentPage];
    
    if (pageData.sections && 
        pageData.sections[sectionIndex] && 
        pageData.sections[sectionIndex].serviceTimes && 
        pageData.sections[sectionIndex].serviceTimes[timeIndex] !== undefined) {
        pageData.sections[sectionIndex].serviceTimes[timeIndex] = value;
    }
}

/**
 * Remove a service time
 * @param {number} sectionIndex - Section index
 * @param {number} timeIndex - Time index to remove
 */
function removeServiceTime(sectionIndex, timeIndex) {
    const pageData = contentData.pages[currentPage];
    
    if (pageData.sections && 
        pageData.sections[sectionIndex] && 
        pageData.sections[sectionIndex].serviceTimes && 
        pageData.sections[sectionIndex].serviceTimes[timeIndex] !== undefined) {
        pageData.sections[sectionIndex].serviceTimes.splice(timeIndex, 1);
        renderPageEditor();
    }
}

/**
 * Add a new contact to a section
 * @param {number} sectionIndex - Section index
 */
function addContact(sectionIndex) {
    const pageData = contentData.pages[currentPage];
    if (!pageData.sections || !pageData.sections[sectionIndex]) return;
    
    const section = pageData.sections[sectionIndex];
    
    if (!section.contacts) {
        section.contacts = [];
    }
    
    section.contacts.push({ type: 'New Type', value: 'New Value' });
    renderPageEditor();
}

/**
 * Update a contact field
 * @param {number} sectionIndex - Section index
 * @param {number} contactIndex - Contact index
 * @param {string} field - Field name (type or value)
 * @param {string} value - New field value
 */
function updateContactField(sectionIndex, contactIndex, field, value) {
    const pageData = contentData.pages[currentPage];
    
    if (pageData.sections && 
        pageData.sections[sectionIndex] && 
        pageData.sections[sectionIndex].contacts && 
        pageData.sections[sectionIndex].contacts[contactIndex]) {
        pageData.sections[sectionIndex].contacts[contactIndex][field] = value;
    }
}

/**
 * Remove a contact
 * @param {number} sectionIndex - Section index
 * @param {number} contactIndex - Contact index to remove
 */
function removeContact(sectionIndex, contactIndex) {
    const pageData = contentData.pages[currentPage];
    
    if (pageData.sections && 
        pageData.sections[sectionIndex] && 
        pageData.sections[sectionIndex].contacts && 
        pageData.sections[sectionIndex].contacts[contactIndex]) {
        pageData.sections[sectionIndex].contacts.splice(contactIndex, 1);
        renderPageEditor();
    }
}

/**
 * Update church name
 * @param {string} value - New church name
 */
function updateChurchName(value) {
    contentData.churchName = value;
}

/**
 * Update tagline
 * @param {string} value - New tagline
 */
function updateTagline(value) {
    contentData.tagline = value;
}

/**
 * Get file SHA for GitHub API
 * @returns {Promise<string>} - SHA of content.json
 */
async function getFileSha() {
    try {
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/content.json`, {
            headers: {
                'Authorization': `token ${gitHubToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.sha;
    } catch (error) {
        console.error('Error getting file SHA:', error);
        throw error;
    }
}

/**
 * Save content to GitHub repository
 */
async function saveContent() {
    try {
        document.getElementById('save-status').textContent = 'Saving...';
        document.getElementById('save-status').className = 'status-saving';
        
        // Update content from form fields
        contentData.churchName = document.getElementById('churchName').value;
        contentData.tagline = document.getElementById('tagline').value;
        
        const commit = {
            message: "CMS Update - " + new Date().toISOString(),
            content: btoa(JSON.stringify(contentData, null, 2)),
            sha: await getFileSha()
        };

        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/content.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${gitHubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commit)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorData.message}`);
        }
        
        document.getElementById('save-status').textContent = 'Saved successfully!';
        document.getElementById('save-status').className = 'status-success';
        
        // Reset status after 3 seconds
        setTimeout(() => {
            document.getElementById('save-status').textContent = '';
            document.getElementById('save-status').className = '';
        }, 3000);
    } catch (error) {
        console.error('Save error:', error);
        document.getElementById('save-status').textContent = 'Error saving: ' + error.message;
        document.getElementById('save-status').className = 'status-error';
    }
}

/**
 * Add a new page to the website
 */
function addNewPage() {
    const pageName = prompt('Enter new page name (lowercase, no spaces):');
    
    if (!pageName) return;
    
    // Validate page name (lowercase, no spaces)
    if (!/^[a-z0-9-]+$/.test(pageName)) {
        alert('Page name must be lowercase with no spaces. Use hyphens instead of spaces.');
        return;
    }
    
    // Check if page already exists
    if (contentData.pages && contentData.pages[pageName]) {
        alert('Page already exists.');
        return;
    }
    
    // Create new page
    if (!contentData.pages) {
        contentData.pages = {};
    }
    
    contentData.pages[pageName] = {
        sections: [
            {
                title: "New Page",
                content: "Add your content here"
            }
        ]
    };
    
    // Update page navigation
    const button = document.createElement('button');
    button.textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    button.onclick = () => showPage(pageName);
    document.getElementById('page-nav').appendChild(button);
    
    // Switch to the new page
    showPage(pageName);
}

/**
 * Preview the website in a new tab
 */
function previewWebsite() {
    // Open the website in a new tab
    window.open('../index.html', '_blank');
}

// Initialize when ready
document.addEventListener('DOMContentLoaded', initGoogleAuth);