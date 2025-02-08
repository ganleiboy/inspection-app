# backend/auth.py
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

from models import User
from database import SessionLocal

# 注意：生产环境请使用环境变量管理 secret_key
SECRET_KEY = "e2806388f9244e899eeea5121a0b9a0f1f0d6b13ff8f4e3b8bd1ed714a0dddd9"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
         expire = datetime.utcnow() + expires_delta
    else:
         expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user(db, username: str):
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user:
         return False
    if not verify_password(password, user.hashed_password):
         return False
    return user

def get_db():
    db = SessionLocal()
    try:
         yield db
    finally:
         db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    credentials_exception = HTTPException(
         status_code=status.HTTP_401_UNAUTHORIZED,
         detail="无法验证的凭证",
         headers={"WWW-Authenticate": "Bearer"},
    )
    try:
         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
         username: str = payload.get("sub")
         if username is None:
              raise credentials_exception
    except JWTError:
         raise credentials_exception
    user = get_user(db, username=username)
    if user is None:
         raise credentials_exception
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    return current_user

def get_current_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
         raise HTTPException(status_code=403, detail="无管理员权限")
    return current_user