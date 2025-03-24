document.addEventListener('DOMContentLoaded', () => {
  // Fade-in animations for prevention items
  const items = document.querySelectorAll('.prevention-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('fade-in');
        }, index * 300);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  items.forEach(item => observer.observe(item));

  // Hamburger menu toggle for mobile
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger && navMenu) {
    console.log('Hamburger menu initialized');
    hamburger.addEventListener('click', () => {
      console.log('Hamburger clicked');
      navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
  } else {
    console.error('Hamburger or nav menu not found');
  }
});