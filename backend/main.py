from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text
import os, time, shutil, subprocess
from datetime import datetime
from pydantic import BaseModel

# Internal Imports
from database import SessionLocal, engine, ScreenshotLog, Employee, init_db
from analyst_service import get_analyst_response, _fetch_analytics
from dotenv import load_dotenv
load_dotenv()  
# Initialize Database Tables
init_db()

app = FastAPI()

# ✅ Add this line AFTER app = FastAPI()
# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class ChatQuery(BaseModel):
    prompt: str

# --- Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Global variable to track the active monitoring process
current_agent = None
GROQ_KEY = os.getenv("GROQ_API_KEY")
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOT_DIR = os.path.join(BASE_DIR, "screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

# ✅ Add this line AFTER app = FastAPI()
app.mount("/screenshots", StaticFiles(directory=SCREENSHOT_DIR), name="screenshots")

GROQ_KEY = os.getenv("GROQ_API_KEY") 
# ─── 1. AI ANALYST ROUTE ──────────────────────────────────────────

@app.post("/ask-analyst")
async def ask_analyst(data: ChatQuery, db: Session = Depends(get_db)):
    try:
        answer = get_analyst_response(data.prompt, db)   # ← pass db here
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# ─── 2. EMPLOYEE MANAGEMENT ─────────────────────────────────────

@app.delete("/delete-employee/{emp_id}")
async def delete_employee(emp_id: str, db: Session = Depends(get_db)):
    try:
        # IMPORTANT: We must search by the custom string 'employee_id' 
        # because that is what the Frontend is sending ('28' or 'EMP_28')
        employee = db.query(Employee).filter(Employee.employee_id == emp_id).first()
        
        if not employee:
            # This is why you saw the 404 in your logs
            print(f"Delete Error: Employee {emp_id} not found in DB")
            raise HTTPException(status_code=404, detail="Employee not found")
        
        # Delete related logs first to avoid Foreign Key errors
        db.query(ScreenshotLog).filter(ScreenshotLog.employee_id == emp_id).delete()
        
        db.delete(employee)
        db.commit()
        return {"message": f"Employee {emp_id} deleted."}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        print(f"System Delete Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/get-employees")
def get_emps(db: Session = Depends(get_db)):
    return db.query(Employee).all()

@app.post("/add-employee")
def add_emp(emp: dict, db: Session = Depends(get_db)):
    # Check if ID already exists
    existing = db.query(Employee).filter(Employee.employee_id == emp['id']).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID already exists")
        
    new_emp = Employee(name=emp['name'], employee_id=emp['id'], department=emp['dept'])
    db.add(new_emp)
    db.commit()
    return {"message": "Saved"}

# ─── 3. SYSTEM CAPTURE AUTOMATION ──────────────────────────────

@app.post("/trigger-system-capture")
async def trigger_capture(data: dict):
    global current_agent
    action = data.get("action")
    emp_id = data.get("employee_id", "UNKNOWN")
    status = data.get("status", "Work")

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    agent_path = os.path.join(base_dir, "client", "agent.py")

    if action == "start":
        if current_agent and current_agent.poll() is None:
            current_agent.terminate()
        
        try:
            # Ensure the agent.py path exists before running
            if not os.path.exists(agent_path):
                return {"status": "error", "message": f"agent.py not found at {agent_path}"}

            current_agent = subprocess.Popen(["python", agent_path, emp_id, status])
            return {"status": "success", "message": f"Agent started for {emp_id}"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    elif action == "stop":
        if current_agent:
            current_agent.terminate()
            current_agent = None
            return {"status": "success", "message": "Agent stopped"}
        return {"status": "error", "message": "No agent is running"}

# ─── 4. AUTH & MONITORING ───────────────────────────────────────

@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    if data['id'] == 'admin' and data['password'] == 'basma708':
        return {"role": "admin", "name": "Administrator"}
    
    emp = db.query(Employee).filter(Employee.employee_id == data['id']).first()
    if emp:
        return {"role": "employee", "id": emp.employee_id, "name": emp.name}
    raise HTTPException(status_code=401, detail="Invalid Credentials")

@app.post("/upload-screenshot")
async def upload(
    employee_id: str = Form(...),
    status: str = Form("work"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_name = f"EMP_{employee_id}_{int(time.time())}.png" 
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
    return {"status": "success", "saved_to": path}

@app.get("/check-db")
async def check_db(employee_id: str = None, start_date: str = None, end_date: str = None, db: Session = Depends(get_db)):
    query = db.query(ScreenshotLog)

    if employee_id and employee_id.strip():
        query = query.filter(ScreenshotLog.employee_id.ilike(f"%{employee_id.strip()}%"))

    if start_date:
        query = query.filter(ScreenshotLog.timestamp >= start_date)

    if end_date:
        query = query.filter(ScreenshotLog.timestamp <= f"{end_date} 23:59:59")

    results = query.order_by(ScreenshotLog.timestamp.desc()).all()
    return {"data": results}

@app.get("/get-last-employee")
async def get_last_employee(db: Session = Depends(get_db)):
    last = db.query(ScreenshotLog).order_by(ScreenshotLog.timestamp.desc()).first()
    if last:
        emp = db.query(Employee).filter(Employee.employee_id == last.employee_id).first()
        if emp:
            return {"employee_id": emp.employee_id, "name": emp.name, "department": emp.department}
        return {"employee_id": last.employee_id, "name": None, "department": None}
    return {"employee_id": None, "name": None, "department": None}