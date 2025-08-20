// Advanced content script with options page integration

(function() {
  'use strict';
  
  let fontFixEnabled = true;
  let originalStyles = new Map(); // Store original font styles
  let advancedSettings = null; // Store advanced settings from options page
  
  // Default advanced settings
  const defaultAdvancedSettings = {
    fontFamily: 'system',
    customFontStack: '',
    fontSize: 1.0,
    lineHeight: 1.5,
    letterSpacing: 0,
    targetMath: true,
    targetCode: false,
    enableTransitions: false,
    preserveEmphasis: true
  };

  // Font family configurations
  const fontConfigs = {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    inter: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    roboto: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    segoe: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    sf: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
    custom: ''
  };

  // Get current font family based on advanced settings
  function getCurrentFontFamily() {
    if (!advancedSettings) return fontConfigs.system;
    
    const selectedFont = advancedSettings.fontFamily;
    if (selectedFont === 'custom' && advancedSettings.customFontStack) {
      return advancedSettings.customFontStack;
    }
    return fontConfigs[selectedFont] || fontConfigs.system;
  }

  // Get serif font family for disabled state
  function getSerifFontFamily() {
    return 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
  }
  
  // Apply or remove font fix based on enabled state with advanced settings
  function applyFontFix() {
    // Remove existing styles if present
    const existing = document.getElementById('claude-font-fix');
    const serifExisting = document.getElementById('claude-serif-restore');
    if (existing) existing.remove();
    if (serifExisting) serifExisting.remove();
    
    if (!fontFixEnabled) {
      // When disabled, restore original fonts and add serif enforcement
      restoreOriginalFonts();
      addSerifEnforcement();
      return;
    }
    
    // Get current settings
    const fontFamily = getCurrentFontFamily();
    const settings = advancedSettings || defaultAdvancedSettings;
    
    // Build CSS with advanced settings
    const style = document.createElement('style');
    style.id = 'claude-font-fix';
    
    let cssRules = `
      /* Override Claude's CSS variables */
      :root {
        --font-claude-response: ${fontFamily} !important;
      }
      
      /* Base font targeting */
      .prose, .prose *,
      .font-serif, .font-claude-response,
      [class*="prose"], [class*="font-serif"], [class*="claude-response"],
      .conversation-turn, .message-content, .markdown-content,
      div[data-testid*="conversation"], div[data-testid*="message"],
      p, h1, h2, h3, h4, h5, h6, li, blockquote, span, div {
        font-family: ${fontFamily} !important;`;
    
    // Add typography settings if not default
    if (settings.fontSize !== 1.0) {
      cssRules += `\n        font-size: ${settings.fontSize}em !important;`;
    }
    if (settings.lineHeight !== 1.5) {
      cssRules += `\n        line-height: ${settings.lineHeight} !important;`;
    }
    if (settings.letterSpacing !== 0) {
      cssRules += `\n        letter-spacing: ${settings.letterSpacing}px !important;`;
    }
    if (settings.enableTransitions) {
      cssRules += `\n        transition: font-family 0.3s ease, font-size 0.3s ease !important;`;
    }
    
    cssRules += `\n      }`;
    
    // Extra specificity for stubborn elements
    cssRules += `\n      
      /* High specificity targeting */
      body * {
        font-family: ${fontFamily} !important;
      }`;
    
    // Conditional targeting based on settings
    if (!settings.targetMath) {
      cssRules += `\n      
      /* Exclude mathematical content */
      .katex, .katex *, 
      [class*="math"], [class*="latex"],
      mjx-container, mjx-container * {
        font-family: initial !important;
      }`;
    }
    
    if (!settings.targetCode) {
      cssRules += `\n      
      /* Exclude code content */
      pre, pre *, code, code *,
      [class*="code"], [class*="monospace"],
      .hljs, .hljs *,
      tt, tt * {
        font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, Consolas, 'Courier New', monospace !important;
      }`;
    }
    
    if (settings.preserveEmphasis) {
      cssRules += `\n      
      /* Preserve text emphasis */
      strong, b {
        font-weight: bold !important;
      }
      em, i {
        font-style: italic !important;
      }`;
    }
    
    style.textContent = cssRules;
    document.head.appendChild(style);
    
    // Also apply to any existing elements immediately
    applyToExistingElements();
  }
  
  // Add serif enforcement when extension is disabled
  function addSerifEnforcement() {
    const style = document.createElement('style');
    style.id = 'claude-serif-restore';
    const serifFont = getSerifFontFamily();
    
    style.textContent = `
      /* Restore serif fonts when disabled */
      .prose, .prose *,
      .font-serif, .font-claude-response,
      [class*="prose"], [class*="font-serif"], [class*="claude-response"],
      .conversation-turn, .message-content, .markdown-content,
      div[data-testid*="conversation"], div[data-testid*="message"],
      p, h1, h2, h3, h4, h5, h6, li, blockquote, span, div {
        font-family: ${serifFont} !important;
      }
      
      /* Override CSS variables back to serif */
      :root {
        --font-claude-response: ${serifFont} !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Apply styles directly to existing elements for immediate effect
  function applyToExistingElements() {
    const fontFamily = fontFixEnabled 
      ? getCurrentFontFamily()
      : getSerifFontFamily();
    
    const settings = advancedSettings || defaultAdvancedSettings;
      
    const selectors = [
      '.prose', '.prose *',
      '.font-serif', '.font-claude-response',
      '[class*="prose"]', '[class*="font-serif"]', '[class*="claude-response"]',
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'span', 'div'
    ];
    
    // Add exclusions based on settings
    let exclusionSelectors = [];
    if (!settings.targetMath) {
      exclusionSelectors.push('.katex', '.katex *', '[class*="math"]', '[class*="latex"]', 'mjx-container', 'mjx-container *');
    }
    if (!settings.targetCode) {
      exclusionSelectors.push('pre', 'pre *', 'code', 'code *', '[class*="code"]', '[class*="monospace"]', '.hljs', '.hljs *', 'tt', 'tt *');
    }
    
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          // Skip excluded elements
          if (exclusionSelectors.length > 0) {
            const isExcluded = exclusionSelectors.some(exclusion => {
              try {
                return el.matches(exclusion) || el.closest(exclusion.replace(' *', ''));
              } catch (e) {
                return false;
              }
            });
            if (isExcluded) return;
          }
          
          if (fontFixEnabled) {
            // Store original style before changing
            if (!originalStyles.has(el)) {
              const originalStyle = {
                fontFamily: el.style.fontFamily || '',
                fontSize: el.style.fontSize || '',
                lineHeight: el.style.lineHeight || '',
                letterSpacing: el.style.letterSpacing || ''
              };
              originalStyles.set(el, originalStyle);
            }
            
            // Apply new styles
            el.style.setProperty('font-family', fontFamily, 'important');
            
            if (settings.fontSize !== 1.0) {
              el.style.setProperty('font-size', settings.fontSize + 'em', 'important');
            }
            if (settings.lineHeight !== 1.5) {
              el.style.setProperty('line-height', settings.lineHeight, 'important');
            }
            if (settings.letterSpacing !== 0) {
              el.style.setProperty('letter-spacing', settings.letterSpacing + 'px', 'important');
            }
            if (settings.enableTransitions) {
              el.style.setProperty('transition', 'font-family 0.3s ease, font-size 0.3s ease', 'important');
            }
          } else {
            // Restore original styles
            const original = originalStyles.get(el);
            if (original !== undefined) {
              if (original.fontFamily) {
                el.style.fontFamily = original.fontFamily;
              } else {
                el.style.setProperty('font-family', fontFamily, 'important');
              }
              
              // Restore other properties
              if (original.fontSize) {
                el.style.fontSize = original.fontSize;
              } else {
                el.style.removeProperty('font-size');
              }
              if (original.lineHeight) {
                el.style.lineHeight = original.lineHeight;
              } else {
                el.style.removeProperty('line-height');
              }
              if (original.letterSpacing) {
                el.style.letterSpacing = original.letterSpacing;
              } else {
                el.style.removeProperty('letter-spacing');
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
    originalStyles.forEach((originalStyle, element) => {
      if (element && element.parentNode) {
        if (typeof originalStyle === 'object') {
          // New format with multiple properties
          if (originalStyle.fontFamily) {
            element.style.fontFamily = originalStyle.fontFamily;
          } else {
            element.style.removeProperty('font-family');
          }
          if (originalStyle.fontSize) {
            element.style.fontSize = originalStyle.fontSize;
          } else {
            element.style.removeProperty('font-size');
          }
          if (originalStyle.lineHeight) {
            element.style.lineHeight = originalStyle.lineHeight;
          } else {
            element.style.removeProperty('line-height');
          }
          if (originalStyle.letterSpacing) {
            element.style.letterSpacing = originalStyle.letterSpacing;
          } else {
            element.style.removeProperty('letter-spacing');
          }
        } else {
          // Backward compatibility for old format (string)
          if (originalStyle) {
            element.style.fontFamily = originalStyle;
          } else {
            element.style.removeProperty('font-family');
          }
        }
        element.style.removeProperty('transition');
      }
    });
  }
  
  // Check storage state and apply font fix accordingly
  function checkEnabled() {
    // Load both basic and advanced settings
    chrome.storage.sync.get(['fontFixEnabled', 'advancedSettings'], function(result) {
      fontFixEnabled = result.fontFixEnabled !== false; // Default to true
      advancedSettings = result.advancedSettings || defaultAdvancedSettings;
      
      console.log('Claude Font Fix: Extension enabled =', fontFixEnabled);
      console.log('Claude Font Fix: Advanced settings =', advancedSettings);
      applyFontFix();
    });
  }

  // Listen for storage changes (from popup or options page)
  chrome.storage.onChanged.addListener(function(changes) {
    let shouldUpdate = false;
    
    if (changes.fontFixEnabled) {
      fontFixEnabled = changes.fontFixEnabled.newValue !== false;
      console.log('Claude Font Fix: Extension toggled to', fontFixEnabled);
      shouldUpdate = true;
    }
    
    if (changes.advancedSettings) {
      advancedSettings = changes.advancedSettings.newValue || defaultAdvancedSettings;
      console.log('Claude Font Fix: Advanced settings updated', advancedSettings);
      shouldUpdate = true;
    }
    
    if (shouldUpdate) {
      applyFontFix();
    }
  });

  // Listen for messages from options page
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'SETTINGS_UPDATED') {
      advancedSettings = request.settings || defaultAdvancedSettings;
      console.log('Claude Font Fix: Settings updated via message', advancedSettings);
      applyFontFix();
      sendResponse({success: true});
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