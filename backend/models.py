from sqlalchemy import Column, Integer, String, Text, Date, TIMESTAMP
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="member")
    created_at = Column(TIMESTAMP, nullable=True)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="PLANNING")
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    created_by = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP, nullable=True)
class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=False)
    requirement_text = Column(Text, nullable=False)
    analysis_result = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, nullable=True)
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=False)
    requirement_id = Column(Integer, nullable=False)
    sprint_id = Column(Integer, nullable=True)
    assigned_to = Column(Integer, nullable=True)

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(20), nullable=False, default="MEDIUM")
    status = Column(String(30), nullable=False, default="TODO")

    due_date = Column(Date, nullable=True)
    created_at = Column(TIMESTAMP, nullable=True)
class Sprint(Base):
    __tablename__ = "sprints"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=False)

    name = Column(String(100), nullable=False)
    goal = Column(Text, nullable=True)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    status = Column(String(30), nullable=False, default="PLANNED")
    created_at = Column(TIMESTAMP, nullable=True)
class ProjectMember(Base):
    __tablename__ = "project_members"

    project_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, primary_key=True)
    role = Column(String(30), nullable=False, default="member")
    joined_at = Column(TIMESTAMP, nullable=True)

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, nullable=True)
class Risk(Base):
    __tablename__ = "risks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=False)
    task_id = Column(Integer, nullable=True)
    risk_level = Column(String(20), nullable=False, default="MEDIUM")
    description = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, nullable=True)