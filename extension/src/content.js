// content.js

let blurEnabled = true;

// Define batching parameters
const MAX_BATCH_SIZE = 5;
const PROCESS_INTERVAL = 1000; // milliseconds
let tweetQueue = [];
let isProcessingQueue = false;

// Get the current state from Chrome storage
chrome.storage.sync.get('blurEnabled', function (data) {
  blurEnabled = data.blurEnabled !== false; // Default to true if not set
  if (blurEnabled) {
    processNewTweets();
  }
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'toggleBlur') {
    blurEnabled = request.blurEnabled;
    if (blurEnabled) {
      processNewTweets();
    } else {
      unblurAllTweets();
    }
  }
});

// Function to add tweets to the queue
function addTweetToQueue(tweet) {
  if (!tweet.dataset.processed) {
    tweet.dataset.processed = 'true';
    tweetQueue.push(tweet);
    if (!isProcessingQueue) {
      processTweetQueue();
    }
  }
}

// Function to process the tweet queue
function processTweetQueue() {
  isProcessingQueue = true;
  if (tweetQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }

  const batch = tweetQueue.splice(0, MAX_BATCH_SIZE);
  const texts = batch.map(tweet => tweet.innerText);

  chrome.runtime.sendMessage(
    { action: 'fetchBatchPrediction', texts: texts },
    response => {
      if (response && response.predictions && blurEnabled) {
        batch.forEach((tweet, index) => {
          if (response.predictions[index] === 1) {
            blurTweet(tweet);
          }
        });
      }
      // Process the next batch after a delay
      setTimeout(processTweetQueue, PROCESS_INTERVAL);
    }
  );
}

// Function to process new tweets
function processNewTweets() {
  // Select all tweet text elements
  const tweetTexts = document.querySelectorAll('article div[lang]');

  tweetTexts.forEach(tweet => {
    addTweetToQueue(tweet);
  });
}

// Function to blur a single tweet and add interactive warning
function blurTweet(tweet) {
  // Apply blur to the tweet
  tweet.style.filter = 'blur(5px)';
  tweet.style.position = 'relative';

  // Add a warning overlay if not already present
  if (!tweet.parentElement.querySelector('.cyberbullying-warning')) {
    const warning = document.createElement('div');
    warning.className = 'cyberbullying-warning';
    warning.innerHTML = 'Content is blurred due to potential cyberbullying warning. <span class="view-override">View anyway?</span>';

    tweet.parentElement.style.position = 'relative'; // Ensure parent is positioned
    tweet.parentElement.appendChild(warning);

    // Add event listener to the "View anyway?" span
    const viewAnyway = warning.querySelector('.view-override');

    viewAnyway.addEventListener('click', function (event) {
      event.stopPropagation(); // Prevent event bubbling
      // Unblur the tweet
      tweet.style.filter = '';
      // Remove the warning overlay
      warning.remove();
    });
  }
}

// Function to remove blurring from all tweets
function unblurAllTweets() {
  const tweets = document.querySelectorAll('article div[lang]');
  tweets.forEach(tweet => {
    tweet.style.filter = '';
    tweet.style.position = '';
    tweet.dataset.processed = '';
    // Remove warning overlay if present
    const warning = tweet.parentElement.querySelector('.cyberbullying-warning');
    if (warning) {
      warning.remove();
    }
  });
  // Clear the tweet queue
  tweetQueue = [];
  isProcessingQueue = false;
}

// Run the function when the page is loaded
window.addEventListener('load', function () {
  if (blurEnabled) {
    processNewTweets();
  }
});

// Observe DOM changes to catch new tweets loaded dynamically
const observer = new MutationObserver(function (mutationsList) {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList' && blurEnabled) {
      processNewTweets();
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });
