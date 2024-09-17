chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchBatchPrediction') {
    fetch('https://group9thesis.com/predict_batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts: request.texts }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        sendResponse({ predictions: data.predictions });
      })
      .catch(error => {
        console.error('Error:', error);
        sendResponse({ predictions: [], error: error.message });
      });
    return true; // Keep the message channel open for sendResponse
  }
});
