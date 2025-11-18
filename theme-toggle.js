// NOTE: This code is hosted directly in the Custom Code component of the Webflow cloneable project for max performance and editing of the INVERT_MODE variable definition

(function () {
    // Configuration
    const INVERT_MODE = "light";

    const docEl = document.documentElement;
    const savedMode = localStorage.getItem("invertMode");

    // Apply mode classes
    function applyModeClasses(shouldInvert) {
      docEl.classList.toggle("u-mode-invert", shouldInvert);
      docEl.classList.toggle("u-mode-base", !shouldInvert);
    }

    // Update label visibility
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
    applyModeClasses(shouldInvert);

    // Set up checkbox toggles and OS preference listener
    window.addEventListener("DOMContentLoaded", function () {
      const checkboxes = document.querySelectorAll('[data-theme-toggle="checkbox"]');

      checkboxes.forEach(function (checkbox) {
        const baseLabel = checkbox.parentElement.querySelector('[data-theme-toggle="base-label"]');
        const invertLabel = checkbox.parentElement.querySelector('[data-theme-toggle="invert-label"]');

        checkbox.checked = docEl.classList.contains("u-mode-invert");
        updateLabels(checkbox.checked, baseLabel, invertLabel);

        checkbox.addEventListener("change", function () {
          const shouldInvert = checkbox.checked;
          applyModeClasses(shouldInvert);
          localStorage.setItem("invertMode", shouldInvert ? "true" : "false");
          updateLabels(shouldInvert, baseLabel, invertLabel);

          // Sync all other checkboxes
          checkboxes.forEach(function (cb) {
            if (cb !== checkbox) {
              cb.checked = shouldInvert;
              const bl = cb.parentElement.querySelector('[data-theme-toggle="base-label"]');
              const il = cb.parentElement.querySelector('[data-theme-toggle="invert-label"]');
              updateLabels(shouldInvert, bl, il);
            }
          });
        });
      });

      // Listen for OS preference changes if no saved preference
      if (savedMode === null) {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
          const shouldInvert = INVERT_MODE === "light" ? !e.matches : e.matches;
          applyModeClasses(shouldInvert);
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
