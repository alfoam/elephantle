from flask import Flask, render_template, jsonify
from flask_cors import CORS

import json
import random

app = Flask(__name__)
CORS(app)

with open("data.json", "r") as f:
    DICT = json.load(f)

#CORRECT = "Phosphatherium"
CORRECT = random.choice(list(DICT))

@app.route("/data")
def get_data():
    return jsonify({
        "dict": DICT,
        "correct": CORRECT
    })

@app.route('/')
def home():
    return render_template('index.html')



if __name__ == '__main__':
    app.run(port=5000)