# Intelligent Team Matching System

A complete local full-stack application based on the attached project specification. It uses FastAPI, SQLite, React/Vite and a backend scikit-learn TF-IDF cosine-similarity matching service.

## Features
- JWT registration/login and protected dashboard
- Student profile and completion score
- Project creation and project list
- Ranked recommendations with weighted score breakdown
- Matching and complementary skill explanations
- Team requests with accept/reject status
- Fictional seed data: 10 students and 5 projects

## Requirements
Install Python 3.10+ and Node.js 18+ on Windows.

## Windows setup
Open the extracted folder in VS Code and use two terminals.

### Backend terminal
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload
```
Backend: http://localhost:8000/docs

### Frontend terminal
```powershell
cd frontend
npm install
npm run dev
```
Open the URL shown by Vite, normally http://localhost:5173.

## Demo login
Email: `demo@student.com`
Password: `Demo@123`
All seeded accounts use the same password.

## Matching algorithm
`backend/app/matching_service.py` centralizes configurable weights: Skills 40%, interests 15%, experience 15%, talents 10%, domain 10%, complementary skills 10%. Skill and profile text are compared with `TfidfVectorizer` and `sklearn.metrics.pairwise.cosine_similarity`. Direct matches, missing requirements and complementary skills are returned to the UI.

## Project structure
```text
intelligent-team-matching-system/
  backend/app/{main.py,database.py,models.py,schemas.py,auth.py,matching_service.py}
  backend/seed.py
  frontend/src/main.jsx
  frontend/src/index.css
  README.md
  .env.example
```

## Troubleshooting
- If the browser reports a network error, confirm `uvicorn` is running on port 8000.
- If the database needs resetting, stop the backend, delete `backend/team_matching.db`, then run `python seed.py`.
- The application uses local TF-IDF matching and does not require paid APIs or internet access after dependencies are installed.
