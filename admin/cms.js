async function loadContent() {
    try {
        const response = await fetch('../content.json');
        const content = await response.json();
        
        // Populate form fields
        document.getElementById('churchName').value = content.churchName;
        document.getElementById('tagline').value = content.tagline;
        
        // Clear existing items
        document.getElementById('menuItems').innerHTML = '';
        document.getElementById('sections').innerHTML = '';
        
        // Populate menu items
        content.menu.forEach((item, index) => {
            const html = `
                <div class="menu-item">
                    <input type="text" placeholder="Title" value="${item.title}" 
                           onchange="updateMenu(${index}, 'title', this.value)">
                    <input type="text" placeholder="Link" value="${item.link}" 
                           onchange="updateMenu(${index}, 'link', this.value)">
                    <button onclick="removeMenu(${index})">×</button>
                </div>
            `;
            document.getElementById('menuItems').innerHTML += html;
        });
        
        // Populate sections
        content.sections.forEach((section, index) => {
            const html = `
                <div class="section">
                    <input type="text" placeholder="Title" value="${section.title}" 
                           onchange="updateSection(${index}, 'title', this.value)">
                    <textarea onchange="updateSection(${index}, 'content', this.value)">
                        ${section.content}
                    </textarea>
                    <button onclick="removeSection(${index})">×</button>
                </div>
            `;
            document.getElementById('sections').innerHTML += html;
        });
        
    } catch (error) {
        console.error('Loading error:', error);
        alert('Failed to load content');
    }
}

async function getFileSha() {
    const response = await fetch('https://api.github.com/repos/[USER]/[REPO]/contents/content.json');
    const data = await response.json();
    return data.sha;
}

async function saveContent() {
    try {
        const content = {
            churchName: document.getElementById('churchName').value,
            tagline: document.getElementById('tagline').value,
            menu: Array.from(document.querySelectorAll('.menu-item')).map(item => ({
                title: item.querySelector('input[placeholder="Title"]').value,
                link: item.querySelector('input[placeholder="Link"]').value
            })),
            sections: Array.from(document.querySelectorAll('.section')).map(section => ({
                title: section.querySelector('input').value,
                content: section.querySelector('textarea').value
            }))
        };

        const commit = {
            message: "CMS Update",
            content: btoa(JSON.stringify(content, null, 2)),
            sha: await getFileSha()
        };

        const response = await fetch('https://api.github.com/repos/[USER]/[REPO]/contents/content.json', {
            method: 'PUT',
            headers: {
                'Authorization': `token ${gitHubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commit)
        });

        if(!response.ok) {
            throw new Error('GitHub API error');
        }
        
        alert('Content updated successfully!');
    } catch (error) {
        console.error('Save error:', error);
        alert('Failed to save content. Check token permissions.');
    }
}

// Initialize when ready
document.addEventListener('DOMContentLoaded', initGoogleAuth);