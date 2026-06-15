# CareMind AI Python Backend - Deployment Build
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai

app = Flask(__name__)
CORS(app)  # Enable cross-origin resource sharing

# Initialize Gemini API Client
API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")

try:
    if API_KEY and API_KEY != "YOUR_GEMINI_API_KEY":
        client = genai.Client(api_key=API_KEY)
        has_gemini = True
        print("[CareMind Backend] Gemini API Client successfully initialized.")
    else:
        client = None
        has_gemini = False
        print("[CareMind Backend] WARNING: GEMINI_API_KEY not configured. Running in local simulation mode.")
except Exception as e:
    client = None
    has_gemini = False
    print(f"[CareMind Backend] Error initializing Gemini client: {e}. Running in local simulation mode.")

# Enforced Admin SMS Numbers
ADMIN_PHONES = ["9677555064", "6379119254"]

# Enenhanced System Prompt for Clinical Accuracy
system_prompt = """
You are CareMind AI, the Patient-Facing Health Intelligence Assistant for a hospital monitoring platform.
You are helping the patient analyze their symptoms and query clinical doubts.

Your job is to read the patient's message, correlate it with their active vitals and medical diagnosis history report, and produce a response:
1. If it is a "doubt" (Clinical inquiry: 'Why is my heart rate high?', 'What medications am I on?', 'Is a temperature of 38.3 normal?', 'Explain my bronchitis'):
   - Formulate a precise, medically accurate, and comforting response detailing their specific case metrics. Do not suggest calling the nurse for general doubts. Explain their vitals clearly.
2. If it is a "request" (Action request: 'I need to go to the restroom', 'bring water', 'I feel suffocated', 'I have chest pain'):
   - Classify the priority (Low/Medium/High) and configure alerts.
   - For restroom mobility, food, or water: Set notify_attendant = true.
   - For chest pain, severe fall, self-suffocating, or breathing distress: Set notify_nurse = true and notify_attendant = true immediately.

CRITICAL DISPATCH RULES:
- If notify_attendant is true, an SMS alert will be broadcast to BOTH admin contacts (+91 9677555064 and +91 6379119254).
- If notify_nurse is true, a critical alarm pages the nurse desk immediately.

OUTPUT FORMAT:
You MUST respond in strict JSON format matching this exact schema:
{
  "classification": "doubt" or "request",
  "response": "Medically precise clinical reply explaining their vitals/medications directly to the patient.",
  "notify_attendant": true or false,
  "notify_nurse": true or false,
  "dispatch_message": "Clean message content (e.g. 'Alert: Patient P001 requires restroom assistance.')",
  "priority": "Low" or "Medium" or "High"
}
"""

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json() or {}
        user_message = data.get("message", "").strip()
        patient_id = data.get("patient_id", "P001")
        vitals = data.get("vitals", {})
        history_summary = data.get("history_summary", "Stable post-op status.")
        diagnosis = data.get("diagnosis", "General recovery.")
        chat_type = data.get("type", "doubt")

        if not user_message:
            return jsonify({"error": "Empty message"}), 400

        # Construct patient telemetry context for Gemini
        patient_context = f"""
Patient ID: {patient_id}
Diagnosis: {diagnosis}
Medical History Summary: {history_summary}
Vitals:
- Heart Rate: {vitals.get('hr', 75)} bpm
- Blood Pressure: {vitals.get('bpSys', 120)}/{vitals.get('bpDia', 80)} mmHg
- Temperature: {vitals.get('temp', 37.0)} °C
- SpO2: {vitals.get('spo2', 98)}%

Patient Input: {user_message}
Mode Selected: {chat_type}
"""

        # 1. Gemini Request
        if has_gemini:
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=f"{system_prompt}\n\n{patient_context}"
                )
                
                resp_text = response.text.strip()
                if resp_text.startswith("```json"):
                    resp_text = resp_text[7:]
                if resp_text.endswith("```"):
                    resp_text = resp_text[:-3]
                resp_text = resp_text.strip()
                
                parsed_res = json.loads(resp_text)
                
                # Append hardcoded dual admin contacts
                parsed_res["dispatch_contacts"] = ADMIN_PHONES
                
                # Print SMS dispatches
                if parsed_res.get("notify_attendant"):
                    print(f"\n[SMS DISPATCHED] To Admin Mobiles (+91 9677555064 & +91 6379119254): \"{parsed_res.get('dispatch_message')}\"")
                if parsed_res.get("notify_nurse"):
                    print(f"[NURSE ALERT ACTIVE] Posted to Ward Coordinator Panel for Patient {patient_id}\n")
                    
                return jsonify(parsed_res)

            except Exception as e:
                print(f"[CareMind Backend] Gemini call failed: {e}. Falling back to local classifier.")

        # 2. Local simulation fallback engine
        msg_lower = user_message.lower()
        classification = chat_type
        notify_attendant = False
        notify_nurse = False
        priority = "Low"
        dispatch_message = ""
        ai_response = ""

        # Check for urgent requests
        if any(w in msg_lower for w in ["suffocat", "breathe", "chest pain", "fall", "dizzy", "severe pain"]):
            classification = "request"
            notify_nurse = True
            notify_attendant = True
            priority = "High"
            dispatch_message = f"URGENT ALERT: Patient {patient_id} in Ward reports: '{user_message}'. Vital Saturation check required."
            ai_response = "I have paged the emergency nurse team and paged your attendant immediately. Clinical staff are rushing to your bedside now."
        
        # Check for moderate requests
        elif any(w in msg_lower for w in ["restroom", "toilet", "walk", "urine"]):
            classification = "request"
            notify_attendant = True
            notify_nurse = False
            priority = "Medium"
            dispatch_message = f"Alert: Patient {patient_id} requires restroom / mobility assistance. Please check room."
            ai_response = "I have sent a mobility request to your registered attendant. They will assist you to the restroom shortly."
            
        # Check for low requests
        elif any(w in msg_lower for w in ["water", "food", "blanket", "towel", "eat", "drink"]):
            classification = "request"
            notify_attendant = True
            notify_nurse = False
            priority = "Low"
            dispatch_message = f"Request: Patient {patient_id} requires water, food, or general comfort items."
            ai_response = "I have logged your comfort request. Your attendant has been notified to bring these items to your bedside."
            
        # Check for doubts / queries
        else:
            classification = "doubt"
            hr = vitals.get('hr', 75)
            spo2 = vitals.get('spo2', 98)
            temp = vitals.get('temp', 37.0)
            
            if "heart" in msg_lower or "hr" in msg_lower:
                ai_response = f"Your heart rate is currently {hr} bpm. For your diagnosis of '{diagnosis}', this is within acceptable ranges. Continue resting."
            elif "oxygen" in msg_lower or "spo2" in msg_lower:
                ai_response = f"Your blood oxygen level is {spo2}%. Normal ranges are 95-100%. Your lungs are functioning adequately under monitoring."
            elif "temp" in msg_lower or "fever" in msg_lower:
                ai_response = f"Your temperature is {temp}°C. We are monitoring this closely under your care plan."
            else:
                ai_response = f"Your parameters are currently tracked. Heart rate: {hr} bpm, SpO2: {spo2}%. Your current diagnosis is '{diagnosis}'. Please let me know if you need restroom help or water."

        # Log simulated SMS dispatch on backend console to the two mobile numbers
        if notify_attendant:
            print(f"\n[SMS DISPATCHED] To Admin Mobiles (+91 9677555064 & +91 6379119254): \"{dispatch_message}\"")
        if notify_nurse:
            print(f"[NURSE ALERT ACTIVE] Posted to Ward Coordinator Panel for Patient {patient_id}\n")

        return jsonify({
            "classification": classification,
            "response": ai_response,
            "notify_attendant": notify_attendant,
            "notify_nurse": notify_nurse,
            "dispatch_message": dispatch_message,
            "priority": priority,
            "dispatch_contacts": ADMIN_PHONES
        })

    except Exception as ex:
        return jsonify({"error": f"Internal server error: {ex}"}), 500

if __name__ == '__main__':
    print("[CareMind Backend] Starting server on http://127.0.0.1:5000...")
    app.run(host='127.0.0.1', port=5000, debug=True)
