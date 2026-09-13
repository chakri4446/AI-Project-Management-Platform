import { useEffect, useState } from "react";

const API_URL =import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  // ---------------- AUTH ----------------

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);
  const [loginType, setLoginType] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [myTasks, setMyTasks] = useState([]);
  const [loadingMyTasks, setLoadingMyTasks] = useState(false);
  const [commentText, setCommentText] = useState({});

  // ---------------- PROJECTS ----------------

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  // ---------------- DASHBOARD STATS ----------------

  const [dashboardStats, setDashboardStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overallProgress: 0,
  });

  // ---------------- REQUIREMENTS ----------------

  const [requirements, setRequirements] = useState([]);
  const [loadingRequirements, setLoadingRequirements] = useState(false);

  const [newRequirement, setNewRequirement] = useState("");
  const [addingRequirement, setAddingRequirement] = useState(false);

  // ---------------- TASKS ----------------

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskStatus, setTaskStatus] = useState("TODO");
  const [taskRequirementId, setTaskRequirementId] = useState("");
  const [taskSprintId, setTaskSprintId] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  const [addingTask, setAddingTask] = useState(false);

  // ---------------- SPRINTS ----------------

  const [sprints, setSprints] = useState([]);
  const [loadingSprints, setLoadingSprints] = useState(false);

  const [sprintName, setSprintName] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [sprintStartDate, setSprintStartDate] = useState("");
  const [sprintEndDate, setSprintEndDate] = useState("");

  const [addingSprint, setAddingSprint] = useState(false);

  // ---------------- MEMBERS ----------------

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [memberUserId, setMemberUserId] = useState("");
  const [memberRole, setMemberRole] = useState("member");

  const [addingMember, setAddingMember] = useState(false);

  // ---------------- USERS ----------------

  const [users, setUsers] = useState([]);

  // ---------------- COMMENTS ----------------

  const [comments, setComments] = useState({});
  const [addingComment, setAddingComment] = useState(null);

  // ---------------- RISKS ----------------

  const [risks, setRisks] = useState([]);
  const [loadingRisks, setLoadingRisks] = useState(false);

  const [riskDescription, setRiskDescription] = useState("");
  const [riskLevel, setRiskLevel] = useState("MEDIUM");
  const [riskRecommendation, setRiskRecommendation] = useState("");
  const [riskTaskId, setRiskTaskId] = useState("");

  const [addingRisk, setAddingRisk] = useState(false);

  // ---------------- GENERAL ----------------

  const [message, setMessage] = useState("");

  // ============================================================
  // INITIAL LOGIN CHECK
  // ============================================================
useEffect(() => {
  const token = localStorage.getItem("access_token");

  if (token) {
    setLoggedIn(true);

    const savedRole =
      localStorage.getItem("user_role");

    setUserRole(savedRole);

    if (savedRole === "member") {
      fetchMyTasks();
    } else {
      fetchProjects(token);
      fetchUsers(token);
    }
  }
}, []);

  // ============================================================
  // LOGIN
  // ============================================================

async function handleLogin(event) {
  event.preventDefault();

  setMessage("Logging in...");

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
        role: loginType === "manager" ? "manager" : "member",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (Array.isArray(data.detail)) {
        setMessage(
          data.detail
            .map((error) => error.msg)
            .join(", ")
        );
      } else {
        setMessage(data.detail || "Login failed");
      }

      return;
    }

    localStorage.setItem(
      "access_token",
      data.access_token
    );

    const payload = JSON.parse(
      atob(
        data.access_token
          .split(".")[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    setUserRole(payload.role);
    if (payload.role === "member") {
      fetchMyTasks();
    }

    localStorage.setItem(
      "user_role",
      payload.role
    );

    setLoggedIn(true);
    setMessage("");

    fetchProjects(data.access_token);
    fetchUsers(data.access_token);

  } catch (error) {
    console.error(error);
    setMessage("Cannot connect to backend");
  }
}

  // ============================================================
  // PROJECTS
  // ============================================================
  async function createProject(event) {
  event.preventDefault();

  if (!projectName.trim()) {
    setMessage("Project name is required.");
    return;
  }

  const token = localStorage.getItem("access_token");
  const userId = getUserIdFromToken();

  if (!userId) {
    setMessage("Could not identify logged-in user.");
    return;
  }

  setCreatingProject(true);
  setMessage("");

  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: projectName,
        description: projectDescription || null,
        status: "PLANNING",
        created_by: userId,
      }),
    });

    if (response.status === 401) {
      handleLogout();
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.detail || "Could not create project");
      return;
    }

    setProjects((previous) => [
      ...previous,
      data,
    ]);

    setProjectName("");
    setProjectDescription("");

    setMessage("Project created successfully.");
  } catch (error) {
    console.error(error);
    setMessage("Cannot connect to backend");
  } finally {
    setCreatingProject(false);
  }
}
  async function fetchProjects(token) {
    try {
      const response = await fetch(
        `${API_URL}/projects`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Could not load projects"
        );
        return;
      }

      setProjects(data);
      fetchDashboardStats(token, data);
    } catch (error) {
      setMessage("Cannot connect to backend");
    }
  }

  async function fetchDashboardStats(token, projectList) {
    try {
      const taskResults = await Promise.all(
        projectList.map(async (project) => {
          const response = await fetch(
            `${API_URL}/projects/${project.id}/tasks`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            return [];
          }

          return await response.json();
        })
      );

      const allTasks = taskResults.flat();
      const completedTasks = allTasks.filter(
        (task) => task.status === "DONE"
      ).length;
      const inProgressTasks = allTasks.filter(
        (task) => task.status === "IN_PROGRESS"
      ).length;

      const overallProgress =
        allTasks.length === 0
          ? 0
          : Math.round((completedTasks / allTasks.length) * 100);

      setDashboardStats({
        totalProjects: projectList.length,
        totalTasks: allTasks.length,
        completedTasks,
        inProgressTasks,
        overallProgress,
      });
    } catch (error) {
      console.error("Could not load dashboard statistics", error);
    }
  }

  // ============================================================
  // USERS
  // ============================================================

  async function fetchUsers(token) {
    try {
      const response = await fetch(
        `${API_URL}/users`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setUsers(data);
    } catch (error) {
      console.log("Could not load users");
    }
  }

  // ============================================================
  // REQUIREMENTS
  // ============================================================

  async function fetchRequirements(projectId) {
    const token = localStorage.getItem("access_token");

    setLoadingRequirements(true);

    try {
      const response = await fetch(
        `${API_URL}/projects/${projectId}/requirements`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Could not load requirements"
        );
        return;
      }

      setRequirements(data);
    } catch (error) {
      setMessage("Cannot connect to backend");
    } finally {
      setLoadingRequirements(false);
    }
  }

  async function addRequirement(event) {
    event.preventDefault();

    if (!newRequirement.trim()) {
      setMessage("Please enter a requirement.");
      return;
    }

    const token = localStorage.getItem("access_token");

    setAddingRequirement(true);
    setMessage("Analyzing requirement...");

    try {
      const response = await fetch(
        `${API_URL}/projects/${selectedProject.id}/requirements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requirement_text: newRequirement,
          }),
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Could not add requirement"
        );
        return;
      }

      setRequirements((previous) => [
        ...previous,
        data,
      ]);

      setNewRequirement("");

      setMessage(
        "Requirement added and analyzed successfully."
      );
    } catch (error) {
      setMessage("Cannot connect to backend");
    } finally {
      setAddingRequirement(false);
    }
  }

  // ============================================================
  // TASKS
  // ============================================================

  async function fetchTasks(projectId) {
    const token = localStorage.getItem("access_token");

    setLoadingTasks(true);

    try {
      const response = await fetch(
        `${API_URL}/projects/${projectId}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Could not load tasks"
        );
        return;
      }

      setTasks(data);
    } catch (error) {
      setMessage("Cannot connect to backend");
    } finally {
      setLoadingTasks(false);
    }
  }

  async function addTask(event) {
    event.preventDefault();

    if (!taskTitle.trim()) {
      setMessage("Task title is required.");
      return;
    }

    if (!taskRequirementId) {
      setMessage("Please select a requirement.");
      return;
    }

    const token = localStorage.getItem("access_token");

    setAddingTask(true);
    setMessage("Creating task...");

    try {
      const response = await fetch(
        `${API_URL}/projects/${selectedProject.id}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requirement_id: Number(taskRequirementId),
            sprint_id: taskSprintId
              ? Number(taskSprintId)
              : null,
            assigned_to: taskAssignedTo
              ? Number(taskAssignedTo)
              : null,
            title: taskTitle,
            description: taskDescription || null,
            priority: taskPriority,
            status: taskStatus,
            due_date: taskDueDate || null,
          }),
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Could not create task"
        );
        return;
      }

      setTasks((previous) => [
        ...previous,
        data,
      ]);

      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("MEDIUM");
      setTaskStatus("TODO");
      setTaskRequirementId("");
      setTaskSprintId("");
      setTaskAssignedTo("");
      setTaskDueDate("");

      setMessage("Task created successfully.");
    } catch (error) {
      setMessage("Cannot connect to backend");
    } finally {
      setAddingTask(false);
    }
  }

  // ============================================================
  // SPRINTS
  // ============================================================

  async function fetchSprints(projectId) {
    const token = localStorage.getItem("access_token");

    setLoadingSprints(true);

    try {
      const response = await fetch(
        `${API_URL}/projects/${projectId}/sprints`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Could not load sprints"
        );
        return;
      }

      setSprints(data);
    } catch (error) {
      setMessage("Cannot connect to backend");
    } finally {
      setLoadingSprints(false);
    }
  }

  async function addSprint(event) {
    event.preventDefault();

    if (!sprintName.trim()) {
      setMessage("Sprint name is required.");
      return;
    }

    if (!sprintStartDate || !sprintEndDate) {
      setMessage(
        "Sprint start and end dates are required."
      );
      return;
    }

    const token = localStorage.getItem("access_token");

    setAddingSprint(true);
    setMessage("Creating sprint...");

    try {
      const response = await fetch(
        `${API_URL}/projects/${selectedProject.id}/sprints`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: sprintName,
            goal: sprintGoal || null,
            start_date: sprintStartDate,
            end_date: sprintEndDate,
            status: "PLANNED",
          }),
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Could not create sprint"
        );
        return;
      }

      setSprints((previous) => [
        ...previous,
        data,
      ]);

      setSprintName("");
      setSprintGoal("");
      setSprintStartDate("");
      setSprintEndDate("");

      setMessage("Sprint created successfully.");
    } catch (error) {
      setMessage("Cannot connect to backend");
    } finally {
      setAddingSprint(false);
    }
  }

  // ============================================================
  // MEMBERS
  // ============================================================

  async function fetchMembers(projectId) {
    const token = localStorage.getItem("access_token");

    setLoadingMembers(true);

    try {
      const response = await fetch(
        `${API_URL}/projects/${projectId}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Could not load members"
        );
        return;
      }

      setMembers(data);
    } catch (error) {
      setMessage("Cannot connect to backend");
    } finally {
      setLoadingMembers(false);
    }
  }

  async function addMember(event) {
    event.preventDefault();

    if (!memberUserId) {
      setMessage("Please select a user.");
      return;
    }

    const token = localStorage.getItem("access_token");

    setAddingMember(true);
    setMessage("Adding member...");

    try {
      const response = await fetch(
        `${API_URL}/projects/${selectedProject.id}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: Number(memberUserId),
            role: memberRole,
          }),
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Could not add member"
        );
        return;
      }

      setMembers((previous) => [
        ...previous,
        data,
      ]);

      setMemberUserId("");
      setMemberRole("member");

      setMessage("Member added successfully.");
    } catch (error) {
      setMessage("Cannot connect to backend");
    } finally {
      setAddingMember(false);
    }
  }

  async function removeMember(userId) {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `${API_URL}/projects/${selectedProject.id}/members/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Could not remove member"
        );
        return;
      }

      setMembers((previous) =>
        previous.filter(
          (member) => member.user_id !== userId
        )
      );

      setMessage("Member removed successfully.");
    } catch (error) {
      setMessage("Cannot connect to backend");
    }
  }

  // ============================================================
  // COMMENTS
  // ============================================================

  async function fetchComments(taskId) {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `${API_URL}/projects/${selectedProject.id}/tasks/${taskId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setComments((previous) => ({
        ...previous,
        [taskId]: data,
      }));
    } catch (error) {
      console.log("Could not load comments");
    }
  }

  async function addComment(taskId) {
    const text = commentText[taskId];

    if (!text || !text.trim()) {
      setMessage("Please enter a comment.");
      return;
    }

    const token = localStorage.getItem("access_token");

    const loggedInUserId = getUserIdFromToken();

    if (!loggedInUserId) {
      setMessage("Could not identify logged-in user.");
      return;
    }

    setAddingComment(taskId);

    try {
      const response = await fetch(
        `${API_URL}/projects/${selectedProject.id}/tasks/${taskId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: loggedInUserId,
            content: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Could not add comment"
        );
        return;
      }

      setComments((previous) => ({
        ...previous,
        [taskId]: [
          ...(previous[taskId] || []),
          data,
        ],
      }));

      setCommentText((previous) => ({
        ...previous,
        [taskId]: "",
      }));

      setMessage("Comment added successfully.");
    } catch (error) {
      setMessage("Cannot connect to backend");
    } finally {
      setAddingComment(null);
    }
  }

  async function deleteComment(taskId, commentId) {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `${API_URL}/projects/${selectedProject.id}/tasks/${taskId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Could not delete comment"
        );
        return;
      }

      setComments((previous) => ({
        ...previous,
        [taskId]: (previous[taskId] || []).filter(
          (comment) => comment.id !== commentId
        ),
      }));

      setMessage("Comment deleted successfully.");
    } catch (error) {
      setMessage("Cannot connect to backend");
    }
  }

  // ============================================================
  // RISKS
  // ============================================================

  async function fetchRisks(projectId) {
    const token = localStorage.getItem("access_token");

    setLoadingRisks(true);

    try {
      const response = await fetch(
        `${API_URL}/projects/${projectId}/risks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Could not load risks"
        );
        return;
      }

      setRisks(data);
    } catch (error) {
      setMessage("Cannot connect to backend");
    } finally {
      setLoadingRisks(false);
    }
  }

  async function addRisk(event) {
    event.preventDefault();

    if (!riskDescription.trim()) {
      setMessage("Risk description is required.");
      return;
    }

    const token = localStorage.getItem("access_token");

    setAddingRisk(true);
    setMessage("Adding risk...");

    try {
      const response = await fetch(
        `${API_URL}/projects/${selectedProject.id}/risks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            task_id: riskTaskId
              ? Number(riskTaskId)
              : null,
            risk_level: riskLevel,
            description: riskDescription,
            recommendation:
              riskRecommendation || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Could not add risk"
        );
        return;
      }

      setRisks((previous) => [
        ...previous,
        data,
      ]);

      setRiskDescription("");
      setRiskLevel("MEDIUM");
      setRiskRecommendation("");
      setRiskTaskId("");

      setMessage("Risk added successfully.");
    } catch (error) {
      setMessage("Cannot connect to backend");
    } finally {
      setAddingRisk(false);
    }
  }

  async function deleteRisk(riskId) {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `${API_URL}/projects/${selectedProject.id}/risks/${riskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Could not delete risk"
        );
        return;
      }

      setRisks((previous) =>
        previous.filter(
          (risk) => risk.id !== riskId
        )
      );

      setMessage("Risk deleted successfully.");
    } catch (error) {
      setMessage("Cannot connect to backend");
    }
  }

  // ============================================================
  // JWT USER ID
  // ============================================================

  function getUserIdFromToken() {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(
        atob(
          token.split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      return payload.user_id;
    } catch (error) {
      return null;
    }
  }

  // ============================================================
  // OPEN PROJECT
  // ============================================================
  async function fetchMyTasks() {
  const token = localStorage.getItem("access_token");

  setLoadingMyTasks(true);

  try {
    const response = await fetch(
      `${API_URL}/my-tasks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      handleLogout();
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data.detail || "Could not load your tasks"
      );
      return;
    }

    setMyTasks(data);

  } catch (error) {
    console.error(error);
    setMessage("Cannot connect to backend");
  } finally {
    setLoadingMyTasks(false);
  }
}
async function updateMyTaskStatus(taskId, newStatus) {
  const token = localStorage.getItem("access_token");

  try {
    const response = await fetch(
      `${API_URL}/my-tasks/${taskId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data.detail || "Could not update task"
      );
      return;
    }

    // Update the task shown on the screen
    setMyTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? data : task
      )
    );

    setMessage("Task status updated successfully");

  } catch (error) {
    console.error(error);
    setMessage("Cannot connect to backend");
  }
}
async function addEmployeeComment(taskId) {
  const token = localStorage.getItem("access_token");
  const text = commentText[taskId];

  if (!text || !text.trim()) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/projects/${myTasks.find((task) => task.id === taskId)?.project_id}/tasks/${taskId}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: getUserIdFromToken(),
          content: text,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data.detail || "Could not add comment"
      );
      return;
    }

    setCommentText({
      ...commentText,
      [taskId]: "",
    });

    setMessage("Comment added successfully");

  } catch (error) {
    console.error(error);
    setMessage("Cannot connect to backend");
  }
}

  function openProject(project) {
    setSelectedProject(project);

    setRequirements([]);
    setTasks([]);
    setSprints([]);
    setMembers([]);
    setRisks([]);
    setComments({});

    setNewRequirement("");

    setMessage("");

    fetchRequirements(project.id);
    fetchTasks(project.id);
    fetchSprints(project.id);
    fetchMembers(project.id);
    fetchRisks(project.id);
  }

  // ============================================================
  // LOAD COMMENTS FOR TASKS
  // ============================================================

  useEffect(() => {
    if (!selectedProject || tasks.length === 0) {
      return;
    }

    tasks.forEach((task) => {
      fetchComments(task.id);
    });
  }, [tasks, selectedProject]);

  // ============================================================
  // BACK
  // ============================================================

  function backToDashboard() {
    setSelectedProject(null);

    setRequirements([]);
    setTasks([]);
    setSprints([]);
    setMembers([]);
    setRisks([]);
    setComments({});

    setNewRequirement("");

    setMessage("");
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  function handleLogout() {
    localStorage.removeItem("access_token");

    setLoggedIn(false);

    setProjects([]);
    setSelectedProject(null);
    setDashboardStats({
      totalProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      overallProgress: 0,
    });

    setRequirements([]);
    setTasks([]);
    setSprints([]);
    setMembers([]);
    setRisks([]);
    setComments({});

    setNewRequirement("");

    setEmail("");
    setPassword("");

    setMessage("");
  }

  // ============================================================
  // LOGIN PAGE
  // ============================================================

if (!loggedIn) {
  return (
    <div className="login-page">
      <div className="login-card">

        {!loginType ? (
          <>
            <h1>AI Project Management</h1>

            <p className="subtitle">
              Plan • Assign • Collaborate • Track
            </p>

            <h2>Choose your workspace</h2>

            <p className="login-description">
              Select your account type to continue
            </p>

            <div className="login-options">

              <button
                className="role-login-button manager-login"
                onClick={() => {
                  setLoginType("manager");
                  setMessage("");
                }}
              >
                <span className="role-icon">👨‍💼</span>

                <span>
                  <strong>Manager</strong>
                  <small>
                    Manage projects, teams and tasks
                  </small>
                </span>
              </button>

              <button
                className="role-login-button employee-login"
                onClick={() => {
                  setLoginType("employee");
                  setMessage("");
                }}
              >
                <span className="role-icon">👨‍💻</span>

                <span>
                  <strong>Employee</strong>
                  <small>
                    View and update your assigned work
                  </small>
                </span>
              </button>

            </div>
          </>
        ) : (
          <>
            <button
              className="back-login-button"
              onClick={() => {
                setLoginType(null);
                setEmail("");
                setPassword("");
                setMessage("");
              }}
            >
              ← Back
            </button>

            <h1>
              {loginType === "manager"
                ? "👨‍💼 Manager Login"
                : "👨‍💻 Employee Login"}
            </h1>

            <p className="subtitle">
              {loginType === "manager"
                ? "Manage your projects and team"
                : "View and update your assigned work"}
            </p>

            <form onSubmit={handleLogin}>

              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

              <button type="submit">
                Login
              </button>

            </form>

            {message && (
              <p className="message">
                {message}
              </p>
            )}
          </>
        )}

      </div>
    </div>
  );
}

  // ============================================================
  // PROJECT DETAILS
  // ============================================================
  if (loggedIn && userRole === "member") {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>AI Project Management</h1>
          <p>Employee Workspace</p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <h2>👋 My Workspace</h2>

        <p className="subtitle">
          View and update your assigned work
        </p>

        <section className="tasks-section">
          <h2>📋 My Tasks</h2>

          {loadingMyTasks ? (
            <p>Loading your tasks...</p>
          ) : myTasks.length === 0 ? (
            <p>
              No tasks have been assigned to you yet.
            </p>
          ) : (
            <div className="tasks-list">
              {myTasks.map((task) => (
                <div
                  className="task-card"
                  key={task.id}
                >
                  <div className="task-header">
                  <h3>{task.title}</h3>

                  <select
                    className="task-status-select"
                    value={task.status}
                    onChange={(event) =>
                      updateMyTaskStatus(
                        task.id,
                        event.target.value
                      )
                    }
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>

                  <p>
                    {task.description ||
                      "No description available."}
                  </p>

                  <div className="task-info">
                    <span>
                      <strong>Priority:</strong>{" "}
                      {task.priority}
                    </span>

                    <span>
                      <strong>Sprint:</strong>{" "}
                      {task.sprint_id
                        ? `#${task.sprint_id}`
                        : "Not assigned"}
                    </span>

                    <span>
                      <strong>Due Date:</strong>{" "}
                      {task.due_date || "Not set"}
                    </span>
                  </div>
                  <div className="employee-comment-box">
                  <textarea
                    placeholder="Write an update or comment..."
                    value={commentText[task.id] || ""}
                    onChange={(event) =>
                      setCommentText({
                        ...commentText,
                        [task.id]: event.target.value,
                      })
                    }
                  />

                  <button
                    onClick={() => addEmployeeComment(task.id)}
                  >
                    Add Comment
                  </button>
                </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {message && (
          <p className="message">
            {message}
          </p>
        )}
      </main>
    </div>
  );
}
  if (selectedProject) {
    return (
      <div className="dashboard">

        <header className="dashboard-header">

          <div>
            <h1>AI Project Management</h1>
            <p>Project Details</p>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </header>

        <main className="dashboard-content">

          <button
            onClick={backToDashboard}
            style={{
              marginBottom: "20px",
              padding: "10px 16px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            ← Back to Dashboard
          </button>

          <section className="project-details-page">

            {/* PROJECT INFORMATION */}

            <h2>{selectedProject.name}</h2>

            <p>
              {selectedProject.description ||
                "No description available."}
            </p>

            <div className="project-info-grid">

              <div className="info-box">
                <strong>Status</strong>
                <span>
                  {selectedProject.status}
                </span>
              </div>

              <div className="info-box">
                <strong>Start Date</strong>
                <span>
                  {selectedProject.start_date ||
                    "Not set"}
                </span>
              </div>

              <div className="info-box">
                <strong>End Date</strong>
                <span>
                  {selectedProject.end_date ||
                    "Not set"}
                </span>
              </div>

              <div className="info-box">
                <strong>Created By</strong>
                <span>
                  User #{selectedProject.created_by}
                </span>
              </div>

            </div>

            {/* ==================================================
                REQUIREMENTS
            ================================================== */}

            <div className="requirements-section">

              <h2>📋 Requirements</h2>

              <form
                onSubmit={addRequirement}
                className="requirement-form"
              >

                <textarea
                  placeholder="Enter a new project requirement..."
                  value={newRequirement}
                  onChange={(event) =>
                    setNewRequirement(event.target.value)
                  }
                  rows="4"
                  required
                />

                <button
                  type="submit"
                  disabled={addingRequirement}
                >
                  {addingRequirement
                    ? "Analyzing..."
                    : "🤖 Analyze & Add Requirement"}
                </button>

              </form>

              {loadingRequirements ? (
                <p>Loading requirements...</p>
              ) : requirements.length === 0 ? (
                <p>
                  No requirements found.
                </p>
              ) : (
                <div className="requirements-list">

                  {requirements.map(
                    (requirement) => (

                      <div
                        className="requirement-card"
                        key={requirement.id}
                      >

                        <h3>
                          Requirement #
                          {requirement.id}
                        </h3>

                        <p>
                          {
                            requirement.requirement_text
                          }
                        </p>

                        {requirement.analysis_result && (
                          <div className="ai-analysis">

                            <strong>
                              🤖 AI Analysis
                            </strong>

                            <pre>
                              {
                                requirement.analysis_result
                              }
                            </pre>

                          </div>
                        )}

                      </div>

                    )
                  )}

                </div>
              )}

            </div>

            {/* ==================================================
                TASKS
            ================================================== */}

            <div className="tasks-section">

              <h2>✅ Tasks</h2>

              <form
                onSubmit={addTask}
                className="task-form"
              >

                <input
                  placeholder="Task title"
                  value={taskTitle}
                  onChange={(event) =>
                    setTaskTitle(event.target.value)
                  }
                  required
                />

                <textarea
                  placeholder="Task description"
                  value={taskDescription}
                  onChange={(event) =>
                    setTaskDescription(
                      event.target.value
                    )
                  }
                  rows="3"
                />

                <div className="form-row">

                  <select
                    value={taskRequirementId}
                    onChange={(event) =>
                      setTaskRequirementId(
                        event.target.value
                      )
                    }
                    required
                  >

                    <option value="">
                      Select Requirement
                    </option>

                    {requirements.map(
                      (requirement) => (

                        <option
                          key={requirement.id}
                          value={requirement.id}
                        >
                          Requirement #
                          {requirement.id}
                        </option>

                      )
                    )}

                  </select>

                  <select
                    value={taskPriority}
                    onChange={(event) =>
                      setTaskPriority(
                        event.target.value
                      )
                    }
                  >

                    <option value="LOW">
                      LOW
                    </option>

                    <option value="MEDIUM">
                      MEDIUM
                    </option>

                    <option value="HIGH">
                      HIGH
                    </option>

                  </select>

                  <select
                    value={taskStatus}
                    onChange={(event) =>
                      setTaskStatus(
                        event.target.value
                      )
                    }
                  >

                    <option value="TODO">
                      TODO
                    </option>

                    <option value="IN_PROGRESS">
                      IN_PROGRESS
                    </option>

                    <option value="DONE">
                      DONE
                    </option>

                  </select>

                </div>

                <div className="form-row">

                  <select
                    value={taskSprintId}
                    onChange={(event) =>
                      setTaskSprintId(
                        event.target.value
                      )
                    }
                  >

                    <option value="">
                      Select Sprint
                    </option>

                    {sprints.map((sprint) => (

                      <option
                        key={sprint.id}
                        value={sprint.id}
                      >
                        {sprint.name}
                      </option>

                    ))}

                  </select>

                  <select
                    value={taskAssignedTo}
                    onChange={(event) =>
                      setTaskAssignedTo(
                        event.target.value
                      )
                    }
                  >

                    <option value="">
                      Assign User
                    </option>

                    {users.map((user) => (

                      <option
                        key={user.id}
                        value={user.id}
                      >
                        {user.name}
                      </option>

                    ))}

                  </select>

                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(event) =>
                      setTaskDueDate(
                        event.target.value
                      )
                    }
                  />

                </div>

                <button
                  type="submit"
                  disabled={addingTask}
                >
                  {addingTask
                    ? "Creating..."
                    : "➕ Create Task"}
                </button>

              </form>

              {loadingTasks ? (
                <p>Loading tasks...</p>
              ) : tasks.length === 0 ? (
                <p>
                  No tasks found.
                </p>
              ) : (
                <div className="tasks-list">

                  {tasks.map((task) => (

                    <div
                      className="task-card"
                      key={task.id}
                    >

                      <div className="task-header">

                        <h3>
                          {task.title}
                        </h3>

                        <span className="task-status">
                          {task.status}
                        </span>

                      </div>

                      <p>
                        {task.description ||
                          "No description available."}
                      </p>

                      <div className="task-info">

                        <span>
                          <strong>
                            Priority:
                          </strong>{" "}
                          {task.priority}
                        </span>

                        <span>
                          <strong>
                            Requirement:
                          </strong>{" "}
                          #{task.requirement_id}
                        </span>

                        <span>
                          <strong>
                            Sprint:
                          </strong>{" "}
                          {task.sprint_id
                            ? `#${task.sprint_id}`
                            : "Not assigned"}
                        </span>

                        <span>
                          <strong>
                            Assigned To:
                          </strong>{" "}
                          {task.assigned_to
                            ? `User #${task.assigned_to}`
                            : "Unassigned"}
                        </span>

                        <span>
                          <strong>
                            Due Date:
                          </strong>{" "}
                          {task.due_date ||
                            "Not set"}
                        </span>

                      </div>

                      {/* COMMENTS */}

                      <div className="comments-section">

                        <h4>
                          💬 Comments
                        </h4>

                        {(comments[task.id] || [])
                          .length === 0 ? (
                          <p>
                            No comments yet.
                          </p>
                        ) : (
                          (comments[task.id] || []).map(
                            (comment) => (

                              <div
                                className="comment-card"
                                key={comment.id}
                              >

                                <p>
                                  {comment.content}
                                </p>

                                <small>
                                  User #
                                  {comment.user_id}
                                </small>

                                <button
                                  onClick={() =>
                                    deleteComment(
                                      task.id,
                                      comment.id
                                    )
                                  }
                                >
                                  Delete
                                </button>

                              </div>

                            )
                          )
                        )}

                        <div className="comment-form">

                          <input
                            placeholder="Write a comment..."
                            value={
                              commentText[
                                task.id
                              ] || ""
                            }
                            onChange={(event) =>
                              setCommentText(
                                (previous) => ({
                                  ...previous,
                                  [task.id]:
                                    event.target.value,
                                })
                              )
                            }
                          />

                          <button
                            onClick={() =>
                              addComment(task.id)
                            }
                            disabled={
                              addingComment ===
                              task.id
                            }
                          >
                            {addingComment ===
                            task.id
                              ? "Adding..."
                              : "Add Comment"}
                          </button>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>
              )}

            </div>

            {/* ==================================================
                SPRINTS
            ================================================== */}

            <div className="sprints-section">

              <h2>🏃 Sprints</h2>

              <form
                onSubmit={addSprint}
                className="sprint-form"
              >

                <input
                  placeholder="Sprint name"
                  value={sprintName}
                  onChange={(event) =>
                    setSprintName(
                      event.target.value
                    )
                  }
                  required
                />

                <textarea
                  placeholder="Sprint goal"
                  value={sprintGoal}
                  onChange={(event) =>
                    setSprintGoal(
                      event.target.value
                    )
                  }
                  rows="3"
                />

                <div className="form-row">

                  <input
                    type="date"
                    value={sprintStartDate}
                    onChange={(event) =>
                      setSprintStartDate(
                        event.target.value
                      )
                    }
                    required
                  />

                  <input
                    type="date"
                    value={sprintEndDate}
                    onChange={(event) =>
                      setSprintEndDate(
                        event.target.value
                      )
                    }
                    required
                  />

                </div>

                <button
                  type="submit"
                  disabled={addingSprint}
                >
                  {addingSprint
                    ? "Creating..."
                    : "➕ Create Sprint"}
                </button>

              </form>

              {loadingSprints ? (
                <p>Loading sprints...</p>
              ) : sprints.length === 0 ? (
                <p>
                  No sprints found.
                </p>
              ) : (
                <div className="sprints-list">

                  {sprints.map((sprint) => (

                    <div
                      className="sprint-card"
                      key={sprint.id}
                    >

                      <h3>
                        {sprint.name}
                      </h3>

                      <p>
                        {sprint.goal ||
                          "No goal specified."}
                      </p>

                      <div className="task-info">

                        <span>
                          <strong>
                            Start:
                          </strong>{" "}
                          {sprint.start_date}
                        </span>

                        <span>
                          <strong>
                            End:
                          </strong>{" "}
                          {sprint.end_date}
                        </span>

                        <span>
                          <strong>
                            Status:
                          </strong>{" "}
                          {sprint.status}
                        </span>

                      </div>

                    </div>

                  ))}

                </div>
              )}

            </div>

            {/* ==================================================
                MEMBERS
            ================================================== */}

            <div className="members-section">

              <h2>👥 Members</h2>

              <form
                onSubmit={addMember}
                className="member-form"
              >

                <select
                  value={memberUserId}
                  onChange={(event) =>
                    setMemberUserId(
                      event.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select User
                  </option>

                  {users.map((user) => (

                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.name} - {user.email}
                    </option>

                  ))}

                </select>

                <select
                  value={memberRole}
                  onChange={(event) =>
                    setMemberRole(
                      event.target.value
                    )
                  }
                >

                  <option value="member">
                    Member
                  </option>

                  <option value="manager">
                    Manager
                  </option>

                </select>

                <button
                  type="submit"
                  disabled={addingMember}
                >
                  {addingMember
                    ? "Adding..."
                    : "➕ Add Member"}
                </button>

              </form>

              {loadingMembers ? (
                <p>Loading members...</p>
              ) : members.length === 0 ? (
                <p>
                  No members found.
                </p>
              ) : (
                <div className="members-list">

                  {members.map((member) => {

                    const user = users.find(
                      (item) =>
                        item.id ===
                        member.user_id
                    );

                    return (
                      <div
                        className="member-card"
                        key={member.user_id}
                      >

                        <div>

                          <strong>
                            {user
                              ? user.name
                              : `User #${member.user_id}`}
                          </strong>

                          <p>
                            {user
                              ? user.email
                              : `User ID: ${member.user_id}`}
                          </p>

                          <span>
                            Role: {member.role}
                          </span>

                        </div>

                        <button
                          onClick={() =>
                            removeMember(
                              member.user_id
                            )
                          }
                        >
                          Remove
                        </button>

                      </div>
                    );
                  })}

                </div>
              )}

            </div>

            {/* ==================================================
                RISKS
            ================================================== */}

            <div className="risks-section">

              <h2>⚠️ Risks</h2>

              <form
                onSubmit={addRisk}
                className="risk-form"
              >

                <select
                  value={riskLevel}
                  onChange={(event) =>
                    setRiskLevel(
                      event.target.value
                    )
                  }
                >

                  <option value="LOW">
                    LOW
                  </option>

                  <option value="MEDIUM">
                    MEDIUM
                  </option>

                  <option value="HIGH">
                    HIGH
                  </option>

                </select>

                <select
                  value={riskTaskId}
                  onChange={(event) =>
                    setRiskTaskId(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Related Task (optional)
                  </option>

                  {tasks.map((task) => (

                    <option
                      key={task.id}
                      value={task.id}
                    >
                      {task.title}
                    </option>

                  ))}

                </select>

                <textarea
                  placeholder="Describe the risk..."
                  value={riskDescription}
                  onChange={(event) =>
                    setRiskDescription(
                      event.target.value
                    )
                  }
                  rows="3"
                  required
                />

                <textarea
                  placeholder="Recommendation..."
                  value={riskRecommendation}
                  onChange={(event) =>
                    setRiskRecommendation(
                      event.target.value
                    )
                  }
                  rows="3"
                />

                <button
                  type="submit"
                  disabled={addingRisk}
                >
                  {addingRisk
                    ? "Adding..."
                    : "➕ Add Risk"}
                </button>

              </form>

              {loadingRisks ? (
                <p>Loading risks...</p>
              ) : risks.length === 0 ? (
                <p>
                  No risks found.
                </p>
              ) : (
                <div className="risks-list">

                  {risks.map((risk) => (

                    <div
                      className="risk-card"
                      key={risk.id}
                    >

                      <div className="task-header">

                        <h3>
                          Risk #{risk.id}
                        </h3>

                        <span className="risk-level">
                          {risk.risk_level}
                        </span>

                      </div>

                      <p>
                        {risk.description}
                      </p>

                      {risk.recommendation && (
                        <p>
                          <strong>
                            Recommendation:
                          </strong>{" "}
                          {risk.recommendation}
                        </p>
                      )}

                      {risk.task_id && (
                        <p>
                          <strong>
                            Related Task:
                          </strong>{" "}
                          #{risk.task_id}
                        </p>
                      )}

                      <button
                        onClick={() =>
                          deleteRisk(risk.id)
                        }
                      >
                        Delete Risk
                      </button>

                    </div>

                  ))}

                </div>
              )}

            </div>

            {message && (
              <p className="message">
                {message}
              </p>
            )}

          </section>

        </main>

      </div>
    );
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <div className="dashboard">

      <header className="dashboard-header">

        <div>
          <h1>AI Project Management</h1>

          <p>
            Intelligent project management platform
          </p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>

      <main className="dashboard-content">

        <h2>Dashboard</h2>
        <section className="projects-section">

  <h3>➕ Create New Project</h3>

  <form onSubmit={createProject}>

    <input
      type="text"
      placeholder="Project name"
      value={projectName}
      onChange={(event) =>
        setProjectName(event.target.value)
      }
      required
    />

    <textarea
      placeholder="Project description"
      value={projectDescription}
      onChange={(event) =>
        setProjectDescription(event.target.value)
      }
      rows="4"
    />

    <button
      type="submit"
      disabled={creatingProject}
    >
      {creatingProject
        ? "Creating..."
        : "Create Project"}
    </button>

  </form>

</section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "16px",
            marginBottom: "30px",
          }}
        >
          <div className="info-box">
            <strong>Total Projects</strong>
            <span style={{ fontSize: "28px", fontWeight: "bold" }}>
              {dashboardStats.totalProjects}
            </span>
          </div>

          <div className="info-box">
            <strong>Total Tasks</strong>
            <span style={{ fontSize: "28px", fontWeight: "bold" }}>
              {dashboardStats.totalTasks}
            </span>
          </div>

          <div className="info-box">
            <strong>Completed Tasks</strong>
            <span style={{ fontSize: "28px", fontWeight: "bold" }}>
              {dashboardStats.completedTasks}
            </span>
          </div>

          <div className="info-box">
            <strong>In Progress</strong>
            <span style={{ fontSize: "28px", fontWeight: "bold" }}>
              {dashboardStats.inProgressTasks}
            </span>
          </div>

          <div className="info-box">
            <strong>Overall Progress</strong>
            <span style={{ fontSize: "28px", fontWeight: "bold" }}>
              {dashboardStats.overallProgress}%
            </span>
          </div>
        </section>

        <section className="projects-section">

          <h3>My Projects</h3>

          {projects.length === 0 ? (
            <p>
              No projects found.
            </p>
          ) : (
            <div className="project-grid">

              {projects.map((project) => (

                <div
                  className="project-card"
                  key={project.id}
                  onClick={() =>
                    openProject(project)
                  }
                  style={{
                    cursor: "pointer",
                  }}
                >

                  <h3>
                    {project.name}
                  </h3>

                  <p>
                    {project.description ||
                      "No description available."}
                  </p>

                  <span className="status">
                    {project.status}
                  </span>

                  <div className="project-details">

                    <p>
                      <strong>
                        Start:
                      </strong>{" "}
                      {project.start_date ||
                        "Not set"}
                    </p>

                    <p>
                      <strong>
                        End:
                      </strong>{" "}
                      {project.end_date ||
                        "Not set"}
                    </p>

                  </div>

                  <p
                    style={{
                      marginTop: "15px",
                      fontWeight: "bold",
                    }}
                  >
                    Click to view project →
                  </p>

                </div>

              ))}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default App;