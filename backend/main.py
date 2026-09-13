from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal
from models import (
    User,
    Project,
    Requirement,
    Task,
    Sprint,
    ProjectMember,
    Comment,
    Risk
)

from schemas import (
    UserCreate,
    UserResponse,
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    RequirementCreate,
    RequirementResponse,
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    SprintCreate,
    SprintUpdate,
    SprintResponse,
    ProjectMemberCreate,
    ProjectMemberResponse,
    CommentCreate,
    CommentResponse,
    RiskCreate,
    RiskResponse,
    LoginRequest,
    LoginResponse
)

from security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

from ai_service import analyze_requirement


app = FastAPI()


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-project-management-frontend-pjcg.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATABASE
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

def require_manager(
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "manager":
        raise HTTPException(
            status_code=403,
            detail="Manager access required"
        )

    return current_user


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def home():
    return {
        "message": "AI Project Management Platform API"
    }


# ============================================================
# USERS
# ============================================================

@app.get(
    "/users",
    response_model=list[UserResponse]
)
def get_users(
    db: Session = Depends(get_db)
):
    users = db.query(User).all()

    return users


@app.post(
    "/users",
    response_model=UserResponse
)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = hash_password(
        user_data.password
    )

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password,
        role="member"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ============================================================
# LOGIN
# ============================================================

@app.post(
    "/login",
    response_model=LoginResponse
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == login_data.email
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        login_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # --------------------------------------------------------
    # ROLE CHECK
    # --------------------------------------------------------

    if user.role != login_data.role:
        raise HTTPException(
            status_code=403,
            detail=(
                f"This account is registered as a "
                f"{user.role}, not a {login_data.role}."
            )
        )

    # --------------------------------------------------------
    # CREATE JWT
    # --------------------------------------------------------

    access_token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    })

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ============================================================
# PROJECTS
# ============================================================

@app.post(
    "/projects",
    response_model=ProjectResponse
)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manager)
):

    new_project = Project(
        name=project_data.name,
        description=project_data.description,
        status=project_data.status,
        start_date=project_data.start_date,
        end_date=project_data.end_date,
        created_by=project_data.created_by
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


@app.get(
    "/projects",
    response_model=list[ProjectResponse]
)
def get_projects(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    projects = db.query(Project).all()

    return projects


@app.get(
    "/projects/{project_id}",
    response_model=ProjectResponse
)
def get_project(
    project_id: int,
    db: Session = Depends(get_db)
):

    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return project


@app.put(
    "/projects/{project_id}",
    response_model=ProjectResponse
)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manager)
):

    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    if project_data.name is not None:
        project.name = project_data.name

    if project_data.description is not None:
        project.description = project_data.description

    if project_data.status is not None:
        project.status = project_data.status

    if project_data.start_date is not None:
        project.start_date = project_data.start_date

    if project_data.end_date is not None:
        project.end_date = project_data.end_date

    db.commit()
    db.refresh(project)

    return project


@app.delete(
    "/projects/{project_id}"
)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manager)
):

    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    db.delete(project)
    db.commit()

    return {
        "message": "Project deleted successfully"
    }


# ============================================================
# REQUIREMENTS
# ============================================================

@app.post(
    "/projects/{project_id}/requirements",
    response_model=RequirementResponse
)
def create_requirement(
    project_id: int,
    requirement_data: RequirementCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manager)
):

    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    analysis = analyze_requirement(
        requirement_data.requirement_text
    )

    new_requirement = Requirement(
        project_id=project_id,
        requirement_text=requirement_data.requirement_text,
        analysis_result=analysis
    )

    db.add(new_requirement)
    db.commit()
    db.refresh(new_requirement)

    return new_requirement


@app.get(
    "/projects/{project_id}/requirements",
    response_model=list[RequirementResponse]
)
def get_requirements(
    project_id: int,
    db: Session = Depends(get_db)
):

    requirements = db.query(Requirement).filter(
        Requirement.project_id == project_id
    ).all()

    return requirements


# ============================================================
# TASKS
# ============================================================

@app.post(
    "/projects/{project_id}/tasks",
    response_model=TaskResponse
)
def create_task(
    project_id: int,
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manager)
):

    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    requirement = db.query(Requirement).filter(
        Requirement.id == task_data.requirement_id,
        Requirement.project_id == project_id
    ).first()

    if requirement is None:
        raise HTTPException(
            status_code=404,
            detail="Requirement not found"
        )

    new_task = Task(
        project_id=project_id,
        requirement_id=task_data.requirement_id,
        sprint_id=task_data.sprint_id,
        assigned_to=task_data.assigned_to,
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        status=task_data.status,
        due_date=task_data.due_date
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


@app.get(
    "/projects/{project_id}/tasks",
    response_model=list[TaskResponse]
)
def get_tasks(
    project_id: int,
    db: Session = Depends(get_db)
):

    tasks = db.query(Task).filter(
        Task.project_id == project_id
    ).all()

    return tasks
@app.get(
    "/my-tasks",
    response_model=list[TaskResponse]
)
def get_my_tasks(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")

    if current_user.get("role") != "member":
        raise HTTPException(
            status_code=403,
            detail="Employee access required"
        )

    tasks = db.query(Task).filter(
        Task.assigned_to == user_id
    ).all()

    return tasks


@app.put("/projects/{project_id}/tasks/{task_id}",
    response_model=TaskResponse
)
def update_task(
    project_id: int,
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manager)
):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.project_id == project_id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    if task_data.sprint_id is not None:
        task.sprint_id = task_data.sprint_id

    if task_data.assigned_to is not None:
        task.assigned_to = task_data.assigned_to

    if task_data.title is not None:
        task.title = task_data.title

    if task_data.description is not None:
        task.description = task_data.description

    if task_data.priority is not None:
        task.priority = task_data.priority

    if task_data.status is not None:
        task.status = task_data.status

    if task_data.due_date is not None:
        task.due_date = task_data.due_date

    db.commit()
    db.refresh(task)

    return task

@app.put(
    "/my-tasks/{task_id}",
    response_model=TaskResponse
)
def update_my_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Only employees can use this endpoint
    if current_user.get("role") != "member":
        raise HTTPException(
            status_code=403,
            detail="Employee access required"
        )

    user_id = current_user.get("user_id")

    # Find only a task assigned to this employee
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.assigned_to == user_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found or not assigned to you"
        )

    # Update only the fields provided by the employee
    update_data = task_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)

    return task


@app.delete(
    "/projects/{project_id}/tasks/{task_id}"
)
def delete_task(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manager)
):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.project_id == project_id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }


# ============================================================
# SPRINTS
# ============================================================

@app.post(
    "/projects/{project_id}/sprints",
    response_model=SprintResponse
)
def create_sprint(
    project_id: int,
    sprint_data: SprintCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manager)
):


    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    new_sprint = Sprint(
        project_id=project_id,
        name=sprint_data.name,
        goal=sprint_data.goal,
        start_date=sprint_data.start_date,
        end_date=sprint_data.end_date,
        status=sprint_data.status
    )

    db.add(new_sprint)
    db.commit()
    db.refresh(new_sprint)

    return new_sprint


@app.get(
    "/projects/{project_id}/sprints",
    response_model=list[SprintResponse]
)
def get_sprints(
    project_id: int,
    db: Session = Depends(get_db)
):

    sprints = db.query(Sprint).filter(
        Sprint.project_id == project_id
    ).all()

    return sprints


@app.put(
    "/projects/{project_id}/sprints/{sprint_id}",
    response_model=SprintResponse
)
def update_sprint(
    project_id: int,
    sprint_id: int,
    sprint_data: SprintUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manager)
):

    sprint = db.query(Sprint).filter(
        Sprint.id == sprint_id,
        Sprint.project_id == project_id
    ).first()

    if sprint is None:
        raise HTTPException(
            status_code=404,
            detail="Sprint not found"
        )

    if sprint_data.name is not None:
        sprint.name = sprint_data.name

    if sprint_data.goal is not None:
        sprint.goal = sprint_data.goal

    if sprint_data.start_date is not None:
        sprint.start_date = sprint_data.start_date

    if sprint_data.end_date is not None:
        sprint.end_date = sprint_data.end_date

    if sprint_data.status is not None:
        sprint.status = sprint_data.status

    db.commit()
    db.refresh(sprint)

    return sprint


@app.delete(
    "/projects/{project_id}/sprints/{sprint_id}"
)
def delete_sprint(
    project_id: int,
    sprint_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manager)
):

    sprint = db.query(Sprint).filter(
        Sprint.id == sprint_id,
        Sprint.project_id == project_id
    ).first()

    if sprint is None:
        raise HTTPException(
            status_code=404,
            detail="Sprint not found"
        )

    db.delete(sprint)
    db.commit()

    return {
        "message": "Sprint deleted successfully"
    }


# ============================================================
# PROJECT MEMBERS
# ============================================================

@app.post(
    "/projects/{project_id}/members",
    response_model=ProjectMemberResponse
)
def add_project_member(
    project_id: int,
    member_data: ProjectMemberCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manager)
):

    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    user = db.query(User).filter(
        User.id == member_data.user_id
    ).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == member_data.user_id
    ).first()

    if existing_member:
        raise HTTPException(
            status_code=400,
            detail="User is already a project member"
        )

    new_member = ProjectMember(
        project_id=project_id,
        user_id=member_data.user_id,
        role=member_data.role
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_member


@app.get(
    "/projects/{project_id}/members",
    response_model=list[ProjectMemberResponse]
)
def get_project_members(
    project_id: int,
    db: Session = Depends(get_db)
):

    members = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).all()

    return members


@app.delete(
    "/projects/{project_id}/members/{user_id}"
)
def remove_project_member(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manager)
):

    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Project member not found"
        )

    db.delete(member)
    db.commit()

    return {
        "message": "Member removed successfully"
    }


# ============================================================
# COMMENTS
# ============================================================

@app.post(
    "/projects/{project_id}/tasks/{task_id}/comments",
    response_model=CommentResponse
)
def create_comment(
    project_id: int,
    task_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Find the task and make sure it belongs to this project
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.project_id == project_id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    # Get the logged-in user's ID from the JWT
    user_id = current_user.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid user information"
        )

    # Employees can comment only on tasks assigned to them
    if current_user.get("role") == "member":
        if task.assigned_to != user_id:
            raise HTTPException(
                status_code=403,
                detail="You can comment only on your assigned tasks"
            )

    # Make sure the logged-in user actually exists
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Ignore comment_data.user_id.
    # The user identity comes from the authenticated JWT.
    new_comment = Comment(
        task_id=task_id,
        user_id=user_id,
        content=comment_data.content
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return new_comment

@app.get(
    "/projects/{project_id}/tasks/{task_id}/comments",
    response_model=list[CommentResponse]
)
def get_comments(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db)
):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.project_id == project_id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    comments = db.query(Comment).filter(
        Comment.task_id == task_id
    ).all()

    return comments


@app.delete(
    "/projects/{project_id}/tasks/{task_id}/comments/{comment_id}"
)
def delete_comment(
    project_id: int,
    task_id: int,
    comment_id: int,
    db: Session = Depends(get_db)
):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.project_id == project_id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.task_id == task_id
    ).first()

    if comment is None:
        raise HTTPException(
            status_code=404,
            detail="Comment not found"
        )

    db.delete(comment)
    db.commit()

    return {
        "message": "Comment deleted successfully"
    }


# ============================================================
# RISKS
# ============================================================

@app.post(
    "/projects/{project_id}/risks",
    response_model=RiskResponse
)
def create_risk(
    project_id: int,
    risk_data: RiskCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manager)
):

    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    if risk_data.task_id is not None:

        task = db.query(Task).filter(
            Task.id == risk_data.task_id,
            Task.project_id == project_id
        ).first()

        if task is None:
            raise HTTPException(
                status_code=404,
                detail="Related task not found"
            )

    new_risk = Risk(
        project_id=project_id,
        task_id=risk_data.task_id,
        risk_level=risk_data.risk_level,
        description=risk_data.description,
        recommendation=risk_data.recommendation
    )

    db.add(new_risk)
    db.commit()
    db.refresh(new_risk)

    return new_risk


@app.get(
    "/projects/{project_id}/risks",
    response_model=list[RiskResponse]
)
def get_risks(
    project_id: int,
    db: Session = Depends(get_db)
):

    risks = db.query(Risk).filter(
        Risk.project_id == project_id
    ).all()

    return risks


@app.delete(
    "/projects/{project_id}/risks/{risk_id}"
)
def delete_risk(
    project_id: int,
    risk_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manager)
):

    risk = db.query(Risk).filter(
        Risk.id == risk_id,
        Risk.project_id == project_id
    ).first()

    if risk is None:
        raise HTTPException(
            status_code=404,
            detail="Risk not found"
        )

    db.delete(risk)
    db.commit()

    return {
        "message": "Risk deleted successfully"
    }