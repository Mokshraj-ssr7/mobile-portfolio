// Smooth and lightweight portfolio script
// Current section tracking
let currentSection = "home"; // Track current active section

// Scroll variables
let lastScrollY = 0;
let scrollSpeed = 0;
let isScrolling = false;
let scrollTimeout;

// Loading Animation
document.addEventListener('DOMContentLoaded', () => {
    const loaderContainer = document.querySelector('.loader-container');
    const loadingPercentage = document.querySelector('.loading-percentage');
    let progress = 0;
    
    // Simulate loading progress (fast and efficient)
    const loadingInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5; // Faster loading
        if (progress > 100) progress = 100;
        
        loadingPercentage.textContent = `${progress}%`;
        
        if (progress === 100) {
            clearInterval(loadingInterval);
            
            // Hide loader after a small delay
            setTimeout(() => {
                loaderContainer.style.opacity = '0';
                setTimeout(() => {
                    loaderContainer.style.display = 'none';
                }, 300);
            }, 300);
        }
    }, 80);
    
    // Initialize UI components
    setTimeout(() => {
        initWorkGallery();
        initAnimations();
        initVectorGraphicsEffects();
    }, 500);
    
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    
    menuToggle.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
    });
    
    // Close mobile menu when clicking a link and smooth scroll
    const navLinks = document.querySelectorAll('.mobile-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            mobileNav.classList.remove('active');
            
            // Smooth scroll to the target
            smoothScroll(target, 800);
        });
    });
    
    // Enable smooth scrolling effect for all sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            smoothScroll(target, 800);
        });
    });
    
    // Handle resume button clicks
    const resumeBtns = document.querySelectorAll('.resume-btn, .resume-floating-btn');
    resumeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Visual feedback through CSS only
            btn.classList.add('button-clicked');
            setTimeout(() => {
                btn.classList.remove('button-clicked');
            }, 300);
        });
    });
    
    // Active link highlighting and scroll effects
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.mobile-nav a');
    
    window.addEventListener('scroll', () => {
        // Throttle scroll events for better performance
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                handleScroll(sections, navItems);
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
    
    // Add intersection observer for animation on scroll
    setupIntersectionObserver();
    
    // Initialize vector graphics effects
    initVectorGraphicsEffects();
});

// Smooth scrolling function - optimized for performance
function smoothScroll(target, duration) {
    const targetElement = document.querySelector(target);
    const targetPosition = targetElement.offsetTop;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// Handle scroll events efficiently
function handleScroll(sections, navItems) {
    let current = '';
    let scrollPosition = window.pageYOffset;
    
    // Calculate scroll speed for effects
    const scrollDelta = scrollPosition - lastScrollY;
    lastScrollY = scrollPosition;
    scrollSpeed = Math.abs(scrollDelta);
    
    // Set scrolling flag and clear previous timeout
    clearTimeout(scrollTimeout);
    
    // Set timeout to detect when scrolling stops
    scrollTimeout = setTimeout(() => {
        // Scrolling stopped
    }, 100);
    
    // Active section detection
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
            
            // Update current section
            if (currentSection !== current) {
                currentSection = current;
                
                // Apply section-specific styling through CSS classes
                document.body.setAttribute('data-active-section', currentSection);
            }
        }
    });
    
    // Update active nav items
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').slice(1) === current) {
            item.classList.add('active');
        }
    });
    
    // Update simple background gradients based on scroll
    updateSimpleBackgroundEffects(scrollPosition, scrollSpeed);
}

// Work Gallery Scroll Effect - Lightweight version
function initWorkGallery() {
    const gallery = document.querySelector('.work-gallery');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    const items = document.querySelectorAll('.work-item');
    
    if (!gallery || !prevBtn || !nextBtn || items.length === 0) return;
    
    const itemWidth = items[0].offsetWidth + 20; // Including gap
    let currentPosition = 0;
    
    function getVisibleItems() {
        const galleryWidth = gallery.parentElement.offsetWidth;
        return Math.floor(galleryWidth / itemWidth);
    }
    
    const maxScroll = (items.length - getVisibleItems()) * itemWidth;
    
    function updateGalleryPosition() {
        // Ensure we don't scroll past boundaries
        if (currentPosition > 0) currentPosition = 0;
        if (currentPosition < -maxScroll) currentPosition = -maxScroll;
        
        // Apply smooth animation
        gallery.style.transform = `translateX(${currentPosition}px)`;
        
        // Update button states
        prevBtn.style.opacity = currentPosition < 0 ? '1' : '0.5';
        nextBtn.style.opacity = currentPosition > -maxScroll ? '1' : '0.5';
    }
    
    // Initialize button states
    updateGalleryPosition();
    
    // Previous button click
    prevBtn.addEventListener('click', () => {
        currentPosition += itemWidth * Math.min(3, getVisibleItems());
        updateGalleryPosition();
    });
    
    // Next button click
    nextBtn.addEventListener('click', () => {
        currentPosition -= itemWidth * Math.min(3, getVisibleItems());
        updateGalleryPosition();
    });
    
    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    gallery.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    gallery.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchStartX - touchEndX > swipeThreshold) {
            // Swipe left - go to next items
            currentPosition -= itemWidth * Math.min(2, getVisibleItems());
            updateGalleryPosition();
        }
        
        if (touchEndX - touchStartX > swipeThreshold) {
            // Swipe right - go to previous items
            currentPosition += itemWidth * Math.min(2, getVisibleItems());
            updateGalleryPosition();
        }
    }
    
    // Resize handler for responsive behavior
    window.addEventListener('resize', () => {
        // Recalculate visible items and max scroll
        const visibleItems = getVisibleItems();
        const newMaxScroll = (items.length - visibleItems) * itemWidth;
        
        // If we've resized smaller, we might need to adjust position
        if (currentPosition < -newMaxScroll) {
            currentPosition = -newMaxScroll;
        }
        
        updateGalleryPosition();
    });
}

// Simple background effects that don't use WebGL
function updateSimpleBackgroundEffects(scrollPosition, scrollSpeed) {
    const gradients = document.querySelectorAll('.simple-gradient');
    
    gradients.forEach((gradient, index) => {
        // Parallax effect based on scroll position
        const speed = 0.05 * (index + 1);
        const yPos = -(scrollPosition * speed);
        
        // Use transform instead of background-position for better performance
        gradient.style.transform = `translateY(${yPos}px)`;
        
        // Simple opacity effect based on scroll speed
        const baseOpacity = 0.2 + (index * 0.05);
        const opacityBoost = Math.min(0.1, scrollSpeed * 0.001);
        gradient.style.opacity = baseOpacity + opacityBoost;
    });
}

// Initialize animations for elements
function initAnimations() {
    // Animate section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach((title, index) => {
        title.style.opacity = '0';
        title.style.animation = `fadeIn 0.5s ease ${index * 0.2}s forwards`;
    });
    
    // Animate tech bubbles with staggered effect
    const techBubbles = document.querySelectorAll('.tech-bubble');
    techBubbles.forEach((bubble, index) => {
        bubble.style.opacity = '0';
        bubble.style.transform = 'translateY(20px)';
        bubble.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateY(0)';
        }, 300 + (index * 100));
        
        // Add subtle float animation
        bubble.style.animation = `float 3s ease-in-out ${index * 0.2}s infinite`;
    });
    
    // Add hover effect for project cards with 3D tilt
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        // Initial animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 500 + (index * 200));
        
        // Add 3D tilt effect on hover for desktop only
        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth > 768) { // Only on desktop
                const cardRect = card.getBoundingClientRect();
                const cardCenterX = cardRect.left + cardRect.width / 2;
                const cardCenterY = cardRect.top + cardRect.height / 2;
                const angleX = (e.clientY - cardCenterY) / 15;
                const angleY = (cardCenterX - e.clientX) / 15;
                card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    });
}

// Setup intersection observer for elements that should animate when they come into view
function setupIntersectionObserver() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Elements to observe
    const elementsToAnimate = document.querySelectorAll('.glass-card, .timeline-item, .work-item, .tech-bubble');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}

// Vector graphics parallax effect
function initVectorGraphicsEffects() {
    // Only apply effects on devices that can handle it
    if (window.innerWidth < 768) return;
    
    const vectorElements = document.querySelectorAll('.floating-svg');
    
    // Add parallax effect on mouse move
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        vectorElements.forEach((element, index) => {
            // Different parallax factors for each element
            const factor = 0.01 * (index + 1);
            const offsetX = (mouseX - 0.5) * 40 * factor;
            const offsetY = (mouseY - 0.5) * 40 * factor;
            
            // Apply transform with performant properties
            element.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
        });
    });
}
