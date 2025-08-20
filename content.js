// Minimal content script to fix fonts without blocking page load

(function() {
  'use strict';
  
  let fontFixEnabled = true;
  
  // Apply or remove font fix based on enabled state
  function applyFontFix() {
    // Remove existing style if present
    const existing = document.getElementById('claude-font-fix');
    if (existing) existing.remove();
    
    if (!fontFixEnabled) return;
    
    // Apply font fix with more comprehensive targeting
    const style = document.createElement('style');
    style.id = 'claude-font-fix';
    style.textContent = `
      /* Override Claude's CSS variables */
      :root {
        --font-claude-response: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      
      /* Target all possible Claude font classes and elements */
      .prose, .prose *,
      .font-serif, .font-claude-response,
      [class*="prose"], [class*="font-serif"], [class*="claude-response"],
      .conversation-turn, .message-content, .markdown-content,
      div[data-testid*="conversation"], div[data-testid*="message"],
      p, h1, h2, h3, h4, h5, h6, li, blockquote, span, div {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
      }
      
      /* Extra specificity for stubborn elements */
      body * {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
      }
    `;
    document.head.appendChild(style);
    
    // Also apply to any existing elements immediately
    applyToExistingElements();
  }
  
  // Apply styles directly to existing elements for immediate effect
  function applyToExistingElements() {
    if (!fontFixEnabled) return;
    
    const fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif';
    const selectors = [
      '.prose', '.prose *',
      '.font-serif', '.font-claude-response',
      '[class*="prose"]', '[class*="font-serif"]', '[class*="claude-response"]',
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'span', 'div'
    ];
    
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.setProperty('font-family', fontFamily, 'important');
        });
      } catch (e) {
        // Ignore invalid selectors
      }
    });
  }
  
  // Check storage state and apply font fix accordingly
  function checkEnabled() {
    chrome.storage.sync.get(['fontFixEnabled'], function(result) {
      fontFixEnabled = result.fontFixEnabled !== false; // Default to true
      console.log('Claude Font Fix: Extension enabled =', fontFixEnabled);
      applyFontFix();
    });
  }
  
  // Listen for storage changes (when popup toggles the setting)
  chrome.storage.onChanged.addListener(function(changes) {
    if (changes.fontFixEnabled) {
      fontFixEnabled = changes.fontFixEnabled.newValue !== false;
      console.log('Claude Font Fix: Extension toggled to', fontFixEnabled);
      applyFontFix();
    }
  });
  
  // Watch for dynamic content changes
  const observer = new MutationObserver(function(mutations) {
    if (!fontFixEnabled) return;
    
    let shouldReapply = false;
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldReapply = true;
      }
    });
    
    if (shouldReapply) {
      // Debounce to avoid excessive calls
      setTimeout(applyToExistingElements, 100);
    }
  });
  
  // Initialize when DOM is ready
  function init() {
    checkEnabled();
    
    // Start observing for dynamic content
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();