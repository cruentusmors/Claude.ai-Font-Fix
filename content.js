// Advanced content script with performance optimization and smart targeting

(function() {
  'use strict';
  
  let fontFixEnabled = true;
  let originalStyles = new Map(); // Store original font styles
  let advancedSettings = null; // Store advanced settings from options page
  
  // Performance optimization variables
  let rafId = null;
  let pendingUpdates = new Set();
  let processedElements = new WeakSet();
  let elementCache = new Map();
  let performanceMetrics = {
    elementsProcessed: 0,
    lastUpdateTime: 0,
    averageUpdateTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  };
  
  // Intersection Observer for visible elements only
  let visibilityObserver = null;
  let enhancedMutationObserver = null;
  
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

  // Performance-optimized element checking
  function shouldUpdateElement(element) {
    // Skip if already processed recently
    if (processedElements.has(element)) {
      performanceMetrics.cacheHits++;
      return false;
    }
    
    // Skip non-text elements
    if (!element.textContent?.trim()) return false;
    
    // Skip hidden elements
    if (element.offsetParent === null) return false;
    
    // Skip script, style, and other non-content elements
    const tagName = element.tagName?.toLowerCase();
    if (['script', 'style', 'meta', 'link', 'noscript', 'template'].includes(tagName)) {
      return false;
    }
    
    // Skip if element is too small (likely decorative)
    const rect = element.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return false;
    
    performanceMetrics.cacheMisses++;
    return true;
  }

  // Optimized font application using RAF
  function optimizedApplyToElements() {
    if (rafId) return; // Already scheduled
    
    const startTime = performance.now();
    
    rafId = requestAnimationFrame(() => {
      const fontFamily = fontFixEnabled 
        ? getCurrentFontFamily()
        : getSerifFontFamily();
      
      const settings = advancedSettings || defaultAdvancedSettings;
      
      // Smart selector targeting with exclusions
      const excludeSelectors = [];
      if (!settings.targetMath) {
        excludeSelectors.push('.katex', '.katex *', '[class*="math"]', '[class*="latex"]', 'mjx-container', 'mjx-container *');
      }
      if (!settings.targetCode) {
        excludeSelectors.push('pre', 'pre *', 'code', 'code *', '[class*="code"]', '[class*="monospace"]', '.hljs', '.hljs *', 'tt', 'tt *');
      }
      
      // Use more efficient selector strategy
      const baseSelectors = [
        '.prose', '.prose *',
        '.font-serif', '.font-claude-response',
        '[class*="prose"]', '[class*="font-serif"]', '[class*="claude-response"]',
        'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'span', 'div'
      ];
      
      // Batch DOM queries and updates
      let elementsProcessed = 0;
      baseSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (shouldUpdateElement(el)) {
              updateElementFont(el, fontFamily, settings);
              processedElements.add(el);
              elementsProcessed++;
              
              // Add to visibility observer if not already observed
              if (visibilityObserver && !el.hasAttribute('data-observed')) {
                visibilityObserver.observe(el);
                el.setAttribute('data-observed', 'true');
              }
            }
          });
        } catch (e) {
          // Ignore invalid selectors
        }
      });
      
      // Update performance metrics
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      performanceMetrics.elementsProcessed += elementsProcessed;
      performanceMetrics.lastUpdateTime = updateTime;
      performanceMetrics.averageUpdateTime = 
        (performanceMetrics.averageUpdateTime + updateTime) / 2;
      
      console.log(`Claude Font Fix: Processed ${elementsProcessed} elements in ${updateTime.toFixed(2)}ms`);
      
      rafId = null;
    });
  }

  // Optimized individual element font update
  function updateElementFont(element, fontFamily, settings) {
    // Check cache first
    const cacheKey = `${element.tagName}-${element.className}-${fontFamily}`;
    if (elementCache.has(cacheKey)) {
      const cachedStyles = elementCache.get(cacheKey);
      applyStylesToElement(element, cachedStyles);
      performanceMetrics.cacheHits++;
      return;
    }
    
    // Skip excluded elements
    const excludeSelectors = [];
    if (!settings.targetMath) {
      excludeSelectors.push('.katex', '[class*="math"]', '[class*="latex"]', 'mjx-container');
    }
    if (!settings.targetCode) {
      excludeSelectors.push('pre', 'code', '[class*="code"]', '[class*="monospace"]', '.hljs', 'tt');
    }
    
    const isExcluded = excludeSelectors.some(exclusion => {
      try {
        return element.matches(exclusion) || element.closest(exclusion);
      } catch (e) {
        return false;
      }
    });
    
    if (isExcluded) return;
    
    // Calculate styles to apply
    const stylesToApply = {
      fontFamily: fontFamily
    };
    
    if (settings.fontSize !== 1.0) {
      stylesToApply.fontSize = settings.fontSize + 'em';
    }
    if (settings.lineHeight !== 1.5) {
      stylesToApply.lineHeight = settings.lineHeight;
    }
    if (settings.letterSpacing !== 0) {
      stylesToApply.letterSpacing = settings.letterSpacing + 'px';
    }
    if (settings.enableTransitions) {
      stylesToApply.transition = 'font-family 0.3s ease, font-size 0.3s ease';
    }
    
    // Cache the styles
    elementCache.set(cacheKey, stylesToApply);
    performanceMetrics.cacheMisses++;
    
    // Apply styles
    applyStylesToElement(element, stylesToApply);
  }

  // Apply styles to element with original style preservation
  function applyStylesToElement(element, styles) {
    if (fontFixEnabled) {
      // Store original style before changing
      if (!originalStyles.has(element)) {
        const originalStyle = {
          fontFamily: element.style.fontFamily || '',
          fontSize: element.style.fontSize || '',
          lineHeight: element.style.lineHeight || '',
          letterSpacing: element.style.letterSpacing || ''
        };
        originalStyles.set(element, originalStyle);
      }
      
      // Apply new styles efficiently
      Object.entries(styles).forEach(([property, value]) => {
        element.style.setProperty(property.replace(/([A-Z])/g, '-$1').toLowerCase(), value, 'important');
      });
    }
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
    optimizedApplyToElements();
  }

  // Initialize Intersection Observer for visible elements
  function initializeIntersectionObserver() {
    if (visibilityObserver) {
      visibilityObserver.disconnect();
    }
    
    visibilityObserver = new IntersectionObserver((entries) => {
      const visibleElements = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => entry.target);
      
      if (visibleElements.length > 0) {
        requestAnimationFrame(() => {
          const fontFamily = fontFixEnabled ? getCurrentFontFamily() : getSerifFontFamily();
          const settings = advancedSettings || defaultAdvancedSettings;
          
          visibleElements.forEach(element => {
            if (shouldUpdateElement(element)) {
              updateElementFont(element, fontFamily, settings);
              processedElements.add(element);
            }
          });
        });
      }
    }, { 
      threshold: 0.1,
      rootMargin: '50px' // Start processing elements 50px before they become visible
    });
  }

  // Enhanced MutationObserver with better filtering
  function initializeEnhancedMutationObserver() {
    if (enhancedMutationObserver) {
      enhancedMutationObserver.disconnect();
    }
    
    enhancedMutationObserver = new MutationObserver((mutations) => {
      let hasRelevantChanges = false;
      const newElements = new Set();
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node contains text content
              if (node.textContent?.trim() && 
                  !node.matches('script, style, noscript, template')) {
                
                hasRelevantChanges = true;
                newElements.add(node);
                
                // Also check child elements
                const textElements = node.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, li');
                textElements.forEach(el => {
                  if (el.textContent?.trim()) {
                    newElements.add(el);
                  }
                });
              }
            }
          });
        } else if (mutation.type === 'characterData') {
          // Text content changed
          const element = mutation.target.parentElement;
          if (element && element.textContent?.trim()) {
            hasRelevantChanges = true;
            newElements.add(element);
          }
        }
      });
      
      if (hasRelevantChanges && newElements.size > 0) {
        // Debounce with smart delay based on number of changes
        const delay = Math.min(200 + (newElements.size * 10), 500);
        
        clearTimeout(window.fontFixTimeout);
        window.fontFixTimeout = setTimeout(() => {
          // Add new elements to intersection observer
          newElements.forEach(element => {
            if (visibilityObserver && !element.hasAttribute('data-observed')) {
              visibilityObserver.observe(element);
              element.setAttribute('data-observed', 'true');
            }
          });
          
          // Process immediately visible elements
          optimizedApplyToElements();
        }, delay);
      }
    });
    
    // Start observing with optimized configuration
    if (document.body) {
      enhancedMutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
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
  
  // Apply styles directly to existing elements for immediate effect (legacy function - now optimized)
  function applyToExistingElements() {
    // Use the new optimized function
    optimizedApplyToElements();
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
      
      // Clear caches when settings change
      clearPerformanceCaches();
      optimizedApplyToElements();
      
      sendResponse({success: true});
    } else if (request.type === 'GET_PERFORMANCE_METRICS') {
      sendResponse({
        metrics: performanceMetrics,
        cacheSize: elementCache.size,
        processedElementsCount: processedElements.size || 0
      });
    }
  });

  // Performance monitoring and cleanup functions
  function clearPerformanceCaches() {
    elementCache.clear();
    processedElements = new WeakSet();
    performanceMetrics.cacheHits = 0;
    performanceMetrics.cacheMisses = 0;
    console.log('Claude Font Fix: Performance caches cleared');
  }

  // Periodic cleanup to prevent memory leaks
  function performPeriodicCleanup() {
    // Clear processed elements that are no longer in the DOM
    const elementsToRemove = new Set();
    originalStyles.forEach((style, element) => {
      if (!document.contains(element)) {
        elementsToRemove.add(element);
      }
    });
    
    elementsToRemove.forEach(element => {
      originalStyles.delete(element);
    });
    
    // Limit cache size
    if (elementCache.size > 1000) {
      const entries = Array.from(elementCache.entries());
      const toKeep = entries.slice(-500); // Keep most recent 500 entries
      elementCache.clear();
      toKeep.forEach(([key, value]) => elementCache.set(key, value));
    }
    
    console.log(`Claude Font Fix: Cleanup completed. Cache size: ${elementCache.size}, Original styles: ${originalStyles.size}`);
  }

  // Performance monitoring
  function logPerformanceMetrics() {
    console.log('Claude Font Fix Performance Metrics:', {
      elementsProcessed: performanceMetrics.elementsProcessed,
      lastUpdateTime: performanceMetrics.lastUpdateTime.toFixed(2) + 'ms',
      averageUpdateTime: performanceMetrics.averageUpdateTime.toFixed(2) + 'ms',
      cacheHitRate: performanceMetrics.cacheHits > 0 ? 
        ((performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses)) * 100).toFixed(1) + '%' : '0%',
      cacheSize: elementCache.size,
      originalStylesTracked: originalStyles.size
    });
  }
  
  // Initialize when DOM is ready
  function init() {
    console.log('Claude Font Fix: Initializing with performance optimizations...');
    
    // Load settings and apply fonts
    checkEnabled();
    
    // Initialize performance observers
    initializeIntersectionObserver();
    initializeEnhancedMutationObserver();
    
    // Set up periodic cleanup (every 2 minutes)
    setInterval(performPeriodicCleanup, 120000);
    
    // Log performance metrics every 30 seconds in debug mode
    if (console.log) {
      setInterval(logPerformanceMetrics, 30000);
    }
    
    console.log('Claude Font Fix: Initialization complete with enhanced performance monitoring');
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', function() {
    if (visibilityObserver) {
      visibilityObserver.disconnect();
    }
    if (enhancedMutationObserver) {
      enhancedMutationObserver.disconnect();
    }
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    console.log('Claude Font Fix: Cleanup completed on page unload');
  });

  // Expose performance metrics for debugging (only in development)
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    window.claudeFontFixDebug = {
      getMetrics: () => performanceMetrics,
      getCacheSize: () => elementCache.size,
      clearCaches: clearPerformanceCaches,
      logMetrics: logPerformanceMetrics
    };
  }
})();