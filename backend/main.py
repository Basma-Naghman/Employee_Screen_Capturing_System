from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os, time, shutil, subprocess
from analyst_service import get_analyst_response
from datetime import datetime
from database import SessionLocal, engine, ScreenshotLog, Employee, init_db
# Make sure the name here matches what you use in db.query()
from database import ScreenshotLog# Initialize DB
init_db()

app = FastAPI()

# Global variable to track the active monitoring process
current_agent = None




# Add this block right after 'app = FastAPI()'
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all IPs (good for testing)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class ChatQuery(BaseModel):
    prompt: str

@app.post("/ask-analyst")
async def ask_analyst(data: ChatQuery):
    answer = get_analyst_response(data.prompt)
    return {"answer": answer}
SCREENSHOT_DIR = "screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)
app.mount("/screenshots", StaticFiles(directory=SCREENSHOT_DIR), name="screenshots")

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- 1. THE AUTOMATION ROUTE (The fix for your 404) ---
import subprocess

# Global variable to keep track of the running process
import subprocess
import os

# Variable to track the running agent
current_agent = None

@app.post("/trigger-system-capture")
async def trigger_capture(data: dict):
    global current_agent
    action = data.get("action")
    emp_id = data.get("employee_id", "UNKNOWN")
    status = data.get("status", "Work")

    # This logic correctly navigates your folders: 
    # From 'backend' -> UP to root -> DOWN to 'client' -> agent.py
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    agent_path = os.path.join(base_dir, "client", "agent.py")

    if action == "start":
        # Stop any existing agent first
        if current_agent and current_agent.poll() is None:
            current_agent.terminate()
        
        try:
            # Launch agent.py and pass the real Employee ID and Status
            current_agent = subprocess.Popen(["python", agent_path, emp_id, status])
            print(f"🚀 Started agent for {emp_id} at {agent_path}")
            return {"status": "success", "message": f"Agent started for {emp_id}"}
        except Exception as e:
            print(f"❌ Failed to start agent: {e}")
            return {"status": "error", "message": str(e)}

    elif action == "stop":
        if current_agent:
            current_agent.terminate()
            current_agent = None
            return {"status": "success", "message": "Agent stopped"}
        return {"status": "error", "message": "No agent is running"}

@app.post("/trigger-system-capture")
async def dummy_trigger():
    # Stops the 404 error from the React UI
    return {"status": "Automated mode active"}


@app.delete("/clear-guests")
def clear_guests(db: Session = Depends(get_db)):
    # Deletes every log where the ID is 'GUEST'
    db.query(ScreenshotLog).filter(ScreenshotLog.employee_id == "GUEST").delete()
    db.commit()
    return {"message": "All GUEST logs deleted"}        

# --- 2. AUTH & ADMIN ROUTES ---
@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    if data['id'] == 'admin' and data['password'] == 'basma708':
        return {"role": "admin", "name": "Administrator"}
    
    emp = db.query(Employee).filter(Employee.employee_id == data['id']).first()
    if emp:
        return {"role": "employee", "id": emp.employee_id, "name": emp.name}
    raise HTTPException(status_code=401, detail="Invalid Credentials")

@app.get("/get-employees")
def get_emps(db: Session = Depends(get_db)):
    return db.query(Employee).all()

@app.post("/add-employee")
def add_emp(emp: dict, db: Session = Depends(get_db)):
    new_emp = Employee(name=emp['name'], employee_id=emp['id'], department=emp['dept'])
    db.add(new_emp)
    db.commit()
    return {"message": "Saved"}

# --- 3. MONITORING ROUTES ---
@app.post("/upload-screenshot")
async def upload(
    employee_id: str = Form(...),
    status: str = Form("work"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_name = f"{employee_id}_{int(time.time())}.png"
    path = os.path.join(SCREENSHOT_DIR, file_name)
    
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_log = ScreenshotLog(
        employee_id=employee_id.upper(),
        file_path=file_name,
        category=status, 
        timestamp=datetime.now()
    )
    db.add(new_log)
    db.commit()
    return {"status": "success"}

@app.get("/check-db")
async def check_db(employee_id: str = None, start_date: str = None, end_date: str = None, db: Session = Depends(get_db)):
    query = db.query(ScreenshotLog)

    # Use .strip() to handle cases where the ID might be just whitespace
    if employee_id and employee_id.strip():
        query = query.filter(ScreenshotLog.employee_id.ilike(f"%{employee_id.strip()}%"))

    if start_date:
        # PostgreSQL/SQLite can compare strings if they are in YYYY-MM-DD format
        query = query.filter(ScreenshotLog.timestamp >= start_date)
    
    if end_date:
        # We add the time to ensure it includes screenshots from the end of that day
        query = query.filter(ScreenshotLog.timestamp <= f"{end_date} 23:59:59")

    results = query.order_by(ScreenshotLog.timestamp.desc()).all()
    return {"data": results}