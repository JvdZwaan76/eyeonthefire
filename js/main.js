/**
 * Eye on the Fire - Main JavaScript
 * Initializes the fire map and connects UI elements
 */

document.addEventListener('DOMContentLoaded', () => {
  initializeSite();
  if (!window.turnstile) {
    const turnstileScript = document.createElement('script');
    turnstile
