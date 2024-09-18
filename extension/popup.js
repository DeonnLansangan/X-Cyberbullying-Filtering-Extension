document.addEventListener('DOMContentLoaded', function() {
  const toggleBlur = document.getElementById('toggleBlur');

  // Retrieve the current state from Chrome storage
  chrome.storage.sync.get('blurEnabled', function(data) {
      toggleBlur.checked = data.blurEnabled !== false; // Default to true if not set
  });

  // Listen for changes on the checkbox
  toggleBlur.addEventListener('change', function() {
      const blurEnabled = toggleBlur.checked;

      // Save the user's preference in Chrome storage
      chrome.storage.sync.set({ blurEnabled: blurEnabled });

      // Send a message to the content script to update the blurring state
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(
              tabs[0].id,
              { action: 'toggleBlur', blurEnabled: blurEnabled },
              function(response) {
                  // Handle any response if necessary
              }
          );
      });
  });
});
