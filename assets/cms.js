function saveContent() {
  const content = {
    siteTitle: document.getElementById('site-title-input').value,
    hero: {
      title: document.getElementById('hero-title-input').value,
      description: document.getElementById('hero-desc-input').value
    }
  };
  const blob = new Blob([JSON.stringify(content, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'home.json';
  a.click();
}