document.addEventListener("DOMContentLoaded", () => {
  const content = JSON.parse(localStorage.getItem("content"));
  if (content) {
    document.getElementById("hero-title").textContent = content.hero.title;
    document.getElementById("hero-description").textContent = content.hero.description;
  }
});