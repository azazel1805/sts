import os
import gspread
from google.oauth2.service_account import Credentials
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import datetime
import json
import google.generativeai as genai # Gemini
import logging

load_dotenv()

# --- Configuration ---
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define the scope for Google APIs
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
]

# --- Initialize Flask App ---
app = Flask(__name__)
# IMPORTANT: Configure CORS correctly for your frontend URL in production
# For development, '*' might be okay, but restrict it for security later.
CORS(app) # Allows requests from your frontend

# --- Google Sheets Setup ---
GOOGLE_SHEET_ID = os.getenv('GOOGLE_SHEET_ID')
WORKSHEET_NAME = os.getenv('GOOGLE_SHEETS_WORKSHEET_NAME')
SERVICE_ACCOUNT_FILE = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')

if not all([GOOGLE_SHEET_ID, WORKSHEET_NAME, SERVICE_ACCOUNT_FILE]):
    logger.error("Missing Google Sheets environment variables!")
    # Handle error appropriately - maybe raise an exception or exit
else:
   try:
       creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
       client = gspread.authorize(creds)
       sheet = client.open_by_key(GOOGLE_SHEET_ID).worksheet(WORKSHEET_NAME)
       logger.info("Successfully connected to Google Sheet.")
   except Exception as e:
       logger.error(f"Error connecting to Google Sheets: {e}")
       # Handle connection error (e.g., prevent app start or set a flag)
       sheet = None # Indicate connection failure

# --- Gemini Setup (Optional) ---
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-1.5-flash') # Or other suitable model
        logger.info("Gemini configured successfully.")
    except Exception as e:
        logger.error(f"Error configuring Gemini: {e}")
        gemini_model = None
else:
    logger.warning("GEMINI_API_KEY not found. Gemini features disabled.")
    gemini_model = None


# --- Correct Answers and Grammar Topics ---
# This needs to be manually created based on your test
# Format: question_id: {'answer': 'correct_option', 'topic': 'Grammar Topic'}
correct_answers_map = {
    '1': {'answer': 'b', 'topic': 'Present Simple (3rd person singular)'},
    '2': {'answer': 'a', 'topic': 'Adverbs of Frequency / Present Simple'},
    '3': {'answer': 'b', 'topic': 'Modal Verbs (can/can\'t)'},
    '4': {'answer': 'c', 'topic': 'Past Simple (Irregular verbs)'},
    '5': {'answer': 'd', 'topic': 'Present Continuous (for now)'},
    '6': {'answer': 'c', 'topic': 'Present Continuous (for future arrangements)'},
    '7': {'answer': 'a', 'topic': 'Adverbs of Frequency / Present Simple'},
    '8': {'answer': 'd', 'topic': 'Quantifiers (some/any/much/many/a lot)'}, # or 'c' a lot
    '9': {'answer': 'a', 'topic': 'Vocabulary (Synonyms)'},
    '10': {'answer': 'd', 'topic': 'Quantifiers (some/any with uncountable)'},
    '11': {'answer': 'a', 'topic': 'Vocabulary (Baby animals)'},
    '12': {'answer': 'c', 'topic': 'Vocabulary (Animals)'},
    '13': {'answer': 'b', 'topic': 'Vocabulary (Transport)'},
    '14': {'answer': 'c', 'topic': 'Vocabulary (Cutlery)'},
    '15': {'answer': 'c', 'topic': 'Prepositions of Time (at)'},
    '16': {'answer': 'a', 'topic': 'Prepositions of Time (on)'},
    '17': {'answer': 'c', 'topic': 'Vocabulary (Antonyms)'},
    '18': {'answer': 'a', 'topic': 'Possessive Apostrophe (singular)'},
    '19': {'answer': 'b', 'topic': 'Present Simple vs Present Continuous'},
    '20': {'answer': 'b', 'topic': 'Past Simple (Irregular verbs)'},
    '21': {'answer': 'a', 'topic': 'Possessive Adjectives/Pronouns (Whose)'}, # could be 'c' depending on interpretation
    '22': {'answer': 'c', 'topic': 'Gerunds/Infinitives (after stop)'},
    '23': {'answer': 'a', 'topic': 'Gerunds/Infinitives (after verbs like can\'t stand)'},
    '24': {'answer': 'a', 'topic': 'Future (be going to)'}, # b) will is also possible depending on nuance
    '25': {'answer': 'b', 'topic': 'Vocabulary (Synonyms)'},
    '26': {'answer': 'd', 'topic': 'Vocabulary (Antonyms)'}, # a) Happy is also an opposite state
    '27': {'answer': 'b', 'topic': 'Gerunds/Infinitives (after enjoy)'},
    '28': {'answer': 'b', 'topic': 'Gerunds/Infinitives (after avoid)'},
    '29': {'answer': 'a', 'topic': 'Past Continuous vs Past Simple'},
    '30': {'answer': 'b', 'topic': 'Conjunctions / Time Clauses (since)'},
    '31': {'answer': 'a', 'topic': 'Phrases of Purpose (in order to)'},
    '31b': {'answer': 'a', 'topic': 'Phrasal Verbs (take up)'}, # Duplicate Q number 31 in source
    '32': {'answer': 'a', 'topic': 'Vocabulary (Genres)'},
    '33': {'answer': 'c', 'topic': 'Relative Clauses (which/that for things)'},
    '34': {'answer': 'a', 'topic': 'Comparatives'},
    '35': {'answer': 'a', 'topic': 'Vocabulary (Feelings)'},
    '36': {'answer': 'a', 'topic': 'Vocabulary (Vehicles)'},
    '37': {'answer': 'a', 'topic': 'Past Simple (Passive vs Active)'}, 
    '38': {'answer': 'd', 'topic': 'Present Perfect (with yet)'},
    '39': {'answer': 'c', 'topic': 'Gerunds/Infinitives (after promise)'},
    '40': {'answer': 'c', 'topic': 'Present Continuous Passive'},
    '41': {'answer': 'a', 'topic': 'Future Simple Passive'},
    '42': {'answer': 'c', 'topic': 'Present Perfect Passive (with already)'}, # or a) has cleaned (Active) - depends if house is subject or actor
    '43': {'answer': 'c', 'topic': 'Reported Speech (Tense shift: am going -> was going, next -> the following)'},
    '44': {'answer': 'a', 'topic': 'Past Continuous vs Past Simple (while)'},
    '45': {'answer': 'd', 'topic': 'Vocabulary (Synonyms - Phrasal Verbs)'}, # a and b are very similar
    '46': {'answer': 'c', 'topic': 'Vocabulary (Adjectives - Personality)'},
    '47': {'answer': 'a', 'topic': 'Past Habits (used to)'},
    '48': {'answer': 'b', 'topic': 'First Conditional'},
    '49': {'answer': 'b', 'topic': 'Third Conditional'},
    '50': {'answer': 'd', 'topic': 'Phrasal Verbs (Clothing)'},
    '51': {'answer': 'd', 'topic': 'Relative Clauses (who for people - subject)'}, # b) whom if object, but here she's subject of 'met' relative clause
    '52': {'answer': 'b', 'topic': 'Relative Clauses (where for places)'},
    '53': {'answer': 'd', 'topic': 'Relative Clauses (whose for possession)'},
    '54': {'answer': 'c', 'topic': 'Future Simple Passive'},
    '55': {'answer': 'd', 'topic': 'Reported Speech (Questions - if + past perfect)'}, # Tense shift: Did enjoy -> had enjoyed
    '56': {'answer': 'b', 'topic': 'Reported Speech (Tense shift: have been -> had been)'},
    '57': {'answer': 'd', 'topic': 'Past Perfect (action finished before another past action)'},
    '58': {'answer': 'b', 'topic': 'Past Perfect (with by the time)'},
    '59': {'answer': 'c', 'topic': 'Vocabulary (Synonyms)'},
    '60': {'answer': 'b', 'topic': 'Present Perfect Continuous'},
    '61': {'answer': 'a', 'topic': 'Present Perfect Continuous'},
    '62': {'answer': 'a', 'topic': 'Future Perfect'},
    '63': {'answer': 'a', 'topic': 'Future Perfect'}, # d) Future Perfect Passive also plausible depending on desired meaning
    '64': {'answer': 'a', 'topic': 'Third Conditional'},
    '65': {'answer': 'b', 'topic': 'Concessive Clauses (although/despite)'}, # Requires two blanks filled
    '66': {'answer': 'd', 'topic': 'Vocabulary (Collocations - find employment)'}, # or c) land
    '67': {'answer': 'b', 'topic': 'Prepositions / Phrasal verbs'}, # Requires two blanks filled
    '68': {'answer': 'c', 'topic': 'Gerunds/Infinitives (after forget - remembering past event)'},
    '69': {'answer': 'a', 'topic': 'Modals of Deduction (Past - must have)'},
    '70': {'answer': 'b', 'topic': 'Gerunds/Infinitives (after regret - past action)'}, # d) to inform is regretting *before* doing it
    '71': {'answer': 'a', 'topic': 'Conjunctions (as)'},
    '72': {'answer': 'b', 'topic': 'Vocabulary (Idioms/Phrases)'},
    '73': {'answer': 'a', 'topic': 'Vocabulary (Synonyms - Phrasal Verbs)'},
    '74': {'answer': 'b', 'topic': 'Vocabulary (Synonyms)'},
    '75': {'answer': 'a', 'topic': 'Vocabulary (Antonyms)'},
    '76': {'answer': 'a', 'topic': 'Vocabulary (Adjectives - Types of rules)'},
    '77': {'answer': 'b', 'topic': 'Phrasal Verbs (cut back)'},
    '78': {'answer': 'a', 'topic': 'Phrasal Verbs (put up with)'},
    '79': {'answer': 'c', 'topic': 'Phrasal Verbs (get up with)'}, 
    '80': {'answer': 'd', 'topic': 'Phrasal Verbs (hand up)'}, 
    '81': {'answer': 'b', 'topic': 'Wishes (Past regret - wish + Past Perfect)'},
    '82': {'answer': 'b', 'topic': 'Wishes (Past regret - wish + Past Perfect)'},
    '83': {'answer': 'a', 'topic': 'Idioms'}, 
    '84': {'answer': 'a', 'topic': 'Idioms'},
    '85': {'answer': 'c', 'topic': 'Idioms (Meaning)'},
    '86': {'answer': 'a', 'topic': 'Idioms'},
    '87': {'answer': 'c', 'topic': 'Vocabulary (Synonyms - Adjectives)'},
    '88': {'answer': 'a', 'topic': 'Vocabulary (Synonyms - Adjectives)'},
    '89': {'answer': 'a', 'topic': 'Vocabulary (Idioms - Meaning)'},
    '90': {'answer': 'b', 'topic': 'Vocabulary / Reading Comprehension'},
}
# NOTE: Q31 appears twice in the source image. I labeled the second as 31b.
# NOTE: Some answers/topics might be debatable (e.g., 8, 24, 25, 26, 42, 51, 66, 67, 76, 79, 80). Adjust as needed.
# NOTE: Q65 and Q67 seem to require filling two blanks, which isn't standard multiple choice. Assuming the first blank.

@app.route('/submit', methods=['POST'])
def handle_submission():
    """Handles submission of test answers."""
    logger.info("Received submission request.")
    if not sheet:
         logger.error("Google Sheets connection not available.")
         return jsonify({"error": "Backend configuration error (Sheets)"}), 500

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data received"}), 400

        name = data.get('name', '').strip()
        surname = data.get('surname', '').strip()
        answers = data.get('answers', {}) # Dictionary { 'q_id': 'selected_option' }

        if not name or not surname:
            return jsonify({"error": "Name and Surname are required"}), 400

        logger.info(f"Processing submission for: {name} {surname}")

        correct_count = 0
        wrong_count = 0
        skipped_count = 0
        wrong_answers_details = [] # Stores details of wrong answers

        total_questions_in_map = len(correct_answers_map)

        for q_id, correct_data in correct_answers_map.items():
            user_answer = answers.get(str(q_id)) # Ensure q_id is string for lookup
            correct_answer = correct_data['answer']
            topic = correct_data['topic']

            if user_answer is None:
                # Question wasn't answered (maybe not reached if submitted early)
                # Decide if this counts as wrong or just skipped/missed
                # Let's count as skipped for now if explicitly skipped, otherwise maybe wrong?
                # The current frontend sends 'skipped' value.
                if user_answer == 'skipped':
                     skipped_count += 1
                else:
                     # If not explicitly skipped, treat as wrong if it was presented
                     # Or maybe better: only score answered questions? Depends on test logic.
                     # Let's treat unanswered as wrong for simplicity here.
                     wrong_count += 1
                     wrong_answers_details.append({
                         "question": q_id,
                         "your_answer": "Not Answered",
                         "correct_answer": correct_answer,
                         "topic": topic
                     })

            elif user_answer == 'skipped':
                 skipped_count += 1

            elif user_answer == correct_answer:
                correct_count += 1
            else:
                wrong_count += 1
                wrong_answers_details.append({
                    "question": q_id,
                    "your_answer": user_answer,
                    "correct_answer": correct_answer,
                    "topic": topic
                })

        # --- Prepare Summary ---
        summary = {
            "correct": correct_count,
            "wrong": wrong_count,
            "skipped": skipped_count,
            "total_answered": correct_count + wrong_count,
            "total_questions": total_questions_in_map,
            "details": wrong_answers_details
        }

        # --- Optional: Get Gemini Feedback ---
        gemini_feedback = "Gemini analysis not available."
        if gemini_model and wrong_answers_details:
            try:
                prompt = f"A student took an English placement test. Here are their incorrect answers:\n\n"
                for detail in wrong_answers_details:
                    prompt += f"- Question {detail['question']} (Topic: {detail['topic']}): Chose '{detail['your_answer']}', Correct was '{detail['correct_answer']}'.\n"
                prompt += f"\nProvide a brief summary of the main grammar/vocabulary areas the student needs to work on based *only* on these mistakes. Be encouraging."

                response = gemini_model.generate_content(prompt)
                gemini_feedback = response.text
                logger.info("Generated Gemini feedback.")
            except Exception as e:
                logger.error(f"Error calling Gemini API: {e}")
                gemini_feedback = "Error generating AI feedback."

        summary["ai_feedback"] = gemini_feedback # Add feedback to summary

        # --- Log to Google Sheets ---
        try:
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            # Create a readable summary string for the sheet
            wrong_summary_str = "; ".join([f"Q{d['question']}: Chose {d['your_answer']}, Correct {d['correct_answer']} ({d['topic']})" for d in wrong_answers_details])
            if not wrong_summary_str:
                wrong_summary_str = "None"

            row_to_insert = [
                timestamp,
                name,
                surname,
                correct_count,
                wrong_count,
                wrong_summary_str # Log the readable summary
                # Optionally log the raw JSON details: json.dumps(wrong_answers_details)
                # Optionally log Gemini feedback: gemini_feedback
            ]
            sheet.append_row(row_to_insert)
            logger.info(f"Successfully logged results to Google Sheet for {name} {surname}.")
        except Exception as e:
            logger.error(f"Error writing to Google Sheet: {e}")
            # Don't fail the whole request, just log the error
            summary["sheet_error"] = "Failed to log results to sheet."


        # --- Return Results to Frontend ---
        return jsonify(summary), 200

    except Exception as e:
        logger.exception("An error occurred during submission processing:") # Log the full traceback
        return jsonify({"error": "An internal server error occurred."}), 500

# --- Basic Health Check Route ---
@app.route('/')
def index():
    return "Placement Test Backend is running."

# --- Run the App ---
if __name__ == '__main__':
    # Use waitress or gunicorn for production instead of Flask's built-in server
    port = int(os.environ.get('PORT', 8080)) # Render uses PORT env var
    app.run(host='0.0.0.0', port=port)
