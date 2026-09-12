from pydantic import BaseModel
from datetime import date, datetime


# ---------------- USERS ----------------

class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


# ---------------- PROJECTS ----------------

class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    status: str = "PLANNING"
    start_date: date | None = None
    end_date: date | None = None
    created_by: int


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str | None
    status: str
    start_date: date | None
    end_date: date | None
    created_by: int

    class Config:
        from_attributes = True


# ---------------- REQUIREMENTS ----------------

class RequirementCreate(BaseModel):
    requirement_text: str


class RequirementResponse(BaseModel):
    id: int
    project_id: int
    requirement_text: str
    analysis_result: str | None
    created_at: datetime | None

    class Config:
        from_attributes = True


# ---------------- TASKS ----------------

class TaskCreate(BaseModel):
    requirement_id: int
    sprint_id: int | None = None
    assigned_to: int | None = None
    title: str
    description: str | None = None
    priority: str = "MEDIUM"
    status: str = "TODO"
    due_date: date | None = None


class TaskUpdate(BaseModel):
    sprint_id: int | None = None
    assigned_to: int | None = None
    title: str | None = None
    description: str | None = None
    priority: str | None = None
    status: str | None = None
    due_date: date | None = None


class TaskResponse(BaseModel):
    id: int
    project_id: int
    requirement_id: int
    sprint_id: int | None
    assigned_to: int | None
    title: str
    description: str | None
    priority: str
    status: str
    due_date: date | None
    created_at: datetime | None

    class Config:
        from_attributes = True
# ---------------- SPRINTS ----------------

class SprintCreate(BaseModel):
    name: str
    goal: str | None = None
    start_date: date
    end_date: date
    status: str = "PLANNED"


class SprintUpdate(BaseModel):
    name: str | None = None
    goal: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str | None = None


class SprintResponse(BaseModel):
    id: int
    project_id: int
    name: str
    goal: str | None
    start_date: date
    end_date: date
    status: str
    created_at: datetime | None

    class Config:
        from_attributes = True
# ---------------- PROJECT MEMBERS ----------------

class ProjectMemberCreate(BaseModel):
    user_id: int
    role: str = "member"


class ProjectMemberResponse(BaseModel):
    project_id: int
    user_id: int
    role: str
    joined_at: datetime | None

    class Config:
        from_attributes = True
# ---------------- COMMENTS ----------------

class CommentCreate(BaseModel):
    user_id: int
    content: str


class CommentResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    content: str
    created_at: datetime | None

    class Config:
        from_attributes = True
# ---------------- RISKS ----------------

class RiskCreate(BaseModel):
    task_id: int | None = None
    risk_level: str = "MEDIUM"
    description: str
    recommendation: str | None = None


class RiskResponse(BaseModel):
    id: int
    project_id: int
    task_id: int | None
    risk_level: str
    description: str
    recommendation: str | None
    created_at: datetime | None

    class Config:
        from_attributes = True
# ---------------- LOGIN ----------------

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str