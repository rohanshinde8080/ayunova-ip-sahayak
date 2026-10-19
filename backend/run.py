import uvicorn
import os
import sys
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    # Ensure UTF-8 output on Windows terminal
    if sys.platform.startswith('win'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except AttributeError:
            pass

    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("ENVIRONMENT", "development") == "development"
    
    print(f"[AYUNOVA] Starting IP-SAKTI Sahayak Backend on http://{host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=reload)
