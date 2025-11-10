(function() {
    'use strict';

    // Early exit if no tabs components exist on the page
    const tabComponents = document.querySelectorAll('.tabs-component');
    if (!tabComponents.length) {
        return;
    }

    /**
     * Initialize a single tabs component
     */
    function initTabsComponent(component) {
        const tabMenu = component.querySelector('.tabs-menu');
        const dropdownMenu = component.querySelector('.tabs-menu_dropdown-menu');
        const tabMenuWrapper = component.querySelector('.slot.cc-tabs-menu');
        const tabLinks = component.querySelectorAll('.tabs-link');
        const tabPanes = component.querySelectorAll('.tabs-pane');

        if (!tabMenu || !dropdownMenu || !tabMenuWrapper || !tabLinks.length || !tabPanes.length) {
            return;
        }

        // State
        let currentActiveIndex = 0;
        let dropdownToggle = tabMenu.querySelector('.tabs-menu_dropdown-toggle');
        let dropdownText = dropdownToggle ? dropdownToggle.querySelector('.tabs-menu_dropdown-text') : null;
        let isMobileDropdown = tabMenu.getAttribute('data-tab-mobile-dropdown') === 'true';

        // Autoplay state
        let autoplayEnabled = tabMenu.getAttribute('data-tabs-autoplay') === 'true';
        let autoplayDuration = parseFloat(tabMenu.getAttribute('data-tabs-autoplay-duration')) || 5;
        let autoplayHoverPause = tabMenu.getAttribute('data-tabs-autoplay-hover-pause') === 'true';
        let autoplayTimer = null;
        let autoplayObserver = null;
        let isAutoplayPaused = false;
        let autoplayStartTime = null;
        let autoplayElapsedTime = 0;

        /**
         * Set the active tab by index
         */
        function setActiveTab(index) {
            if (index < 0 || index >= tabLinks.length) {
                return;
            }

            // Update tab links and overlays
            tabLinks.forEach((link, i) => {
                const isActive = i === index;
                link.setAttribute('aria-selected', isActive);

                // Add/remove active class
                if (isActive) {
                    link.classList.add('cc-active');
                } else {
                    link.classList.remove('cc-active');
                }

                const overlay = link.querySelector('[data-tabs-link-button]');
                if (overlay) {
                    overlay.setAttribute('tabindex', isActive ? '0' : '-1');
                }
            });

            // Update tab panes
            tabPanes.forEach((pane, i) => {
                const isActive = i === index;
                pane.setAttribute('aria-hidden', !isActive);
            });

            currentActiveIndex = index;

            // Update dropdown toggle text if it exists
            if (dropdownText && isMobileDropdown) {
                const activeTabName = tabLinks[index].getAttribute('data-tab-link-name');
                dropdownText.textContent = activeTabName || tabLinks[index].textContent;
            }

            // Close dropdown if open
            if (dropdownToggle && dropdownMenu.classList.contains('cc-open')) {
                closeDropdown();
            }

            // Scroll active tab into view within the overflow container
            if (!isMobileDropdown) {
                const activeLink = tabLinks[index];
                const scrollContainer = tabMenuWrapper;

                // Calculate the scroll position needed to show the active tab
                const containerLeft = scrollContainer.scrollLeft;
                const containerWidth = scrollContainer.clientWidth;
                const tabLeft = activeLink.offsetLeft;
                const tabWidth = activeLink.offsetWidth;

                // Scroll to show the tab on the left side of the container
                if (tabLeft < containerLeft || tabLeft + tabWidth > containerLeft + containerWidth) {
                    scrollContainer.scrollTo({
                        left: tabLeft,
                        behavior: 'smooth'
                    });
                }
            }

            // Restart autoplay if enabled
            if (autoplayEnabled) {
                if (isAutoplayPaused) {
                    // Reset elapsed time when manually switching tabs while paused
                    autoplayElapsedTime = 0;
                } else {
                    restartAutoplay();
                }
            }
        }

        /**
         * Open the mobile dropdown
         */
        function openDropdown() {
            if (!dropdownToggle || !dropdownMenu) return;
            dropdownMenu.classList.add('cc-open');
            dropdownToggle.classList.add('cc-open');
            dropdownToggle.setAttribute('aria-expanded', 'true');
        }

        /**
         * Close the mobile dropdown
         */
        function closeDropdown() {
            if (!dropdownToggle || !dropdownMenu) return;
            dropdownMenu.classList.remove('cc-open');
            dropdownToggle.classList.remove('cc-open');
            dropdownToggle.setAttribute('aria-expanded', 'false');
        }

        /**
         * Toggle the mobile dropdown
         */
        function toggleDropdown() {
            if (dropdownMenu.classList.contains('cc-open')) {
                closeDropdown();
            } else {
                openDropdown();
            }
        }

        /**
         * Setup mobile dropdown interactions
         */
        function setupMobileDropdown() {
            if (!isMobileDropdown || !dropdownToggle) return;

            // Set initial aria attributes
            dropdownToggle.setAttribute('aria-haspopup', 'true');
            dropdownToggle.setAttribute('aria-expanded', 'false');

            // Set initial text to active tab
            const activeLink = component.querySelector('.tabs-link[aria-selected="true"]') ||
                              component.querySelector('.tabs-link.cc-active') ||
                              tabLinks[0];
            if (dropdownText && activeLink) {
                const activeTabName = activeLink.getAttribute('data-tab-link-name');
                dropdownText.textContent = activeTabName || activeLink.textContent;
            }

            // Toggle dropdown on click
            dropdownToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleDropdown();
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!component.contains(e.target)) {
                    closeDropdown();
                }
            });

            // Close on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && dropdownMenu.classList.contains('cc-open')) {
                    closeDropdown();
                    dropdownToggle.focus();
                }
            });
        }

        /**
         * Setup autoplay progress bars
         */
        function setupAutoplayProgressBars() {
            if (!autoplayEnabled) return;

            // Set CSS variable for duration
            component.style.setProperty('--autoplay-duration', `${autoplayDuration}s`);
        }

        /**
         * Start autoplay
         */
        function startAutoplay() {
            if (!autoplayEnabled || isAutoplayPaused) return;

            stopAutoplay();

            const remainingTime = (autoplayDuration * 1000) - autoplayElapsedTime;
            autoplayStartTime = Date.now();

            autoplayTimer = setTimeout(() => {
                const nextIndex = (currentActiveIndex + 1) % tabLinks.length;
                setActiveTab(nextIndex);
            }, remainingTime);
        }

        /**
         * Stop autoplay
         */
        function stopAutoplay() {
            if (autoplayTimer) {
                clearTimeout(autoplayTimer);
                autoplayTimer = null;
            }
            autoplayStartTime = null;
        }

        /**
         * Restart autoplay (used when manually switching tabs)
         */
        function restartAutoplay() {
            if (!autoplayEnabled) return;

            // Reset elapsed time
            autoplayElapsedTime = 0;

            // Remove and re-add animation to restart it
            const activeLink = tabLinks[currentActiveIndex];
            const progressBar = activeLink.querySelector('.tabs-autoplay-progress');

            if (progressBar) {
                // Force animation restart
                progressBar.style.animation = 'none';
                void progressBar.offsetWidth; // Trigger reflow
                progressBar.style.animation = '';
            }

            startAutoplay();
        }

        /**
         * Update toggle button aria-label
         */
        function updateToggleButton() {
            const toggleButton = component.querySelector('.tabs-autoplay-toggle');
            if (!toggleButton) return;

            if (isAutoplayPaused) {
                toggleButton.setAttribute('aria-label', 'Play autoplay');
            } else {
                toggleButton.setAttribute('aria-label', 'Pause autoplay');
            }
        }

        /**
         * Pause autoplay
         */
        function pauseAutoplay() {
            if (!autoplayEnabled) return;

            // Calculate elapsed time
            if (autoplayStartTime !== null) {
                autoplayElapsedTime += Date.now() - autoplayStartTime;
            }

            isAutoplayPaused = true;
            component.classList.add('autoplay-paused');
            stopAutoplay();
            updateToggleButton();
        }

        /**
         * Resume autoplay
         */
        function resumeAutoplay() {
            if (!autoplayEnabled) return;
            isAutoplayPaused = false;
            component.classList.remove('autoplay-paused');
            startAutoplay();
            updateToggleButton();
        }

        /**
         * Setup intersection observer for autoplay
         */
        function setupAutoplayObserver() {
            if (!autoplayEnabled) return;

            autoplayObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        resumeAutoplay();
                    } else {
                        pauseAutoplay();
                    }
                });
            }, { threshold: 0.5 });

            autoplayObserver.observe(component);
        }

        /**
         * Setup hover pause for autoplay
         */
        function setupAutoplayHoverPause() {
            if (!autoplayEnabled || !autoplayHoverPause) return;

            component.addEventListener('mouseenter', () => {
                pauseAutoplay();
            });

            component.addEventListener('mouseleave', () => {
                resumeAutoplay();
            });
        }

        /**
         * Setup play/pause toggle button
         */
        function setupAutoplayToggle() {
            if (!autoplayEnabled) return;

            const toggleButton = component.querySelector('.tabs-autoplay-toggle');
            if (!toggleButton) return;

            toggleButton.addEventListener('click', () => {
                if (isAutoplayPaused) {
                    resumeAutoplay();
                } else {
                    pauseAutoplay();
                }
            });
        }

        /**
         * Find initial active tab index
         */
        function findInitialActiveIndex() {
            // Check for URL hash match
            if (window.location.hash) {
                const hash = window.location.hash.substring(1);
                const matchIndex = Array.from(tabLinks).findIndex(link => link.id === hash);
                if (matchIndex !== -1) {
                    return matchIndex;
                }
            }

            // Check for cc-active class
            const customActiveIndex = Array.from(tabLinks).findIndex(
                link => link.classList.contains('cc-active')
            );
            if (customActiveIndex !== -1) {
                return customActiveIndex;
            }

            // Default to first tab
            return 0;
        }

        /**
         * Setup keyboard navigation
         */
        function setupKeyboardNav() {
            tabLinks.forEach((link) => {
                const overlay = link.querySelector('[data-tabs-link-button]');
                if (!overlay) return;

                overlay.addEventListener('keydown', function(e) {
                    let newIndex = currentActiveIndex;

                    switch(e.key) {
                        case 'ArrowLeft':
                            e.preventDefault();
                            newIndex = currentActiveIndex > 0 ? currentActiveIndex - 1 : tabLinks.length - 1;
                            break;
                        case 'ArrowRight':
                            e.preventDefault();
                            newIndex = currentActiveIndex < tabLinks.length - 1 ? currentActiveIndex + 1 : 0;
                            break;
                        case 'Home':
                            e.preventDefault();
                            newIndex = 0;
                            break;
                        case 'End':
                            e.preventDefault();
                            newIndex = tabLinks.length - 1;
                            break;
                        default:
                            return;
                    }

                    setActiveTab(newIndex);
                    const nextOverlay = tabLinks[newIndex].querySelector('[data-tabs-link-button]');
                    if (nextOverlay) {
                        nextOverlay.focus();
                    }
                });
            });
        }

        /**
         * Setup click handlers
         */
        function setupClickHandlers() {
            tabLinks.forEach((link, index) => {
                const overlay = link.querySelector('[data-tabs-link-button]');
                if (!overlay) return;

                overlay.addEventListener('click', function(e) {
                    e.preventDefault();
                    setActiveTab(index);

                    // Scroll the active tab into view on mobile
                    if (window.innerWidth < 768 && !isMobileDropdown) {
                        link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                });
            });
        }

        /**
         * Initialize the component
         */
        function init() {
            // Setup mobile dropdown if needed
            setupMobileDropdown();

            // Setup autoplay if needed
            setupAutoplayProgressBars();
            setupAutoplayObserver();
            setupAutoplayHoverPause();
            setupAutoplayToggle();

            // Find and set initial active tab
            const initialIndex = findInitialActiveIndex();
            setActiveTab(initialIndex);

            // Setup interactions
            setupClickHandlers();
            setupKeyboardNav();

            // Start autoplay if enabled
            if (autoplayEnabled) {
                startAutoplay();
            }

            // Handle hash changes for deep linking
            window.addEventListener('hashchange', function() {
                if (window.location.hash) {
                    const hash = window.location.hash.substring(1);
                    const matchIndex = Array.from(tabLinks).findIndex(link => link.id === hash);
                    if (matchIndex !== -1) {
                        setActiveTab(matchIndex);
                    }
                }
            });
        }

        // Initialize this component
        init();
    }

    /**
     * Initialize all tabs components on the page
     */
    function initAllTabs() {
        // Re-query for tabs components in case they were added dynamically
        const components = document.querySelectorAll('.tabs-component');

        if (!components.length) {
            return;
        }

        components.forEach(initTabsComponent);
    }

    // Wait for DOM to be fully loaded before initializing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllTabs);
    } else {
        initAllTabs();
    }

})();
