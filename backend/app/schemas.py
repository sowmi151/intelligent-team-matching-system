from pydantic import BaseModel, EmailStr
from typing import Optional

class Register(BaseModel):
    name: Optional[str] = ""
    first_name: Optional[str] = ""
    nickname: Optional[str] = ""
    dob: Optional[str] = ""
    email: EmailStr
    password: str
    college: Optional[str] = ""
    department: Optional[str] = ""
    year: Optional[str] = ""
    section: Optional[str] = ""
    role: str = "Student"

class Login(BaseModel):
    email: EmailStr
    password: str

class ProfileIn(BaseModel):
    name: Optional[str] = None
    college: Optional[str] = None
    section: Optional[str] = None
    domain: str = ""
    skills: str = ""
    talents: str = ""
    linkedin: str = ""
    github: str = ""
    portfolio: str = ""
    bio: str = ""

class ProjectIn(BaseModel):
    title: str
    description: str = ""
    domain: str = ""
    required_skills: str = ""
    required_talents: str = ""
    required_experience: str = ""
    team_size: int = 4
    duration: str = ""
    requirements: str = ""
    progress: int = 0
    status: str = "Active"

class RequestIn(BaseModel):
    receiver_id: int
    project_id: Optional[int] = None

class MessageIn(BaseModel):
    receiver_id: int
    content: str

class SettingsIn(BaseModel):
    dark_mode: Optional[bool] = None
    notifications_enabled: Optional[bool] = None
    ai_recommendations_enabled: Optional[bool] = None