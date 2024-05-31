from flask import Flask, request, jsonify
import pickle
from joblib import dump, load
import numpy as np
import json

app = Flask(__name__)


# model=pickle.load(open("./ML_Model/FinalPfeModel.pkl",'rb'))
model = load('./ML_Model/FinalPfeModelFinal.joblib') 

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    
    features = [data['data'], data['ota'], data['autres']]
    prediction = model.predict(np.array(features).reshape(1, -1))
    
    return json.dumps({"predicted_offer": int(prediction[0])}) # jsonify({"predicted_offer": prediction[0]})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
