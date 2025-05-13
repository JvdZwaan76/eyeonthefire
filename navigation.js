// Navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    // Update year in footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // Mobile navigation handling
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const mainNavLinks = document.querySelectorAll('.main-menu a');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isActive = navMenu.classList.contains('active');
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', !isActive);
            if (!navMenu.classList.contains('active')) {
                document.querySelectorAll('.main-menu .has-dropdown.open').forEach(openDropdown => {
                    openDropdown.classList.remove('open');
                    const caret = openDropdown.querySelector('a > i.fa-caret-down');
                    if(caret) caret.style.transform = '';
                });
            }
        });
    }
    
    // Dropdown menu handling
    if (navMenu) {
        const dropdownToggles = navMenu.querySelectorAll('.main-menu .has-dropdown > a');
        dropdownToggles.forEach(toggleLink => {
            toggleLink.addEventListener('click', (e) => {
                if (hamburger && window.getComputedStyle(hamburger).display !== 'none') {
                    e.preventDefault();
                    const parentLi = toggleLink.closest('.has-dropdown');
                    if (parentLi) {
                        const currentlyOpen = parentLi.classList.contains('open');
                        document.querySelectorAll('.main-menu .has-dropdown.open').forEach(otherLi => {
                            if (otherLi !== parentLi) {
                                otherLi.classList.remove('open');
                                const otherCaret = otherLi.querySelector('a > i.fa-caret-down');
                                if(otherCaret) otherCaret.style.transform = '';
                            }
                        });
                        parentLi.classList.toggle('open', !currentlyOpen);
                        const caret = toggleLink.querySelector('i.fa-caret-down');
                        if (caret) {
                            caret.style.transform = parentLi.classList.contains('open') ? 'rotate(180deg)' : '';
                        }
                    }
                }
                else if (!toggleLink.getAttribute('href') || toggleLink.getAttribute('href') === '#') {
                    e.preventDefault();
                }
            });
        });
        
        // Navigation link click handling
        mainNavLinks.forEach(link => {
            const isToggle = link.matches('.has-dropdown > a');
            const isInDropdown = link.closest('.dropdown') !== null;
            if (!isToggle || (isInDropdown && hamburger && navMenu.classList.contains('active'))) {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    let isExternal = false;
                    try {
                        isExternal = new URL(href, window.location.origin).origin !== window.location.origin;
                    } catch (_) {}
                    if (hamburger && navMenu.classList.contains('active') && (!href || href === '#' || (href.startsWith('#') && !isExternal))) {
                        hamburger.classList.remove('active');
                        navMenu.classList.remove('active');
                        hamburger.setAttribute('aria-expanded', 'false');
                        document.querySelectorAll('.main-menu .has-dropdown.open').forEach(openDropdown => {
                            openDropdown.classList.remove('open');
                            const caret = openDropdown.querySelector('a > i.fa-caret-down');
                            if(caret) caret.style.transform = '';
                        });
                    }
                });
            }
        });
    }
});
