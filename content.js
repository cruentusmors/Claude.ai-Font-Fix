// Minimal content script to fix fonts without blocking page load

(function() {
  'use strict';
  
  // Wait for page to be ready
  function init() {
    // Simple font fix for prose elements
    const style = document.createElement('style');
    style.textContent = `
      .prose, .prose * {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      .font-serif {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();