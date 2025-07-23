from flask import Flask, render_template, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
from flask_cors import CORS

import json
import random

app = Flask(__name__)
CORS(app)

with open("data.json", "r") as f:
    DICT = json.load(f)

#CORRECT = "Phosphatherium"
CORRECT = None

def pick_new_correct():
    global CORRECT
    CORRECT = random.choice(list(DICT))
    print(f"New CORRECT selected: {CORRECT}")

scheduler = BackgroundScheduler()
scheduler.add_job(func=pick_new_correct, trigger="interval", hours=24)
scheduler.start()

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