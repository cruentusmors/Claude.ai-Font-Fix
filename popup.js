document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggleBtn');
  const status = document.getElementById('status');
  const openOptionsBtn = document.getElementById('openOptions');
  
  // Load current state
  chrome.storage.sync.get(['fontFixEnabled'], function(result) {
    const isEnabled = result.fontFixEnabled !== false; // Default to true
    updateUI(isEnabled);
  });
  
  // Toggle button click handler
  toggleBtn.addEventListener('click', function() {
    chrome.storage.sync.get(['fontFixEnabled'], function(result) {
      const currentState = result.fontFixEnabled !== false;
      const newState = !currentState;
      
      chrome.storage.sync.set({fontFixEnabled: newState}, function() {
        updateUI(newState);
        // Remove the page reload - content script will handle the change in real-time
      });
    });
  });
  
  // Options button click handler
  openOptionsBtn.addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
  
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