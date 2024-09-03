async function sendTweetForPrediction(tweetText) {
    try {
        const response = await fetch('http://172.31.19.210:8080/predict', { //enter AWS IP address here
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: tweetText })
        });

        const data = await response.json();
        return data.prediction;
    } catch (error) {
        console.error('Error predicting tweet:', error);
    }
}

async function processTweets() {
    const tweetElements = document.querySelectorAll('div[data-testid="tweetText"]');
    for (let tweetElement of tweetElements) {
        const tweetText = tweetElement.innerText;
        const prediction = await sendTweetForPrediction(tweetText);

        if (prediction > 0.5) { // Assuming 0.5 is the threshold for blurring
            tweetElement.style.filter = "blur(5px)";
        }
    }
}

// Initial run
processTweets();

// Observe for new tweets
const observer = new MutationObserver(processTweets);
observer.observe(document.body, { childList: true, subtree: true });