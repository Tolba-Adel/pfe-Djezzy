from flask import Flask, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)


model=pickle.load(open("./ML_Model/FinalPfeModel.pkl",'rb'))

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    features = [data['data'], data['ota'], data['autres']]
    prediction = model.predict(np.array(features).reshape(1, -1))
    return jsonify({'predicted_offer': prediction[0]})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
