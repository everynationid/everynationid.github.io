let currentToken = null;
let gitHubToken = null;

function initGoogleAuth() {
    google.accounts.id.initialize({
        client_id: '.apps.googleusercontent.com',
        callback: handleCredentialResponse,
        auto_select: false
    });
    google.accounts.id.renderButton(
        document.getElementById('auth-container'),
        { theme: "filled_blue", size: "large" }
    );
}

async function verifyGoogleToken(token) {
    try {
        const response = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + token);
        const payload = await response.json();
        
        // Verify domain (replace with your domain)
      if(payload.hd !== 'everynationid.github.io' && payload.hd !== 'everynation.id') {
            throw new Error('Unauthorized domain');
        }
        
        return payload;
    } catch (error) {
        console.error('Auth error:', error);
        alert('Authentication failed');
        return null;
    }
}

function handleCredentialResponse(response) {
    verifyGoogleToken(response.credential).then(payload => {
        if(payload) {
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('token-ui').style.display = 'block';
            currentToken = response.credential;
        }
    });
}

function storeToken() {
    gitHubToken = document.getElementById('githubToken').value;
    document.getElementById('token-ui').style.display = 'none';
    document.getElementById('editor').style.display = 'block';
    loadContent();
}