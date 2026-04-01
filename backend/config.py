"""
Configuration module for the Employee Monitoring System.
Loads settings from .env file and provides defaults.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:basma708@localhost:5432/monitor_db"
)

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Admin Configuration
ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# Frontend URL (for reference)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Screenshot Configuration
SCREENSHOT_DIR = os.getenv("SCREENSHOT_DIR", "screenshots")
