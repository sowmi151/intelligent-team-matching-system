from fastapi import Depends,HTTPException,status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt,JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from .database import get_db
from .models import User
SECRET="local-dev-secret-change-me"; oauth=OAuth2PasswordBearer(tokenUrl="/api/auth/login"); pwd=CryptContext(schemes=["bcrypt"],deprecated="auto")
def hash_password(x): return pwd.hash(x)
def verify_password(x,y): return pwd.verify(x,y)
def token(u): return jwt.encode({"sub":str(u.id)},SECRET,algorithm="HS256")
def current_user(t:str=Depends(oauth),db:Session=Depends(get_db)):
 try: uid=int(jwt.decode(t,SECRET,algorithms=["HS256"])["sub"])
 except (JWTError,KeyError,ValueError): raise HTTPException(401,"Invalid or expired token")
 u=db.get(User,uid)
 if not u: raise HTTPException(401,"User not found")
 return u
