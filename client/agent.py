import sys 
import pyautogui
import requests
import time
import os
import pygetwindow as gw
# --- CONFIG ---
# Ensure this matches your actual backend IP (1.7 or 100.13)
BASE_URL = "http://192.168.1.8:8000"
API_URL = f"{BASE_URL}/upload-screenshot"

# Check arguments passed from main.py
if len(sys.argv) < 2:
    print("❌ Error: No Employee ID provided.")
    sys.exit(1)

EMP_ID = sys.argv[1] 
STATUS = sys.argv[2] if len(sys.argv) > 2 else "Work"

# I renamed this to match what your bottom code is calling
def capture_and_upload():
    try:
        # --- NEW: DISTRACTION DETECTION LOGIC ---
        final_status = STATUS # Default to 'Work' or 'Break'
        
        # Get all open window titles
        windows = gw.getAllTitles()
        
        # Check if any window contains "YouTube"
        # You can add more like "Netflix", "Facebook", etc.
        distractions = ["youtube", "netflix", "facebook", "instagram","whatsapp","twitter","telegram"]
        
        for title in windows:
            if any(site in title.lower() for site in distractions):
                final_status = "Distraction"
                break 
        # ----------------------------------------

        ss = pyautogui.screenshot()
        path = f"temp_{EMP_ID}_{int(time.time())}.png"
        ss.save(path)

        with open(path, 'rb') as f:
            files = {'file': (path, f, 'image/png')}
            # Use final_status instead of STATUS
            data = {'employee_id': EMP_ID, 'status': final_status} 
            requests.post(API_URL, files=files, data=data, timeout=20)
            
        if os.path.exists(path):
            os.remove(path)
            
        print(f"✅ Sent: {EMP_ID} | Badge: {final_status}")

    except Exception as e:
        print(f"❌ Agent Error: {e}")

# --- STARTUP LOGIC ---
print(f"🤖 Agent active for {EMP_ID} (Mode: {STATUS})")

if STATUS.lower() == "break":
    # CASE 1: Employee pressed Break
    # Take ONLY ONE screenshot and then close the script
    print("☕ Break Mode: Capturing single notification screenshot...")
    capture_and_upload()
    print("👋 Admin informed. Agent closing.")
    sys.exit(0) 
else:
    # CASE 2: Employee is Working
    # Take first screenshot immediately, then loop every 60 seconds
    capture_and_upload()
    while True:
        time.sleep(60)
        capture_and_upload()