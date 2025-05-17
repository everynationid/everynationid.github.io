document.addEventListener("DOMContentLoaded", () => {
  fetch('content/home.json')
    .then(res => res.json())
    .then(data => {
      document.getElementById('site-title-input').value = data.siteTitle || '';
      document.getElementById('hero-title-input').value = data.hero?.title || '';
      document.getElementById('hero-desc-input').value = data.hero?.description || '';
    });
});

function saveContent() {
  const data = {
    siteTitle: document.getElementById('site-title-input').value,
    hero: {
      title: document.getElementById('hero-title-input').value,
      description: document.getElementById('hero-desc-input').value
    }
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type : 'application/json'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'home.json';
  link.click();
}

async function saveContentToGitHub(filePath, updatedContent) {
  const token = getToken();
  if (!token) return alert("GitHub token not found.");

  const owner = "your-github-username";    // <<-- edit this
  const repo = "your-repo-name";           // <<-- edit this
  const branch = "main";                   // <<-- or "master"
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  // Step 1: Get current file's SHA
  const response = await fetch(apiUrl, {
    headers: { Authorization: `token ${token}` }
  });

  if (!response.ok) {
    alert("Failed to fetch file metadata. Check file path and token.");
    return;
  }

  const data = await response.json();

  // Step 2: Encode updated content
  const contentEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(updatedContent, null, 2))));

  // Step 3: Push new content
  const updatePayload = {
    message: "Update content via CMS",
    content: contentEncoded,
    sha: data.sha,
    branch: branch
  };

  const updateResponse = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updatePayload)
  });

  if (updateResponse.ok) {
    alert("Content saved to GitHub!");
  } else {
    const err = await updateResponse.text();
    alert("Failed to save: " + err);
    console.error(err);
  }
}
