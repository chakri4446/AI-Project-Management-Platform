# AI-Powered Intelligent Project Management Platform

A full-stack web-based project management platform designed to help managers plan and monitor projects while enabling employees to manage their assigned tasks. The platform also provides AI-assisted requirement analysis for generating suggested tasks, priorities, and potential risks.

---

## 📌 Project Overview

The AI-Powered Intelligent Project Management Platform is a full-stack application built using React, FastAPI, Python, and MySQL.

The system provides two different roles:

- **Manager**
- **Employee**

Managers can create and manage projects, requirements, tasks, sprints, project members, and risks. Employees can view their assigned tasks, update task status, and add comments to their assigned tasks.

The application uses JWT-based authentication and role-based authorization to control access to different operations.

An AI service is also included to analyze project requirements and generate useful project-planning information such as requirement type, priority, suggested tasks, and risks.

The current AI implementation uses a mock AI service so that the application can operate without requiring paid AI API usage. The AI functionality is separated into its own service so that a real AI provider can be integrated later.

---

# ✨ Key Features

## 👨‍💼 Manager Features

- Manager login and authentication
- Create projects
- View projects
- Update projects
- Delete projects
- Add project requirements
- Analyze requirements using AI
- Create tasks
- Update tasks
- Delete tasks
- Assign tasks to employees
- Create and manage sprints
- Add project members
- Remove project members
- Create project risks
- Delete project risks
- View task comments
- Monitor project progress
- View dashboard statistics

## 👨‍💻 Employee Features

- Employee login and authentication
- View assigned tasks
- Update assigned task status
- Update assigned task information
- Add comments to assigned tasks
- Cannot perform manager-only operations
- Cannot comment on tasks that are not assigned to them

---

# 🏗️ System Architecture

The application follows a three-layer full-stack architecture.

```text
                    USER
                     |
                     v
          +----------------------+
          |   React Frontend     |
          |   JavaScript / CSS   |
          +----------+-----------+
                     |
                 HTTP / JSON
                     |
                     v
          +----------------------+
          |   FastAPI Backend    |
          |       Python         |
          +----------+-----------+
                     |
          +----------+-----------+
          |          |            |
          v          v            v
     Security     Business      AI Service
     / JWT         Logic            |
                                  Mock AI
                     |
                     v
          +----------------------+
          |   SQLAlchemy ORM     |
          +----------+-----------+
                     |
                     v
          +----------------------+
          |    MySQL Database    |
          +----------------------+
Request Flow

For example, when a manager creates a project:

Manager clicks Create Project
            |
            v
       React Frontend
            |
            | HTTP POST
            | JSON data
            v
       FastAPI Backend
            |
            v
       JWT Verification
            |
            v
     Manager Authorization
            |
            v
      Pydantic Validation
            |
            v
       SQLAlchemy ORM
            |
            v
       MySQL Database
            |
            v
       JSON Response
            |
            v
       React Frontend
            |
            v
       Updated Dashboard
🛠️ Technologies Used
Frontend
React
JavaScript
HTML
CSS
Vite
Backend
Python
FastAPI
Uvicorn
Pydantic
Database
MySQL
SQLAlchemy
PyMySQL
Authentication and Security
JWT
bcrypt
Passlib
Role-Based Access Control
AI
Python AI service
Mock AI implementation
Designed for future real AI provider integration
Development Tools
Visual Studio Code
Git
GitHub
FastAPI Swagger UI
📁 Project Structure
AI-Project-Management-Platform/
│
├── .gitignore
├── README.md
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── security.py
│   ├── ai_service.py
│   ├── requirements.txt
│   ├── .env
│   └── .venv/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── ...
│
└── database/
    └── schema.sql
Important

The following files and directories are intentionally excluded from GitHub:

backend/.env
backend/.venv/
backend/__pycache__/
frontend/node_modules/

The .env file contains sensitive configuration such as database credentials and the JWT secret.

📂 Backend File Responsibilities
main.py

The main FastAPI application.

It contains API endpoints for:

User registration
Login
Projects
Requirements
Tasks
Sprints
Project members
Comments
Risks
Employee tasks
Dashboard-related data
Authentication and authorization

It acts as the main controller between the frontend and the backend logic.

database.py

Responsible for configuring the connection between the Python backend and MySQL using SQLAlchemy.

The main components are:

SQLAlchemy engine
Database session
Declarative base

The general connection is:

FastAPI
   |
SQLAlchemy
   |
PyMySQL
   |
MySQL
models.py

Contains SQLAlchemy ORM models representing database tables.

The main models are:

User
Project
Requirement
Task
Sprint
ProjectMember
Comment
Risk

The models allow Python code to interact with database tables using SQLAlchemy ORM.

schemas.py

Contains Pydantic models used for:

Request validation
Response validation
API data structures

Examples include:

UserCreate
UserResponse
ProjectCreate
ProjectResponse
TaskCreate
TaskResponse
SprintCreate
SprintResponse
CommentCreate
CommentResponse
RiskCreate
RiskResponse

Schemas are kept separate from database models to control what data enters and leaves the API.

security.py

Responsible for application security.

It handles:

Password hashing
Password verification
JWT creation
JWT verification
Authentication
Current-user identification
Manager authorization

The application uses bcrypt for password hashing and JWT for authentication.

ai_service.py

Contains the requirement-analysis service.

The current implementation uses a mock AI system.

Example input:

The system should allow users to register using
their name, email and password.

The AI service generates information such as:

Requirement Type
Priority
Suggested Tasks
Potential Risks

The service is kept separate from the main application logic so that a real AI provider can be integrated later.

🗄️ Database Design

The MySQL database is:

ai_project_management

The database contains eight tables:

users
projects
requirements
sprints
project_members
tasks
comments
risks
Users

Stores application users.

Important fields:

id
name
email
password_hash
role
created_at

Users can have roles such as:

manager
member
Projects

Stores project information.

Important fields:

id
name
description
status
start_date
end_date
created_by
created_at
Requirements

Stores project requirements.

Important fields:

id
project_id
requirement_text
analysis_result
created_at

A requirement belongs to a project.

Sprints

Stores sprint information.

Important fields:

id
project_id
name
goal
start_date
end_date
status
created_at
Project Members

Connects users with projects.

Important fields:

project_id
user_id
role
joined_at

This table represents the relationship between projects and users.

Tasks

Stores development tasks.

Important fields:

id
project_id
requirement_id
sprint_id
assigned_to
title
description
priority
status
due_date
created_at

Tasks can be associated with:

Projects
Requirements
Sprints
Employees
Comments

Stores comments related to tasks.

Important fields:

id
task_id
user_id
content
created_at
Risks

Stores project risks.

Important fields:

id
project_id
task_id
risk_level
description
recommendation
created_at
🔗 Database Relationships

The major relationships are:

User
 |
 +---- Project Creator
 |
 +---- Assigned Tasks
 |
 +---- Comments


Project
 |
 +---- Requirements
 |
 +---- Tasks
 |
 +---- Sprints
 |
 +---- Project Members
 |
 +---- Risks


Requirement
 |
 +---- Tasks


Task
 |
 +---- Comments

Foreign keys are used to maintain relationships between related records.

For example:

tasks.project_id
        |
        v
projects.id

means that the task belongs to that project.

Similarly:

tasks.assigned_to
        |
        v
users.id

means that the task is assigned to that user.

🔐 Authentication

The application uses JWT-based authentication.

Login Flow
User enters email and password
            |
            v
        POST /login
            |
            v
     Find user by email
            |
            v
     Verify password
            |
            v
      Verify requested role
            |
            v
        Create JWT
            |
            v
     Return access token
            |
            v
     Frontend stores token

Protected API requests use:

Authorization: Bearer <JWT>
🔒 Authorization

The application uses role-based authorization.

Authentication answers:

Who is the user?

Authorization answers:

What is the user allowed to do?

Manager

Managers can perform project-management operations.

Create Project       ✅
Update Project       ✅
Delete Project       ✅
Create Requirement   ✅
Create Task          ✅
Update Task          ✅
Delete Task          ✅
Manage Sprints       ✅
Manage Members       ✅
Manage Risks         ✅
Employee

Employees have restricted access.

View Assigned Tasks       ✅
Update Assigned Task      ✅
Add Comment to Own Task  ✅

Create Project            ❌
Delete Project            ❌
Create Task               ❌
Manage Members            ❌
Manage Risks              ❌
🛡️ Security Validation

The backend does not rely only on the frontend for authorization.

Manager-only endpoints are protected using a manager authorization dependency.

For employee task operations, the backend verifies that the task belongs to the currently authenticated employee.

For comments, the backend obtains the user ID from the JWT rather than trusting the user_id supplied by the client.

This prevents an employee from pretending to be another user.

🤖 AI Requirement Analysis Flow

The AI functionality follows this flow:

Manager enters requirement
            |
            v
       FastAPI API
            |
            v
      AI Service
            |
            v
        Mock AI
            |
            v
   Requirement Analysis
            |
     +------+------+
     |      |      |
     v      v      v
   Type  Priority Tasks
                   |
                   v
                 Risks
            |
            v
       Database

The current implementation does not require paid AI API credits.

📊 Manager Dashboard

The manager dashboard provides project-level statistics.

The dashboard currently displays:

Total Projects
Total Tasks
Completed Tasks
In-Progress Tasks
Overall Progress

The frontend retrieves project and task data from the backend and calculates the dashboard statistics.

Example:

Total Projects: 2
Total Tasks: 2
Completed Tasks: 0
In Progress: 1
Overall Progress: 0%

The values change according to the actual project and task data.

👨‍💻 Employee Workflow

The employee workflow is:

Employee Login
      |
      v
JWT Authentication
      |
      v
GET /my-tasks
      |
      v
Backend finds tasks assigned
to the logged-in employee
      |
      v
React displays My Tasks
      |
      v
Employee updates task
      |
      v
PUT /my-tasks/{task_id}
      |
      v
Backend verifies ownership
      |
      v
MySQL updates task
      |
      v
Updated task returned
      |
      v
React updates interface
🔄 Frontend and Backend Communication

The React frontend communicates with FastAPI using HTTP requests and JSON.

For example:

React
 |
 | POST /projects
 | JSON
 v
FastAPI
 |
 | SQLAlchemy
 v
MySQL
 |
 | Result
 v
FastAPI
 |
 | JSON
 v
React

The frontend uses API requests for operations such as:

Login
Create Project
Get Projects
Create Requirement
Create Task
Update Task
Create Sprint
Manage Members
Create Risk
Add Comment
Get Employee Tasks
🧪 Testing

The application was tested locally using both the frontend and FastAPI Swagger UI.

Swagger documentation is available during development at:

http://127.0.0.1:8000/docs

Testing included:

User registration
Manager login
Employee login
Role mismatch handling
Manager authorization
Employee task access
Task creation
Task updates
Task assignment
Comments
Comment authorization
Risk operations
Sprint operations
Project member operations
Dashboard statistics
🔐 Security Testing Results

The application was tested to ensure employees cannot perform manager-only operations.

Examples:

Employee → Create Project
Result → 403 Forbidden

Employee → Update Project
Result → 403 Forbidden

Employee → Delete Project
Result → 403 Forbidden

Employee → Create Requirement
Result → 403 Forbidden

Employee → Create Task
Result → 403 Forbidden

Comment authorization was also tested.

An employee was able to comment on an assigned task:

Result → Success

The same employee attempted to comment on a task that was not assigned to them:

Result → 403 Forbidden

This confirms that the backend performs task ownership validation.

⚙️ Installation and Setup
Prerequisites

Install:

Python
Node.js
npm
MySQL
Git
🐍 Backend Setup

Open a terminal inside the backend directory.

1. Create virtual environment
python -m venv .venv
2. Activate virtual environment

Windows PowerShell:

.\.venv\Scripts\Activate.ps1
3. Install Python dependencies
pip install -r requirements.txt
4. Configure environment variables

Create:

backend/.env

Example:

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=ai_project_management

SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

Do not commit the .env file to GitHub.

5. Create the database

The database structure is available in:

database/schema.sql

The SQL script can be used to recreate the database and tables.

6. Start FastAPI
uvicorn main:app --reload

Backend server:

http://127.0.0.1:8000

Swagger API documentation:

http://127.0.0.1:8000/docs
⚛️ Frontend Setup

Open another terminal inside the frontend directory.

1. Install dependencies
npm install
2. Start the React development server
npm run dev

Vite will display a local URL, usually:

http://localhost:5173
🧪 Build Frontend

To create a production build:

npm run build

The production files are generated in the:

dist/

directory.

📈 Example Application Flow

A complete example of the application flow:

Manager Login
     |
     v
JWT Generated
     |
     v
Manager Dashboard
     |
     v
Create Project
     |
     v
Add Requirement
     |
     v
AI Requirement Analysis
     |
     v
Suggested Tasks
     |
     v
Create Tasks
     |
     v
Assign Tasks to Employees
     |
     v
Create Sprint
     |
     v
Employee Login
     |
     v
Employee Views Assigned Tasks
     |
     v
Employee Updates Task Status
     |
     v
Employee Adds Comment
     |
     v
Manager Sees Updated Progress
🧠 Learning Outcomes

This project provided practical experience with:

Full-stack web development
React development
REST API development
FastAPI
Python
MySQL
SQLAlchemy ORM
Pydantic
CRUD operations
HTTP methods
JSON communication
Authentication
JWT
Authorization
Role-Based Access Control
Password hashing
Database relationships
Foreign keys
Frontend state management
Frontend-backend integration
AI service integration
Git and GitHub
🔮 Future Improvements

Possible future enhancements include:

Integration with a real AI provider
AI-generated task estimation
AI-based sprint planning
Automatic risk prediction
Project deadline notifications
Email notifications
Real-time collaboration
Advanced analytics
Project charts and visualizations
File attachments
Improved dashboard
Automated backend and frontend tests
Cloud deployment
Production database configuration
📌 Project Status

The core application has been implemented and tested locally.

Current major components include:

✅ React Frontend
✅ FastAPI Backend
✅ MySQL Database
✅ SQLAlchemy ORM
✅ JWT Authentication
✅ Role-Based Authorization
✅ Manager Dashboard
✅ Employee Workspace
✅ Project Management
✅ Requirement Management
✅ AI Requirement Analysis
✅ Task Management
✅ Task Assignment
✅ Sprint Management
✅ Project Members
✅ Comments
✅ Risk Management
✅ Dashboard Statistics
✅ Security Testing

Next steps include:

1. Final project cleanup
2. GitHub repository setup
3. Backend deployment
4. Frontend deployment
5. Production configuration
👨‍💻 Author

Chakri Pavuluri

AI/ML and Full-Stack Development Project


### One correction before you save

In the **Project Structure** section, `.env` and `.venv/` are shown to explain your local structure, but they are **ignored and will not be uploaded to GitHub**. That's intentional.

Save this README.

Then **don't run any Git command yet**. We'll next inspect the project one final time and make sure there are **no passwords, secrets, unnecessary files, or accidental test files** before the first commit.