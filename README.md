# CyberSafe

**CyberSafe** is a Chrome browser extension designed to enhance your online safety by detecting and blurring cyberbullying content on X (formerly known as Twitter). Utilizing advanced machine learning algorithms, CyberSafe ensures a safer and more positive social media experience by automatically identifying offensive tweets and concealing them from your view.

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Local Installation](#local-installation)
  - [Prerequisites](#prerequisites)
  - [Setting Up the Flask Server](#setting-up-the-flask-server)
  - [Installing the Chrome Extension](#installing-the-chrome-extension)
- [Usage](#usage)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Contact](#contact)

## Features

- **Automatic Detection:** Leverages machine learning models to identify cyberbullying content in real-time.
- **Content Blurring:** Automatically blurs offensive tweets, replacing them with a warning message.
- **Batch Processing:** Efficiently processes multiple tweets simultaneously for swift performance.
- **User Control:** Easily enable or disable the blurring feature through a user-friendly popup interface.
- **Real-Time Monitoring:** Continuously scans new tweets as they load on your feed.

## How It Works

CyberSafe integrates both **Support Vector Machine (SVM)** and **Long Short-Term Memory (LSTM)** algorithms to analyze and classify tweets. Here's a high-level overview of the workflow:

1. **Data Collection:** The extension scans tweets on your feed in batches.
2. **Preprocessing:** Each tweet undergoes text preprocessing to prepare it for analysis.
3. **Feature Extraction:**
   - **SVM:** Uses TF-IDF vectorization to convert text into numerical features.
   - **LSTM:** Utilizes tokenization and embedding to capture the sequential nature of the text.
4. **Prediction:**
   - **SVM Model:** Predicts the likelihood of a tweet being cyberbullying based on extracted features.
   - **LSTM Model:** Analyzes the context and sequence of words to assess the tweet's offensiveness.
5. **Ensemble Decision:** A Logistic Regression meta-model combines the predictions from both SVM and LSTM to make a final determination.
6. **Action:** If a tweet is classified as cyberbullying, the extension blurs the content and displays a warning message.

## Technologies Used

- **Frontend:**
  - **JavaScript:** Core scripting language for the Chrome extension.
  - **HTML/CSS:** For the popup interface.
- **Backend:**
  - **Flask:** Python web framework for serving the machine learning models.
  - **Machine Learning Models:**
    - **Support Vector Machine (SVM):** For feature-based classification.
    - **Long Short-Term Memory (LSTM):** For sequence-based classification.
    - **Logistic Regression:** Meta-model for combining predictions.
- **Deployment:**
  - **AWS EC2:** Hosting the Flask server.
- **Other Tools:**
  - **Chrome Extensions API:** For browser integration.
  - **Joblib & Pickle:** For model serialization.

## Installation
- You install our extension from the Chrome Web Store (https://chromewebstore.google.com/detail/cybersafe/okjkiaigldmglhgdfpiifmggijbfkcdn)

## Local Installation

### Prerequisites

- **Python 3.7+**
- **pip (Python package installer)**
- **AWS EC2 Instance:** To host the Flask server.
- **Chrome Browser:** For installing the extension.
- **Chrome Developer Mode Enabled:** To load the unpacked extension.

### Setting Up the Flask Server

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/DeonnLansangan/X-Cyberbullying-Filtering-Extension.git
   cd X-Cyberbullying-Filtering-Extension

2. **Install Python Dependencies:**
- It's recommended to use a virtual environment to manage dependencies.

    ```bash
    python3 -m venv venv
    source venv/bin/activate

- Install the required packages:

    ```bash
    pip install -r requirements.txt

3. **Transfer Model Files to the Server:**
- Use scp to securely copy your model files to your chosen directory on the server.

  ```bash
  scp -i *your .pem file here* tokenizer.pkl ubuntu@ip.address:/srv/modelserver
  scp -i *your .pem file here* tfidf_vectorizer.pkl ubuntu@ip.address:/srv/modelserver
  scp -i *your .pem file here* svm_model.pkl ubuntu@ip.address:/srv/modelserver
  scp -i *your .pem file here* lstm_model.keras ubuntu@ip.address:/srv/modelserver
  scp -i *your .pem file here* meta_model.pkl ubuntu@ip.address:/srv/modelserver

4. **Configure the Flask App:**
- Ensure that the app.py file correctly points to the model files in /srv/modelserver/. If necessary, adjust the paths in app.py:

  ```bash
  # Example path adjustments in app.py
  tfidf_vectorizer = joblib.load('/srv/modelserver/tfidf_vectorizer.pkl')
  with open('/srv/modelserver/tokenizer.pkl', 'rb') as handle:
    tokenizer = pickle.load(handle)
  svm_model = joblib.load('/srv/modelserver/svm_model.pkl')
  lstm_model = load_model('/srv/modelserver/lstm_model.keras')
  meta_model = joblib.load('/srv/modelserver/meta_model.pkl')

5. **Run the Flask Server:**

    ```bash
    python app.py

 - **Production Deployment:**
 For a production environment, consider using a production-grade WSGI server like Gunicorn and setting up a reverse proxy with Nginx.
 
    ```bash
    Copy code
    gunicorn --workers 4 app:app

### Installing the Chrome Extension

1. **Navigate to the Extension Directory:**
- Ensure you're in the root directory of your cloned repository.

2. **Open Chrome Extensions Page:**
- Navigate to chrome://extensions/ in your Chrome browser.

3. **Enable Developer Mode:**
- Toggle the Developer mode switch in the top right corner.

4. **Load Unpacked Extension:**
- Click on Load unpacked and select the extension directory of your cloned repository.

5. **Verify Installation:**
- The CyberSafe icon should appear in your Chrome toolbar. Click on it to access the popup interface.

6. **Configure Host Permissions:**
- Ensure that the Flask server is accessible at https://group9thesis.com/predict_batch. If your server is hosted at a different URL, update the manifest.json accordingly.

## Usage

1. Enable Blurring:
- Click on the CyberSafe icon in the Chrome toolbar.
- Ensure the "Enable Blurring of Cyberbullying Content" checkbox is checked.

2. Automatic Detection:
- As you browse X (Twitter), the extension scans tweets in batches.
- Offensive tweets are automatically blurred with a warning message: "Content hidden due to potential cyberbullying."

3. Toggle Feature:
- You can enable or disable the blurring feature anytime by toggling the button in the popup.
  
## Configuration

### Extension Configuration
- Batch Size and Interval:

  - Defined in content.js:

    - MAX_BATCH_SIZE = 5: Number of tweets processed per batch.

    - PROCESS_INTERVAL = 1000: Time interval (in milliseconds) between processing batches.

- Server Endpoint:

  - Defined in background.js:

    - URL: https://group9thesis.com/predict_batch

    - Method: POST

    - Headers: Content-Type: application/json

    - Body: { texts: [array_of_tweets] }

  - Ensure that the Flask server is running and accessible at the specified endpoint.

### Flask Server Configuration

- CORS Settings:

  - Configured in app.py using Flask-CORS to allow cross-origin requests from the Chrome extension.

- Model Paths:

  - Ensure that all model files (tokenizer.pkl, tfidf_vectorizer.pkl, svm_model.pkl, lstm_model.keras, meta_model.pkl) are correctly placed in /srv/modelserver/ and that app.py references them accurately.

## Troubleshooting

Flask Server Not Responding

- Ensure Server is Running: Verify that app.py is running without errors.

- Check Server Logs: Look for any error messages in the terminal where the Flask server is running.

- Verify Network Accessibility: Ensure that the server's security groups on AWS allow incoming traffic on the port Flask is running (default is 5000). For production, consider using port 80 or 443.

Extension Not Blurring Tweets

- Check Server Endpoint: Ensure that the URL hosting the server is correct and the Flask server is operational.

- Inspect Extension Permissions: Verify that manifest.json includes the correct host_permissions.

- Console Errors: Open Chrome Developer Tools and check the console for any errors related to the extension or network requests.

Other Common Issues
- CORS Errors: Ensure that Flask-CORS is properly configured to allow requests from your extension.

- Model Loading Errors: Verify that all model files are correctly placed and that app.py references the correct paths.

## Contributing
We welcome contributions to improve CyberSafe! Please follow these steps:

1. Fork the Repository

2. Create a New Branch:

    ```bash
    git checkout -b feature/YourFeatureName

3. Make Your Changes

4. Commit Your Changes:

    ```bash
    git commit -m "Add Your Feature Description"

5. Push to Your Fork:

    ```bash
    git push origin feature/YourFeatureName

6. Open a Pull Request

## Contact
For any questions, issues, or suggestions, please reach out to:

- Name: Deonn Lansangan

  - Email: jslansangan@student.hau.edu.ph

  - GitHub: @DeonnLansangan

- Name: Katherine Maglalang

  - Email: krmaglalang@student.hau.edu.ph

- Name: Katherine Medina
  - Email: kbmedina@student.hau.edu.ph

- Name: Aireesh Pineda
  - Email: agpineda4@student.hau.edu.ph 
