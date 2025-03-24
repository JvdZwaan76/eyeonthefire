document.addEventListener('DOMContentLoaded', () => {
  // Fade-in animations for prevention items
  const items = document.querySelectorAll('.prevention-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('fade-in');
        }, index * 300); // Staggered fade-in
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  items.forEach(item => observer.observe(item));

  // Hamburger menu toggle for mobile
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
  });
});