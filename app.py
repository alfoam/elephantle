from flask import Flask, render_template, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
from pytz import timezone
from datetime import datetime, timedelta
from flask_cors import CORS

import json
import random
import os

should_clear_guesses = True

app = Flask(__name__)
CORS(app)

with open("data.json", "r") as f:
    DICT = json.load(f)

STATE_FILE = "state.json"

def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    return {}

def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f)

def get_current_date_str():
    return datetime.now(timezone("US/Eastern")).strftime("%Y-%m-%d")

def pick_new_correct(force=False):
    global should_clear_guesses, state

    today = get_current_date_str()
    state = load_state()

    # If already picked today and not forced, skip
    if not force and state.get("date") == today:
        print(f"Reusing today's CORRECT: {state['correct']}")
        return

    new_correct = random.choice(list(DICT))
    state = {
        "correct": new_correct,
        "date": today
    }
    save_state(state)
    should_clear_guesses = True
    print(f"New CORRECT selected: {new_correct}")

# Initial pick on startup
pick_new_correct()

# Schedule to pick a new one daily at 12 AM EST
scheduler = BackgroundScheduler(timezone="US/Eastern")
scheduler.add_job(func=pick_new_correct, trigger="cron", hour=0, minute=0)
scheduler.start()

@app.route("/data")
def get_data():
    global should_clear_guesses
    response = {
        "dict": DICT,
        "correct": state["correct"],
        "clear_guesses": should_clear_guesses
    }
    should_clear_guesses = False
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