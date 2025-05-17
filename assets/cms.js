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
