// Kleine UI-Skripte
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile navigation toggle
const toggle = document.querySelector('.nav-toggle');
if(toggle){
  toggle.addEventListener('click', ()=>{
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    // Für dieses einfache Template gibt es keine Menu, aber das Attribut hilft bei Accessibility
  });
}
