// Minimal content script to fix fonts without blocking page load

(function() {
  'use strict';
  
  let fontFixEnabled = true;
  let originalStyles = new Map(); // Store original font styles
  
  // Apply or remove font fix based on enabled state
  function applyFontFix() {
    // Remove existing style if present
    const existing = document.getElementById('claude-font-fix');
    if (existing) existing.remove();
    
    if (!fontFixEnabled) {
      // When disabled, restore original fonts and add serif enforcement
      restoreOriginalFonts();
      addSerifEnforcement();
      return;
    }
    
    // Apply font fix with comprehensive targeting
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
  
  // Add serif enforcement when extension is disabled
  function addSerifEnforcement() {
    const style = document.createElement('style');
    style.id = 'claude-serif-restore';
    style.textContent = `
      /* Restore serif fonts when disabled */
      .prose, .prose *,
      .font-serif, .font-claude-response,
      [class*="prose"], [class*="font-serif"], [class*="claude-response"],
      .conversation-turn, .message-content, .markdown-content,
      div[data-testid*="conversation"], div[data-testid*="message"],
      p, h1, h2, h3, h4, h5, h6, li, blockquote, span, div {
        font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif !important;
      }
      
      /* Override CSS variables back to serif */
      :root {
        --font-claude-response: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Apply styles directly to existing elements for immediate effect
  function applyToExistingElements() {
    const fontFamily = fontFixEnabled 
      ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
      : 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
      
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
          if (fontFixEnabled) {
            // Store original style before changing
            if (!originalStyles.has(el)) {
              originalStyles.set(el, el.style.fontFamily || '');
            }
            el.style.setProperty('font-family', fontFamily, 'important');
          } else {
            // Restore original style or set to serif
            const original = originalStyles.get(el);
            if (original !== undefined) {
              if (original) {
                el.style.fontFamily = original;
              } else {
                el.style.setProperty('font-family', fontFamily, 'important');
              }
            }
          }
        });
      } catch (e) {
        // Ignore invalid selectors
      }
    });
  }
  
  // Restore original font styles when disabled
  function restoreOriginalFonts() {
    // Remove serif enforcement style if it exists
    const serifStyle = document.getElementById('claude-serif-restore');
    if (serifStyle) serifStyle.remove();
    
    // Restore all stored original styles
    originalStyles.forEach((originalFont, element) => {
      if (element && element.parentNode) {
        if (originalFont) {
          element.style.fontFamily = originalFont;
        } else {
          element.style.removeProperty('font-family');
        }
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