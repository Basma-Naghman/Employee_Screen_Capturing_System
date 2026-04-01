# Database Setup & Configuration Guide

## Environment Variables (.env file)

The project uses environment variables to manage sensitive configuration. All credentials are stored in `.env` file which is **not committed to version control**.

### Setting up .env file

1. Copy the example file:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` with your actual values:
   ```ini
   DATABASE_URL=postgresql://postgres:basma708@localhost:5432/monitor_db
   HOST=0.0.0.0
   PORT=8000
   ADMIN_USER=admin
   ADMIN_PASSWORD=admin123
   ```

### Database Connection Details

- **Database URL Format**: `postgresql://user:password@host:port/database`
- **Default URL** (from database.py): `postgresql://postgres:basma708@localhost:5432/monitor_db`
- **Environment Variable**: `DATABASE_URL`

### How It Works

1. `database.py` loads `.env` file using `python-dotenv`
2. `config.py` provides a centralized configuration module
3. `main.py` uses environment variables for server configuration
4. All other Python files can import from `config` or `database` module

### Files Structure

```
backend/
├── .env              ← Your actual credentials (NOT in git)
├── .env.example      ← Template for new developers
├── config.py         ← Centralized configuration module
├── database.py       ← Database connection (loads .env)
├── main.py           ← FastAPI app (uses config)
├── requirements.txt  ← Python dependencies (includes python-dotenv)
└── ...
```

### Using Configuration in Other Files

**Option 1: Direct from database.py**
```python
from database import SessionLocal, Base
db = SessionLocal()
```

**Option 2: Using config.py (recommended)**
```python
from config import DATABASE_URL, ADMIN_USER
from database import SessionLocal

db = SessionLocal()
```

### Important Notes

1. **Never commit .env file** - Use `.gitignore` (already configured)
2. **Always use .env.example** - For documenting required variables
3. **Change admin password** - Update `ADMIN_PASSWORD` in `.env` for security
4. **Update DATABASE_URL** - If your PostgreSQL is on a different host/port

### Common Configuration Options

```ini
# PostgreSQL local
DATABASE_URL=postgresql://postgres:password@localhost:5432/monitor_db

# PostgreSQL on network
DATABASE_URL=postgresql://postgres:password@192.168.1.100:5432/monitor_db

# Server binding
HOST=0.0.0.0          # All interfaces
HOST=127.0.0.1        # Local only
HOST=192.168.1.9      # Specific IP
PORT=8000

# CORS (if needed)
ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.9:3000
```

### Running the Server

```bash
# With default config
uvicorn main:app --reload

# With specific settings from .env
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# From environment variables (if .env is set)
python -c "from main import app; import uvicorn; uvicorn.run(app, host='0.0.0.0', port=8000)"
```

### Troubleshooting

- **Error: Module not found 'dotenv'**
  - Install: `pip install python-dotenv`

- **Database connection failed**
  - Check `DATABASE_URL` in `.env`
  - Verify PostgreSQL is running
  - Check credentials and permissions

- **Admin login fails**
  - Verify `ADMIN_PASSWORD` in `.env`
  - Check admin record in `admins` table
  - Update DB: `UPDATE admins SET password='new_pass' WHERE username='admin';`
