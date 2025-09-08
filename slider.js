(function () {
  "use strict";

  // Early exit if Swiper is not available
  if (typeof Swiper === "undefined") {
    return;
  }

  function initializeSwipers() {
    const swiperElements = document.querySelectorAll('[data-slider="slider"]');

    // Gracefully exit if no sliders found
    if (swiperElements.length === 0) {
      return;
    }

    // Initialize each swiper instance
    swiperElements.forEach((element, index) => {
      initializeSwiper(element, index);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSwipers);
  } else {
    initializeSwipers();
  }

  function initializeSwiper(element, index) {
    try {
      // Get configuration from data attributes
      const config = getSwiperConfig(element);

      // Initialize Swiper
      const swiper = new Swiper(element, config);

      // Store reference for potential future access
      element.swiperInstance = swiper;
    } catch (error) {
      // Silently handle errors in production
      if (typeof console !== "undefined" && console.error) {
        console.error("Swiper initialization failed:", error);
      }
    }
  }

  function getSwiperConfig(element) {
    // Get computed styles to read CSS variables for proper slide calculation
    const computedStyle = getComputedStyle(element);
    const xs = parseInt(computedStyle.getPropertyValue("--xs").trim()) || 1;
    const sm = parseInt(computedStyle.getPropertyValue("--sm").trim()) || 1;
    const md = parseInt(computedStyle.getPropertyValue("--md").trim()) || 2;
    const lg = parseInt(computedStyle.getPropertyValue("--lg").trim()) || 3;
    const spaceBetween =
      parseInt(computedStyle.getPropertyValue("--gap").trim()) || 24;

    // Base configuration - sync with CSS-controlled layout
    const config = {
      // Use breakpoints that match our CSS exactly
      breakpoints: {
        0: { slidesPerView: xs, spaceBetween: spaceBetween },
        480: { slidesPerView: sm, spaceBetween: spaceBetween },
        768: { slidesPerView: md, spaceBetween: spaceBetween },
        992: { slidesPerView: lg, spaceBetween: spaceBetween },
      },
      autoHeight: true,
      watchSlidesProgress: true,
      simulateTouch: true,
      allowTouchMove: true,
      keyboard: { enabled: true, onlyInViewport: true },
      a11y: { enabled: true },
    };

    // Configure grab cursor (default: true, can be disabled for clickable content)
    const grabCursor = element.dataset.grabCursor;
    if (grabCursor === "false") {
      config.grabCursor = false;
    } else {
      config.grabCursor = true;
    }

    // Find the parent component wrapper
    const componentWrapper = element.closest('[data-slider="component"]');

    // Configure navigation if elements exist
    const nextEl = componentWrapper.querySelector('[data-slider="next"]');
    const prevEl = componentWrapper.querySelector('[data-slider="previous"]');

    if (nextEl && prevEl) {
      config.navigation = { nextEl, prevEl };
    }

    // Configure pagination if element exists
    const paginationEl = componentWrapper.querySelector(
      '[data-slider="pagination"]'
    );

    if (paginationEl) {
      config.pagination = {
        el: paginationEl,
        clickable: true,
        bulletElement: "button",
        bulletClass: "slider-pagination_button",
        bulletActiveClass: "cc-active",
      };
    }

    // Configure loop if requested
    if (element.dataset.loop === "true") {
      config.loop = true;
      config.loopFillGroupWithBlank = true;

      // Configure loopAdditionalSlides if specified
      const loopAdditionalSlides = element.dataset.loopAdditionalSlides;
      if (loopAdditionalSlides && !isNaN(loopAdditionalSlides)) {
        config.loopAdditionalSlides = parseInt(loopAdditionalSlides);
      }
    }

    // Configure autoplay if requested
    const autoplayDelay = element.dataset.autoplay;
    if (autoplayDelay && autoplayDelay !== "false" && !isNaN(autoplayDelay)) {
      config.autoplay = {
        delay: parseInt(autoplayDelay),
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      };
    }

    // Configure centered slides if requested
    if (element.dataset.centered === "true") {
      config.centeredSlides = true;
      config.centeredSlidesBounds = true;
    }

    // Configure fade effect if specified
    if (element.dataset.effect === "fade") {
      config.effect = "fade";
      config.fadeEffect = { crossFade: true };
    }

    // Configure speed if specified
    const speed = element.dataset.speed;
    if (speed && !isNaN(speed)) {
      config.speed = parseInt(speed);
    }

    return config;
  }

  // Utility functions for external use
  window.AttributesSwiper = {
    // Reinitialize all swipers (useful for dynamic content)
    reinitialize: function () {
      if (typeof Swiper === "undefined") return;

      const swiperElements = document.querySelectorAll(
        '[data-slider="slider"]'
      );
      swiperElements.forEach((element) => {
        if (element.swiperInstance) {
          element.swiperInstance.destroy(true, true);
        }
      });

      setTimeout(() => {
        swiperElements.forEach((element, index) => {
          initializeSwiper(element, index);
        });
      }, 50);
    },

    // Get a specific swiper instance
    getInstance: function (index) {
      const swiperElements = document.querySelectorAll(
        '[data-slider="slider"]'
      );
      if (swiperElements[index] && swiperElements[index].swiperInstance) {
        return swiperElements[index].swiperInstance;
      }
      return null;
    },
  };
})();
