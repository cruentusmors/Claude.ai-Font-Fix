// Configuration file for extension
const CONFIG = {
  EXTENSION_ID: null, // Will be set when published to Chrome Web Store
  GITHUB_REPO: 'https://github.com/cruentusmors/Claude.ai-Font-Fix',
  DONATE_URL: 'https://buymeacoffee.com/cruentusmors',
  DEBUG: false, // Set to false for production builds
  
  // Font loading and detection settings
  FONT_TIMEOUT: 3000, // Base timeout for font loading (milliseconds)
  FONT_DETECTION_THRESHOLD: 0.05, // Default 5% threshold for canvas font detection
  
  // Font-specific detection thresholds for improved accuracy
  FONT_THRESHOLDS: {
    'OpenDyslexic': 0.08,           // Higher threshold for stylized fonts
    'Atkinson Hyperlegible': 0.06,  // Medium threshold for accessible fonts
    'Lexend': 0.04,                 // Lower threshold for similar fonts
    'Comic Sans MS': 0.07,          // Medium-high for distinctive fonts
    'system': 0.05                  // Default for system fonts
  }
};

// Helper function for debug logging
function debugLog(message, ...args) {
  if (CONFIG.DEBUG) {
    console.log(message, ...args);
  }
}

// Get adaptive detection threshold based on font family
function getDetectionThreshold(fontFamily) {
  if (!fontFamily) return CONFIG.FONT_DETECTION_THRESHOLD;
  
  // Identify font category (use existing function if available)
  let fontCategory = 'system';
  if (typeof identifyFontFamily === 'function') {
    fontCategory = identifyFontFamily(fontFamily);
  } else {
    // Fallback simple detection
    const lowerFont = fontFamily.toLowerCase();
    if (lowerFont.includes('opendyslexic')) fontCategory = 'OpenDyslexic';
    else if (lowerFont.includes('atkinson')) fontCategory = 'Atkinson Hyperlegible';
    else if (lowerFont.includes('lexend')) fontCategory = 'Lexend';
    else if (lowerFont.includes('comic')) fontCategory = 'Comic Sans MS';
  }
  
  return CONFIG.FONT_THRESHOLDS[fontCategory] || CONFIG.FONT_DETECTION_THRESHOLD;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}