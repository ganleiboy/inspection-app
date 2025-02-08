# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
import uvicorn

from database import engine, Base
import models
from models import User, InspectionItem, InspectionSubmission, SubmissionDetail
from auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_current_active_user,
    get_current_admin,
    get_db
)
from pydantic import BaseModel

# 创建数据库表（首次运行时会自动生成数据表）
Base.metadata.create_all(bind=engine)

app = FastAPI(title="点检表系统")

# 跨域中间件配置：允许前端 (例如：http://192.168.169.12:3000) 访问 API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.169.12:3000"],  # 或者使用 ["*"] 开发测试时允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 增加根路径，返回欢迎信息和接口文档入口，避免 GET "/" 返回 404
@app.get("/")
def read_root():
    return {"message": "欢迎使用点检表系统 API，请访问 /docs 获取接口文档"}

# 在应用启动时自动创建默认管理员账号（仅用于测试）
@app.on_event("startup")
def create_default_admin():
    # 通过 get_db 获取数据库会话
    db = next(get_db())
    existing_admin = db.query(User).filter(User.username == "admin").first()
    if not existing_admin:
         new_admin = User(
             username="admin",
             hashed_password=get_password_hash("admin123"),  # 默认管理员密码为 admin123
             is_admin=True
         )
         db.add(new_admin)
         db.commit()
         print("默认管理员账号已创建：用户名：admin, 密码：admin123")

# ------------------ 定义 Pydantic 模型 ------------------

class UserCreate(BaseModel):
    username: str
    password: str
    is_admin: bool = False

class UserOut(BaseModel):
    id: int
    username: str
    is_admin: bool
    class Config:
         orm_mode = True

class InspectionItemCreate(BaseModel):
    category: str
    step: str
    check_item: str
    standard: str
    remark: str = None

class InspectionItemUpdate(BaseModel):
    category: str = None
    step: str = None
    check_item: str = None
    standard: str = None
    remark: str = None

class InspectionItemOut(BaseModel):
    id: int
    category: str
    step: str
    check_item: str
    standard: str
    remark: str = None
    class Config:
         orm_mode = True

class SubmissionDetailItem(BaseModel):
    inspection_item_id: int
    result: str
    remark: str = None

class InspectionSubmissionCreate(BaseModel):
    date: date
    details: List[SubmissionDetailItem]

class InspectionSubmissionOut(BaseModel):
    id: int
    user_id: int
    date: date
    details: List[SubmissionDetailItem]
    class Config:
         orm_mode = True

# ------------------ 登录接口 ------------------

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                             detail="用户名或密码错误")
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# ---------- 新增：用户信息接口，用于前端验证当前用户是否为管理员  ----------
@app.get("/user-info")
def get_user_info(current_user: User = Depends(get_current_active_user)):
    role = "admin" if current_user.is_admin else "user"
    return {"id": current_user.id, "username": current_user.username, "role": role}

# ------------------ 用户管理（管理员） ------------------

@app.get("/admin/users", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    users = db.query(User).all()
    return users

@app.post("/admin/users", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
         raise HTTPException(status_code=400, detail="用户名已存在")
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password, is_admin=user.is_admin)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
         raise HTTPException(status_code=404, detail="未找到该用户")
    db.delete(user)
    db.commit()
    return {"detail": "已删除用户"}

# ------------------ 点检项目管理 ------------------

@app.get("/inspection-items", response_model=List[InspectionItemOut])
def get_inspection_items(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    items = db.query(InspectionItem).all()
    return items

@app.post("/admin/inspection-items", response_model=InspectionItemOut)
def add_inspection_item(item: InspectionItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    new_item = InspectionItem(**item.dict())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.put("/admin/inspection-items/{item_id}", response_model=InspectionItemOut)
def update_inspection_item(item_id: int, item: InspectionItemUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    db_item = db.query(InspectionItem).filter(InspectionItem.id == item_id).first()
    if not db_item:
         raise HTTPException(status_code=404, detail="未找到点检项目")
    update_data = item.dict(exclude_unset=True)
    for key, value in update_data.items():
         setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/admin/inspection-items/{item_id}")
def delete_inspection_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    db_item = db.query(InspectionItem).filter(InspectionItem.id == item_id).first()
    if not db_item:
         raise HTTPException(status_code=404, detail="未找到点检项目")
    db.delete(db_item)
    db.commit()
    return {"detail": "已删除点检项目"}

# ------------------ 点检数据提交 ------------------

@app.post("/submit-inspection")
def submit_inspection(submission: InspectionSubmissionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    new_submission = InspectionSubmission(user_id=current_user.id, date=submission.date)
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)
    for detail in submission.details:
         submission_detail = SubmissionDetail(
              submission_id=new_submission.id,
              inspection_item_id=detail.inspection_item_id,
              result=detail.result,
              remark=detail.remark
         )
         db.add(submission_detail)
    db.commit()
    return {"detail": "点检数据提交成功"}

@app.get("/my-inspections", response_model=List[InspectionSubmissionOut])
def get_my_inspections(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    submissions = db.query(InspectionSubmission).filter(InspectionSubmission.user_id == current_user.id).all()
    result = []
    for submission in submissions:
         details = []
         for detail in submission.details:
              details.append({
                   "inspection_item_id": detail.inspection_item_id,
                   "result": detail.result,
                   "remark": detail.remark
              })
         result.append({
              "id": submission.id,
              "user_id": submission.user_id,
              "date": submission.date,
              "details": details
         })
    return result

# ------------------ 统计与 Excel 导出（管理员） ------------------

@app.get("/admin/statistics")
def get_statistics(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    from sqlalchemy import func
    stats = db.query(User.username, func.count(InspectionSubmission.id))\
              .join(InspectionSubmission)\
              .group_by(User.username).all()
    return [{"username": username, "inspection_count": count} for username, count in stats]

@app.get("/admin/export-excel")
def export_excel(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    import pandas as pd
    from io import BytesIO
    submissions = db.query(InspectionSubmission).all()
    data = []
    for submission in submissions:
         user = submission.user.username
         submission_date = submission.date
         for detail in submission.details:
              item = db.query(InspectionItem).filter(InspectionItem.id == detail.inspection_item_id).first()
              data.append({
                  "用户名": user,
                  "日期": submission_date,
                  "检查项目": item.check_item if item else "",
                  "标准": item.standard if item else "",
                  "结果": detail.result,
                  "备注": detail.remark
              })
    df = pd.DataFrame(data)
    output = BytesIO()
    df.to_excel(output, index=False)
    output.seek(0)
    from fastapi.responses import StreamingResponse
    headers = {"Content-Disposition": "attachment; filename=inspection_report.xlsx"}
    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers=headers)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)