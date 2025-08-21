document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const fontFamilySelect = document.getElementById('fontFamily');
  const customFontStack = document.getElementById('customFontStack');
  const fontPreview = document.getElementById('fontPreview');
  const fontSizeSlider = document.getElementById('fontSize');
  const fontSizeValue = document.getElementById('fontSizeValue');
  const lineHeightSlider = document.getElementById('lineHeight');
  const lineHeightValue = document.getElementById('lineHeightValue');
  const letterSpacingSlider = document.getElementById('letterSpacing');
  const letterSpacingValue = document.getElementById('letterSpacingValue');
  const targetMathCheckbox = document.getElementById('targetMath');
  const targetCodeCheckbox = document.getElementById('targetCode');
  const enableTransitionsCheckbox = document.getElementById('enableTransitions');
  const preserveEmphasisCheckbox = document.getElementById('preserveEmphasis');
  const saveButton = document.getElementById('saveSettings');
  const resetButton = document.getElementById('resetSettings');
  const exportButton = document.getElementById('exportSettings');
  const importButton = document.getElementById('importSettings');
  const fileInput = document.getElementById('fileInput');
  const saveIndicator = document.getElementById('saveIndicator');

  // Default settings
  const defaultSettings = {
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

  // Font family configurations with improved Lexend handling
  const fontConfigs = {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    inter: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    roboto: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    segoe: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    sf: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
    opendyslexic: '"OpenDyslexic", "Comic Sans MS", "Comic Neue", Verdana, Arial, sans-serif',
    atkinson: '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    lexend: '"Lexend", "Lexend Deca", sans-serif',
    sylexiad: '"Sylexiad Sans", "OpenDyslexic", "Comic Sans MS", Verdana, Arial, sans-serif',
    comic: '"Comic Sans MS", "Comic Neue", cursive, sans-serif',
    custom: ''
  };

  // Initialize the options page
  function init() {
    loadSettings();
    setupEventListeners();
    updatePreview();
  }

  // Load settings from Chrome storage
  function loadSettings() {
    chrome.storage.sync.get(['advancedSettings'], function(result) {
      const settings = { ...defaultSettings, ...(result.advancedSettings || {}) };
      applySettingsToUI(settings);
    });
  }

  // Apply settings to UI elements
  function applySettingsToUI(settings) {
    fontFamilySelect.value = settings.fontFamily;
    customFontStack.value = settings.customFontStack;
    fontSizeSlider.value = settings.fontSize;
    lineHeightSlider.value = settings.lineHeight;
    letterSpacingSlider.value = settings.letterSpacing;
    targetMathCheckbox.checked = settings.targetMath;
    targetCodeCheckbox.checked = settings.targetCode;
    enableTransitionsCheckbox.checked = settings.enableTransitions;
    preserveEmphasisCheckbox.checked = settings.preserveEmphasis;

    // Update value displays
    updateSliderValues();
    
    // Show/hide custom font stack input
    toggleCustomFontInput();
    
    // Update preview
    updatePreview();
  }

  // Setup event listeners
  function setupEventListeners() {
    // Font family selection
    fontFamilySelect.addEventListener('change', function() {
      toggleCustomFontInput();
      updatePreview();
    });

    // Custom font stack
    customFontStack.addEventListener('input', updatePreview);

    // Typography sliders
    fontSizeSlider.addEventListener('input', function() {
      updateSliderValues();
      updatePreview();
    });

    lineHeightSlider.addEventListener('input', function() {
      updateSliderValues();
      updatePreview();
    });

    letterSpacingSlider.addEventListener('input', function() {
      updateSliderValues();
      updatePreview();
    });

    // Checkboxes
    [targetMathCheckbox, targetCodeCheckbox, enableTransitionsCheckbox, preserveEmphasisCheckbox]
      .forEach(checkbox => {
        checkbox.addEventListener('change', updatePreview);
      });

    // Buttons
    saveButton.addEventListener('click', saveSettings);
    resetButton.addEventListener('click', resetSettings);
    exportButton.addEventListener('click', exportSettings);
    importButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', importSettings);

    // Auto-save on change (debounced)
    let autoSaveTimeout;
    document.addEventListener('input', function(e) {
      if (e.target.matches('input, select, textarea')) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(saveSettings, 1000);
      }
    });
  }

  // Toggle custom font input visibility
  function toggleCustomFontInput() {
    if (fontFamilySelect.value === 'custom') {
      customFontStack.classList.remove('hidden');
      customFontStack.focus();
    } else {
      customFontStack.classList.add('hidden');
    }
  }

  // Update slider value displays
  function updateSliderValues() {
    fontSizeValue.textContent = Math.round(fontSizeSlider.value * 100) + '%';
    lineHeightValue.textContent = lineHeightSlider.value;
    letterSpacingValue.textContent = letterSpacingSlider.value + 'px';
  }

  // Get current font family based on selection
  function getCurrentFontFamily() {
    const selectedFont = fontFamilySelect.value;
    if (selectedFont === 'custom') {
      return customFontStack.value.trim() || fontConfigs.system;
    }
    return fontConfigs[selectedFont] || fontConfigs.system;
  }

  // Update font preview with font loading detection
  function updatePreview() {
    const fontFamily = getCurrentFontFamily();
    const fontSize = fontSizeSlider.value;
    const lineHeight = lineHeightSlider.value;
    const letterSpacing = letterSpacingSlider.value;
    const enableTransitions = enableTransitionsCheckbox.checked;

    // Apply styles to preview
    const previewStyles = {
      fontFamily: fontFamily,
      fontSize: fontSize + 'em',
      lineHeight: lineHeight,
      letterSpacing: letterSpacing + 'px',
      transition: enableTransitions ? 'all 0.3s ease' : 'none',
      fontFeatureSettings: 'normal',
      fontVariantLigatures: 'normal'
    };

    Object.assign(fontPreview.style, previewStyles);

    // Update preview text to show current settings and font detection
    const previewText = fontPreview.querySelector('p:first-of-type');
    if (previewText) {
      const fontDisplayName = getFontDisplayName();
      const detectionResult = detectActualFont(fontPreview);
      
      let fontInfo = `<strong>Font:</strong> ${fontDisplayName} | <strong>Size:</strong> ${Math.round(fontSize * 100)}% | <strong>Line Height:</strong> ${lineHeight}`;
      
      // Add font detection info for debugging
      if (detectionResult && detectionResult.font) {
        if (detectionResult.loaded && detectionResult.font !== 'Fallback font') {
          fontInfo += `<br><small style="color: #28a745;">✓ ${detectionResult.font} loaded successfully (${detectionResult.method})</small>`;
        } else if (!detectionResult.loaded) {
          fontInfo += `<br><small style="color: #dc3545;">⚠ Web font may not be loaded - using fallback (${detectionResult.method})</small>`;
        }
        
        // Add debug info if available
        if (detectionResult.debug && CONFIG && CONFIG.DEBUG) {
          fontInfo += `<br><small style="color: #6c757d;">Debug: ${JSON.stringify(detectionResult.debug)}</small>`;
        }
      }
      
      previewText.innerHTML = fontInfo;
    }
  }

  // Enhanced font detection with Font Loading API and improved canvas fallback
  function detectActualFont(element) {
    try {
      const computedStyle = window.getComputedStyle(element);
      const fontFamily = computedStyle.fontFamily;
      const fontSize = computedStyle.fontSize || "16px";
      const primaryFont = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
      
      // Use Font Loading API if available (preferred method)
      if (document.fonts && document.fonts.check) {
        try {
          if (document.fonts.check(`${fontSize} "${primaryFont}"`)) {
            return {
              font: primaryFont,
              loaded: true,
              method: 'Font Loading API'
            };
          } else {
            return {
              font: 'Fallback font',
              loaded: false,
              method: 'Font Loading API'
            };
          }
        } catch (error) {
          debugLog('Font Loading API failed:', error);
        }
      }
      
      // Fallback to canvas detection (less reliable but widely supported)
      return canvasBasedDetection(element, fontFamily, fontSize, primaryFont);
    } catch (e) {
      return {
        font: 'Detection failed',
        loaded: false,
        method: 'Error',
        error: e.message
      };
    }
  }

  // Canvas-based font detection with improved reliability
  function canvasBasedDetection(element, fontFamily, fontSize, primaryFont) {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const testText = 'The quick brown fox jumps over the lazy dog 1234567890';
      const fallbackFont = 'monospace';
      
      // Test with specified font
      context.font = `${fontSize} ${fontFamily}`;
      const testWidth = context.measureText(testText).width;
      
      // Test with fallback
      context.font = `${fontSize} ${fallbackFont}`;
      const fallbackWidth = context.measureText(testText).width;
      
      // Use configurable relative threshold based on font characteristics
      const detectionThreshold = getDetectionThreshold(fontFamily);
      const threshold = Math.max(1, Math.abs(fallbackWidth * detectionThreshold));
      const isLoaded = Math.abs(testWidth - fallbackWidth) > threshold;
      
      return {
        font: isLoaded ? primaryFont : 'Fallback font',
        loaded: isLoaded,
        method: 'Canvas detection',
        debug: {
          testWidth,
          fallbackWidth,
          difference: Math.abs(testWidth - fallbackWidth),
          threshold,
          detectionThreshold: detectionThreshold,
          fontFamily: fontFamily
        }
      };
    } catch (error) {
      return {
        font: 'Canvas detection failed',
        loaded: false,
        method: 'Canvas Error',
        error: error.message
      };
    }
  }

  // Get display name for current font
  function getFontDisplayName() {
    const selectedFont = fontFamilySelect.value;
    if (selectedFont === 'custom') {
      const customFont = customFontStack.value.trim();
      if (customFont) {
        const firstFont = customFont.split(',')[0].replace(/['"]/g, '').trim();
        return firstFont;
      }
      return 'Custom (empty)';
    }
    const option = fontFamilySelect.querySelector(`option[value="${selectedFont}"]`);
    return option ? option.textContent.split('(')[0].trim() : 'Unknown';
  }

  // Get current settings from UI
  function getCurrentSettings() {
    return {
      fontFamily: fontFamilySelect.value,
      customFontStack: customFontStack.value.trim(),
      fontSize: parseFloat(fontSizeSlider.value),
      lineHeight: parseFloat(lineHeightSlider.value),
      letterSpacing: parseFloat(letterSpacingSlider.value),
      targetMath: targetMathCheckbox.checked,
      targetCode: targetCodeCheckbox.checked,
      enableTransitions: enableTransitionsCheckbox.checked,
      preserveEmphasis: preserveEmphasisCheckbox.checked
    };
  }

  // Save settings to Chrome storage
  function saveSettings() {
    const settings = getCurrentSettings();
    
    chrome.storage.sync.set({ 
      advancedSettings: settings 
    }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving settings:', chrome.runtime.lastError);
        showNotification('❌ Error saving settings', 'error');
      } else {
        debugLog('Advanced settings saved:', settings);
        showNotification('✅ Settings saved!', 'success');
        
        // Notify content script of changes
        chrome.tabs.query({ url: "https://claude.ai/*" }, function(tabs) {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              type: 'SETTINGS_UPDATED',
              settings: settings
            }).catch((error) => {
              // Ignore errors for tabs that don't have the content script
              debugLog('Claude Font Fix: Could not send message to tab', tab.id, error);
            });
          });
        });
      }
    });
  }

  // Reset settings to defaults
  function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      applySettingsToUI(defaultSettings);
      saveSettings();
      showNotification('🔄 Settings reset to defaults', 'info');
    }
  }

  // Export settings to JSON file
  function exportSettings() {
    const settings = getCurrentSettings();
    const exportData = {
      claudeFontFixSettings: settings,
      version: '1.0',
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claude-font-fix-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('📤 Settings exported successfully', 'success');
  }

  // Import settings from JSON file
  function importSettings(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.claudeFontFixSettings) {
          const importedSettings = { ...defaultSettings, ...data.claudeFontFixSettings };
          applySettingsToUI(importedSettings);
          saveSettings();
          showNotification('📥 Settings imported successfully', 'success');
        } else {
          throw new Error('Invalid settings file format');
        }
      } catch (error) {
        console.error('Error importing settings:', error);
        showNotification('❌ Error importing settings: Invalid file format', 'error');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    fileInput.value = '';
  }

  // Show notification
  function showNotification(message, type = 'info') {
    saveIndicator.textContent = message;
    saveIndicator.className = `save-indicator show ${type}`;
    
    setTimeout(() => {
      saveIndicator.classList.remove('show');
    }, 3000);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveSettings();
    }
    
    // Ctrl/Cmd + R to reset
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      resetSettings();
    }
    
    // Ctrl/Cmd + E to export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      exportSettings();
    }
  });

  // Add tooltips for better UX
  function addTooltips() {
    const tooltips = {
      fontFamily: 'Choose your preferred font family for Claude.ai text',
      fontSize: 'Adjust text size for better readability',
      lineHeight: 'Control spacing between lines',
      letterSpacing: 'Fine-tune character spacing',
      targetMath: 'Apply font changes to mathematical expressions',
      targetCode: 'Apply font changes to code blocks (may affect readability)',
      enableTransitions: 'Smooth animations when fonts change',
      preserveEmphasis: 'Keep bold and italic styling'
    };

    Object.entries(tooltips).forEach(([id, tooltip]) => {
      const element = document.getElementById(id);
      if (element) {
        element.title = tooltip;
      }
    });
  }

  // Initialize everything
  init();
  addTooltips();

  // Add visual feedback for interactions
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function() {
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });

  debugLog('Claude Font Fix Options page loaded successfully');
});