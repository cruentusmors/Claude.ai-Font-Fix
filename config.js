// Configuration file for extension
const CONFIG = {
  EXTENSION_ID: null, // Will be set when published to Chrome Web Store
  GITHUB_REPO: 'https://github.com/cruentusmors/Claude.ai-Font-Fix',
  DONATE_URL: 'https://buymeacoffee.com/cruentusmors',
  DEBUG: false // Set to false for production builds
};

// Helper function for debug logging
function debugLog(message, ...args) {
  if (CONFIG.DEBUG) {
    console.log(message, ...args);
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}