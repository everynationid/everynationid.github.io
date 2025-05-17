fetch('content/home.json')
  .then(res => res.json())
  .then(data => {
    document.getElementById('site-title').textContent = data.siteTitle;
    document.getElementById('hero-title').textContent = data.hero.title;
    document.getElementById('hero-desc').textContent = data.hero.description;
  });