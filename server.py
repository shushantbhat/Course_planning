from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import os
import json
from datetime import datetime, timedelta

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    subject = db.Column(db.String(50), nullable=False)

# Create the database
with app.app_context():
    db.create_all()

# Get the absolute path to the src/data directory
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "src", "data"))
os.makedirs(DATA_DIR, exist_ok=True)
print("Data directory:", DATA_DIR)  # Debugging: Print the data directory path

# File paths
USERS_FILE = os.path.join(DATA_DIR, "users.json")
SEMESTER_FILE = os.path.join(DATA_DIR, "semester_details.json")
CHAPTER_FILE = os.path.join(DATA_DIR, "chapter_details.json")
TIMETABLE_FILE = os.path.join(DATA_DIR, "lesson_timetable.json")
SYLLABUS_FILE = os.path.join(DATA_DIR, "syllabus_details.json")
SEMESTER_TIMETABLE_FILE = os.path.join(DATA_DIR, "semester_timetable.json")

# Load data from file
def load_data(file_path):
    if os.path.exists(file_path):
        with open(file_path, "r") as file:
            return json.load(file)
    return []

# Save data to file
def save_data(file_path, data):
    with open(file_path, "w") as file:
        json.dump(data, file, indent=2)

# User registration
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    subject = data.get("subject")

    if not username or not password or not subject:
        return jsonify({"error": "Username, password, and subject are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = User(username=username, password=hashed_password, subject=subject)
    db.session.add(new_user)
    db.session.commit()

    # Save user details to file
    users = load_data(USERS_FILE)
    users.append({"username": username, "password": hashed_password, "subject": subject})
    save_data(USERS_FILE, users)

    return jsonify({"message": "User registered successfully"}), 201

# User login
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Invalid username or password"}), 401

    return jsonify({"message": "Login successful", "user_id": user.id, "subject": user.subject}), 200

# Get and save syllabus
@app.route("/get-syllabus", methods=["GET"])
def get_syllabus():
    try:
        return jsonify(load_data(SYLLABUS_FILE)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/save-syllabus", methods=["POST"])
def save_syllabus():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        save_data(SYLLABUS_FILE, data)
        return jsonify({"message": "Syllabus saved successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get and save semester timetable
@app.route("/get-semester", methods=["GET"])
def get_semester():
    try:
        return jsonify(load_data(SEMESTER_TIMETABLE_FILE)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/save-semester", methods=["POST"])
def save_semester():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        save_data(SEMESTER_TIMETABLE_FILE, data)
        return jsonify({"message": "Semester details saved successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get and save semester details
@app.route("/get-semester-details", methods=["GET"])
def get_semester_details():
    try:
        return jsonify(load_data(SEMESTER_FILE)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/save-semester-details", methods=["POST"])
def save_semester_details():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        semester_data = load_data(SEMESTER_FILE)
        semester_data.append(data)
        save_data(SEMESTER_FILE, semester_data)

        return jsonify({"message": "Semester details saved successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get and save chapter details
@app.route("/get-chapter-details", methods=["GET"])
def get_chapter_details():
    try:
        return jsonify(load_data(CHAPTER_FILE)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/save-chapter-details", methods=["POST"])
def save_chapter_details():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        chapter_data = load_data(CHAPTER_FILE)
        chapter_data.append(data)
        save_data(CHAPTER_FILE, chapter_data)

        return jsonify({"message": "Chapter details saved successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Save lesson timetable
@app.route("/save-timetable", methods=["POST"])
def save_timetable():
    try:
        data = request.json.get("timetable", [])
        if not data:
            return jsonify({"error": "No timetable data received"}), 400
        save_data(TIMETABLE_FILE, data)
        return jsonify({"message": "Timetable saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get combined details
@app.route("/get-combined-details", methods=["GET"])
def get_combined_details():
    try:
        # Load all required data
        semester_details = load_data(SEMESTER_FILE)
        chapter_details = load_data(CHAPTER_FILE)
        timetable = load_data(TIMETABLE_FILE)
        syllabus = load_data(SYLLABUS_FILE)
        semester_timetable = load_data(SEMESTER_TIMETABLE_FILE)

        # Combine all data into one response
        combined_data = {
            "semester_details": semester_details,
            "chapter_details": chapter_details,
            "timetable": timetable,
            "syllabus": syllabus,
            "semester_timetable": semester_timetable
        }

        return jsonify(combined_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add new endpoint for rescheduling topics
@app.route("/reschedule-topic", methods=["POST"])
def reschedule_topic():
    try:
        data = request.json
        if not data or 'topic' not in data or 'currentDate' not in data:
            return jsonify({"error": "Invalid request data"}), 400

        # Load current timetable
        timetable = load_data(TIMETABLE_FILE)
        
        topic_to_reschedule = data['topic']
        current_date = data['currentDate']
        
        # Get the entry that needs to be rescheduled
        current_entry = None
        for entry in timetable:
            if entry['date'] == current_date:
                current_entry = entry
                break
        
        if not current_entry:
            return jsonify({"error": "Current entry not found"}), 404

        # Find next available slot
        next_slot = None
        
        # First, try to find a non-teaching day
        for entry in sorted(timetable, key=lambda x: x['date']):
            if entry['date'] > current_date and entry['type'] in ['holiday', 'non-teaching']:
                next_slot = entry
                break
        
        # If no non-teaching day, try to find a vacant slot
        if not next_slot:
            for entry in sorted(timetable, key=lambda x: x['date']):
                if entry['date'] > current_date and entry['type'] == 'vacant':
                    next_slot = entry
                    break
        
        # If still no slot, find next teaching day for extra lecture
        if not next_slot:
            teaching_days = sorted([entry['date'] for entry in timetable 
                                 if entry['date'] > current_date])
            
            if teaching_days:
                for teaching_date in teaching_days:
                    day_lectures = sum(1 for entry in timetable 
                                     if entry['date'] == teaching_date)
                    if day_lectures < 2:  # Allow up to 2 lectures per day
                        # Mark current entry as rescheduled
                        for entry in timetable:
                            if entry['date'] == current_date:
                                entry['status'] = 'Rescheduled'
                        
                        # Remove any existing entry for the target date
                        timetable = [entry for entry in timetable 
                                   if entry['date'] != teaching_date]
                        
                        next_slot = {'date': teaching_date, 'is_extra': True}
                        break
        
        if not next_slot:
            return jsonify({"error": "No available slots found in the semester"}), 400

        # Create or update the rescheduled entry
        if next_slot.get('is_extra'):
            # Add as extra lecture
            new_entry = {
                'date': next_slot['date'],
                'type': current_entry['type'],
                'details': current_entry['details'],
                'status': f'Rescheduled from {current_date} (Extra Lecture)'
            }
            timetable.append(new_entry)
        else:
            # Update existing slot
            for entry in timetable:
                if entry['date'] == next_slot['date']:
                    original_type = entry['type']  # Store original type
                    entry.update({
                        'type': current_entry['type'],
                        'details': current_entry['details'],
                        'status': f'Rescheduled from {current_date} (Originally {original_type})'
                    })
                    break
        
        # Sort timetable by date
        timetable.sort(key=lambda x: x['date'])
        
        # Save updated timetable
        save_data(TIMETABLE_FILE, timetable)
        
        return jsonify({
            "message": "Topic rescheduled successfully",
            "updatedTimetable": timetable
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the app on port 5000
if __name__ == "__main__":
    app.run(debug=True, port=5000)