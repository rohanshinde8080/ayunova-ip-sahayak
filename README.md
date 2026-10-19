# 🌿 AYUNOVA (IP-SAKTI Sahayak)
> **Smart India Hackathon 2026 | PS SIH26045 | Ministry of Ayush & AIIA**
> **AI Copilot for Ayurveda IP & Regulatory Guidance**

---

## 📂 Project Structure

```
ip-sakti-sahayak-main/
│
├── 📁 frontend/              # ⚛️ React 18 + Vite + Tailwind CSS + TypeScript
│   ├── 📁 src/
│   │   ├── 📁 components/    # Reusable UI components (Sidebar, Topbar, Citations)
│   │   ├── 📁 pages/         # 11 Main Views (Assistant, Classification, IP Advisor, etc.)
│   │   ├── 📁 services/      # Frontend API & RAG integration layer
│   │   ├── 📁 context/       # Global App state & Multi-language support
│   │   ├── 📁 router/        # AppRouter & Navigation
│   │   └── 📁 types/         # TypeScript Interfaces
│   ├── 📄 vite.config.ts     # Vite Config with /api proxy to FastAPI (port 8000)
│   └── 📄 package.json       # Frontend dependencies & scripts
│
├── 📁 backend/               # 🐍 Python FastAPI + RAG Knowledge Engine
│   ├── 📁 app/
│   │   ├── 📁 api/           # API routes (/chat, /classify, /ip-advisor, /sources, /admin)
│   │   ├── 📁 core/          # App config & CORS
│   │   ├── 📁 data/          # TKDL, Patents Act 3(p), 3(e), BDA, WIPO databases
│   │   ├── 📁 models/        # Pydantic schemas
│   │   ├── 📁 services/      # Ayush RAG processing pipeline & LLM connectors
│   │   └── 📄 main.py        # FastAPI app entry
│   ├── 📄 run.py             # Uvicorn server entry (Windows UTF-8 compatible)
│   ├── 📄 requirements.txt   # Backend dependencies (fastapi, uvicorn, pydantic, etc.)
│   └── 📄 .env               # Environment configuration
│
├── 📄 package.json           # 🚀 Root orchestrator scripts
├── 🚀 start_all.bat          # 1-Click launcher for both Frontend & Backend
├── 🚀 start_backend.bat      # 1-Click launcher for Backend only
└── 🚀 start_frontend.bat     # 1-Click launcher for Frontend only
```

---

## ⚡ Quick Start

### 1️⃣ Run Everything with 1 Click (Windows):
Double-click on **`start_all.bat`**.

---

### 2️⃣ Run via Command Line (Terminal):
```powershell
# Run Frontend (http://localhost:5173):
npm run dev:frontend

# Run Backend (http://localhost:8000):
npm run dev:backend
```

---

## 🌐 Active Endpoints:
* **Frontend Web App:** [http://localhost:5173/](http://localhost:5173/)
* **Backend Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Backend Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)
