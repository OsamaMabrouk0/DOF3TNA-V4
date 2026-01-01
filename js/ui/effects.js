(function(App) {
    'use strict';
    
    App.Effects.createRipple = function(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(function() {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    };
    
    App.Effects.attachRippleEffect = function() {
        if (!App._settings.animationsEnabled) return;
        
        const buttons = document.querySelectorAll('.magnetic-btn, button, .glass-panel');
        
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].removeEventListener('click', App.Effects.createRipple);
            buttons[i].addEventListener('click', App.Effects.createRipple);
        }
    };
    
    App.Effects.magneticButton = function(element, strength) {
        if (!App._settings.animationsEnabled) return;
        
        strength = strength || 0.3;
        
        element.addEventListener('mousemove', function(e) {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            element.style.transform = 'translate(' + (x * strength) + 'px, ' + (y * strength) + 'px) scale(1.05)';
        });
        
        element.addEventListener('mouseleave', function() {
            element.style.transform = '';
        });
    };
    
    App.Effects.attachMagneticEffect = function() {
        if (!App._settings.animationsEnabled) return;
        
        const magneticBtns = document.querySelectorAll('.magnetic-btn');
        
        for (let i = 0; i < magneticBtns.length; i++) {
            App.Effects.magneticButton(magneticBtns[i]);
        }
    };
    
    App.Effects.initParticles = function() {
        const container = App.DOM.particlesContainer;
        if (!container || !App._settings.particlesEnabled) return;
        
        container.innerHTML = '';
        
        const particleCount = App.Utils.isMobile() ? 15 : 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            const size = App.Utils.random(2, 6);
            const left = App.Utils.random(0, 100);
            const animationDuration = App.Utils.random(10, 30);
            const animationDelay = App.Utils.random(0, 10);
            
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = left + '%';
            particle.style.top = App.Utils.random(0, 100) + '%';
            particle.style.animationDuration = animationDuration + 's';
            particle.style.animationDelay = '-' + animationDelay + 's';
            particle.style.background = App.Utils.randomColor();
            
            container.appendChild(particle);
        }
    };
    
    App.Effects.toggleParticles = function(enabled) {
        const container = App.DOM.particlesContainer;
        if (!container) return;
        
        if (enabled) {
            container.classList.remove('hidden');
            App.Effects.initParticles();
        } else {
            container.classList.add('hidden');
        }
        
        App._settings.particlesEnabled = enabled;
        App.Utils.saveToStorage('particlesEnabled', enabled);
    };
    
    App.Effects.toggleAnimations = function(enabled) {
        App._settings.animationsEnabled = enabled;
        App.Utils.saveToStorage('animationsEnabled', enabled);
        
        if (enabled) {
            App.Effects.attachRippleEffect();
            App.Effects.attachMagneticEffect();
            App.Effects.initScrollAnimations();
        } else {
            const animatedElements = document.querySelectorAll('.scroll-animate');
            animatedElements.forEach(function(el) {
                el.classList.add('visible');
            });
        }
    };
    
    App.Effects.initScrollAnimations = function() {
        if (!App._settings.animationsEnabled) {
            const animatedElements = document.querySelectorAll('.scroll-animate');
            animatedElements.forEach(function(el) {
                el.classList.add('visible');
            });
            return;
        }
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);
        
        const animatedElements = document.querySelectorAll('.scroll-animate');
        animatedElements.forEach(function(el) {
            el.classList.remove('visible');
            observer.observe(el);
        });
    };
    
    App.Effects.initPullToRefresh = function() {
        const content = App.DOM.appContent;
        const indicator = App.DOM.pullRefreshIndicator;
        
        if (!content || !indicator) return;
        
        let startY = 0;
        let currentY = 0;
        let pulling = false;
        
        content.addEventListener('touchstart', function(e) {
            if (content.scrollTop === 0) {
                startY = e.touches[0].pageY;
                pulling = true;
            }
        });
        
        content.addEventListener('touchmove', function(e) {
            if (!pulling) return;
            
            currentY = e.touches[0].pageY;
            const diff = currentY - startY;
            
            if (diff > 0 && diff < 100) {
                e.preventDefault();
                indicator.style.transform = 'translateX(-50%) rotate(' + (diff * 3.6) + 'deg)';
                
                if (diff > 60) {
                    indicator.classList.add('active');
                }
            }
        });
        
        content.addEventListener('touchend', function() {
            if (!pulling) return;
            
            const diff = currentY - startY;
            
            if (diff > 60) {
                indicator.classList.add('spinning');
                
                setTimeout(function() {
                    indicator.classList.remove('active', 'spinning');
                    indicator.style.transform = '';
                    
                    App.Router.go(App.State.currentPage, false);
                }, 1000);
            } else {
                indicator.classList.remove('active');
                indicator.style.transform = '';
            }
            
            pulling = false;
            startY = 0;
            currentY = 0;
        });
    };
    
    App.Effects.initParallax = function() {
        if (App.Utils.isMobile() || !App._settings.animationsEnabled) return;
        
        document.addEventListener('mousemove', App.Utils.throttle(function(e) {
            const parallaxElements = document.querySelectorAll('.parallax-layer');
            
            parallaxElements.forEach(function(el) {
                const speed = el.getAttribute('data-speed') || 0.05;
                const x = (window.innerWidth - e.pageX * speed) / 100;
                const y = (window.innerHeight - e.pageY * speed) / 100;
                
                el.style.transform = 'translateX(' + x + 'px) translateY(' + y + 'px)';
            });
        }, 50));
    };
    
    App.Effects.initLazyLoad = function() {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(function(img) {
            imageObserver.observe(img);
        });
    };
    
    App.Effects.initBlurOnScroll = function() {
        if (!App._settings.animationsEnabled) return;
        
        const content = App.DOM.appContent;
        if (!content) return;
        
        let lastScrollTop = 0;
        let scrolling = false;
        
        content.addEventListener('scroll', function() {
            if (!scrolling) {
                scrolling = true;
                const elements = document.querySelectorAll('.blur-on-scroll');
                elements.forEach(function(el) {
                    el.classList.add('blurred');
                });
            }
            
            clearTimeout(window.scrollTimer);
            window.scrollTimer = setTimeout(function() {
                scrolling = false;
                const elements = document.querySelectorAll('.blur-on-scroll');
                elements.forEach(function(el) {
                    el.classList.remove('blurred');
                });
            }, 150);
        });
    };
    
    App.Effects.init = function() {
        App._settings.animationsEnabled = App.Utils.loadFromStorage('animationsEnabled', true);
        App._settings.particlesEnabled = App.Utils.loadFromStorage('particlesEnabled', true);
        
        App.Effects.attachRippleEffect();
        
        App.Effects.attachMagneticEffect();
        
        if (App._settings.particlesEnabled) {
            App.Effects.initParticles();
        }
        
        App.Effects.initScrollAnimations();
        
        if (App.Utils.isTouchDevice()) {
            App.Effects.initPullToRefresh();
        }
        
        App.Effects.initParallax();
        
        App.Effects.initLazyLoad();
    };
    
    App.Effects.refresh = function() {
        App.Effects.attachRippleEffect();
        App.Effects.attachMagneticEffect();
        App.Effects.initScrollAnimations();
        App.Effects.initLazyLoad();
    };
    
})(window.App);