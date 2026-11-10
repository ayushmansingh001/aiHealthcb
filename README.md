# 🏥 AI Health Assistant – RAG-Based Chatbot

A modern, intelligent AI healthcare assistant powered by Retrieval-Augmented Generation (RAG), built with React + FastAPI.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Google Gemini API key ([Get one free](https://aistudio.google.com/app/apikey))

---

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start backend
python main.py
# Backend runs at http://localhost:8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
# Frontend runs at http://localhost:5173
```

### 3. Open the App

Navigate to **http://localhost:5173** in your browser.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 AI Health Chatbot | Ask any health-related question |
| 📄 RAG-Based Responses | Answers grounded in medical documents |
| 📁 PDF Upload | Upload & query your medical documents |
| 🔍 Smart Search | Semantic search over document content |
| 📚 Source References | See which document powered each answer |
| 💬 Chat History | Revisit all previous conversations |
| 🌐 Multilingual | English & Hindi support |
| 🎤 Voice Input | Speak your questions |
| 💡 Suggested Questions | Common health queries to get started |
| 📱 Responsive Design | Works on desktop, tablet & mobile |

---

## 🏗️ Architecture

```
User → React Frontend → FastAPI Backend → Gemini LLM
                                ↕
                          ChromaDB (Vector Store)
                          SQLite (Chat History)
                          Uploaded PDFs
```

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Zustand
- **Backend**: FastAPI, Python 3.10+
- **AI/ML**: Google Gemini Pro, Sentence Transformers
- **Vector DB**: ChromaDB
- **Database**: SQLite (async)
- **PDF Processing**: PyMuPDF

---

## 📂 Project Structure

```
AI Health Chatbot/
├── backend/           # FastAPI Python backend
│   ├── main.py
│   ├── config.py
│   ├── routers/       # API route handlers
│   ├── services/      # Business logic (RAG, LLM, PDF)
│   ├── models/        # Pydantic data models
│   └── database/      # DB & vector store setup
└── frontend/          # React TypeScript frontend
    └── src/
        ├── components/ # UI components
        ├── pages/      # Page-level components
        ├── hooks/      # Custom React hooks
        ├── store/      # Zustand state management
        └── services/   # API client
```

---

## ⚙️ Configuration

Edit `backend/.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Google Gemini API key | (required) |
| `DATABASE_URL` | SQLite database path | `sqlite+aiosqlite:///./health_assistant.db` |
| `CHROMA_PERSIST_DIR` | ChromaDB storage path | `./data/chroma_db` |
| `UPLOAD_DIR` | PDF upload directory | `./data/uploads` |
| `MAX_FILE_SIZE_MB` | Max PDF size | `50` |

---

## ⚠️ Medical Disclaimer

> This AI Health Assistant is for **informational purposes only**. It is **NOT** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions. In case of emergency, contact emergency services immediately.

---

## 🔒 Privacy

- All data is stored locally on your machine
- No data is sent to external servers except the Gemini API for response generation
- PDF contents are stored locally in ChromaDB

---

## 📝 License

MIT License — Free to use and modify.
