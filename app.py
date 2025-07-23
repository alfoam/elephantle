from flask import Flask, render_template, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
from pytz import timezone
from datetime import datetime, timedelta
from flask_cors import CORS

import json
import random

should_clear_guesses = True 

app = Flask(__name__)
CORS(app)

with open("data.json", "r") as f:
    DICT = json.load(f)

state = {
    "correct": None,
    "last_picked": None
}

def pick_new_correct():
    global should_clear_guesses
    
    state["correct"] = random.choice(list(DICT))
    state["last_picked"] = datetime.now(timezone("US/Eastern"))

    should_clear_guesses = True
    print(f"New CORRECT selected: {state['correct']}")

# Initial run on startup
pick_new_correct()

# Schedule it to run daily at 12 AM EST
scheduler = BackgroundScheduler(timezone("US/Eastern"))

#DEBUG
#scheduler.add_job(func=pick_new_correct, trigger="interval", minutes=1)

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
    # Reset the flag after sending
    should_clear_guesses = False
    return jsonify(response)


@app.route('/')
def home():
    return render_template('index.html')

@app.route("/next_reset")
def next_reset():
    now = datetime.now(timezone('US/Eastern'))
    next_midnight = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    return jsonify({"next_reset": next_midnight.isoformat()})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)