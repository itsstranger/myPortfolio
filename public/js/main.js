// Register GSAP ScrollTrigger plugin TEST
gsap.registerPlugin(ScrollTrigger);

// Disable browser scroll restoration IMMEDIATELY
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Force scroll to top function
const resetScrollTop = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
};

// Reset scroll immediately (before DOM loads)
resetScrollTop();

// Reset on page show (handles back/forward navigation)
window.addEventListener('pageshow', function(event) {
    resetScrollTop();
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Reset scroll again at DOM ready
    resetScrollTop();
    
    // Clear any persisted inline styles/transforms from browser session restore
    const shapeElements = document.querySelectorAll('.shape');
    shapeElements.forEach(shape => {
        // Remove any inline styles that might persist from previous session
        shape.style.transform = '';
        shape.style.opacity = '';
        shape.style.left = '';
        shape.style.right = '';
        shape.style.top = '';
        shape.style.bottom = '';
    });

    // Safari-specific rendering fallbacks (runs even when hover: none, e.g. iOS).
    // Some fixes are handled via CSS selectors like `body.is-safari ...`.
    if (document.body) {
        document.body.classList.toggle('is-safari', isSafariBrowser());
    }

    initLoaderTransition();
    initCursorDot();
    initWorkPageSlider();      // Run early so work page positioning is set while content still hidden
    initHeroAnimations();
    initHeroTitleImageHover();
    initWorkLaptopSequence();
    initWorkCursorFollow();
    initProcessStacking();
    initAboutPageAnimations(); // Init about page scroll animations
    initAboutTimeline();       // Then init about timeline so it accounts for pin-spacer
    initCaseStudyEvolution();  // Design evolution phase timeline on case study page
    initCaseStudyHeroMediaReveal();  // Fade-in hero media when scrolled to (any page)
    initSmoothPageTransitions(); // Enable smooth page transitions with loader
    initPortfolioPageFigureReveal();
    
    window.addEventListener('load', () => {
        // Double-check scroll position after all resources load
        resetScrollTop();
        ScrollTrigger.refresh();
        
        // Final check after a small delay to override any browser scroll restoration
        setTimeout(() => {
            resetScrollTop();
            ScrollTrigger.refresh();
        }, 100);
    });
});

// Check if device is mobile/tablet
function isMobileDevice() {
    return window.innerWidth <= 800;
}

// Check if prefers reduced motion
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isSafariBrowser() {
    const ua = navigator.userAgent;
    // Exclude Chrome/Android browsers and iOS browsers that identify as other engines.
    return /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(ua);
}

/** iPhone / iPod, or iPad (including iPadOS that reports as MacIntel + touch). Used to avoid scale-based text on WebKit. */
function isIOSDevice() {
    const ua = navigator.userAgent || '';
    if (/iPhone|iPod/i.test(ua)) return true;
    if (/iPad/i.test(ua)) return true;
    return typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

function playHeroIntro() {
    const heroContent = document.querySelector('.hero-content');
    const header = document.querySelector('.header');

    if (!heroContent || !header) {
        return;
    }

    const tl = gsap.timeline();


    tl
        .fromTo(header, {
            y: 20,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power2.out'
        })
        .fromTo(heroContent, {
            y: 50,
            opacity: 0,
            filter: 'blur(10px)'
        }, {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1,
            delay:0,
            ease: 'power2.out'
        }, '-=0.3');

       

}

function initHeroTitleImageHover() {
    const titleImages = document.querySelectorAll('.hero-title-img');
    
    titleImages.forEach(img => {
        // Listen for animation end
        img.addEventListener('animationend', (e) => {
            if (e.animationName === 'shrink') {
                // Remove animation to allow transition to work
                img.style.animation = 'none';
                // Set final width from animation
                img.style.width = isMobileDevice() ? '40px' : '6.5vw';
                img.style.marginRight = '.7vw';
            }
        });
    });
}

function initLoaderTransition() {
    const loader = document.getElementById('loader');
    const loaderFill = document.querySelector('.loader-logo-fill-bar');
    const hero = document.querySelector('.hero');
    const workPage = document.querySelector('.work-page');
    const aboutPage = document.querySelector('.about-page');
    const caseStudyPage = document.querySelector('.case-study-page');
    const header = document.querySelector('.header');
    
    // Check if we're on a page with a loader
    const mainContent = hero || workPage || aboutPage || caseStudyPage;
    
    if (!loader || !loaderFill || !mainContent || !header) {
        return;
    }

    if (prefersReducedMotion()) {
        loader.style.display = 'none';
        document.body.classList.remove('is-loading');
        gsap.set([header, mainContent], { opacity: 1, clearProps: 'transform' });
        return;
    }

    document.body.classList.add('is-loading');

    gsap.set(loaderFill, { scaleX: 0 });
    gsap.set([header, mainContent], { opacity: 0 });

    // Hide portfolio figures so they can reveal on scroll (ScrollTriggers created in onComplete)
    const portfolioPage = document.querySelector('.portfolio-page');
    if (portfolioPage && !prefersReducedMotion()) {
        const portfolioFigures = portfolioPage.querySelectorAll('figure');
        if (portfolioFigures.length) gsap.set(portfolioFigures, { opacity: 0, y: 24 });
    }

    gsap.to(loaderFill, {
        scaleX: 1,
        duration: 1.2,
        ease: 'power3.inOut'
    });

    const minDuration = 1300;
    const startTime = performance.now();
    let hasFinished = false;

    const finishLoader = () => {
        if (hasFinished) {
            return;
        }
        hasFinished = true;

        const elapsed = performance.now() - startTime;
        const remaining = Math.max(minDuration - elapsed, 0);

        window.setTimeout(() => {
            document.body.classList.remove('is-loading');
            
            // Disable loader text animation to prevent it from playing again during slide-up
            const loaderText = document.querySelector('.loader-text');
            if (loaderText) {
                loaderText.style.animation = 'none';
            }
            
            const loaderTimeline = gsap.timeline({
                onComplete: () => {
                    loader.style.display = 'none';
                    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                    initPortfolioPageFigureReveal();
                    initContactTimeline();
                }
            })
                .to(loader, {
                    yPercent: -100,
                    duration: 1.3,
                    ease: 'power3.inOut'
                }, 0)
                .set([header, mainContent], { opacity: 1 }, 0);
            
            // Only add hero-specific animations if we're on the index page
            if (hero) {
                loaderTimeline
                    .add(playHeroIntro, 0.2)
                    .add(() => {
                        if (window.__runShapeExplode) {
                            window.__runShapeExplode();
                        }
                    }, 0.5);
            }

            // Case study hero media: fade in/up when content is revealed (after loader)
            const heroMedia = document.querySelector('.case-study-hero__media');
            if (heroMedia && !prefersReducedMotion()) {
                gsap.set(heroMedia, { opacity: 0, y: 28 });
                loaderTimeline.to(heroMedia, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    delay: .7,
                    ease: 'power2.out'
                }, 0.25);
            }

            // About page: blur-to-sharp intro when content is revealed (same as when navigating via transition)
            const aboutHeroHeading = document.querySelector('.about-hero__heading');
            if (aboutHeroHeading && !prefersReducedMotion()) {
                loaderTimeline
                    .set(aboutHeroHeading, { filter: 'blur(20px)', y: 100 }, 0)
                    .to(aboutHeroHeading, {
                        filter: 'blur(0px)',
                        duration: 0.8,
                        y: 0,
                        delay: .5,
                        ease: 'power2.out'
                    }, 0);
            }
        }, remaining);
    };

    

    // Don't wait for window load (images, videos, etc.) — finish after loader animation duration
    // so LCP isn't blocked by slow resources. Content reveals ~2.6s from start.
    window.setTimeout(finishLoader, minDuration);
}

function initHeroAnimations() {
    // Get shape elements
    const shapeCircleLeft = document.getElementById('shape-circle-left');
    const shapeAstrix = document.getElementById('shape-astrix');
    const shapeAstrixTexture = document.querySelector('.shape-astrix-texture');
    const shapeStarburst = document.getElementById('shape-starburst');
    const shapeCircleRight = document.getElementById('shape-circle-right');
    const shapeCircleBottom = document.getElementById('shape-circle-bottom');
    const shapeLeaf = document.getElementById('shape-leaf');
    const shapeGeometric = document.getElementById('shape-geometric');
    const shapeStarburst2 = document.getElementById('shape-starburst-2');
    const shapeM = document.getElementById('shape-M');
    const hero = document.querySelector('.hero');
    const heroBackground = document.querySelector('.hero-background');
    const heroContent = document.querySelector('.hero-content');

    // Check if elements exist
    if (!shapeCircleLeft || !shapeAstrix || !shapeAstrixTexture || !shapeStarburst || !shapeCircleRight || !shapeCircleBottom || !shapeLeaf || !shapeGeometric || !hero || !heroBackground || !heroContent) {
        console.warn('Some shape elements not found');
        return;
    }

    // Respect reduced motion preference
    if (prefersReducedMotion()) {
        if (isMobileDevice()) {
            initHeroShapesPositionMobile();
        }
        return;
    }
    // Set initial circle positions via GSAP to avoid CSS/JS mismatch
    gsap.set(shapeCircleLeft, {
        opacity: 0,
    });
    gsap.set(shapeCircleRight, {
        opacity: 0,
        right: '50%',
        top: '100%',
        left: 'auto', 
        bottom: 'auto'
    });
    gsap.set(shapeCircleBottom, {
        left: '50%',
        bottom: '-20%',
        right: 'auto',
        top: 'auto'
    });

    // Set base positions + initial offscreen offsets for explode shapes (replaces CSS positioning)
    gsap.set(shapeStarburst, {
        left: isMobileDevice() ? '-10%' : '3%',
        top: isMobileDevice() ? '15%' : '23%',
        right: 'auto',
        bottom: 'auto',
        scale: .5,
        opacity: 0,
        x: '20vw',
        y: '20vh',
        rotationY: '180deg',
        rotationX: '-100deg'
    });
    gsap.set(shapeStarburst2, {
        right: '-20%',
        top: '10%',
        left: 'auto',
        bottom: 'auto',
        scale: .5,
        opacity: 0,
        x: '-50vw',
        y: '20vh'
    });
    gsap.set(shapeM, {
        left: '-80%',
        top: '50%',
        left: 'auto',
        bottom: 'auto',
        scale: .5,
        opacity: 0,
        x: '50vw',
        y: '0px'
    });
    gsap.set(shapeAstrix, {
        left: isMobileDevice() ? '10%' : '23%',
        top: isMobileDevice() ? '10%' : '20%',
        right: 'auto',
        bottom: 'auto',
        scale: isMobileDevice() ? 0.7 : 1,
        opacity: 0,
        x: '10vw',
        y: '25vh',
        rotationY: '480deg',
        rotationX: '-100deg'
    });
    gsap.set(shapeLeaf, {
        right: '0%',
        top: isMobileDevice() ? '45%' : '40%',
        left: 'auto',
        bottom: 'auto',
        scale: .5,
        opacity: 0,
        x: '-10vw',
        y: '-15vh',
        rotation: -250,
        rotationX: '-10deg'
    });
    gsap.set(shapeGeometric, {
        right: isMobileDevice() ? '30%' : '15%',
        bottom: isMobileDevice() ? '0%' : '10%',
        left: 'auto',
        top: 'auto',
        scale: .5,
        opacity: 0,
        x: '-40vw',
        y: '-30vh',
        rotation: -90,
        rotationY: '-180deg'
    });

    // Create explode intro animation
    const explodeIntro = gsap.timeline({ paused: true });
    explodeIntro
    .to(shapeCircleLeft, {
        scale: 1,
        opacity: 1,
        duration: 3,
        delay: 0,
        ease: 'power4.inOut'
    }, 0)
    .to(shapeCircleRight, {
        opacity: 1,
        duration: 3,
        delay: 1,
        ease: 'power4.out'
    }, 0)
        .to(shapeStarburst, {
            x: 0,
            y: 0,
            rotationY: 0,
            scale: 1,
            opacity: 1,
            rotationX: 0,
            duration: 3,
            ease: 'power4.out',
            delay: .2,
        }, 0)
        .to(shapeStarburst2, {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            rotation: 90,
            duration: 5,
            ease: 'power4.out',
            delay: .5,
        }, 0)
        .to(shapeM, {
            x: '-20vw',
            y: '20vh',
            scale: 1,
            opacity: 1,
            rotation: -90,
            duration: 5,
            ease: 'power4.out',
            }, 0)
        .to(shapeLeaf, {
            x: '10vw',
            y: window.innerWidth <= 1200 ? '20vh' : 0,
            rotationY: 0,
            scale: .8,
            opacity: 1,
            rotation: -180,
            rotationX: 0,
            duration: 2.5,
            delay: 1,
            ease: 'power4.out',
        }, 0.1)
        .to(shapeGeometric, {
            x: 0,
            y: 0,
            rotationY: 0,
            scale: 1,
            opacity: 1,
            rotation: 180,
            duration: 2.5,
            ease: 'power4.out',
            delay: .3,
        }, 0.2)
        .to(shapeAstrix, {
            x: 0,
            y: 0,
            rotationY: 0,
            rotationX: 0,
            scale: isMobileDevice() ? 0.7 : 1,
            opacity: 1,
            rotation: 270,
            duration: 3,
            delay: .5,
            ease: 'power4.out'
        }, 0.3);

    window.__runShapeExplode = () => explodeIntro.restart();
    window.__explodeIntro = explodeIntro;

    // Continuous mask rotation independent of scroll
    gsap.to(shapeAstrix, {
        rotation: 360,
        duration: 30,
        repeat: -1,
        ease: 'none',
        transformOrigin: '50% 50%'
    });

    gsap.to(shapeAstrixTexture, {
        rotation: -360,
        duration: 30,
        repeat: -1,
        ease: 'none',
        transformOrigin: '50% 50%'
    });

    // Mobile: play the loader explode intro only — no ScrollTrigger pin/scrub/orbit.
    // Hero background scrolls with the page (overrides CSS position:fixed !important).
    if (isMobileDevice()) {
        if (heroBackground) {
            heroBackground.style.setProperty('position', 'absolute', 'important');
            heroBackground.style.top = '0';
            heroBackground.style.left = '0';
            heroBackground.style.width = '100%';
            heroBackground.style.height = '100%';
        }
        if (!document.body.classList.contains('is-loading')) {
            playHeroIntro();
            if (window.__runShapeExplode) {
                window.__runShapeExplode();
            }
        }
        return;
    }

    // Calculate hero section height for scroll calculations
    const heroHeight = hero.offsetHeight;
    
    // Adjust animation intensity based on device
    const isMobile = isMobileDevice();
    const movementMultiplier = isMobile ? 0.5 : 1; // Reduce movement on mobile
    const rotationMultiplier = isMobile ? 0.6 : 1; // Reduce rotation on mobile
    const transform3DMultiplier = isMobile ? 0.4 : 1; // Reduce 3D transforms on mobile
    
    // Get expertise section
    const expertiseSection = document.getElementById('expertise');
    if (!expertiseSection) {
        console.warn('Expertise section not found');
        return;
    }

    if (!document.body.classList.contains('is-loading')) {
        playHeroIntro();
        if (window.__runShapeExplode) {
            window.__runShapeExplode();
        }
    } 

    
    // Pin the hero background container so shapes remain visible
    const heroPin = ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        markers: false,
        end: () => `bottom+=${expertiseSection.offsetHeight} 80%`,
        pin: heroBackground,
        pinSpacing: false,
        anticipatePin: 1, 
       
    });

    ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: () => `bottom+=${expertiseSection.offsetHeight} 60%`,
        scrub: 1,
        onUpdate: (self) => {
            // Fade starts late so orbit spins on its own first (e.g. 0.8 = last 20% of scroll)
            const fadeStart = 0.8;
            if (self.progress < fadeStart) {
                gsap.set(hero, { opacity: 1 });
                return;
            }
            const raw = (self.progress - fadeStart) / (1 - fadeStart);
            const eased = raw < 1 ? 1 - Math.pow(1 - raw, 1.5) : 1;
            gsap.set(hero, { opacity: 1 - eased });
        }
    });
    

    const loopData = {
        angle: 0
    };
    const loopState = {
        startAngleDegrees: 0
    };
    const loopBaseRotation = {
        left: 0,
        right: 0,
        bottom: 0
    };
    const loopSpin = {
        left: 1,
        right: 1,
        bottom: 1
    };
    let orbitLoop;

        

    // Create a single timeline with all shape animations
    const tl = gsap.timeline({
        scrollTrigger: { 
            trigger: hero,
            start: 'top top',
            end: () => `top+=${expertiseSection.offsetHeight * 1.1} 90%`,
            scrub: isMobile ? 1.5 : 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                // Safari can leave a tiny non-zero opacity when fully scrolled to the top.
                if (document.body.classList.contains('is-safari')) {
                    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
                    const isAtTop = scrollY <= 10;
                    // When scrolling quickly, ScrollTrigger progress can skip tiny thresholds.
                    const shouldHardReset = isAtTop || self.progress <= 0.08;
                    const labels = hero.querySelectorAll('.shape-label');
                    if (shouldHardReset && labels && labels.length) gsap.set(labels, { opacity: 0 });
                    const ring = hero.querySelector('.expertise-ring');
                    if (shouldHardReset && ring) gsap.set(ring, { opacity: 0 });
                }
            },
            onEnter: () => {
                // Complete explode animation instantly when user starts scrolling
                if (window.__explodeIntro && window.__explodeIntro.progress() < 1) {
                    window.__explodeIntro.progress(1);
                }
            },
            onLeave: () => {
                if (orbitLoop) {
                    orbitData.t = 1;
                    updateOrbit();
                    loopBaseRotation.left = circleSpin.left * orbitData.t;
                    loopBaseRotation.right = circleSpin.right * orbitData.t;
                    loopBaseRotation.bottom = circleSpin.bottom * orbitData.t;
                    loopState.startAngleDegrees = (orbitData.currentAngle * 180) / Math.PI;
                    gsap.set(loopData, { angle: orbitData.currentAngle });
                    gsap.killTweensOf(loopData);
                    orbitLoop.invalidate().restart();
                }
            },
            onEnterBack: () => {
                if (orbitLoop) {
                    orbitLoop.pause();
                    gsap.killTweensOf(loopData);
                    gsap.to(loopData, {
                        angle: orbitData.currentAngle,
                        duration: 0.3,
                        ease: 'power2.out',
                        onUpdate: updateLoop,
                        onComplete: () => {
                            orbitLoop.pause(0);
                        }
                    });
                }
            },
            onLeaveBack: () => {
                // Hard reset so scrubbed timeline doesn't get stuck at a non-zero opacity.
                const heroEl = hero;
                if (!heroEl) return;
                const labels = heroEl.querySelectorAll('.shape-label');
                if (labels && labels.length) {
                    gsap.set(labels, { opacity: 0 });
                }
                const ring = heroEl.querySelector('.expertise-ring');
                if (ring) {
                    gsap.set(ring, { opacity: 0 }); 
                }
            }
        }
    });

  
    // Set initial transforms (at start of timeline) - only for circles, not explode shapes
    gsap.set([shapeCircleLeft, shapeCircleRight, shapeCircleBottom], {
        x: 0,
        y: 0,
        rotation: 0,
        rotationX: 0,
        rotationY: 0,
        z: 0,
        scale: 1
    });

    // Calculate orbit parameters for circle animation
    // Match the expertise ring size; smaller on mobile to fit viewport
    const viewportHeight = window.innerHeight;
    const ringSize = isMobile
        ? Math.max(260, Math.min(viewportHeight * 0.45, 360))
        : Math.max(400, Math.min(viewportHeight * 0.6, 600));
    const orbitRadius = ringSize / 2;
    const finalScale = 0.6;
    
    // Calculate viewport center as target
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const startCenterYOffset = isMobile ? 180 : 260;
    const startCenterX = viewportCenterX;
    const startCenterY = viewportCenterY + startCenterYOffset;
    
    // Get initial positions of circles
    const leftRect = shapeCircleLeft.getBoundingClientRect();
    const rightRect = shapeCircleRight.getBoundingClientRect();
    const bottomRect = shapeCircleBottom.getBoundingClientRect();
    
    // Calculate offsets from each circle's starting position to viewport center
    const leftStartX = leftRect.left + leftRect.width / 2;
    const leftStartY = leftRect.top + leftRect.height / 2;
    const rightStartX = rightRect.left + rightRect.width / 2;
    const rightStartY = rightRect.top + rightRect.height / 2;
    const bottomStartX = bottomRect.left + bottomRect.width / 2;
    const bottomStartY = bottomRect.top + bottomRect.height / 2;
    
    // Calculate initial angles based on starting positions relative to center
    const leftStartAngle = Math.atan2(leftStartY - startCenterY, leftStartX - startCenterX);
    const rightStartAngle = Math.atan2(rightStartY - startCenterY, rightStartX - startCenterX);
    const bottomStartAngle = Math.atan2(bottomStartY - startCenterY, bottomStartX - startCenterX);

    // Average radius from the three start positions
    const leftRadius = Math.hypot(leftStartX - startCenterX, leftStartY - startCenterY);
    const rightRadius = Math.hypot(rightStartX - startCenterX, rightStartY - startCenterY);
    const bottomRadius = Math.hypot(bottomStartX - startCenterX, bottomStartY - startCenterY);
    const startRadius = ((leftRadius + rightRadius + bottomRadius) / 3) * 1.2;
    
    // Final angles on the ring (120 degrees apart)
    // Left at 210° (bottom-left), Right at 330° (bottom-right), Bottom at 90° (top)
    const finalAngles = {
        left: 210 * Math.PI / 180,
        right: 330 * Math.PI / 180,
        bottom: 90 * Math.PI / 180
    };

    // Keep the circles evenly spaced: base angle + 120° offsets
    const baseStartAngle = leftStartAngle;
    const baseEndAngle = finalAngles.left;
    const orbitTurns = 0.6;
    const circleSpin = {
        left: 300,
        right: 270,
        bottom: 140
    };
    const spacingBlendDuration = 0.2;
    const orbitData = {
        t: 0,
        radius: startRadius,
        scale: 1,
        centerX: startCenterX,
        centerY: startCenterY,
        currentAngle: 0,
        currentRotation: 0
    };

    const labelLeft = shapeCircleLeft.querySelector('.shape-label');
    const labelRight = shapeCircleRight.querySelector('.shape-label');
    const labelBottom = shapeCircleBottom.querySelector('.shape-label');

    const updateOrbit = () => {
        const t = orbitData.t;
        const spacingBlend = Math.min(t / spacingBlendDuration, 1);
        const orbitSpin = Math.PI * 2 * orbitTurns * t;

        const shortestDelta = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
        const baseDelta = shortestDelta(baseStartAngle, baseEndAngle);

        const leftAngle = baseStartAngle + baseDelta * spacingBlend + orbitSpin;
        const rightAngle = leftAngle + (Math.PI * 2 / 3);
        const bottomAngle = leftAngle + (Math.PI * 4 / 3);
        orbitData.currentAngle = leftAngle;
        orbitData.currentRotation = orbitData.t;

        gsap.set(shapeCircleLeft, {
            x: orbitData.centerX + Math.cos(leftAngle) * orbitData.radius - leftStartX,
            y: orbitData.centerY + Math.sin(leftAngle) * orbitData.radius - leftStartY,
            scale: orbitData.scale,
            rotation: circleSpin.left * orbitData.t
        });
        if (labelLeft) {
            gsap.set(labelLeft, { rotation: -circleSpin.left * orbitData.t });
        }
        gsap.set(shapeCircleRight, {
            x: orbitData.centerX + Math.cos(rightAngle) * orbitData.radius - rightStartX,
            y: orbitData.centerY + Math.sin(rightAngle) * orbitData.radius - rightStartY,
            scale: orbitData.scale,
            rotation: circleSpin.right * orbitData.t
        });
        if (labelRight) {
            gsap.set(labelRight, { rotation: -circleSpin.right * orbitData.t });
        }
        gsap.set(shapeCircleBottom, {
            x: orbitData.centerX + Math.cos(bottomAngle) * orbitData.radius - bottomStartX,
            y: orbitData.centerY + Math.sin(bottomAngle) * orbitData.radius - bottomStartY,
            scale: orbitData.scale,
            rotation: circleSpin.bottom * orbitData.t
        });
        if (labelBottom) {
            gsap.set(labelBottom, { rotation: -circleSpin.bottom * orbitData.t });
        }
    };

    updateOrbit();

    const expertiseRing = document.querySelector('.expertise-ring');
    if (expertiseRing) {
        gsap.set(expertiseRing, { opacity: 0 });
    }

   
    const shapeLabels = document.querySelectorAll('.shape-label');
    if (shapeLabels) {
        gsap.set(shapeLabels, { opacity: 0 });
    }



    // Add all shape animations to the timeline - final transforms (at end of timeline)
    tl.to(heroContent, {
        filter: 'blur(20px)',
        opacity:0,
        duration: .2,
        y:100, 
    }, "+=0.0")
    
    // Circle orbit animations with shared angular velocity (equal spacing)
    .to(orbitData, {
        t: 1,
        radius: orbitRadius,
        scale: finalScale,
        centerY: viewportCenterY,
        duration: 1,
        ease: 'power2.inOut',
        onStart: () => {
            updateOrbit();
        },
        onUpdate: () => {
            updateOrbit();
        }
    }, 0)
    
    // Other shapes continue their existing animations
    .to(shapeAstrix, {
        x: -20 * movementMultiplier,
        y: -400 * movementMultiplier,
        scale: 1.5,
        duration: 1
    }, 0)
    .to(shapeStarburst, {
        x: -150 * movementMultiplier,
        y: -100 * movementMultiplier,
        rotation: 20 * rotationMultiplier,
        rotationX: -10 * transform3DMultiplier,
        rotationY: -20 * transform3DMultiplier,
        z: 150 * transform3DMultiplier,
        duration: 1
    }, 0)
    .to(shapeLeaf, {
        x: 400 * movementMultiplier,
        y: -300 * movementMultiplier,
        rotation: 10 * rotationMultiplier,
        rotationX: 20 * transform3DMultiplier,
        rotationY: -20 * transform3DMultiplier,
        z: 120 * transform3DMultiplier,
        duration: 1
    }, 0)
    .to(shapeGeometric, {
        x: 400 * movementMultiplier,
        y: -500 * movementMultiplier,
        rotation: 20 * rotationMultiplier,
        rotationX: -30 * transform3DMultiplier,
        rotationY: 180 * transform3DMultiplier,
        z: 80 * transform3DMultiplier,
        scale: isMobile ? 1.5 : 1.5,
        duration: 1
    }, 0)


    if (expertiseRing) {
        tl.to(expertiseRing, {
            opacity: 1,
            ease: 'power1.out',
            duration: 0.1
        }, 0.8);
    }
    if (shapeLabels) {
        tl.fromTo(shapeLabels, {
            opacity: 0
        }, {
            opacity: 1,
            ease: 'power1.out',
            duration: 0.1
        }, 0.7);
    }
    

    // Continuous orbit loop after scroll completes
    loopData.angle = baseEndAngle + Math.PI * 2 * orbitTurns;
    const updateLoop = () => {
        const leftAngle = loopData.angle;
        const rightAngle = leftAngle + (Math.PI * 2 / 3);
        const bottomAngle = leftAngle + (Math.PI * 4 / 3);
        const loopAngleDegrees = (leftAngle * 180) / Math.PI;
        const loopAngleDelta = loopAngleDegrees - loopState.startAngleDegrees;

        gsap.set(shapeCircleLeft, {
            x: viewportCenterX + Math.cos(leftAngle) * orbitRadius - leftStartX,
            y: viewportCenterY + Math.sin(leftAngle) * orbitRadius - leftStartY,
            scale: finalScale,
            rotation: loopBaseRotation.left + loopSpin.left * loopAngleDelta
        });
        if (labelLeft) {
            gsap.set(labelLeft, { rotation: -(loopBaseRotation.left + loopSpin.left * loopAngleDelta) });
        }
        gsap.set(shapeCircleRight, {
            x: viewportCenterX + Math.cos(rightAngle) * orbitRadius - rightStartX,
            y: viewportCenterY + Math.sin(rightAngle) * orbitRadius - rightStartY,
            scale: finalScale,
            rotation: loopBaseRotation.right + loopSpin.right * loopAngleDelta
        });
        if (labelRight) {
            gsap.set(labelRight, { rotation: -(loopBaseRotation.right + loopSpin.right * loopAngleDelta) });
        }
        gsap.set(shapeCircleBottom, {
            x: viewportCenterX + Math.cos(bottomAngle) * orbitRadius - bottomStartX,
            y: viewportCenterY + Math.sin(bottomAngle) * orbitRadius - bottomStartY,
            scale: finalScale,
            rotation: loopBaseRotation.bottom + loopSpin.bottom * loopAngleDelta
        });
        if (labelBottom) {
            gsap.set(labelBottom, { rotation: -(loopBaseRotation.bottom + loopSpin.bottom * loopAngleDelta) });
        }
    };

    orbitLoop = gsap.to(loopData, {
        angle: `+=${Math.PI * 2}`,
        duration: 50,
        repeat: -1,
        ease: 'none',
        paused: true,
        onUpdate: updateLoop
    });

    // Refresh ScrollTrigger on window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            ScrollTrigger.refresh();
        }, 250);
    });
}

// Mobile-only: immediately places hero shapes at their correct resting positions
// (mirrors the end-state of explodeIntro) so iOS Safari renders them identically
// to Chrome mobile. No animation — just correct CSS + transforms applied via GSAP.
function initHeroShapesPositionMobile() {
    const shapeCircleLeft   = document.getElementById('shape-circle-left');
    const shapeCircleRight  = document.getElementById('shape-circle-right');
    const shapeCircleBottom = document.getElementById('shape-circle-bottom');
    const shapeAstrix        = document.getElementById('shape-astrix');
    const shapeAstrixTexture = document.querySelector('.shape-astrix-texture');
    const shapeStarburst     = document.getElementById('shape-starburst');
    const shapeStarburst2    = document.getElementById('shape-starburst-2');
    const shapeM             = document.getElementById('shape-M');
    const shapeLeaf          = document.getElementById('shape-leaf');
    const shapeGeometric     = document.getElementById('shape-geometric');
    const hero = document.querySelector('.hero');

    if (!hero || !shapeStarburst) return;
    if (prefersReducedMotion()) return;

    // Circles are hidden on mobile — the expertise section shows a video instead
    if (shapeCircleLeft)   gsap.set(shapeCircleLeft,   { opacity: 0 });
    if (shapeCircleRight)  gsap.set(shapeCircleRight,  { opacity: 0 });
    if (shapeCircleBottom) gsap.set(shapeCircleBottom, { opacity: 0 });

    // Each shape is set to the exact end-state the explodeIntro timeline would
    // have reached, using mobile-specific position/scale values.
    if (shapeStarburst) {
        gsap.set(shapeStarburst, {
            left: '-10%', top: '15%', right: 'auto', bottom: 'auto',
            scale: 1, opacity: 1,
            x: 0, y: 0, rotation: 0, rotationY: 0, rotationX: 0
        });
    }
    if (shapeStarburst2) {
        gsap.set(shapeStarburst2, {
            right: '-20%', top: '10%', left: 'auto', bottom: 'auto',
            scale: 1, opacity: 1,
            x: 0, y: 0, rotation: 90
        });
    }
    if (shapeM) {
        gsap.set(shapeM, {
            left: 'auto', bottom: 'auto',
            scale: 1, opacity: 1,
            x: '-20vw', y: '20vh', rotation: -90
        });
    }
    if (shapeAstrix) {
        gsap.set(shapeAstrix, {
            left: '10%', top: '10%', right: 'auto', bottom: 'auto',
            scale: 0.7, opacity: 1,
            x: 0, y: 0, rotationY: 0, rotationX: 0
        });
        // Continuous spin — same as desktop
        gsap.to(shapeAstrix, {
            rotation: 360, duration: 30, repeat: -1, ease: 'none', transformOrigin: '50% 50%'
        });
    }
    if (shapeAstrixTexture) {
        gsap.to(shapeAstrixTexture, {
            rotation: -360, duration: 30, repeat: -1, ease: 'none', transformOrigin: '50% 50%'
        });
    }
    if (shapeLeaf) {
        gsap.set(shapeLeaf, {
            right: '0%', top: '50%', left: 'auto', bottom: 'auto',
            scale: 0.8, opacity: 1,
            x: '10vw', y: '20vh', rotation: -180, rotationY: 0, rotationX: 0
        });
    }
    if (shapeGeometric) {
        gsap.set(shapeGeometric, {
            right: '30%', bottom: '5%', left: 'auto', top: 'auto',
            scale: 1, opacity: 1,
            x: 0, y: 0, rotation: 180, rotationY: 0
        });
    }
}

function initWorkLaptopSequence() {
    const workSection = document.getElementById('work');
    const frameImg = document.querySelector('.work__laptop-frame');
    const video = document.querySelector('.work__laptop-video');

    if (!workSection || !frameImg || !video) {
        return;
    }

    const videoSrc = '/assets/showReel_1-opt.mp4';
    let hasPlayed = false;

    const prepareVideo = () => {
        if (!video.dataset.srcLoaded) {
            video.src = videoSrc;
            video.load();
            video.dataset.srcLoaded = 'true';
        }
    };

    const playSequence = () => {
        if (hasPlayed) return;
        hasPlayed = true;
        prepareVideo();
        video.classList.add('is-active');
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
        }
    };

    ScrollTrigger.create({
        trigger: workSection,
        start: 'top 50%',
        onEnter: playSequence
    });
}

function initCursorDot() {
    if (window.matchMedia('(hover: none)').matches) {
        return;
    }
    let dot = document.getElementById('cursor-dot');
    if (!dot) {
        dot = document.createElement('div');
        dot.id = 'cursor-dot';
        dot.className = 'cursor-dot';
        dot.setAttribute('aria-hidden', 'true');
        document.body.appendChild(dot);
    }

    // Ensure the "View work" UI exists (shown only on work hover)
    if (!dot.querySelector('.cursor-dot__inner')) {
        const inner = document.createElement('div');
        inner.className = 'cursor-dot__inner';
        inner.setAttribute('aria-hidden', 'true');
        inner.innerHTML = `
            <svg class="cursor-dot__arrow" width="45" height="27" viewBox="0 0 45 27" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M43.6466 13.3979C32.8541 13.3979 25.712 9.10371 22.228 1.00019" stroke="#F0EFE9" stroke-width="2" stroke-linecap="round"/>
                <path d="M43.6466 13.398C32.8541 13.3979 25.712 17.6922 22.228 25.7957" stroke="#F0EFE9" stroke-width="2" stroke-linecap="round"/>
                <path d="M42.8208 13.398L1 13.3979" stroke="#F0EFE9" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div class="cursor-dot__label">View work</div>
        `;
        dot.appendChild(inner);
    }

    // Safari renders large scaled circles/text blurry; use size-based animation there.
    const ua = navigator.userAgent;
    const isSafari = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(ua);
    dot.classList.toggle('is-safari', isSafari);
    document.body.classList.toggle('is-safari', isSafari);

    // Smooth follow (slight lag) using rAF + lerp
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let rafId = null;
    const ease = 0.18; // smaller = more lag, larger = snappier

    const tick = () => {
        currentX += (targetX - currentX) * ease;
        currentY += (targetY - currentY) * ease;
        dot.style.left = `${currentX}px`;
        dot.style.top = `${currentY}px`;

        // Stop when we're essentially at the target (saves CPU)
        if (Math.abs(targetX - currentX) < 0.1 && Math.abs(targetY - currentY) < 0.1) {
            rafId = null;
            return;
        }
        rafId = window.requestAnimationFrame(tick);
    };

    const move = (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        if (!rafId) rafId = window.requestAnimationFrame(tick);
    };
    const press = () => dot.classList.add('is-pressed');
    const release = () => dot.classList.remove('is-pressed');
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mousedown', press);
    window.removeEventListener('mouseup', release);
    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', press);
    window.addEventListener('mouseup', release);
    // Start hidden until first move positions it (avoids dot flashing top-left)
    dot.style.left = '-9999px';
    dot.style.top = '-9999px';
}

function initWorkCursorFollow() {
    const workSection = document.getElementById('work');
    const dot = document.getElementById('cursor-dot');

    if (!workSection || !dot) {
        return;
    }

    if (window.matchMedia('(hover: none)').matches) {
        return;
    }

    const enableCursor = () => {
        dot.classList.add('is-work-hover');
        document.body.classList.add('is-work-cursor-active');
    };

    const disableCursor = () => {
        dot.classList.remove('is-work-hover');
        document.body.classList.remove('is-work-cursor-active');
    };

    workSection.addEventListener('mouseenter', enableCursor);
    workSection.addEventListener('mouseleave', disableCursor);

    workSection.addEventListener('click', () => {
        window.location.href = 'work.html'; satisfies
    });
}

function initProcessStacking() {
    const section = document.querySelector('.process');
    if (!section) {
        return;
    }

    const disks = gsap.utils.toArray('.process__disk');
    const diskGradients = gsap.utils.toArray('.disk-gradient');
    const diskLabelHeadlines = gsap.utils.toArray('.process__disk-label-headline');
    const diskLabelTexts = gsap.utils.toArray('.process__disk-label-text');

    if (!disks.length) {
        return;
    }

    gsap.set(disks, {
        y: (index) => -index * 150,
        opacity: 0,
        zIndex: (index, el) => {
            const diskValue = Number(el.dataset.disk) || 0;
            return disks.length - diskValue + 1;
        }
    });
    gsap.set(disks[0], {
        opacity: 1,
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=200%',
            scrub: 0.6,
            pin: true,
            anticipatePin: 1
        }
    });

    tl.to(disks, {
        y: (index) => -index * 54,
        duration: 1,
        ease: 'power2.inOut',
        stagger: {
            amount: 1,
            from: 1
        }
    },0);

    tl.to(disks, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.inOut',
        stagger: {
            amount: 1,
            from: 1
        }
    }, 0);


    tl.to(diskGradients, {
        rotation: 360,
        duration: 1,
        ease: 'power2.inOut',
        stagger: 0.25
    }, 0);


    tl.to(diskLabelHeadlines, {
        y:'20px',
        duration: 1,
        ease: 'power2.inOut',
        stagger: {
            amount: 1,
            from: 0
        }
    }, 0.3);

    tl.to(diskLabelTexts, {
        opacity: 0,
        duration: .6,
        ease: 'power2.inOut',
        stagger: {
            each: .3,
            from: 0
        }
    }, 0.5);


}

function initAboutTimeline() {
    const aboutItems = gsap.utils.toArray('.about__item');
    const aboutSection = document.getElementById('about');

    if (!aboutSection || !aboutItems.length) {
        return;
    }

    gsap.set(aboutItems, {
        opacity: 0,
        y: -50
    });

    const aboutTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: aboutSection,
            start: 'top 40%',
            end: 'bottom bottom',
            markers: false,
            scrub: 0.6,
            invalidateOnRefresh: true,
            refreshPriority: -10,  // Lower priority ensures it recalculates after work timeline pin-spacer
            anticipatePin: 1
        }
    });

    aboutTimeline.to(aboutItems, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.inOut',
        stagger: {
            amount: 1,
            from: 0
        }
    }, 0);
}

function initContactTimeline() {
    const contactSection = document.getElementById('contact');
    const contactContent = document.querySelectorAll('*');
    const brandLogo = document.querySelector('.brand-logo');
    const cursorDot = document.querySelector('.cursor-dot');
    if (!contactSection) {
        return;
    }

    // SPA-style navigations call this again; kill the previous timeline + trigger or
    // ScrollTrigger keeps stale geometry and the scrub range fires too early.
    if (window.__contactTimeline) {
        const prev = window.__contactTimeline;
        if (prev.scrollTrigger) prev.scrollTrigger.kill();
        prev.kill();
        window.__contactTimeline = null;
    }
    const stale = ScrollTrigger.getById('contactSectionBg');
    if (stale) stale.kill();

    // Let other page ScrollTriggers (case study pins, etc.) settle before we measure #contact.
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }

    const contactTimeline = gsap.timeline({
        scrollTrigger: {
            id: 'contactSectionBg',
            trigger: contactSection,
            start: 'top 50%',
            end: 'top+=40% 50%',
            scrub: 0.6,
            invalidateOnRefresh: true,
            refreshPriority: -1,
            anticipatePin: 1,
            markers: false,
        }
    });
    window.__contactTimeline = contactTimeline;

    contactTimeline.to('body', {
       backgroundColor: '#212E02',
        duration: 1,
        ease: 'power2.inOut',
    }, 0)
    .to(brandLogo, {
        filter: 'brightness(0) saturate(100%) invert(96%) sepia(4%) saturate(382%) hue-rotate(356deg) brightness(104%) contrast(97%)',
        duration: 1,
        ease: 'power2.inOut'
    }, 0)
    .to(contactContent, {
        color:"#F0EFE9",
        borderColor:"#F0EFE9",
        duration: 1,
        ease: 'power2.inOut',
    }, 0)
    .to(cursorDot, {
        background: "#F0EFE9",
        duration: 1,
        ease: 'power2.inOut',
    }, 0);

    // Tall case-study pages: images/video often change height after first paint; refresh
    // so start/end track the real position of #contact (load does not refire on fetch nav).
    if (typeof ScrollTrigger !== 'undefined') {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => ScrollTrigger.refresh());
        });
        [400, 900, 1800, 3200].forEach((ms) => {
            window.setTimeout(() => {
                if (document.getElementById('contact') && typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                }
            }, ms);
        });
    }
}

function initCaseStudyEvolution() {
    const section = document.querySelector('.case-study-evolution');
    if (!section) return;

    const phaseButtons = section.querySelectorAll('.case-study-evolution__phase');
    const panels = section.querySelectorAll('.case-study-evolution__phase-content');
    const videoEl = section.querySelector('.MMT-video');
    if (!phaseButtons.length || !panels.length) return;

    const videoSourcesByPhase = {
        '1': 'assets/MMT/MMT-V1-opt2.mp4',
        '2': 'assets/MMT/MMT-V2-opt.mp4',
        '3': 'assets/MMT/MMT-V3-opt.mp4',
        '4': null
    };

    function updateVideoForPhase(phase) {
        if (!videoEl) return;
        const src = videoSourcesByPhase[phase];
        if (phase === '4' || src == null) {
            videoEl.classList.add('MMT-video--hidden');
            gsap.set(videoEl, { opacity: 0 });
            return;
        }
        videoEl.classList.remove('MMT-video--hidden');
        gsap.set(videoEl, { opacity: 1});
        const sourceEl = videoEl.querySelector('source');
        if (sourceEl) {
            sourceEl.setAttribute('src', src);
            videoEl.load();
            videoEl.play().catch(() => {});
        }
    }

    phaseButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const phase = btn.getAttribute('data-phase');
            const targetPanel = section.querySelector(`.case-study-evolution__phase-content[data-phase="${phase}"]`);
            const currentPanel = section.querySelector('.case-study-evolution__phase-content.is-visible');
            if (!targetPanel || targetPanel === currentPanel) return;

            const duration = 0.25;

            gsap.to(currentPanel, {
                opacity: 0,
                duration,
                ease: 'power2.in',
                onComplete: () => {
                    currentPanel.classList.remove('is-visible');
                    targetPanel.classList.add('is-visible');
                    gsap.set(targetPanel, { opacity: 0 });
                    gsap.to(targetPanel, {
                        opacity: 1,
                        duration,
                        ease: 'power2.out'
                    });
                    phaseButtons.forEach((b) => b.classList.remove('is-active'));
                    btn.classList.add('is-active');
                    phaseButtons.forEach((b) => {
                        b.setAttribute('aria-selected', b.getAttribute('data-phase') === phase ? 'true' : 'false');
                    });
                    updateVideoForPhase(phase);
                }
            });
        });
    });

    // Phase 4 is active by default: hide video on init if needed
    const activePhase = section.querySelector('.case-study-evolution__phase.is-active');
    if (activePhase && activePhase.getAttribute('data-phase') === '4') {
        if (videoEl) {
            videoEl.classList.add('MMT-video--hidden');
            gsap.set(videoEl, { opacity: 0 });
        }
    }
}

/**
 * On .portfolio-page: when a figure's wrapping container scrolls into view,
 * fade in and move up each figure with a stagger.
 * @param {Object} [opts] - opts.initOnly: if true, only set figures to initial state (opacity: 0, y: 24), do not create ScrollTriggers. Use after body swap so triggers are created later when layout is stable.
 */
function initPortfolioPageFigureReveal(opts) {
    const page = document.querySelector('.portfolio-page');
    if (!page) return;
    if (prefersReducedMotion()) return;

    const figures = page.querySelectorAll('figure');
    if (!figures.length) return;

    // Group figures by their wrapping section (so trigger is always the section top)
    const sectionToFigures = new Map();
    figures.forEach((fig) => {
        const section = fig.closest('section');
        if (!section) return;
        if (!sectionToFigures.has(section)) {
            sectionToFigures.set(section, []);
        }
        sectionToFigures.get(section).push(fig);
    });

    sectionToFigures.forEach((figs) => {
        gsap.set(figs, { opacity: 0, y: 24 });
    });

    if (opts && opts.initOnly) return;

    sectionToFigures.forEach((figs, section) => {
        gsap.to(figs, {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: section,
                start: 'top 50%',
                end: 'bottom top',
                toggleActions: 'play none play none'
            }
        });
    });
}

/**
 * Set .case-study-hero__media hidden initially. The fade-in/up animation runs when
 * the loader finishes (see initLoaderTransition → finishLoader), or with runAnimation
 * when entering the page via smooth transition (reinitPageAfterTransition).
 */
function initCaseStudyHeroMediaReveal(opts) {
    const media = document.querySelector('.case-study-hero__media');
    if (!media) return;
    if (prefersReducedMotion()) return;
    gsap.set(media, { opacity: 0, y: 28 });
    if (opts && opts.runAnimation) {
        gsap.to(media, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: 0.4,
            ease: 'power2.out'
        });
    }
}

function initWorkPageSlider() {
    const workPage = document.querySelector('.work-page');
    if (!workPage) {
        return;
    }
    
    // Pinned container (intro + slider only)
    const workHeroWrapper = document.querySelector('.work-hero-wrapper');
    
    // Intro section elements
    const workIntro = document.querySelector('.work-intro__container');
    const workIntroHeading = document.querySelector('.work-intro__heading');
    const workIntroDescription = document.querySelector('.work-intro__description');
    
    // Slider section elements
    const sliderSection = document.querySelector('.work-slider');
    const laptopElement = document.querySelector('.work-slider__laptop');
    const contentWrapper = document.querySelector('.work-slider__content-wrapper');
    const descriptionsWrapper = document.querySelector('.work-slider__descriptions');
    
    // Slider content elements
    const mediaElements = document.querySelectorAll('.work-slider__media');
    const contentElements = document.querySelectorAll('.work-slider__content');
    const counterCurrentElements = document.querySelectorAll('.work-slider__counter-current');
    const descriptionElements = document.querySelectorAll('.work-slider__description');
    const paginationDots = document.querySelectorAll('.work-slider__dot');
    
    if (!sliderSection || mediaElements.length === 0 || contentElements.length === 0) {
        console.warn('Work slider elements not found');
        return;
    }

    // ============================================
    // 2. CONSTANTS & CALCULATIONS
    // ============================================
    const totalProjects = mediaElements.length;
    const isMobile = window.innerWidth < 768;
    const isSafari = isSafariBrowser();
    
    // Laptop dimensions for intro animation
    const laptopRect = laptopElement.getBoundingClientRect();
    const finalWidth = laptopRect.width;
    const finalHeight = laptopRect.height;
    const initialWidth = finalWidth * 0.7;
    const initialHeight = finalHeight * 0.4;
    
    // Positioning calculations
    const sliderRect = sliderSection.getBoundingClientRect();
    const finalLeftInGrid = laptopRect.left - sliderRect.left;
    
    if (!isMobile) { 
        // ============================================
        // 3. INITIAL ENTRANCE ANIMATION (ON LOAD)
        // ============================================
        
        // Set initial position for sliderSection before entrance animation
        gsap.set(sliderSection, {
            marginTop: '-25vh'
        });

        // Safari can keep text blurry when animating `filter: blur(...)`.
        // Skip the blur and only move/opacity for Safari.
        const workHeadingFrom = isSafari ? { y: 100 } : { filter: 'blur(40px)', y: 100 };
        const workHeadingTo = isSafari
            ? { y: 0, duration: 1.2, ease: 'power1.inOut' }
            : { y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power1.inOut' };
        
        const workHeadlineTimeline = gsap.timeline()
        .fromTo(workIntro, {
           opacity: 0,
        }, {
            opacity: 1,
            duration: 1,
            ease: 'power1.inOut'
        }, 0) 
            .fromTo(workIntroHeading, workHeadingFrom, workHeadingTo, 0) 
            .fromTo(workIntroDescription, {
                opacity: 0,
                y: -20,
            }, {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: 'power1.inOut'
            }, 0.8)
            .fromTo(sliderSection, {
                marginTop: '-25vh'
            }, {
                marginTop: '-45vh',
                duration: 1,
                ease: 'power2.inOut'
            }, 1);
        }
        // ============================================
        // 4. COMBINED INTRO PIN & LAPTOP ANIMATION
        // ============================================
        
        // Set initial states
        gsap.set(workIntro, {
            height: isMobile ? '50vh' : '100vh',
            opacity: 1
        });
        
        if (isSafari) {
            // Safari rasterizes scaled text poorly; use font-size for zoom-equivalent effect.
            gsap.set(workIntroHeading, {
                scale: 1,
                transformOrigin: 'bottom center',
                fontSize: '12.6vw',
                filter: 'none',
                webkitFilter: 'none'
            });
        } else {
            gsap.set(workIntroHeading, {
                scale: isMobile ? 1 : 2.8,
                transformOrigin: 'bottom center'
            });
        }
        
        gsap.set(laptopElement, {
            position: 'absolute',
            left: '50%',
            top: isMobile ? '30%' : '50%',
            xPercent: -50,
            yPercent: -50,
            width: initialWidth + 'px',
            height: initialHeight + 'px',
            gridColumn: 'unset'
        });
        
        gsap.set([contentWrapper, descriptionsWrapper], {
            opacity: 0,
            x: 100
        });
    
        // Combined timeline: Pins both intro and slider, includes all animations
        const workHeroTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: workHeroWrapper,
                start: 'top top',
                end:  `+=${totalProjects * 1200}vh`, // Increase this multiplier to slow down scroll rate
                markers: false,
                pin: true, 
                scrub: 1,
                invalidateOnRefresh: false,
                id: 'workHero',
                refreshPriority: 10,  // High priority so it calculates first
                onEnter: () => {
                    if (!isSafari) return;
                    // Force crisp rasterization at the start of the pinned section.
                    gsap.set(workIntroHeading, { filter: 'none', webkitFilter: 'none' });
                },
                onUpdate: (self) => {
                    // Update pagination dots based on scroll progress
                    // Only start after intro animations complete (position 3.0+)
                    const adjustedProgress = Math.max(0, (self.progress * totalProjects * 2) - 3.0);
                    const currentIndex = Math.min(Math.floor(adjustedProgress), totalProjects - 1);
                    const indexProgress = adjustedProgress - currentIndex;
                    
                    // Update active class on dots
                    paginationDots.forEach((dot, index) => {
                        if (index === currentIndex) {
                            dot.classList.add('is-active');
                            // Animate fill height based on progress within this slide
                            const fillHeight = indexProgress * 100;
                            dot.style.setProperty('--fill-height', `${fillHeight}%`);
                        } else {
                            dot.classList.remove('is-active');
                        }
                    });
                },
                onLeave: () => {
                    // Capture content wrapper dimensions and position BEFORE changing layout
                    const contentHeight = contentWrapper.offsetHeight;
                    const contentWidth = contentWrapper.offsetWidth;
                    const contentRect = contentWrapper.getBoundingClientRect();
                    const sliderRect = sliderSection.getBoundingClientRect();
                    const topOffset = contentRect.top - sliderRect.top;
                    
                    // Lock in the final state after scrolling past the animation
                    gsap.set(workIntro, { 
                        height: isMobile ? '30vh' : '40vh'
                    });
                    // Lock sliderSection in final position
                    gsap.set(sliderSection, {
                        y: 35
                    });
                    // Lock content wrapper in final position, height, width, and vertical position
                    gsap.set(contentWrapper, {
                        opacity: 1,
                        x: 0,
                        height: contentHeight + 'px',
                        width: contentWidth + 'px',
                        position: 'absolute',
                        top: topOffset + 'px',
                        alignSelf: 'unset'
                    });
                    gsap.set(descriptionsWrapper, {
                        opacity: 1,
                        x: 0
                    });
                    // Reset laptop element positioning
                    gsap.set(laptopElement, { clearProps: 'position,left,top,xPercent,yPercent,gridColumn' });
                },
                onEnterBack: () => {
                    // When scrolling back from below, only set height - let timeline control opacity/y
                    gsap.set(workIntro, { 
                        height: isMobile ? '30vh' : '40vh'
                    });
                    // Keep sliderSection in final position
                    gsap.set(sliderSection, {
                        y: 35
                    });
                    // Re-apply laptop absolute positioning for animation
                    gsap.set(laptopElement, {
                        position: 'absolute',
                        left: finalLeftInGrid + 'px',
                        xPercent: 0,
                        yPercent: isMobile ? -50 : 0,
                        gridColumn: 'unset'
                    });
                    // Clear absolute positioning from content wrapper to let timeline control it
                    gsap.set(contentWrapper, {
                        clearProps: 'position,top,alignSelf,height,width'
                    });
                    gsap.set(descriptionsWrapper, {
                        opacity: 1,
                        x: 0
                    });
                },
                onLeaveBack: () => {
                    // Reset to initial state when scrolling back to the top
                    gsap.set(workIntro, { 
                        height: isMobile ? '50vh' : '100vh',
                        opacity: 1,
                        y: 0
                    });
                    // Reset sliderSection to entrance animation starting position
                    gsap.set(sliderSection, {
                        y: 0
                    });
                    // Reset content wrapper to initial state for entrance animation
                    gsap.set(contentWrapper, {
                        opacity: 0,
                        x: 100,
                        clearProps: 'height,width,position,top,alignSelf'
                    });
                    gsap.set(descriptionsWrapper, {
                        opacity: 0,
                        x: 100
                    });
                }
            }
        });
    
        // All animations happen during the pinned intro section
        workHeroTimeline
            // Phase 1 (0.0 - 0.9): Intro heading zoom & height reduction (3x slower)
            .to(workIntroHeading, isSafari
                ? {
                    scale: 1,
                    fontSize: '4.5vw',
                    duration: isMobile ? 0.2 : 0.9,
                    ease: 'power2.inOut'
                }
                : {
                    scale: 1,
                    duration: isMobile ? 0.2 : 0.9,
                    ease: 'power2.inOut'
                }, 0)
            .fromTo(workIntro, {
                height: isMobile ? '60vh' : '100vh'
            }, {
                height: isMobile ? '30vh' : '40vh',
                duration: 0.9,
                ease: 'power2.inOut',
                immediateRender: false
            }, 0)
            .fromTo(sliderSection, {
                y: 0
            }, {
                y: 150,
                duration:.4,
                ease: 'linear'
            }, 0.2)
            .to(workIntro, { 
                y: -500,
                duration: 0.9,
                ease: 'power2.in'
            }, 0.6)
            .fromTo(sliderSection, {
                y: 150
            }, {
                y: 35,
                duration:.6,
                ease: 'power1.inOut'
            }, .6)
            // Phase 2 (0.6 - 2.1): Laptop grows from center (3x slower)
            .to(laptopElement, {
                width: finalWidth + 'px',
                height: finalHeight + 'px',
                duration: 1.5,
                ease: 'power2.inOut'
            }, 0.6)
            // Phase 3 (1.5 - 2.25): Laptop slides to left position (3x slower)
            .to(laptopElement, {
                left: finalLeftInGrid + 'px',
                xPercent: 0,
                duration: 1,
                ease: 'power2.inOut'
            }, 1.5)
            // Phase 4 (1.65 - 2.4): Content fades in from right (3x slower)
            .to([contentWrapper, descriptionsWrapper], {
                opacity: 1,
                x: 0,
                duration: 1,
                ease: 'power2.out'
            }, 1.9);
    
    
    // ============================================
    // 5. INITIAL STATES SETUP FOR SLIDER CONTENT
    // ============================================
    
    // Pagination dots - activate first
    if (paginationDots.length > 0) {
        paginationDots[0].classList.add('is-active');
    }
    
    // Media elements - all visible but clipped (curtain effect ready)
    mediaElements.forEach((media, index) => {
        if (index === 0) {
            gsap.set(media, { 
                visibility: 'visible',
                clipPath: 'inset(0% 0% 0% 0%)',
                scale: 1.2,
                zIndex: 1
            });
        } else {
            gsap.set(media, { 
                visibility: 'visible',
                clipPath: 'inset(100% 0% 0% 0%)',
                scale: 1.2,
                zIndex: index + 1
            });
        }
    });
    
    // Content elements (title & button) - first visible, others hidden with offset
    contentElements.forEach((content, index) => {
        const title = content.querySelector('.work-slider__title');
        const button = content.querySelector('.work-slider__button');
        
        if (index === 0) {
            gsap.set(content, { opacity: 1, visibility: 'visible', zIndex: 10, pointerEvents: 'auto' });
            gsap.set([title, button], { opacity: 1, y: 0 });
        } else {
            gsap.set(content, { opacity: 0, visibility: 'hidden', zIndex: 1, pointerEvents: 'none' });
            gsap.set([title, button], { opacity: 0, y: 30 });
        }
    });
    
    // Counter numbers - first visible, others hidden
    counterCurrentElements.forEach((counter, index) => {
        if (index === 0) {
            gsap.set(counter, { opacity: 1, visibility: 'visible' });
        } else {
            gsap.set(counter, { opacity: 0, visibility: 'hidden' });
        }
    });
    
    // Descriptions - first visible, others hidden with offset
    descriptionElements.forEach((desc, index) => {
        if (index === 0) {
            gsap.set(desc, { opacity: 1, visibility: 'visible', y: 0 });
        } else {
            gsap.set(desc, { opacity: 0, visibility: 'hidden', y: 30 });
        }
    });
    
    // Preload all video elements
    mediaElements.forEach(media => {
        if (media.tagName === 'VIDEO') {
            media.load();
        }
    });

    // ============================================
    // 6. REDUCED MOTION FALLBACK
    // ============================================
    
    if (prefersReducedMotion()) {
        // Simplified snap behavior (no smooth animations)
        ScrollTrigger.create({
            trigger: sliderSection,
            start: 'top 20%',
            end: `+=${totalProjects * 1200}vh`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            markers: false,
            scrub: 0,
        
            onUpdate: (self) => {
                const progress = self.progress;
                const currentProject = Math.min(Math.floor(progress * totalProjects), totalProjects - 1);
                
                // Show/hide media with clip-path
                mediaElements.forEach((media, index) => {
                    if (index === currentProject) {
                        gsap.set(media, {
                            clipPath: 'inset(0% 0% 0% 0%)',
                            scale: 1
                        });
                    } else if (index < currentProject) {
                        gsap.set(media, {
                            clipPath: 'inset(0% 0% 0% 0%)',
                            scale: 1
                        });
                    } else {
                        gsap.set(media, {
                            clipPath: 'inset(100% 0% 0% 0%)',
                            scale: 1.2
                        });
                    }
                });
                
                // Show/hide content
                contentElements.forEach((content, index) => {
                    gsap.set(content, {
                        opacity: index === currentProject ? 1 : 0,
                        visibility: index === currentProject ? 'visible' : 'hidden',
                        zIndex: index === currentProject ? 10 : 1,
                        pointerEvents: index === currentProject ? 'auto' : 'none'
                    });
                });
                
                // Show/hide counter numbers
                counterCurrentElements.forEach((counter, index) => {
                    gsap.set(counter, {
                        opacity: index === currentProject ? 1 : 0,
                        visibility: index === currentProject ? 'visible' : 'hidden'
                    });
                });
                
                // Show/hide descriptions
                descriptionElements.forEach((desc, index) => {
                    gsap.set(desc, {
                        opacity: index === currentProject ? 1 : 0,
                        visibility: index === currentProject ? 'visible' : 'hidden'
                    });
                });
            }
        });
        return;
    }

    // ============================================
    // 7. PROJECT TRANSITION LOOP
    // ============================================
    // These animations are added to workHeroTimeline starting at position 1.0+
    // Ensuring they only play after the intro/laptop animations complete
    
    const initialDelay = 3.0; // Hold first slide before transitions start (after intro animations complete)
    
    // Loop through each project transition (1→2, 2→3, 3→4)
    for (let i = 0; i < totalProjects - 1; i++) {
        const currentMedia = mediaElements[i];
        const nextMedia = mediaElements[i + 1];
        const currentContent = contentElements[i];
        const nextContent = contentElements[i + 1];
        
        const position = i + initialDelay;
        
        // --- MEDIA ANIMATIONS ---
        
        // Reveal next media with curtain effect (slides down from top)
        workHeroTimeline.to(nextMedia, {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1,
            ease: 'power2.inOut'
        }, position);
        
        // Zoom animation pattern (alternates for visual variety)
        if (i === 0 || i === totalProjects - 2) {
            // Transitions 1→2 and 3→4: Zoom OUT (1.2 → 1.0)
            workHeroTimeline.to(currentMedia, {
                scale: 1,
                duration: 1,
                ease: 'power2.inOut'
            }, position);
            
            workHeroTimeline.fromTo(nextMedia, {
                scale: 1.2
            }, {
                scale: 1,
                duration: 1,
                ease: 'power2.inOut'
            }, position);
        } else {
            // Transition 2→3: Zoom IN (1.0 → 1.2)
            workHeroTimeline.to(currentMedia, {
                scale: 1.2,
                duration: 1,
                ease: 'power2.inOut'
            }, position);
            
            workHeroTimeline.fromTo(nextMedia, {
                scale: 1
            }, {
                scale: 1.2,
                duration: 1,
                ease: 'power2.inOut'
            }, position);
        }
        
        // --- CONTENT ANIMATIONS ---
        
        // Get elements for this transition
        const currentCounter = counterCurrentElements[i];
        const nextCounter = counterCurrentElements[i + 1];
        const currentDescription = descriptionElements[i];
        const nextDescription = descriptionElements[i + 1];
        
        // Get title and button from content containers
        const currentTitle = currentContent.querySelector('.work-slider__title');
        const currentButton = currentContent.querySelector('.work-slider__button');
        const nextTitle = nextContent.querySelector('.work-slider__title');
        const nextButton = nextContent.querySelector('.work-slider__button');
        
        // Z-index management: next on top for visuals, but keep current clickable until next button is revealed
        workHeroTimeline.set(nextContent, { zIndex: 10, pointerEvents: 'none' }, position);
        workHeroTimeline.set(currentContent, { zIndex: 1, pointerEvents: 'auto' }, position);
        workHeroTimeline.set(nextContent, { visibility: 'visible' }, position);
        
        // Counter animation (crossfade numbers)
        workHeroTimeline.to(currentCounter, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in'
        }, position);
        
        workHeroTimeline.set(currentCounter, { visibility: 'hidden' }, position + 0.3);
        workHeroTimeline.set(nextCounter, { visibility: 'visible' }, position + 0.3);
        
        workHeroTimeline.to(nextCounter, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out'
        }, position + 0.3);
        
        // Title & Button animation (staggered fade & slide)
        // Fade out current
        workHeroTimeline.to(currentTitle, {
            opacity: 0,
            y: -15,
            duration: 0.4,
            ease: 'power2.in'
        }, position);
        
        workHeroTimeline.to(currentButton, {
            opacity: 0,
            y: -15,
            duration: 0.4,
            ease: 'power2.in'
        }, position + 0.08);
        
        workHeroTimeline.set(currentContent, { visibility: 'hidden', opacity: 0, pointerEvents: 'none' }, position + 0.4);
        
        // Fade in next (with stagger)
        workHeroTimeline.set([nextTitle, nextButton], { y: 30 }, position + 0.3);
        
        workHeroTimeline.to(nextTitle, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, position + 0.4);
        
        workHeroTimeline.to(nextButton, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, position + 0.5);
        
        workHeroTimeline.set(nextContent, { opacity: 1, pointerEvents: 'auto' }, position + 0.4);
        
        // Description animation (fade & slide)
        workHeroTimeline.to(currentDescription, {
            opacity: 0,
            y: -15,
            duration: 0.4,
            ease: 'power2.in'
        }, position + 0.1);
        
        workHeroTimeline.set(currentDescription, { visibility: 'hidden' }, position + 0.5);
        workHeroTimeline.set(nextDescription, { visibility: 'visible', y: 30 }, position + 0.5);
        
        workHeroTimeline.to(nextDescription, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, position + 0.6);
    }
    
    // ============================================
    // 8. VIDEO PLAYBACK CONTROL
    // ============================================
    
    // Ensure all videos play continuously (no pausing during transitions)
    mediaElements.forEach(media => {
        if (media.tagName === 'VIDEO') {
            media.play().catch(() => {});
        }
    });
}

// End of initWorkPageSlider()

// ============================================
// ABOUT PAGE ANIMATIONS
// ============================================

/** Creates the About hero pinned scroll timeline (heading zoom + height + intro). Call after loader completes when navigating to About so layout is final. */
function createAboutHeroScrollTimeline(aboutHero, heroHeading, aboutIntro, isMobile, fromTransition, headingFontSizeLarge, headingFontSizeEnd) {
    if (!aboutHero || !heroHeading || !aboutIntro) return;
    headingFontSizeLarge = headingFontSizeLarge || '12.6vw';
    headingFontSizeEnd = headingFontSizeEnd || '4.5vw';
    const aboutHeroTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: aboutHero,
            start: 'top top',
            end: '100% 0%',
            pin: isMobile ? false : true,
            scrub: 1,
            invalidateOnRefresh: false,
            id: 'aboutHero',
            onLeave: () => {
                gsap.set(aboutHero, { height: isMobile ? '30vh' : '80vh' });
                gsap.set(aboutIntro, { y: 0, opacity: 1 });
            },
            onEnterBack: () => {
                gsap.set(aboutHero, { height: isMobile ? '30vh' : '80vh' });
                gsap.set(aboutIntro, { opacity: 1 });
            },
            onLeaveBack: () => {
                gsap.set(aboutHero, { height: isMobile ? '50vh' : '80vh', opacity: 1, y: 0 });
                gsap.set(aboutIntro, { y: 0, opacity: 0 });
            }
        }
    });
    // Scale-based zoom rasterizes badly on iOS/Safari; font-size zoom stays sharp (same idea as work intro).
    const zoomHeadingWithFontSize = isMobile || isSafariBrowser() || isIOSDevice() || fromTransition;
    if (zoomHeadingWithFontSize) {
        aboutHeroTimeline.fromTo(heroHeading, {
            fontSize: headingFontSizeLarge,
            scale: 1
        }, {
            fontSize: headingFontSizeEnd,
            scale: 1,
            duration: 0.9,
            ease: 'power2.inOut'
        }, 0);
    } else {
        aboutHeroTimeline.to(heroHeading, {
            scale: 1,
            duration: 0.9,
            ease: 'power2.inOut'
        }, 0);
    }
    aboutHeroTimeline
        .fromTo(aboutHero, { height: isMobile ? '50vh' : '80vh' }, {
            height: isMobile ? '30vh' : '80vh',
            duration: 0.9,
            ease: 'power2.inOut',
            immediateRender: false
        }, 0)
        .to(aboutIntro, { y: -50, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.5);
}

function initAboutPageAnimations(opts) {
    // Check if we're on the about page
    const aboutPage = document.querySelector('#about-page');
    if (!aboutPage) return;
    
    // When true, we came via smooth transition (body swap). Keep heading at scale 1 so text stays crisp (no scaled-up pixelation).
    const fromTransition = !!(opts && opts.fromTransition);
    
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // Skip animations if user prefers reduced motion
        return;
    }
    
    // ============================================
    // 1. HERO SECTION - INTRO & PINNED ZOOM TIMELINE
    // ============================================
    
    const aboutHero = document.querySelector('.about-hero');
    const heroHeading = document.querySelector('.about-hero__heading');
    const aboutIntro = document.querySelector('.about-intro');
    const isMobile = window.innerWidth <= 768;
    const isSafari = isSafariBrowser();
    const isIOS = isIOSDevice();
    const crispHeadingIntro = isMobile || isSafari || isIOS;

    // Reset hero/heading so reinit after transition starts from a clean state (avoids pixelation)
    if (aboutHero) gsap.set(aboutHero, { clearProps: 'opacity' });
    if (heroHeading) gsap.set(heroHeading, { clearProps: 'filter,transform,will-change,fontSize' });
    
    // Initial entrance animation (on page load only; skip when from transition so we don't run blur while loader is up)
    // Safari/iOS often leaves text soft after animating filter: blur — use motion only (matches work page).
    if (!fromTransition) {
        const headingIntroFrom = crispHeadingIntro
            ? { y: 100 }
            : { filter: 'blur(40px)', y: 100 };
        const headingIntroTo = crispHeadingIntro
            ? { y: 0, duration: 1.2, ease: 'power1.inOut' }
            : { y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power1.inOut' };
        const aboutHeadlineTimeline = gsap.timeline()
            .fromTo(aboutHero, {
                opacity: 0,
            }, {
                opacity: 1,
                duration: 1,
                ease: 'power1.inOut'
            }, 0)
            .fromTo(heroHeading, headingIntroFrom, headingIntroTo, 0);
    }
    
    // Set initial states for scroll timeline (always use scale 2.8 on desktop so zoom effect is visible).
    gsap.set(aboutHero, {
        height: isMobile ? '50vh' : '80vh',
        transformOrigin: 'center center',
        opacity: 1
    });
    
    // Font-size zoom for mobile/Safari/transition — transform scale makes body text blurry on iOS.
    const headingFontSizeEnd = '4.5vw';
    const headingFontSizeLarge = '12.6vw'; // 4.5 * 2.8 ≈ same visual size as scale 2.8
    if (fromTransition) {
        gsap.set(heroHeading, {
            scale: 1,
            transformOrigin: 'center center',
            fontSize: headingFontSizeLarge,
            filter: crispHeadingIntro ? 'none' : 'blur(20px)',
            y: 100
        });
        if (aboutHero && heroHeading && aboutIntro) {
            gsap.to(heroHeading, {
                filter: 'blur(0px)',
                y: 0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true,
                onComplete: () => {
                    createAboutHeroScrollTimeline(aboutHero, heroHeading, aboutIntro, isMobile, true, headingFontSizeLarge, headingFontSizeEnd);
                    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                }
            });
        }
    } else if (isMobile || isSafari || isIOS) {
        gsap.set(heroHeading, {
            scale: 1,
            transformOrigin: 'center center',
            fontSize: headingFontSizeLarge,
            filter: 'none'
        });
    } else {
        gsap.set(heroHeading, {
            scale: 2.8,
            transformOrigin: 'center center',
            filter: 'blur(0px)'
        });
    }
    
    gsap.set(aboutIntro, {
        y: 0,
        opacity: 0
    });
    
    // When not from transition, create the hero scroll timeline immediately.
    if (!fromTransition) {
        createAboutHeroScrollTimeline(aboutHero, heroHeading, aboutIntro, isMobile, false, headingFontSizeLarge, headingFontSizeEnd);
    }
    
    // ============================================
    // 2. INTRO SECTION ANIMATIONS
    // ============================================
    
    const introImage = document.querySelector('.about-intro__image-selfie-2');
    const introImageBg1 = document.querySelector('.about-intro__image-shape-burst');
    const introImageBg2 = document.querySelector('.about-intro__image-shape-ring');
    const introTitle = document.querySelector('.about-intro__title');
    const introTextParagraphs = document.querySelectorAll('.about-intro__text p');
    const introStats = document.querySelectorAll('.about-intro__stat');
    if (introImageBg1) {
        gsap.from(introImageBg1, {
            opacity: 0,
            scale: 0.95,
            x: -10,
            duration: 1,
            ease: 'power2.out',
            delay: 0.5,
            scrollTrigger: {
                trigger: '.about-intro',
                start: 'top 70%',
                toggleActions: 'play none none none'
            }
        });
    }
    if (introImageBg2) {
        gsap.fromTo(introImageBg2, {
            rotate: 0,
        }, {
            rotate: 360,
            duration: 10,
            ease: 'none',
            repeat: -1,
        });
    }
    if (introImage) {
        gsap.set(introImage, {
            rotate: 5,
            opacity: 0,
            scale: 0.95,
        }); 
        gsap.to(introImage, 
            {
                rotate: -5,
                opacity: 1,
                scale: 1,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: introImage,
                
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                    invalidateOnRefresh: true
                }
            }
        );
    }

    
    if (introTitle) {
        gsap.from(introTitle, {
            opacity: 0,
            x: 30,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: introTitle,
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });
    }
    
    introTextParagraphs.forEach((p, index) => {
        gsap.from(p, {
            opacity: 0,
            y: 20,
            duration: 0.6,
            delay: 0.1 * index,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.about-intro__text',
                start: 'top 70%',
                toggleActions: 'play none none none'
            }
        });
    });
    
    introStats.forEach((stat, index) => {
        gsap.from(stat, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            delay: 0.2 * index,
            ease: 'back.out(1.2)',
            scrollTrigger: {
                trigger: '.about-intro__stats',
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });
    });
    
    // ============================================
    // 3. EXPERIENCE SECTION ANIMATIONS
    // ============================================
    
    const experienceHeading = document.querySelector('.about-experience__heading');
    const experienceItems = document.querySelectorAll('.about-experience__item');
    
    if (experienceHeading) {
        gsap.from(experienceHeading, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: experienceHeading,
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });
    }
    
    experienceItems.forEach((item, index) => {
        gsap.from(item, {
            opacity: 0,
            x: -20,
            duration: 0.6,
            delay: 0.05 * index,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.about-experience__grid',
                start: 'top 70%',
                toggleActions: 'play none none none'
            }
        });
    });
    
    // ============================================
    // 4. INTERESTS SECTION ANIMATIONS
    // ============================================
    
    const interestsHeading = document.querySelector('.about-interests__heading');
    const interestsParagraphs = document.querySelectorAll('.about-interests__content p');
    
    if (interestsHeading) {
        gsap.from(interestsHeading, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: interestsHeading,
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });
    }
    
    interestsParagraphs.forEach((p, index) => {
        gsap.from(p, {
            opacity: 0,
            x: -15,
            duration: 0.5,
            delay: 0.05 * index,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.about-interests__content',
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });
    });
    
    // ============================================
    // 5. CONTACT SECTION ANIMATIONS
    // ============================================
    
    const contactHeading = document.querySelector('.about-contact__heading');
    const contactEmail = document.querySelector('.about-contact__email');
    const contactLinks = document.querySelectorAll('.about-contact__link');
    
    if (contactHeading) {
        gsap.from(contactHeading, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: contactHeading,
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });
    }
    
    if (contactEmail) {
        gsap.from(contactEmail, {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.about-contact__content',
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });
    }
    
    contactLinks.forEach((link, index) => {
        gsap.from(link, {
            opacity: 0,
            x: -15,
            duration: 0.5,
            delay: 0.1 * (index + 1),
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.about-contact__content',
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });
    });
}

// End of initAboutPageAnimations()

// ============================================
// SMOOTH PAGE TRANSITIONS (Fetch + Replace - No Full Reload)
// ============================================

function initSmoothPageTransitions() {
    const loader = document.getElementById('loader');
    const loaderFill = document.querySelector('.loader-logo-fill-bar');
    
    if (!loader || !loaderFill) {
        return;
    }
    
    // Initially hide loader at bottom (only after initial page load completes)
    if (!document.body.classList.contains('is-loading')) {
        loader.classList.add('loader--hidden');
    }
    
    // Intercept all internal navigation clicks (capture phase so anchor check runs first)
    document.addEventListener('click', async (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;
        
        // Same-page anchor (e.g. #contact): scroll and update URL, never run transition
        try {
            const linkUrl = new URL(link.href);
            const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
            const linkPath = linkUrl.pathname.replace(/\/$/, '') || '/';
            if (linkPath === currentPath && linkUrl.hash) {
                e.preventDefault();
                const id = linkUrl.hash.slice(1);
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.pushState(null, '', link.href);
                return;
            }
        } catch (_) {}
        
        const hrefAttr = (link.getAttribute('href') || '').trim();
        if (hrefAttr.startsWith('#') && hrefAttr.length > 1) {
            return;
        }
        
        if (link.target === '_blank' || 
            !link.href.includes(window.location.origin) ||
            link.hasAttribute('download')) {
            return;
        }
        
        try {
            const url = new URL(link.href);
            if (url.pathname === window.location.pathname && url.hash) {
                return;
            }
        } catch (_) {
            return;
        }
        
        e.preventDefault();
        
        const targetUrl = link.href;
        
        // Use current page’s loader (refs are stale after first transition when body was replaced)
        const loader = document.getElementById('loader');
        const loaderFill = document.querySelector('.loader-logo-fill-bar');
        if (!loader || !loaderFill) return;
        
        // Phase 1: Loader wipes up from bottom – reset and set position first, keep invisible until ready
        loader.style.display = '';
        loader.style.visibility = 'hidden';
        loader.classList.add('loader--transitioning');
        loader.classList.remove('loader--hidden');
        gsap.set(loader, { yPercent: 100, force3D: true });
        gsap.set(loaderFill, { scaleX: 0 });
        // Wait two frames so transform is applied and painted, then show and animate
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                loader.style.visibility = '';
                gsap.to(loaderFill, {
                    scaleX: 1,
                    duration: 0.8,
                    ease: 'power2.inOut'
                });
                // fromTo so the loader explicitly starts at 100% and slides up to 0
                gsap.fromTo(loader,
                    { yPercent: 100, force3D: true },
                    {
                        yPercent: 0,
                        duration: 0.6,
                        ease: 'power3.out',
                        force3D: true,
                        immediateRender: false,
                        onComplete: async () => {
                    try {
                        // Phase 2: Fetch new page (no reload!)
                        const response = await fetch(targetUrl);
                        if (!response.ok) throw new Error('Fetch failed');
                        
                        const html = await response.text();
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        
                        // Kill existing ScrollTriggers before DOM swap
                        if (typeof ScrollTrigger !== 'undefined') {
                            ScrollTrigger.getAll().forEach(t => t.kill());
                        }
                        
                        // Replace entire body content (no full page reload)
                        const newBody = doc.body;
                        document.body.id = newBody.id || '';
                        document.body.className = newBody.className || '';
                        document.body.innerHTML = newBody.innerHTML;
                        
                        // Immediately switch new loader to transitioning state (solid, no logo) so it never flashes default
                        const newLoader = document.getElementById('loader');
                        if (newLoader) {
                            newLoader.classList.add('loader--transitioning');
                            newLoader.classList.remove('loader--hidden');
                            gsap.set(newLoader, { yPercent: 0, force3D: true });
                        }
                        
                        // Update document
                        document.title = doc.title;
                        history.pushState({}, '', targetUrl);
                        
                        // Scroll to top immediately so new page doesn't keep previous scroll position
                        resetScrollTop();
                        
                        // Re-initialize page (scripts don't re-run on fetch, so we call inits manually)
                        reinitPageAfterTransition();
                        
                        // Reset scroll again after layout so it sticks (new body may not have been laid out yet)
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => resetScrollTop());
                        });
                        
                        // Phase 3: Loader slides up and off
                        if (newLoader) {
                            gsap.to(newLoader, {
                                yPercent: -100,
                                duration: 1.3,
                                ease: 'power3.inOut',
                                force3D: true,
                                onComplete: () => {
                                    newLoader.classList.remove('loader--transitioning');
                                    newLoader.classList.add('loader--hidden');
                                    gsap.set(newLoader, { yPercent: 100, force3D: true });
                                    resetScrollTop();
                                    if (document.querySelector('#contact')) {
                                        // initContactTimeline refreshes first, then schedules more refreshes as media/layout settle
                                        requestAnimationFrame(() => {
                                            requestAnimationFrame(() => initContactTimeline());
                                        });
                                    } else if (typeof ScrollTrigger !== 'undefined') {
                                        ScrollTrigger.refresh();
                                    }
                                    if (document.querySelector('.portfolio-page')) {
                                        initPortfolioPageFigureReveal();
                                        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                                    }
                                }
                            });
                        }
                        
                    } catch (err) {
                        // Fallback to normal navigation if fetch fails
                        window.location.href = targetUrl;
                    }
                }
            });
            });
        });
    }, { capture: true });
    
    // Handle browser back/forward
    window.addEventListener('popstate', () => {
        window.location.reload();
    });
}

function reinitPageAfterTransition() {
    resetScrollTop();
    initCursorDot();

    // Only run inits for the current page to avoid "GSAP target null not found" (e.g. homepage shapes on About page)
    if (document.querySelector('.hero')) {
        if (!isMobileDevice()) {
            initHeroAnimations();
        } else {
            initHeroShapesPositionMobile();
        }
        initHeroTitleImageHover();
        initWorkLaptopSequence();
        initWorkCursorFollow();
        initProcessStacking();
    }
    if (document.querySelector('.work-page')) {
        initWorkPageSlider();
    }
    if (document.querySelector('#about-page')) {
        initAboutPageAnimations();
        initAboutTimeline();
    }
    // Contact timeline is created in Phase 3 loader onComplete (after layout is stable) to avoid wrong marker positions on transition
    if (document.querySelector('.case-study-evolution')) {
        initCaseStudyEvolution();
    }
    if (document.querySelector('.case-study-hero__media')) {
        initCaseStudyHeroMediaReveal({ runAnimation: true });
    }
    if (document.querySelector('.portfolio-page')) {
        initPortfolioPageFigureReveal({ initOnly: true });
    }

    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
        requestAnimationFrame(() => {
            requestAnimationFrame(() => ScrollTrigger.refresh());
        });
    }
}

// End of initSmoothPageTransitions()