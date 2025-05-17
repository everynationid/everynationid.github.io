function saveContent() {
  const content = {
    hero: {
      title: document.getElementById("hero-title").value,
      description: document.getElementById("hero-description").value
    }
  };

  // Save to localStorage for simplicity or replace this with GitHub API to commit changes
  localStorage.setItem("content", JSON.stringify(content));
  alert("Content saved!");
}