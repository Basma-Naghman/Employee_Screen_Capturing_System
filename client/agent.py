import sys
import pyautogui
import requests
import time
import os
import pygetwindow as gw
# --- CONFIG ---
BASE_URL = "http://192.168.1.6:8000"
API_URL = f"{BASE_URL}/upload-screenshot"

# Check arguments passed from main.py
if len(sys.argv) < 2:
    print("❌ Error: No Employee ID provided.")
    sys.exit(1)

EMP_ID = sys.argv[1]
STATUS = sys.argv[2] if len(sys.argv) > 2 else "Work"

def capture_and_upload():
    try:
        final_status = STATUS

        # Only do distraction detection in Work mode
        if STATUS.lower() == "work":
            try:
                # Get the ACTIVE (focused) window only - this is what the user is actually looking at
                try:
                    active_window = gw.getActiveWindow()
                    if active_window:
                        active_title = active_window.title
                        active_lower = active_title.lower()
                        print(f"🔍 Active window: '{active_title}'")

                        # Work apps that should NEVER be marked as distraction
                        work_apps = [
                            "visual studio", "vs code", "vscode", "pycharm", "intellij",
                            "sublime", "notepad++", "atom", "vim", "emacs", "eclipse",
                            "xcode", "notepad", "powershell", "cmd", "git", "github desktop"
                        ]

                        # Check if active window is a work app first
                        is_work = any(app in active_lower for app in work_apps)
                        if is_work:
                            final_status = "Work"
                            print(f"✅ Work app active - marking as Work")
                        else:
                            # Active window is NOT a known work app - check for distractions
                            distractions = ["youtube", "netflix", "facebook", "instagram", "whatsapp", "twitter", "telegram"]
                            found_distraction = False
                            for keyword in distractions:
                                if keyword in active_lower:
                                    # Check it's a whole word match (not "telegram" in "telegram-desktop")
                                    import re
                                    if re.search(r'\b' + re.escape(keyword) + r'\b', active_lower):
                                        final_status = "Distraction"
                                        print(f"⚠️ Distraction found in active window: '{active_title}'")
                                        found_distraction = True
                                        break

                            if not found_distraction:
                                # Active window is not work and not distraction - default to Work
                                final_status = "Work"
                                print(f"✅ Normal window active - marking as Work")
                    else:
                        # No active window found - default to Work
                        final_status = "Work"
                        print(f"✅ No active window - marking as Work")

                except Exception as e:
                    print(f"⚠️ Window detection error: {e}")
                    # On error, default to Work to avoid false positives
                    final_status = "Work"

            except Exception as e:
                print(f"⚠️ Window detection error: {e}")
                final_status = "Work"
        # For Break mode, final_status stays as STATUS ("Break")

        # Take screenshot
        ss = pyautogui.screenshot()
        path = f"temp_{EMP_ID}_{int(time.time())}.png"
        ss.save(path)

        with open(path, 'rb') as f:
            files = {'file': (path, f, 'image/png')}
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
    print("☕ Break Mode: Capturing single screenshot...")
    capture_and_upload()
    print("👋 Agent closing.")
    sys.exit(0)
else:
    # Work mode: capture immediately, then every 60 seconds
    capture_and_upload()
    while True:
        time.sleep(60)
        capture_and_upload()