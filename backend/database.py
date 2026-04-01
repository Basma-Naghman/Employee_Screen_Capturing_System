from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database Connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:basma708@localhost:5432/monitor_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# --- TABLE 1: Master Employee List ---
class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    employee_id = Column(String, unique=True, index=True) 
    department = Column(String)

    
# --- TABLE 3: Admin Credentials ---
class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    password = Column(String) # Ensure the password here matches your manual entry    
from datetime import datetime, timezone # Add timezone here

# ... other imports ...

from datetime import datetime, timezone

class ScreenshotLog(Base):
    __tablename__ = "screenshot_logs"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String)
    file_path = Column(String)
    # CHECK THIS LINE BELOW:
    category = Column(String)  # <--- If this says 'category', you cannot use 'status' in main.py
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    
def init_db():
    Base.metadata.create_all(bind=engine)