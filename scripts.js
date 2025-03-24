// Fade-in animations on scroll
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.prevention-item');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('fade-in');
        }, index * 200); // Staggered fade-in
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  items.forEach(item => observer.observe(item));
});