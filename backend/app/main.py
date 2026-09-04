from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from .database import Base, engine, get_db, SessionLocal
from .models import *
from .schemas import *
from .auth import *
from .matching_service import match, sim

Base.metadata.create_all(bind=engine)
# Auto-seed demo user
def seed_demo_user():
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "demo@student.com").first():
            demo = User(
                name="Demo Student",
                email="demo@student.com",
                password_hash=hash_password("Demo@123"),
                college="SRM Institute of Science and Technology",
                department="Computer Science",
                year="3rd",
                section="D"
            )
            db.add(demo)
            db.commit()
            print("✅ Demo user created.")
        else:
            print("✅ Demo user already exists.")
    finally:
        db.close()

seed_demo_user()
app = FastAPI(title="TeamBloom API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://intelligent-team-matching-system.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def user_dict(u): 
    return {"id": u.id, "name": u.name, "email": u.email, "college": u.college, "department": u.department, "year": u.year, "section": u.section}

def profile_dict(p): 
    return {
        "bio": p.bio, "skills": p.skills, "talents": p.talents, "interests": p.interests, 
        "experience": p.experience, "domain": p.domain,
        "linkedin": getattr(p, 'linkedin', ''), "github": getattr(p, 'github', ''), "portfolio": getattr(p, 'portfolio', '')
    }

@app.post("/api/auth/register")
def register(x: Register, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == x.email).first(): 
        raise HTTPException(400, "Email already registered")
    u = User(name=x.name, email=x.email, password_hash=hash_password(x.password), college=x.college, department=x.department, year=x.year, section=x.section)
    db.add(u)
    db.commit()
    db.refresh(u)
    db.add(StudentProfile(user_id=u.id))
    db.commit()
    return {"access_token": token(u), "user": user_dict(u)}

@app.post("/api/auth/login")
def login(x: Login, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email == x.email).first()
    if not u or not verify_password(x.password, u.password_hash): 
        raise HTTPException(401, "Invalid email or password")
    return {"access_token": token(u), "user": user_dict(u)}

@app.get("/api/auth/me")
def me(u=Depends(current_user)): 
    return user_dict(u)

@app.get("/api/profile")
def get_profile(u=Depends(current_user), db: Session = Depends(get_db)):
    p = db.query(StudentProfile).filter_by(user_id=u.id).first() or StudentProfile(user_id=u.id)
    return {**user_dict(u), **profile_dict(p)}

@app.put("/api/profile")
def update_profile(x: ProfileIn, u=Depends(current_user), db: Session = Depends(get_db)):
    p = db.query(StudentProfile).filter_by(user_id=u.id).first()
    if not p:
        p = StudentProfile(user_id=u.id)
        db.add(p)
    
    # Safely update User table details
    if x.name is not None: u.name = x.name
    if x.college is not None: u.college = x.college
    if x.section is not None: u.section = x.section
    
    # Safely update Profile table details
    p.domain = x.domain
    p.skills = x.skills
    p.talents = x.talents
    p.linkedin = x.linkedin
    p.github = x.github
    p.portfolio = x.portfolio
    p.bio = x.bio
    
    db.commit()
    return {**user_dict(u), **profile_dict(p)}

@app.get("/api/dashboard/stats")
def dashboard_stats(u: User = Depends(current_user), db: Session = Depends(get_db)):
    return {"team_matches": 0, "avg_match": 0, "active_projects": 0, "new_requests": 0}

@app.get("/api/recommendations")
def get_recommendations(u: User = Depends(current_user), db: Session = Depends(get_db)):
    my_prof = db.query(StudentProfile).filter_by(user_id=u.id).first()
    students = db.query(User).filter(User.id != u.id).all()
    results = []
    for s in students:
        p = db.query(StudentProfile).filter_by(user_id=s.id).first()
        if p:
            score = 0 # Replaced the 92 dummy score with 0
            results.append({"id": s.id, "name": s.name, "role": p.domain or "Student", "match_score": score, "skills": p.skills})
    return sorted(results, key=lambda k: k["match_score"], reverse=True)

@app.get("/api/teams")
def get_teams(u: User = Depends(current_user), db: Session = Depends(get_db)):
    projects = db.query(Project).filter(or_(Project.owner_id == u.id, Project.status == "Active")).all()
    return [{"id": p.id, "name": f"{p.title} Team", "members_count": p.team_size, "category": p.domain, "status": p.status} for p in projects]

@app.get("/api/projects")
def projects(u=Depends(current_user), db: Session = Depends(get_db)): 
    return db.query(Project).all()

@app.post("/api/projects")
def create_project(x: ProjectIn, u=Depends(current_user), db: Session = Depends(get_db)):
    p = Project(owner_id=u.id, **x.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p.__dict__

@app.post("/api/requests")
def request(x: RequestIn, u=Depends(current_user), db: Session = Depends(get_db)):
    if x.receiver_id == u.id: raise HTTPException(400, "Cannot request yourself")
    r = TeamRequest(sender_id=u.id, receiver_id=x.receiver_id, project_id=x.project_id)
    db.add(r)
    db.commit()
    return {"message": "Request sent"}

@app.get("/api/messages")
def get_messages(u: User = Depends(current_user), db: Session = Depends(get_db)):
    return []

@app.get("/api/notifications")
def get_notifications(u: User = Depends(current_user), db: Session = Depends(get_db)):
    return []

@app.get("/api/settings")
def get_settings(u: User = Depends(current_user)):
    return {"dark_mode": u.dark_mode, "notifications_enabled": u.notifications_enabled, "ai_recommendations_enabled": u.ai_recommendations_enabled}

@app.put("/api/settings")
def update_settings(x: SettingsIn, u: User = Depends(current_user), db: Session = Depends(get_db)):
    if x.dark_mode is not None: u.dark_mode = x.dark_mode
    if x.notifications_enabled is not None: u.notifications_enabled = x.notifications_enabled
    if x.ai_recommendations_enabled is not None: u.ai_recommendations_enabled = x.ai_recommendations_enabled
    db.commit()
    return {"message": "Settings updated"}