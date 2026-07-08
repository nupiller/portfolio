// Simple helpers
document.getElementById('year').textContent = new Date().getFullYear();

// Optional: lazy load background images used in inline styles
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tile .img').forEach(el => {
    const bg = el.style.backgroundImage || '';
    if(bg && bg.includes('url(')){
      // no-op here; browsers already load background images, but you could swap low-res -> hi-res
    }
  });
});
