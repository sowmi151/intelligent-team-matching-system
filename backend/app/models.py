from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    college = Column(String, default="")
    department = Column(String, default="")
    year = Column(String, default="")
    section = Column(String, default="")
    role = Column(String, default="Student")
    dark_mode = Column(Boolean, default=False)
    notifications_enabled = Column(Boolean, default=True)
    ai_recommendations_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

class StudentProfile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    bio = Column(Text, default="")
    skills = Column(Text, default="")
    talents = Column(Text, default="")
    interests = Column(Text, default="")
    experience = Column(Text, default="")
    availability = Column(String, default="Flexible")
    preferences = Column(Text, default="")
    domain = Column(String, default="")
    # NEW LINK COLUMNS
    linkedin = Column(String, default="")
    github = Column(String, default="")
    portfolio = Column(String, default="")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    domain = Column(String, default="")
    required_skills = Column(Text, default="")
    required_talents = Column(Text, default="")
    required_experience = Column(Text, default="")
    team_size = Column(Integer, default=4)
    duration = Column(String, default="")
    requirements = Column(Text, default="")
    progress = Column(Integer, default=0)
    status = Column(String, default="Active")
    created_at = Column(DateTime, server_default=func.now())

class TeamRequest(Base):
    __tablename__ = "team_requests"
    id = Column(Integer, primary_key=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    status = Column(String, default="Pending")
    created_at = Column(DateTime, server_default=func.now())

class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    partner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    compatibility_score = Column(Integer, default=0)
    skill_score = Column(Integer, default=0)
    interest_score = Column(Integer, default=0)
    experience_score = Column(Integer, default=0)
    talent_score = Column(Integer, default=0)
    domain_score = Column(Integer, default=0)
    complementary_score = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(String, default="")
    created_at = Column(DateTime, server_default=func.now())