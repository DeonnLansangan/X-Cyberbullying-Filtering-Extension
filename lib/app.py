##import this to AWS along with tokenizer.pkl and final_lstm_model.keras

from flask import Flask, request, jsonify
import tensorflow as tf
import pickle

#Load model and tokenizer
model = tf.keras.models.load_model('final_lstm_model.keras')
with open('tokenizer.pkl', 'rb') as file:
    tokenizer = pickle.load(file)

app = Flask(__name__)

def preprocess_text(text):
    sequences = tokenizer.texts_to_sequences([text])
    padded_sequences = tf.keras.preprocessing.sequence.pad_sequences(sequences, maxlen =100)
    return padded_sequences

@app.route('/predict', methods = ['POST'])
def predict():
    data = request.get_json(force = True)
    text = data['text']
    preprocessed_text = preprocess_text(text)
    prediction = model.predict(preprocessed_text)
    return jsonify({'prediction': float(prediction[0][0])})
