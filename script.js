// Three.js Scene Setup
let scene, camera, renderer, spheres = [];
let ambientLights = []; // Array to store ambient lights
let ambientIntensity = 0; // Current ambient light intensity
let ambientIntensityTarget = 0.3; // Target intensity to animate towards
let ambientIntensityBase = 0.3; // Base intensity when idle
let ambientColor = 0x9F7AEA; // Purple ambient color
let lastUserActivity = Date.now(); // Track last user interaction time
let idleTimer; // Timer to track user idle state
let currentSection = "home"; // Track current active section

function initThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Create renderer with high quality for glass effect and true transparency
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Fully transparent background
    renderer.setPixelRatio(window.devicePixelRatio);
    // Enable transparency
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    // Add ambient lighting system
    createAmbientLightingSystem();
    
    // Add point lights with purple hues for dramatic lighting
    const purpleLight = new THREE.PointLight(0x9F7AEA, 1, 20);
    purpleLight.position.set(5, 5, 5);
    scene.add(purpleLight);
    
    const blueLight = new THREE.PointLight(0x63B3ED, 0.8, 20);
    blueLight.position.set(-5, -5, 5);
    scene.add(blueLight);
    
    // Add renderer to the DOM
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Create floating spheres with tech logos
    createFloatingSpheres();
    
    // Add window resize listener
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
}

function createAmbientLightingSystem() {
    // Create multiple ambient lights with different positions for a more dynamic effect
    const positions = [
        { x: 0, y: 0, z: 0 },       // Center
        { x: 5, y: 5, z: 5 },       // Top right
        { x: -5, y: 5, z: 5 },      // Top left
        { x: 5, y: -5, z: 5 },      // Bottom right
        { x: -5, y: -5, z: 5 }      // Bottom left
    ];
    
    positions.forEach((pos, index) => {
        // Create ambient light with purple color
        const light = new THREE.AmbientLight(ambientColor, ambientIntensity);
        
        // Create a hemisphere light for better coloring
        const hemisphereLight = new THREE.HemisphereLight(
            ambientColor,   // Sky color (purple)
            0x000000,       // Ground color (black)
            ambientIntensity
        );
        hemisphereLight.position.set(pos.x, pos.y, pos.z);
        
        // Add lights to scene and store in array
        scene.add(light);
        scene.add(hemisphereLight);
        ambientLights.push({ ambient: light, hemisphere: hemisphereLight });
    });
    
    // Add a subtle point light at center for dramatic effect
    const centerLight = new THREE.PointLight(ambientColor, ambientIntensity * 1.5, 15);
    centerLight.position.set(0, 0, 2);
    scene.add(centerLight);
    ambientLights.push({ point: centerLight });
    
    // Add dynamic point lights for section-specific effects
    const sections = ['home', 'about', 'work', 'contact'];
    sections.forEach((sectionName, index) => {
        // Create section-specific point lights with custom positions
        const sectionLight = new THREE.PointLight(
            ambientColor,
            0,  // Start with 0 intensity, will be controlled dynamically
            10
        );
        
        // Position lights in different areas based on section
        const posX = Math.cos(index * Math.PI / 2) * 5;
        const posY = Math.sin(index * Math.PI / 2) * 5;
        sectionLight.position.set(posX, posY, 3);
        
        scene.add(sectionLight);
        ambientLights.push({ 
            sectionLight: sectionLight,
            sectionName: sectionName
        });
    });
    
    // Initialize idle detection for ambient lighting
    initIdleDetection();
}

function updateAmbientLighting() {
    // Check idle state for potential ambient dimming
    checkIdleState();
    
    // Smoothly interpolate current intensity toward target intensity
    ambientIntensity += (ambientIntensityTarget - ambientIntensity) * 0.05;
    
    // Get current time for pulsing effects
    const time = Date.now() * 0.001;
    
    // Update all ambient lights
    ambientLights.forEach(lightGroup => {
        if (lightGroup.ambient) {
            lightGroup.ambient.intensity = ambientIntensity;
        }
        
        if (lightGroup.hemisphere) {
            lightGroup.hemisphere.intensity = ambientIntensity;
        }
        
        if (lightGroup.point) {
            // Add subtle pulsing effect to center point light
            const pulse = Math.sin(time) * 0.1;
            lightGroup.point.intensity = (ambientIntensity * 1.5) + pulse;
        }
        
        // Update section-specific lighting
        if (lightGroup.sectionLight && lightGroup.sectionName) {
            // Boost intensity for current section, dim others
            if (lightGroup.sectionName === currentSection) {
                lightGroup.sectionLight.intensity = ambientIntensity * 0.8;
                
                // Add subtle pulse effect for active section
                const sectionPulse = Math.sin(time * 2) * 0.1;
                lightGroup.sectionLight.intensity += sectionPulse;
            } else {
                // Dim non-active sections
                lightGroup.sectionLight.intensity = ambientIntensity * 0.2;
            }
        }
    });
    
    // No need to set scene background - using CSS gradient background instead
    // Make scene background transparent to allow CSS gradients to show through
    scene.background = null;
}

function createFloatingSpheres() {
    // Technology names to display on spheres
    const technologies = [
        'JS', 'React', 'Node', 'Next', 'CSS', 'HTML', 'Three.js', 
        'MongoDB', 'Express', 'Angular', 'AI/ML', 'TypeScript'
    ];
    
    // Purple colors for the glass effect
    const purpleColors = [
        0x9F7AEA, // Primary purple
        0x805AD5, // Deeper purple
        0xB794F4, // Lighter purple
        0x6B46C1, // Rich purple
        0xD6BCFA  // Soft purple
    ];
    
    technologies.forEach((tech, index) => {
        // Create sphere geometry - varying sizes for more dynamic look
        const size = 0.2 + Math.random() * 0.3;
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        
        // Create a glass-like material with purple glow
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            shininess: 100,
            specular: new THREE.Color(purpleColors[index % purpleColors.length]),
            refractionRatio: 0.98,
            reflectivity: 0.9
        });
        
        // Create mesh
        const sphere = new THREE.Mesh(geometry, material);
        
        // Create a wireframe for the purple border effect
        const wireGeometry = new THREE.SphereGeometry(size * 1.02, 16, 16);
        const wireMaterial = new THREE.MeshBasicMaterial({
            color: purpleColors[index % purpleColors.length],
            wireframe: true,
            transparent: true,
            opacity: 0.7
        });
        const wireframe = new THREE.Mesh(wireGeometry, wireMaterial);
        
        // Add wireframe to sphere
        sphere.add(wireframe);
        
        // Position randomly in the scene - more spread out
        sphere.position.x = (Math.random() - 0.5) * 12;
        sphere.position.y = (Math.random() - 0.5) * 12;
        sphere.position.z = (Math.random() - 0.5) * 6;
        
        // Add random movement properties - smoother, varied movement
        sphere.userData = {
            speed: {
                x: (Math.random() - 0.5) * 0.008,
                y: (Math.random() - 0.5) * 0.008,
                z: (Math.random() - 0.5) * 0.005
            },
            pulseSpeed: 0.005 + Math.random() * 0.01,
            pulseAmount: 0.05 + Math.random() * 0.05,
            originalSize: size,
            originalOpacity: material.opacity,
            tech: tech,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.005,
                y: (Math.random() - 0.5) * 0.005
            }
        };
        
        // Add to scene and spheres array
        scene.add(sphere);
        spheres.push(sphere);
    });
}

// Track scrolling for glass effect
let lastScrollY = 0;
let scrollSpeed = 0;
let blurAmount = 0;
let isScrolling = false;
let scrollTimeout;
let currentTime = 0;

function animate() {
    requestAnimationFrame(animate);
    currentTime += 0.01;
    
    // Update ambient lighting
    updateAmbientLighting();
    
    // Update gradient lights interaction with Three.js scene
    updateGradientLightsInteraction();
    
    // Animate each sphere
    spheres.forEach((sphere, index) => {
        // Update position based on speed
        sphere.position.x += sphere.userData.speed.x;
        sphere.position.y += sphere.userData.speed.y;
        sphere.position.z += sphere.userData.speed.z;
        
        // Bounce if reaches boundaries with slight randomization for natural movement
        if (Math.abs(sphere.position.x) > 6) {
            sphere.userData.speed.x *= -1;
            sphere.userData.speed.x += (Math.random() - 0.5) * 0.002; // Add slight randomness
        }
        if (Math.abs(sphere.position.y) > 6) {
            sphere.userData.speed.y *= -1;
            sphere.userData.speed.y += (Math.random() - 0.5) * 0.002;
        }
        if (Math.abs(sphere.position.z) > 4) {
            sphere.userData.speed.z *= -1;
            sphere.userData.speed.z += (Math.random() - 0.5) * 0.001;
        }
        
        // Pulsating size effect for liquid glass look
        const pulse = Math.sin(currentTime * sphere.userData.pulseSpeed) * sphere.userData.pulseAmount;
        const scaleFactor = 1 + pulse;
        sphere.scale.set(scaleFactor, scaleFactor, scaleFactor);
        
        // Apply more dynamic rotation
        sphere.rotation.x += sphere.userData.rotationSpeed.x;
        sphere.rotation.y += sphere.userData.rotationSpeed.y;
        
        // Apply blur effect based on scroll speed
        const blurFactor = Math.min(1, blurAmount / 10);
        
        // Adjust opacity for "blur" effect when scrolling
        if (isScrolling) {
            sphere.material.opacity = Math.max(0.2, sphere.userData.originalOpacity - blurFactor * 0.4);
            if (sphere.children[0]) {
                sphere.children[0].material.opacity = Math.max(0.3, 0.7 - blurFactor * 0.5);
            }
        } else {
            // Gradually return to original opacity
            sphere.material.opacity += (sphere.userData.originalOpacity - sphere.material.opacity) * 0.05;
            if (sphere.children[0]) {
                sphere.children[0].material.opacity += (0.7 - sphere.children[0].material.opacity) * 0.05;
            }
        }
        
        // Add subtle motion based on mouse position (follows cursor subtly)
        if (window.mouseX !== undefined && window.mouseY !== undefined) {
            const mouseInfluence = 0.0001;
            sphere.position.x += (window.mouseX - sphere.position.x) * mouseInfluence;
            sphere.position.y += (-window.mouseY - sphere.position.y) * mouseInfluence;
        }
    });
    
    // Gradually reduce blur amount when not scrolling
    if (!isScrolling && blurAmount > 0) {
        blurAmount = Math.max(0, blurAmount - 0.2);
    }
    
    // Render the scene
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Smooth scrolling effect
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

// Loading Animation
document.addEventListener('DOMContentLoaded', () => {
    const loaderContainer = document.querySelector('.loader-container');
    const loadingPercentage = document.querySelector('.loading-percentage');
    let progress = 0;
    
    // Initialize Three.js scene
    initThreeJS();
    
    // Initialize UI lighting effects and gallery after slight delay to ensure DOM is ready
    setTimeout(() => {
        initUILightingEffects();
        initWorkGallery();
        initLightClusterMouseTracking(); // Initialize mouse tracking for light clusters
    }, 1000);
    
    // Simulate loading progress
    const loadingInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress > 100) progress = 100;
        
        loadingPercentage.textContent = `${progress}%`;
        
        if (progress === 100) {
            clearInterval(loadingInterval);
            
            // Hide loader after a small delay
            setTimeout(() => {
                loaderContainer.style.opacity = '0';
                setTimeout(() => {
                    loaderContainer.style.display = 'none';
                }, 500);
            }, 500);
        }
    }, 100);
    
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
            smoothScroll(target, 1000);
        });
    });
    
    // Handle resume button clicks
    const resumeBtns = document.querySelectorAll('.resume-btn, .resume-floating-btn');
    resumeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // No need to prevent default, we want the link to open
            // Just add visual feedback with lighting effects
            
            // Update user activity timestamp
            lastUserActivity = Date.now();
            
            // Quick flash of increased intensity for visual feedback
            const originalTarget = ambientIntensityTarget;
            ambientIntensityTarget = ambientIntensityBase * 1.6;
            
            // Return to normal after brief flash
            setTimeout(() => {
                ambientIntensityTarget = originalTarget;
            }, 500);
        });
    });
    
    // Mouse tracking for subtle sphere interaction
    window.mouseX = 0;
    window.mouseY = 0;
    document.addEventListener('mousemove', (event) => {
        window.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        window.mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    });
    
    // Touch tracking for mobile
    document.addEventListener('touchmove', (event) => {
        if (event.touches.length > 0) {
            window.mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
            window.mouseY = (event.touches[0].clientY / window.innerHeight) * 2 - 1;
        }
    });
    
    // Active link highlighting and scroll effects
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.mobile-nav a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        let scrollPosition = window.pageYOffset;
        
        // Calculate scroll speed for blur effect
        const scrollDelta = scrollPosition - lastScrollY;
        lastScrollY = scrollPosition;
        scrollSpeed = Math.abs(scrollDelta);
        blurAmount = Math.min(20, blurAmount + scrollSpeed * 0.1);
        
        // Set scrolling flag and clear previous timeout
        isScrolling = true;
        clearTimeout(scrollTimeout);
        
        // Set timeout to detect when scrolling stops
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            
            // Reset ambient lighting intensity when scrolling stops
            ambientIntensityTarget = 0.3; // Base intensity
        }, 100);
        
        // Adjust ambient lighting based on scroll speed with more dynamic range
        if (scrollSpeed > 0) {
            // Increase ambient light intensity with faster scrolling
            // Map scroll speed (typically 0-50) to intensity boost (0-0.5)
            const scrollFactor = Math.min(scrollSpeed / 100, 0.5);
            ambientIntensityTarget = Math.min(0.8, ambientIntensityBase + scrollFactor);
            
            // Make spheres glow brighter with faster scrolling
            spheres.forEach(sphere => {
                if (sphere.material.emissive) {
                    sphere.material.emissive.setHex(ambientColor);
                    sphere.material.emissiveIntensity = scrollFactor * 0.5;
                }
            });
        }
        
        // Add blur class to canvas when scrolling for Apple-like glass effect
        const canvas = document.querySelector('#canvas-container canvas');
        if (canvas) {
            if (isScrolling) {
                canvas.classList.add('blur-effect');
            } else {
                canvas.classList.remove('blur-effect');
            }
        }
        
        // Active section detection with ambient lighting effects
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
                
                // Update current section for ambient lighting
                if (currentSection !== current) {
                    // Section changed, update lighting
                    currentSection = current;
                    
                    // Apply section-specific ambient lighting
                    applyAmbientLightingForSection(currentSection);
                }
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').slice(1) === current) {
                item.classList.add('active');
            }
        });
        
        // Enhanced parallax scrolling effect for sections with depth
        sections.forEach((section, index) => {
            const speed = 0.2 + (index * 0.05); // Different speeds for different sections
            const yPos = -(scrollPosition * speed);
            section.style.backgroundPositionY = yPos + 'px';
            
            // Add subtle 3D transform effect based on scroll position
            const rotation = (scrollPosition - section.offsetTop) * 0.01;
            if (rotation > -5 && rotation < 5) {
                section.style.transform = `perspective(1000px) rotateX(${rotation}deg)`;
            }
        });
    });
    
    // Enable smooth scrolling effect for all sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            smoothScroll(target, 1000);
        });
    });
});

// Work Gallery Scroll Effect
function initWorkGallery() {
    const gallery = document.querySelector('.work-gallery');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    const items = document.querySelectorAll('.work-item');
    
    if (!gallery || !prevBtn || !nextBtn || items.length === 0) return;
    
    const itemWidth = items[0].offsetWidth + 20; // Including gap
    let currentPosition = 0;
    const maxScroll = (items.length - getVisibleItems()) * itemWidth;
    
    // Update ambient lighting when interacting with gallery
    const updateGalleryLighting = () => {
        // Temporarily boost the ambient light when scrolling the gallery
        const originalTarget = ambientIntensityTarget;
        ambientIntensityTarget = ambientIntensityBase * 1.4;
        
        // Return to normal after a moment
        setTimeout(() => {
            ambientIntensityTarget = originalTarget;
        }, 800);
    };
    
    function getVisibleItems() {
        const galleryWidth = gallery.parentElement.offsetWidth;
        return Math.floor(galleryWidth / itemWidth);
    }
    
    function updateGalleryPosition() {
        // Ensure we don't scroll past the beginning or end
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
        updateGalleryLighting();
    });
    
    // Next button click
    nextBtn.addEventListener('click', () => {
        currentPosition -= itemWidth * Math.min(3, getVisibleItems());
        updateGalleryPosition();
        updateGalleryLighting();
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
            updateGalleryLighting();
        }
        
        if (touchEndX - touchStartX > swipeThreshold) {
            // Swipe right - go to previous items
            currentPosition += itemWidth * Math.min(2, getVisibleItems());
            updateGalleryPosition();
            updateGalleryLighting();
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
    
    // Add interactive hover effects to work items
    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Quick pulse of lighting
            if (ambientLights.length > 0) {
                // Focus lighting on this item
                const rect = item.getBoundingClientRect();
                const centerX = (rect.left + rect.width / 2) / window.innerWidth;
                const centerY = (rect.top + rect.height / 2) / window.innerHeight;
                
                // Set intensity slightly higher than base
                ambientIntensityTarget = ambientIntensityBase * 1.2;
            }
            
            // Add subtle glow to item
            item.style.boxShadow = '0 0 25px rgba(159, 122, 234, 0.5)';
        });
        
        item.addEventListener('mouseleave', () => {
            // Return to normal lighting
            ambientIntensityTarget = ambientIntensityBase;
            
            // Remove glow effect
            item.style.boxShadow = '';
        });
    });
}

// Update gradient lights to interact with Three.js scene
function updateGradientLightsInteraction() {
    // Handle the main background gradient lights
    const gradientLights = document.querySelectorAll('.gradient-light');
    if (!gradientLights.length) return;
    
    // Sync gradient light intensity with ambient lighting
    const intensity = ambientIntensity * 2; // Scale for visibility
    const opacityValue = 0.1 + (intensity * 0.2); // Range: 0.1 - 0.3
    
    gradientLights.forEach((light, index) => {
        // Set opacity based on current ambient intensity
        light.style.opacity = opacityValue.toString();
        
        // Subtle pulse effect based on Three.js timing
        const pulse = Math.sin(currentTime * 0.5 + index) * 0.1;
        const scale = 1 + pulse;
        
        // Apply additional transform for dynamic effect
        const currentTransform = getComputedStyle(light).transform;
        if (currentTransform.includes('matrix')) {
            // Extract the translation values from current transform (keep animation going)
            const matrix = new DOMMatrix(currentTransform);
            const translateX = matrix.m41;
            const translateY = matrix.m42;
            
            // Apply scale while preserving translation from the moveGradient animation
            light.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        }
        
        // Adjust blur amount based on intensity and scroll speed
        const blurAmount = 80 + (intensity * 20) + (isScrolling ? scrollSpeed : 0);
        light.style.filter = `blur(${blurAmount}px)`;
        
        // Adjust color saturation based on section and intensity
        const saturation = 100 + (intensity * 20);
        light.style.background = `radial-gradient(circle, 
            hsl(270, ${saturation}%, 70%) 0%, 
            hsla(260, ${saturation - 20}%, 52%, 0.5) 40%, 
            transparent 70%)`;
    });
    
    // Now handle the specific red region light clusters
    updateLightClusters();
}

// Animate elements when they come into view
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

// Add animation classes and observe elements
window.addEventListener('load', () => {
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
        
        // Add 3D tilt effect on hover
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
    
    // Add interactive particle effect to section titles
    document.querySelectorAll('.section-title').forEach(title => {
        title.addEventListener('mouseenter', () => {
            // Update user activity timestamp
            lastUserActivity = Date.now();
            
            // Create dramatic lighting effect on title hover
            const sectionParent = title.closest('section');
            const sectionId = sectionParent ? sectionParent.id : 'home';
            
            // Increase ambient light intensity significantly on hover
            ambientIntensityTarget = ambientIntensityBase * 1.7; // Much brighter on hover
            
            // Add purple glow to the title
            title.classList.add('glow-effect');
            
            // Add pulsating background effect behind title
            addPulseEffectToElement(title);
            
            // Create ripple effect from title that affects ambient lighting
            createLightingRippleEffect(title);
            
            // Increase sphere activity when hovering over titles
            spheres.forEach(sphere => {
                // Store original speeds
                if (!sphere.userData.originalSpeed) {
                    sphere.userData.originalSpeed = {
                        x: sphere.userData.speed.x,
                        y: sphere.userData.speed.y,
                        z: sphere.userData.speed.z
                    };
                }
                
                // Speed up movement temporarily
                sphere.userData.speed.x *= 2;
                sphere.userData.speed.y *= 2;
                sphere.userData.speed.z *= 2;
                
                // Make spheres glow when hovering titles
                if (sphere.material.emissive) {
                    sphere.material.emissive.setHex(ambientColor);
                    sphere.material.emissiveIntensity = 0.5;
                }
            });
        });
        
        title.addEventListener('mouseleave', () => {
            // Return ambient light intensity to normal with smooth transition
            ambientIntensityTarget = ambientIntensityBase;
            
            // Remove glow effect
            title.classList.remove('glow-effect');
            
            // Return to normal speed
            spheres.forEach(sphere => {
                if (sphere.userData.originalSpeed) {
                    sphere.userData.speed.x = sphere.userData.originalSpeed.x;
                    sphere.userData.speed.y = sphere.userData.originalSpeed.y;
                    sphere.userData.speed.z = sphere.userData.originalSpeed.z;
                }
            });
        });
    });
    
    // Add subtle wave effect to timeline
    const timeline = document.querySelector('.timeline');
    if (timeline) {
        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY;
            const timelinePos = timeline.getBoundingClientRect().top + scrollPos;
            const distance = scrollPos - timelinePos + 400;
            
            if (distance > 0) {
                const timelineItems = document.querySelectorAll('.timeline-item');
                timelineItems.forEach((item, index) => {
                    const waveOffset = Math.sin(distance / 200 + index) * 10;
                    item.style.transform = `translateX(${waveOffset}px)`;
                });
            }
        });
    }
    
    // Add glass effect to all section dividers
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        // Add subtle gradient overlay for depth
        const overlay = document.createElement('div');
        overlay.classList.add('section-overlay');
        section.appendChild(overlay);
    });
});

function initIdleDetection() {
    // Track user activity to adjust ambient lighting
    const userEvents = ['mousemove', 'mousedown', 'click', 'touchstart', 'touchmove', 'keydown', 'scroll'];
    
    userEvents.forEach(eventType => {
        document.addEventListener(eventType, () => {
            // Update last activity timestamp
            lastUserActivity = Date.now();
            
            // Clear existing idle timer
            clearTimeout(idleTimer);
            
            // Set a new idle timer
            idleTimer = setTimeout(() => {
                // User is considered idle, gradually dim the ambient lighting
                ambientIntensityTarget = ambientIntensityBase * 0.7;
            }, 5000); // 5 seconds of inactivity to trigger idle state
        });
    });
}

function checkIdleState() {
    const idleTime = Date.now() - lastUserActivity;
    
    // If user returns from idle state, restore normal lighting
    if (idleTime < 5000 && ambientIntensityTarget < ambientIntensityBase) {
        ambientIntensityTarget = ambientIntensityBase;
    }
    
    // For very long idle periods, dim lights even further
    if (idleTime > 15000) { // 15 seconds
        ambientIntensityTarget = ambientIntensityBase * 0.5; // 50% dimmed
    }
}

function applyAmbientLightingForSection(sectionName) {
    // Define section-specific ambient lighting characteristics
    const sectionLighting = {
        'home': {
            intensity: 0.35,
            pulseSpeed: 1.0,
            colorShift: 0x9F7AEA, // Default purple
            gradientPosition: 'center',
            gradientSize: 1.2
        },
        'about': {
            intensity: 0.4,
            pulseSpeed: 0.7,
            colorShift: 0xB794F4, // Lighter purple
            gradientPosition: 'top-right',
            gradientSize: 1.0
        },
        'work': {
            intensity: 0.45,
            pulseSpeed: 1.2,
            colorShift: 0x805AD5, // Deeper purple
            gradientPosition: 'bottom',
            gradientSize: 1.3
        },
        'education': {
            intensity: 0.38,
            pulseSpeed: 0.9,
            colorShift: 0xA78BFA, // Medium purple
            gradientPosition: 'left',
            gradientSize: 0.9
        },
        'projects': {
            intensity: 0.5,
            pulseSpeed: 1.3,
            colorShift: 0x8B5CF6, // Rich purple
            gradientPosition: 'top',
            gradientSize: 1.1
        },
        'contact': {
            intensity: 0.3,
            pulseSpeed: 0.6,
            colorShift: 0xA78BFA, // Medium purple
            gradientPosition: 'right',
            gradientSize: 0.8
        }
    };
    
    // Get lighting settings for current section or use defaults
    const lighting = sectionLighting[sectionName] || sectionLighting['home'];
    
    // Update base and target intensity
    ambientIntensityBase = lighting.intensity;
    ambientIntensityTarget = lighting.intensity;
    
    // Create animation for smoother section transitions
    const currentColor = ambientColor;
    ambientColor = lighting.colorShift;
    
    // Update all lights with new color (subtle shift maintaining purple theme)
    ambientLights.forEach(lightGroup => {
        if (lightGroup.ambient) {
            lightGroup.ambient.color.setHex(ambientColor);
        }
        if (lightGroup.hemisphere) {
            lightGroup.hemisphere.skyColor.setHex(ambientColor);
        }
        if (lightGroup.point) {
            lightGroup.point.color.setHex(ambientColor);
        }
        if (lightGroup.sectionLight) {
            lightGroup.sectionLight.color.setHex(ambientColor);
        }
    });
    
    // Add a brief flash of brighter light during transition
    const flashIntensity = ambientIntensityBase + 0.2;
    ambientIntensityTarget = flashIntensity;
    
    // Reset to normal after brief flash
    setTimeout(() => {
        ambientIntensityTarget = ambientIntensityBase;
    }, 500);
    
    // Update gradient lights positions based on section
    adjustGradientLightsForSection(lighting.gradientPosition, lighting.gradientSize);
}

function addPulseEffectToElement(element) {
    // Create a pulsing background effect for the element
    const pulseEffect = document.createElement('div');
    pulseEffect.classList.add('pulse-effect');
    
    // Position the pulse effect behind the element
    const rect = element.getBoundingClientRect();
    pulseEffect.style.width = `${rect.width + 40}px`;
    pulseEffect.style.height = `${rect.height + 20}px`;
    pulseEffect.style.top = `-10px`;
    pulseEffect.style.left = `-20px`;
    
    // Add the pulse effect to the element
    element.style.position = 'relative';
    element.prepend(pulseEffect);
    
    // Remove the pulse effect after animation completes
    setTimeout(() => {
        pulseEffect.remove();
    }, 2000);
}

function createLightingRippleEffect(element) {
    // Create a ripple effect that affects ambient lighting
    // This simulates light spreading out from the interacted element
    
    // Get element position relative to viewport
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create normalized coordinates for the scene (-1 to 1)
    const normalizedX = (centerX / window.innerWidth) * 2 - 1;
    const normalizedY = -(centerY / window.innerHeight) * 2 + 1;
    
    // Update light positions to create a ripple effect
    // This creates the illusion of light emanating from the interaction point
    let delay = 0;
    ambientLights.forEach(lightGroup => {
        if (lightGroup.point) {
            // Animate point light to move toward interaction point then back
            const originalX = lightGroup.point.position.x;
            const originalY = lightGroup.point.position.y;
            const originalZ = lightGroup.point.position.z;
            
            // Move toward interaction point
            setTimeout(() => {
                // Move 30% toward the interaction point
                gsap.to(lightGroup.point.position, {
                    x: originalX + (normalizedX * 5 - originalX) * 0.3,
                    y: originalY + (normalizedY * 5 - originalY) * 0.3,
                    duration: 0.5,
                    ease: "power2.out",
                    onComplete: () => {
                        // Move back to original position
                        gsap.to(lightGroup.point.position, {
                            x: originalX,
                            y: originalY,
                            duration: 1.5,
                            ease: "elastic.out(1, 0.3)"
                        });
                    }
                });
            }, delay);
            
            delay += 100; // Stagger the animations
        }
    });
}

// Update the light clusters in the red-marked regions
function updateLightClusters() {
    // Get all light clusters
    const leftCluster = document.querySelector('.left-cluster');
    const rightCluster = document.querySelector('.right-cluster');
    const centerCluster = document.querySelector('.center-cluster');
    const clusterLights = document.querySelectorAll('.cluster-light');
    
    if (!clusterLights.length) return;
    
    // Apply section-specific adjustments to clusters
    adjustClusterPositionsForSection(leftCluster, rightCluster, centerCluster);
    
    // Determine enhanced intensity based on ambient lighting and scroll activity
    // Use a higher base intensity for these aesthetic highlights
    const baseIntensity = ambientIntensity * 3;  // Enhanced intensity for clusters
    const scrollBoost = isScrolling ? (scrollSpeed * 0.005) : 0;
    const intensityFactor = baseIntensity + scrollBoost;
    
    // Calculate optimal opacity range for aesthetic effect (0.15 - 0.35)
    const opacityValue = Math.min(0.35, 0.15 + (intensityFactor * 0.1));
    
    // Apply effects to each individual cluster light
    clusterLights.forEach((light, index) => {
        // Set base opacity with individual variation
        const individualOpacity = opacityValue * (1 + (Math.sin(currentTime + index) * 0.2));
        light.style.opacity = individualOpacity.toString();
        
        // Create fluid motion effect
        const currentTransform = getComputedStyle(light).transform;
        
        // Add additional dynamic movement based on user interaction
        const mouseInfluence = window.mouseX && window.mouseY ? 
            Math.sin(window.mouseX * window.mouseY * 0.1 + index * 0.5) * 5 : 0;
            
        const pulse = Math.sin(currentTime * (0.3 + index * 0.05)) * 0.15;
        const scale = 1 + pulse;
        
        // Apply additional transform effects while preserving animation
        if (!currentTransform.includes('matrix3d')) {
            // Add subtle interactive movement
            const offsetX = Math.sin(currentTime * 0.2 + index) * 10 + mouseInfluence;
            const offsetY = Math.cos(currentTime * 0.3 + index) * 10;
            
            // Small lights move more dramatically
            const moveFactor = light.classList.contains('small') ? 1.5 : 1;
            
            // Apply the transform
            light.style.transform = `translate(${offsetX * moveFactor}px, ${offsetY * moveFactor}px) scale(${scale})`;
        }
        
        // Dynamic blur effect based on intensity and scrolling
        const isSmall = light.classList.contains('small');
        const baseBlur = isSmall ? 40 : 60;
        const blurAmount = baseBlur + (intensityFactor * 10) + (isScrolling ? scrollSpeed * 0.5 : 0);
        light.style.filter = `blur(${blurAmount}px)`;
        
        // Dynamic color adjustments based on section and intensity
        const hue = 270 + (Math.sin(currentTime * 0.1 + index) * 15); // Purple range (255-285)
        const saturation = 80 + (intensityFactor * 15);
        const lightness = 60 + (Math.sin(currentTime * 0.2 + index * 0.5) * 10);
        
        // Create a more vibrant gradient for these highlight areas
        light.style.background = `radial-gradient(circle, 
            hsl(${hue}, ${saturation}%, ${lightness}%) 0%, 
            hsla(${hue - 10}, ${saturation - 10}%, ${lightness - 15}%, 0.6) 30%, 
            hsla(${hue - 20}, ${saturation - 20}%, ${lightness - 20}%, 0.3) 60%,
            transparent 80%)`;
    });
}

function adjustGradientLightsForSection(position, sizeMultiplier) {
    const gradientLights = document.querySelectorAll('.gradient-light');
    if (!gradientLights.length) return;
    
    // Convert hex color to HSL to better control saturation and luminance
    function hexToHSL(hex) {
        // Remove # if present
        hex = hex.replace(/^#/, '');
        
        // Parse the hex values
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return {
            h: h * 360,
            s: s * 100,
            l: l * 100
        };
    }
    
    // Convert ambient color to HSL
    const colorHSL = hexToHSL(ambientColor.toString(16).padStart(6, '0'));
    
    // Position adjustments based on section
    let positions = [];
    switch(position) {
        case 'center':
            positions = [
                { top: '40%', left: '50%' },
                { top: '60%', left: '20%' },
                { top: '20%', left: '80%' },
                { top: '80%', left: '40%' },
                { top: '30%', left: '30%' }
            ];
            break;
        case 'top':
            positions = [
                { top: '0%', left: '50%' },
                { top: '10%', left: '20%' },
                { top: '20%', left: '80%' },
                { top: '30%', left: '40%' },
                { top: '15%', left: '60%' }
            ];
            break;
        case 'bottom':
            positions = [
                { top: '70%', left: '50%' },
                { top: '80%', left: '20%' },
                { top: '90%', left: '70%' },
                { top: '85%', left: '40%' },
                { top: '75%', left: '60%' }
            ];
            break;
        case 'left':
            positions = [
                { top: '40%', left: '10%' },
                { top: '60%', left: '20%' },
                { top: '20%', left: '30%' },
                { top: '80%', left: '15%' },
                { top: '30%', left: '25%' }
            ];
            break;
        case 'right':
            positions = [
                { top: '40%', left: '70%' },
                { top: '60%', left: '80%' },
                { top: '20%', left: '90%' },
                { top: '80%', left: '85%' },
                { top: '30%', left: '75%' }
            ];
            break;
        case 'top-right':
            positions = [
                { top: '10%', left: '70%' },
                { top: '20%', left: '80%' },
                { top: '5%', left: '90%' },
                { top: '25%', left: '85%' },
                { top: '15%', left: '75%' }
            ];
            break;
        default:
            return; // Don't adjust if position not recognized
    }
    
    // Apply positions with smooth transitions
    gradientLights.forEach((light, index) => {
        if (positions[index]) {
            light.style.transition = 'top 1.5s ease, left 1.5s ease, width 1s ease, height 1s ease';
            light.style.top = positions[index].top;
            light.style.left = positions[index].left;
            
            // Apply size adjustments
            const baseSize = parseInt(index % 2 === 0 ? 450 : 350);
            const newSize = baseSize * sizeMultiplier;
            light.style.width = `${newSize}px`;
            light.style.height = `${newSize}px`;
            
            // Apply color adjustment
            // Slightly vary hue while keeping in purple family
            const hueVariation = index * 5;
            const adjustedHue = ((colorHSL.h + hueVariation) % 40) + 250; // Keep in purple range (250-290)
            
            // Apply slightly different saturation and luminance per light for depth
            const saturation = colorHSL.s + (index * 3) - 6;
            const luminance = colorHSL.l + (index * 2) - 4;
            
            light.style.background = `radial-gradient(circle, 
                hsl(${adjustedHue}, ${saturation}%, ${luminance}%) 0%, 
                hsla(${adjustedHue - 10}, ${saturation - 10}%, ${luminance - 15}%, 0.5) 40%, 
                transparent 70%)`;
        }
    });
}

// Adjust light cluster positions and effects based on current section
function adjustClusterPositionsForSection(leftCluster, rightCluster, centerCluster) {
    if (!leftCluster || !rightCluster || !centerCluster) return;
    
    // Default positions - will be adjusted based on section
    let leftTop = '30%';
    let rightBottom = '30%';
    let centerVisible = false;
    
    // Apply different positioning and effects based on current section
    switch (currentSection) {
        case 'home':
            // For home: position clusters along the sides
            leftTop = '20%';
            rightBottom = '40%';
            centerVisible = false;
            break;
            
        case 'about':
            // For about: move clusters more toward center
            leftTop = '30%';
            rightBottom = '20%';
            centerVisible = false;
            break;
            
        case 'work':
            // For work: highlight more on the right side
            leftTop = '50%';
            rightBottom = '10%';
            centerVisible = false;
            break;
            
        case 'contact':
            // For contact: add center cluster and adjust side clusters
            leftTop = '15%';
            rightBottom = '15%';
            centerVisible = true;
            break;
            
        default:
            // Default positioning
            leftTop = '30%';
            rightBottom = '30%';
            centerVisible = false;
    }
    
    // Apply the section-specific positions with smooth transitions
    leftCluster.style.transition = 'top 1.5s ease-in-out';
    leftCluster.style.top = leftTop;
    
    rightCluster.style.transition = 'bottom 1.5s ease-in-out';
    rightCluster.style.bottom = rightBottom;
    
    // Show/hide center cluster based on section
    centerCluster.style.transition = 'opacity 1.5s ease-in-out';
    centerCluster.style.opacity = centerVisible ? '1' : '0';
    
    // Adjust the intensity of the clusters based on section
    // This is controlled via CSS classes to allow for more complex animations
    const allClusters = [leftCluster, rightCluster, centerCluster];
    const sectionClasses = ['home-active', 'about-active', 'work-active', 'contact-active'];
    
    // Remove all section classes
    allClusters.forEach(cluster => {
        sectionClasses.forEach(className => {
            cluster.classList.remove(className);
        });
        
        // Add current section class
        if (currentSection) {
            cluster.classList.add(`${currentSection}-active`);
        }
    });
}

// Add interactive lighting effects for UI elements
function initUILightingEffects() {
    // Elements that should trigger lighting effects on interaction
    const interactiveElements = document.querySelectorAll('a, button, .card, .project-item');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            // Update user activity timestamp
            lastUserActivity = Date.now();
            
            // Quick flash of increased intensity
            const originalTarget = ambientIntensityTarget;
            ambientIntensityTarget = ambientIntensityBase * 1.3;
            
            // Return to normal intensity after brief flash
            setTimeout(() => {
                ambientIntensityTarget = originalTarget;
            }, 300);
            
            // Create a quick pulse in sphere activity
            spheres.forEach(sphere => {
                const distance = getDistanceFromElementToSphere(element, sphere);
                
                // Only affect nearby spheres for a localized effect
                if (distance < 5) {
                    // Quick jolt in random direction
                    const joltFactor = 0.03 * (1 - distance / 5);
                    sphere.userData.speed.x += (Math.random() - 0.5) * joltFactor;
                    sphere.userData.speed.y += (Math.random() - 0.5) * joltFactor;
                    
                    // Brief glow effect proportional to distance
                    if (sphere.material.emissive) {
                        const intensity = 0.3 * (1 - distance / 5);
                        sphere.material.emissive.setHex(ambientColor);
                        sphere.material.emissiveIntensity = intensity;
                        
                        // Fade out emissive effect
                        setTimeout(() => {
                            sphere.material.emissiveIntensity = 0;
                        }, 500);
                    }
                }
            });
        });
    });
}

// Helper function to calculate distance between element and sphere in 3D space
function getDistanceFromElementToSphere(element, sphere) {
    // Get element center position in viewport
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Convert to normalized device coordinates (-1 to 1)
    const normalizedX = (centerX / window.innerWidth) * 2 - 1;
    const normalizedY = -(centerY / window.innerHeight) * 2 - 1;
    
    // Approximate depth based on scroll position and element position
    const normalizedZ = -0.5; // Default depth estimate
    
    // Calculate distance to sphere
    const dx = normalizedX * 10 - sphere.position.x;
    const dy = normalizedY * 10 - sphere.position.y;
    const dz = normalizedZ * 10 - sphere.position.z;
    
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

// Add mouse tracking effect for light clusters
function initLightClusterMouseTracking() {
    if (window.innerWidth < 768) return; // Skip on mobile devices
    
    // Get the clusters
    const leftCluster = document.querySelector('.left-cluster');
    const rightCluster = document.querySelector('.right-cluster');
    const centerCluster = document.querySelector('.center-cluster');
    
    if (!leftCluster || !rightCluster || !centerCluster) return;
    
    // Track mouse movement for subtle parallax effect
    document.addEventListener('mousemove', (event) => {
        // Calculate normalized position (-1 to 1)
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = (event.clientY / window.innerHeight) * 2 - 1;
        
        // Apply subtle movement to clusters (inverted for parallax)
        if (leftCluster) {
            leftCluster.style.transform = `translateX(${-mouseX * 20}px) translateY(${-mouseY * 20}px)`;
        }
        
        if (rightCluster) {
            rightCluster.style.transform = `translateX(${-mouseX * 15}px) translateY(${-mouseY * 15}px)`;
        }
        
        if (centerCluster) {
            centerCluster.style.transform = `translateX(${-mouseX * 10}px) translateY(${-mouseY * 10}px)`;
        }
    });
}
