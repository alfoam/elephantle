from flask import Flask, render_template, jsonify
from pytz import timezone
from datetime import datetime, timedelta
from flask_cors import CORS
import hashlib
import json

app = Flask(__name__)
CORS(app)

with open("data.json", "r") as f:
    DICT = json.load(f)

DICT_KEYS = list(DICT.keys())

def get_current_date_str():
    now = datetime.now(timezone("US/Eastern")) #+ timedelta(days=2)
    return now.strftime("%Y-%m-%d")

def get_index_from_date(date_str, salt="secret_salt"):
    raw = (date_str + salt).encode()
    hashed = hashlib.sha256(raw).hexdigest()
    return int(hashed, 16) % len(DICT_KEYS)
#sajdliasjdlasjd
def get_correct_for_today():
    today_str = get_current_date_str()
    index = get_index_from_date(today_str)
    return DICT_KEYS[index]

@app.route("/clear_guesses")
def clear_guesses():
    response = {
        "clear_guesses": True
    }
    return jsonify(response)

@app.route("/data")
def get_data():
    correct = get_correct_for_today()
    today_str = get_current_date_str()
    seed = hashlib.sha256((today_str + "secret_salt").encode()).hexdigest()
    response = {
        "dict": DICT,
        "correct": correct,
        "seed": seed
    }
    return jsonify(response)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/next_reset")
def next_reset():
    now = datetime.now(timezone("US/Eastern"))
    next_midnight = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    return jsonify({"next_reset": next_midnight.isoformat()})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)