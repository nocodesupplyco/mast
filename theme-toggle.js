(function () {
  // Configuration
  const INVERT_MODE = "light";

  const docEl = document.documentElement;
  const savedMode = localStorage.getItem("invertMode");

  // Apply mode classes and toggle label visibility
  function applyMode(shouldInvert, baseLabel, invertLabel) {
    docEl.classList.toggle("u-mode-invert", shouldInvert);
    docEl.classList.toggle("u-mode-base", !shouldInvert);
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
  applyMode(shouldInvert, null, null);

  // Set up checkbox toggle and OS preference listener
  window.addEventListener("DOMContentLoaded", function () {
    const checkbox = document.querySelector('[data-theme-toggle="checkbox"]');
    const baseLabel = checkbox ? checkbox.parentElement.querySelector('[data-theme-toggle="base-label"]') : null;
    const invertLabel = checkbox ? checkbox.parentElement.querySelector('[data-theme-toggle="invert-label"]') : null;

    if (checkbox) {
      checkbox.checked = docEl.classList.contains("u-mode-invert");

      if (baseLabel && invertLabel) {
        baseLabel.style.display = checkbox.checked ? "none" : "block";
        invertLabel.style.display = checkbox.checked ? "block" : "none";
      }

      checkbox.addEventListener("change", function () {
        const shouldInvert = checkbox.checked;
        applyMode(shouldInvert, baseLabel, invertLabel);
        localStorage.setItem("invertMode", shouldInvert ? "true" : "false");
      });
    }

    // Listen for OS preference changes if no saved preference
    if (savedMode === null) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
        const shouldInvert = INVERT_MODE === "light" ? !e.matches : e.matches;
        applyMode(shouldInvert, baseLabel, invertLabel);
        if (checkbox) checkbox.checked = shouldInvert;
      });
    }
  });
})();
