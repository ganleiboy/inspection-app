# backend/models.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)

    inspections = relationship("InspectionSubmission", back_populates="user")

class InspectionItem(Base):
    __tablename__ = "inspection_items"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String)        # 例如："前期准备"、"数据采集"、"数据整理"、"数据上传和检查"
    step = Column(String)            # 例如："1.1"、"2.1" 等
    check_item = Column(String)      # 检查项目名称，如“场地整理”
    standard = Column(String)        # 检查内容/标准，如“确保场地清洁，无杂物阻碍机器人或人工操作”
    remark = Column(String, nullable=True)

class InspectionSubmission(Base):
    __tablename__ = "inspection_submissions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date)

    user = relationship("User", back_populates="inspections")
    details = relationship("SubmissionDetail", back_populates="submission", cascade="all, delete-orphan")

class SubmissionDetail(Base):
    __tablename__ = "submission_details"
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("inspection_submissions.id"))
    inspection_item_id = Column(Integer, ForeignKey("inspection_items.id"))
    result = Column(String)  # “合格”或“不合格”
    remark = Column(String, nullable=True)

    submission = relationship("InspectionSubmission", back_populates="details")
    inspection_item = relationship("InspectionItem")