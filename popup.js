document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggleBtn');
  const status = document.getElementById('status');
  const openOptionsBtn = document.getElementById('openOptions');
  const performanceInfo = document.getElementById('performanceInfo');
  const perfStats = document.getElementById('perfStats');
  
  // Analytics elements
  const usageStats = document.getElementById('usageStats');
  const pagesCount = document.getElementById('pagesCount');
  const elementsCount = document.getElementById('elementsCount');
  const daysActive = document.getElementById('daysActive');
  const cacheHitRate = document.getElementById('cacheHitRate');
  
  // Feedback elements
  const rateBtn = document.getElementById('rateBtn');
  const feedbackBtn = document.getElementById('feedbackBtn');
  const shareBtn = document.getElementById('shareBtn');
  const donateBtn = document.getElementById('donateBtn');
  
  // Load current state and analytics
  chrome.storage.sync.get(['fontFixEnabled'], function(result) {
    // Handle potential storage errors
    if (chrome.runtime.lastError) {
      console.log('Claude Font Fix: Storage access error, using defaults');
      updateUI(true); // Default to enabled
      return;
    }
    
    const isEnabled = result.fontFixEnabled !== false; // Default to true
    updateUI(isEnabled);
    loadAnalytics();
    loadPerformanceStats();
  });
  
  // Track popup open
  trackEvent('popup_opened');
  
  // Toggle button click handler
  toggleBtn.addEventListener('click', function() {
    chrome.storage.sync.get(['fontFixEnabled'], function(result) {
      if (chrome.runtime.lastError) {
        console.log('Claude Font Fix: Storage access error during toggle');
        return;
      }
      
      const currentState = result.fontFixEnabled !== false;
      const newState = !currentState;
      
      chrome.storage.sync.set({fontFixEnabled: newState}, function() {
        if (chrome.runtime.lastError) {
          console.log('Claude Font Fix: Storage write error');
          return;
        }
        
        updateUI(newState);
        trackEvent(newState ? 'extension_enabled' : 'extension_disabled');
      });
    });
  });
  
  // Options button click handler
  openOptionsBtn.addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
    trackEvent('options_opened');
  });

  // Feedback button handlers
  rateBtn.addEventListener('click', function() {
    chrome.tabs.create({
      url: 'https://chromewebstore.google.com/detail/claude-font-fix/[EXTENSION-ID-HERE]'
    });
    trackEvent('rate_clicked');
    updateFeedbackEngagement('rated');
  });

  feedbackBtn.addEventListener('click', function() {
    chrome.tabs.create({
      url: 'https://github.com/cruentusmors/Claude.ai-Font-Fix/issues/new?template=feedback.md'
    });
    trackEvent('feedback_clicked');
    updateFeedbackEngagement('feedback_sent');
  });

  shareBtn.addEventListener('click', function() {
    // Copy extension URL to clipboard
    const extensionUrl = 'https://chromewebstore.google.com/detail/claude-font-fix/[EXTENSION-ID-HERE]';
    navigator.clipboard.writeText(extensionUrl).then(() => {
      showNotification('Extension URL copied to clipboard!');
    });
    trackEvent('share_clicked');
    updateFeedbackEngagement('shared');
  });

  donateBtn.addEventListener('click', function() {
    chrome.tabs.create({
      url: 'https://buymeacoffee.com/cruentusmors'
    });
    trackEvent('donate_clicked');
    updateFeedbackEngagement('donated');
  });

  // Load performance statistics
  function loadPerformanceStats() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('claude.ai')) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'GET_PERFORMANCE_METRICS'}, function(response) {
          // Handle chrome.runtime.lastError to prevent unchecked runtime error
          if (chrome.runtime.lastError) {
            console.log('Claude Font Fix: Content script not available on this tab');
            return;
          }
          
          if (response && response.metrics) {
            displayPerformanceStats(response);
            performanceInfo.classList.remove('hidden');
            
            // Update cache hit rate in analytics
            const metrics = response.metrics;
            const hitRate = metrics.cacheHits > 0 ? 
              ((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(1) : '0';
            cacheHitRate.textContent = hitRate + '%';
          }
        });
      }
    });
  }

  // Load and display analytics
  function loadAnalytics() {
    chrome.storage.local.get(['usageAnalytics'], function(result) {
      const analytics = result.usageAnalytics || initializeAnalytics();
      displayAnalytics(analytics);
      
      // Update page count for current session
      updatePageCount();
    });
  }

  // Initialize analytics structure
  function initializeAnalytics() {
    const analytics = {
      firstInstall: Date.now(),
      lastUsed: Date.now(),
      pagesEnhanced: 0,
      elementsFixed: 0,
      totalSessions: 0,
      eventsTracked: {},
      feedbackEngagement: {
        rated: false,
        feedback_sent: false,
        shared: false,
        donated: false
      }
    };
    
    chrome.storage.local.set({usageAnalytics: analytics});
    return analytics;
  }

  // Display analytics in UI
  function displayAnalytics(analytics) {
    pagesCount.textContent = analytics.pagesEnhanced || 0;
    elementsCount.textContent = analytics.elementsFixed || 0;
    
    const daysActiveCount = Math.floor((Date.now() - analytics.firstInstall) / (1000 * 60 * 60 * 24));
    daysActive.textContent = Math.max(1, daysActiveCount);
    
    // Show/hide feedback section based on usage
    updateFeedbackVisibility(analytics);
  }

  // Update page count for current Claude.ai tab
  function updatePageCount() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('claude.ai')) {
        chrome.storage.local.get(['usageAnalytics'], function(result) {
          const analytics = result.usageAnalytics || initializeAnalytics();
          analytics.pagesEnhanced = (analytics.pagesEnhanced || 0) + 1;
          analytics.lastUsed = Date.now();
          
          chrome.storage.local.set({usageAnalytics: analytics});
          pagesCount.textContent = analytics.pagesEnhanced;
        });
      }
    });
  }

  // Track user events
  function trackEvent(eventName, data = {}) {
    chrome.storage.local.get(['usageAnalytics'], function(result) {
      const analytics = result.usageAnalytics || initializeAnalytics();
      
      if (!analytics.eventsTracked) {
        analytics.eventsTracked = {};
      }
      
      if (!analytics.eventsTracked[eventName]) {
        analytics.eventsTracked[eventName] = 0;
      }
      
      analytics.eventsTracked[eventName]++;
      analytics.lastUsed = Date.now();
      
      chrome.storage.local.set({usageAnalytics: analytics});
      
      console.log(`Claude Font Fix: Event tracked - ${eventName}`, data);
    });
  }

  // Update feedback engagement
  function updateFeedbackEngagement(action) {
    chrome.storage.local.get(['usageAnalytics'], function(result) {
      const analytics = result.usageAnalytics || initializeAnalytics();
      
      if (!analytics.feedbackEngagement) {
        analytics.feedbackEngagement = {};
      }
      
      analytics.feedbackEngagement[action] = true;
      analytics.feedbackEngagement.lastAction = Date.now();
      
      chrome.storage.local.set({usageAnalytics: analytics});
      
      // Update UI to reflect engagement
      updateFeedbackVisibility(analytics);
    });
  }

  // Update feedback section visibility based on usage patterns
  function updateFeedbackVisibility(analytics) {
    const feedbackSection = document.querySelector('.feedback-section');
    const pagesUsed = analytics.pagesEnhanced || 0;
    const daysUsed = Math.floor((Date.now() - analytics.firstInstall) / (1000 * 60 * 60 * 24));
    
    // Show feedback after 5 pages or 3 days of usage
    if (pagesUsed >= 5 || daysUsed >= 3) {
      feedbackSection.style.display = 'block';
      
      // Update button states based on previous engagement
      if (analytics.feedbackEngagement) {
        if (analytics.feedbackEngagement.rated) {
          rateBtn.innerHTML = '✅ Rated - Thank you!';
          rateBtn.disabled = true;
          rateBtn.style.opacity = '0.7';
        }
        if (analytics.feedbackEngagement.donated) {
          donateBtn.innerHTML = '❤️ Thank you!';
          donateBtn.disabled = true;
          donateBtn.style.opacity = '0.7';
        }
      }
    } else {
      feedbackSection.style.display = 'none';
    }
  }

  // Show notification
  function showNotification(message) {
    // Create and show a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #28a745;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Display performance statistics
  function displayPerformanceStats(data) {
    const metrics = data.metrics;
    const cacheHitRate = metrics.cacheHits > 0 ? 
      ((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(1) : '0';
    
    perfStats.innerHTML = `
      Elements: ${metrics.elementsProcessed} | 
      Cache: ${cacheHitRate}% | 
      Last: ${metrics.lastUpdateTime.toFixed(1)}ms
    `;
  }
  
  function updateUI(isEnabled) {
    if (isEnabled) {
      status.innerHTML = '✅ Sans-serif fonts active';
      status.style.background = '#e8f5e8';
      status.style.borderColor = '#4caf50';
      status.style.color = '#2e7d32';
      toggleBtn.textContent = 'Disable Extension';
      toggleBtn.classList.remove('disabled');
    } else {
      status.innerHTML = '❌ Extension disabled';
      status.style.background = '#ffebee';
      status.style.borderColor = '#f44336';
      status.style.color = '#c62828';
      toggleBtn.textContent = 'Enable Extension';
      toggleBtn.classList.add('disabled');
    }
  }
});