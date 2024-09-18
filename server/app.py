from flask import Flask, request, jsonify
import numpy as np
import joblib
import pickle
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from flask_cors import CORS  # Import CORS

app = Flask(__name__)

# Enable CORS
CORS(app)

# Load models and preprocessing objects at app startup
# Load TF-IDF Vectorizer
tfidf_vectorizer = joblib.load('tfidf_vectorizer.pkl')

# Load Tokenizer
with open('tokenizer.pkl', 'rb') as handle:
    tokenizer = pickle.load(handle)

# Load SVM model
svm_model = joblib.load('svm_model.pkl')

# Load LSTM model
lstm_model = load_model('lstm_model.keras')

# Load Logistic Regression meta-model
meta_model = joblib.load('meta_model.pkl')

# Define the maximum sequence length (should match the training setting)
max_sequence_length = 100

@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    # Get JSON data from the request
    data = request.get_json(force=True)

    # Extract the list of texts
    texts = data.get('texts', [])

    if not texts or not isinstance(texts, list):
        return jsonify({'error': 'No texts provided or invalid format'}), 400

    # Preprocess new data for SVM
    new_data_svm = tfidf_vectorizer.transform(texts)

    # Preprocess new data for LSTM
    new_sequences = tokenizer.texts_to_sequences(texts)
    new_padded_sequences = pad_sequences(new_sequences, maxlen=max_sequence_length)

    # Get predictions from SVM and LSTM
    svm_pred_proba = svm_model.predict_proba(new_data_svm)[:, 1]
    lstm_pred = lstm_model.predict(new_padded_sequences).flatten()

    # Combine predictions
    combined_input = np.column_stack((svm_pred_proba, lstm_pred))

    # Get final predictions from meta-model
    final_pred_proba = meta_model.predict_proba(combined_input)[:, 1]
    final_pred_binary = (final_pred_proba > 0.5).astype(int)

    # Prepare the response
    predictions = final_pred_binary.tolist()  # Convert numpy array to list

    # Return the results as JSON
    return jsonify({'predictions': predictions})

if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True)
