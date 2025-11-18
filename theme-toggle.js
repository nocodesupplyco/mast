// NOTE: This code is hosted directly in the Custom Code component of the Webflow cloneable project for max performance and editing of the INVERT_MODE variable definition

 (function () {
    // Configuration
    const INVERT_MODE = "light";

    const docEl = document.documentElement;
    const savedMode = localStorage.getItem("invertMode");

    // Apply mode classes globally
    function applyMode(shouldInvert) {
      docEl.classList.toggle("u-mode-invert", shouldInvert);
      docEl.classList.toggle("u-mode-base", !shouldInvert);
    }

    // Update label visibility for a specific toggle instance
    function updateLabels(shouldInvert, baseLabel, invertLabel) {
      if (baseLabel && invertLabel) {
        baseLabel.style.display = shouldInvert ? "none" : "block";
        invertLabel.style.display = shouldInvert ? "block" : "none";
      }
    }

    // Determine initial mode from saved preference or OS
    let shouldInvert;
    if (savedMode !== null) {
      shouldInvert = savedMode === "true";
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      shouldInvert = INVERT_MODE === "light" ? !prefersDark : prefersDark;
    }

    // Apply mode immediately to prevent flash
    applyMode(shouldInvert);

    // Set up checkbox toggles and OS preference listener
    window.addEventListener("DOMContentLoaded", function () {
      const checkboxes = document.querySelectorAll('[data-theme-toggle="checkbox"]');

      // Set up each toggle instance
      checkboxes.forEach(function (checkbox) {
        const baseLabel = checkbox.parentElement.querySelector('[data-theme-toggle="base-label"]');
        const invertLabel = checkbox.parentElement.querySelector('[data-theme-toggle="invert-label"]');

        // Initialize checkbox state and labels
        checkbox.checked = docEl.classList.contains("u-mode-invert");
        updateLabels(checkbox.checked, baseLabel, invertLabel);

        // Handle checkbox change
        checkbox.addEventListener("change", function () {
          const shouldInvert = checkbox.checked;
          applyMode(shouldInvert);
          localStorage.setItem("invertMode", shouldInvert ? "true" : "false");

          // Update all checkbox instances to stay in sync
          checkboxes.forEach(function (cb) {
            cb.checked = shouldInvert;
            const cbBaseLabel = cb.parentElement.querySelector('[data-theme-toggle="base-label"]');
            const cbInvertLabel = cb.parentElement.querySelector('[data-theme-toggle="invert-label"]');
            updateLabels(shouldInvert, cbBaseLabel, cbInvertLabel);
          });
        });
      });

      // Listen for OS preference changes if no saved preference
      if (savedMode === null) {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
          const shouldInvert = INVERT_MODE === "light" ? !e.matches : e.matches;
          applyMode(shouldInvert);

          // Update all checkbox instances
          checkboxes.forEach(function (checkbox) {
            checkbox.checked = shouldInvert;
            const baseLabel = checkbox.parentElement.querySelector('[data-theme-toggle="base-label"]');
            const invertLabel = checkbox.parentElement.querySelector('[data-theme-toggle="invert-label"]');
            updateLabels(shouldInvert, baseLabel, invertLabel);
          });
        });
      }
    });
  })();
