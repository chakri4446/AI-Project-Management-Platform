CREATE DATABASE IF NOT EXISTS ai_project_management;

USE ai_project_management;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PLANNING',
    start_date DATE,
    end_date DATE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 3. Requirements
CREATE TABLE IF NOT EXISTS requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    requirement_text TEXT NOT NULL,
    analysis_result TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- 4. Sprints
CREATE TABLE IF NOT EXISTS sprints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    goal TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PLANNED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- 5. Project Members
CREATE TABLE IF NOT EXISTS project_members (
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 6. Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    requirement_id INT NOT NULL,
    sprint_id INT,
    assigned_to INT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'TODO',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (requirement_id) REFERENCES requirements(id),
    FOREIGN KEY (sprint_id) REFERENCES sprints(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- 7. Comments
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 8. Risks
CREATE TABLE IF NOT EXISTS risks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    task_id INT,
    risk_level VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    description TEXT NOT NULL,
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);