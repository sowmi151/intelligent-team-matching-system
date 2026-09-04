import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { fetchWithAuth } from "./services/api";

function getInitials(name = "Student") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function Dashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchWithAuth("/auth/me")
      .then((data) => setUser(data))
      .catch((err) => console.error("Failed to load user:", err));
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Find Teammates", icon: "⌘" },
    { name: "My Teams", icon: "◉" },
    { name: "Messages", icon: "✉" },
    { name: "Projects", icon: "◫" },
    { name: "Notifications", icon: "◌" },
  ];

  const renderPage = () => {
    switch (activePage) {
      case "Find Teammates":
        return <FindTeammates />;
      case "My Teams":
        return <MyTeams />;
      case "Messages":
        return <Messages />;
      case "Projects":
        return <Projects />;
      case "Notifications":
        return <Notifications />;
      case "Settings":
        return <Settings />;
      case "Edit Profile":
        return <EditProfile user={user} />;
      default:
        return <Home setActivePage={setActivePage} user={user} />;
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    window.location.reload();
  };

  return (
    <div className="app">
      <aside className="sidebar glass">
        <div className="logo">
          <div className="logo-mark">TB</div>

          <div>
            <h2>TeamBloom</h2>
            <small>COLLABORATION WORKSPACE</small>
          </div>
        </div>

        <nav>
          {menuItems.map((item) => (
            <a
              key={item.name}
              href="#"
              className={activePage === item.name ? "active" : ""}
              onClick={(event) => {
                event.preventDefault();
                setActivePage(item.name);
              }}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <a
            href="#"
            className={activePage === "Settings" ? "active" : ""}
            onClick={(event) => {
              event.preventDefault();
              setActivePage("Settings");
            }}
          >
            <span>⚙</span>
            <span>Settings</span>
          </a>

          <div
            className="mini-profile"
            role="button"
            tabIndex={0}
            onClick={() => setActivePage("Edit Profile")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                setActivePage("Edit Profile");
              }
            }}
          >
            <div className="avatar">{getInitials(user?.name || "Student")}</div>

            <div>
              <b>{user?.name || "Student"}</b>
              <small>{user?.department || user?.domain || "Member"}</small>
            </div>

            <span>⋮</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="welcome">WORKSPACE OVERVIEW</p>

            <h1>
              {activePage === "Dashboard"
                ? `Welcome back, ${user?.name?.split(" ")[0] || "Student"}`
                : activePage}
            </h1>

            <p className="subtitle">
              {activePage === "Dashboard"
                ? "Track projects, discover compatible collaborators, and manage your teams."
                : `Manage your ${activePage.toLowerCase()} from one place.`}
            </p>
          </div>

          <div className="top-actions">
            <button
              className="icon-btn"
              type="button"
              title="Notifications"
              onClick={() => setActivePage("Notifications")}
            >
              ◌
            </button>

            <button
              className="profile-btn"
              type="button"
              onClick={() => setActivePage("Settings")}
            >
              <span className="top-avatar">
                {getInitials(user?.name || "Student")}
              </span>
              <b>{user?.name?.split(" ")[0] || "Student"}</b>
              <span>⌄</span>
            </button>

            <button
              className="logout-btn"
              type="button"
              title="Logout"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        {renderPage()}
      </main>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

function Home({ setActivePage, user }) {
  const [stats, setStats] = useState({
    team_matches: 0,
    avg_match: 0,
    active_projects: 0,
    new_requests: 0,
  });

  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchWithAuth("/dashboard/stats")
      .then((data) => setStats(data))
      .catch(console.error);

    fetchWithAuth("/recommendations")
      .then((data) => setRecommendations((data || []).slice(0, 3)))
      .catch(console.error);
  }, []);

  const handleConnect = async (studentId) => {
    try {
      await fetchWithAuth("/requests", {
        method: "POST",
        body: JSON.stringify({ receiver_id: studentId }),
      });

      alert("Connection request sent.");
    } catch (error) {
      alert(error.message || "Failed to send connection request.");
    }
  };

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <span className="tag">AI-POWERED TEAM MATCHING</span>

          <h2>
            Find the right people.
            <span> Build better projects.</span>
          </h2>

          <p>
            Discover students with compatible skills, interests, and working
            preferences for your next project.
          </p>

          <div className="hero-actions">
            <button
              className="primary-btn"
              type="button"
              onClick={() => setActivePage("Find Teammates")}
            >
              Explore teammates <span>→</span>
            </button>

            <button
              className="secondary-btn"
              type="button"
              onClick={() => setActivePage("Projects")}
            >
              View projects
            </button>
          </div>
        </div>

        <div className="hero-panel">
          <div className="panel-label">TEAM MATCH ENGINE</div>

          <div className="match-ring">
            <span>{stats.avg_match || 0}%</span>
            <small>average fit</small>
          </div>

          <div className="match-lines">
            <div>
              <span>Technical skills</span>
              <b>Strong</b>
            </div>

            <div>
              <span>Working style</span>
              <b>Compatible</b>
            </div>

            <div>
              <span>Project interests</span>
              <b>Aligned</b>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <Stat
          icon="⌘"
          color="blue"
          title="TEAM MATCHES"
          value={stats.team_matches || 0}
          text="Potential collaborators"
        />

        <Stat
          icon="◉"
          color="purple"
          title="AVERAGE MATCH"
          value={`${stats.avg_match || 0}%`}
          text="Compatibility score"
        />

        <Stat
          icon="◫"
          color="yellow"
          title="ACTIVE PROJECTS"
          value={String(stats.active_projects || 0).padStart(2, "0")}
          text="Projects in progress"
        />

        <Stat
          icon="✉"
          color="blue"
          title="NEW REQUESTS"
          value={String(stats.new_requests || 0).padStart(2, "0")}
          text="Awaiting response"
        />
      </section>

      <div className="content-grid">
        <section className="recommendations glass">
          <div className="section-heading">
            <div>
              <span className="eyebrow">RECOMMENDED FOR YOU</span>
              <h2>Potential collaborators</h2>
            </div>

            <button
              className="see-all"
              type="button"
              onClick={() => setActivePage("Find Teammates")}
            >
              View all →
            </button>
          </div>

          <div className="people">
            {recommendations.length > 0 ? (
              recommendations.map((recommendation) => (
                <Person
                  key={recommendation.id}
                  name={recommendation.name}
                  role={recommendation.role || "Student"}
                  match={`${recommendation.match_score || 0}%`}
                  skills={
                    recommendation.skills
                      ? recommendation.skills.split(",").slice(0, 3)
                      : ["No skills added"]
                  }
                  onConnect={() => handleConnect(recommendation.id)}
                />
              ))
            ) : (
              <p className="empty-state">Finding compatible teammates...</p>
            )}
          </div>
        </section>

        <aside className="right-column">
          <ProfileCard
            user={user}
            onEditClick={() => setActivePage("Edit Profile")}
          />

          <ProjectsMini />
        </aside>
      </div>

      <section className="bottom-banner glass">
        <div className="banner-emoji"></div>

        <div>
          <span className="eyebrow">COLLABORATION INSIGHT</span>
          <h2>Strong teams align on skills, goals, and execution.</h2>
          <p>
            Build better projects by defining roles early and communicating
            clearly.
          </p>
        </div>
      </section>
    </>
  );
}

function Stat({ icon, color, title, value, text }) {
  return (
    <div className="stat-card glass">
      <div className={`stat-icon ${color}`}>{icon}</div>

      <div>
        <small>{title}</small>
        <h3>{value}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function Person({ name, role, match, skills, onConnect }) {
  return (
    <div className="person-card">
      <div className="person-picture">{getInitials(name || "Student")}</div>

      <div className="person-info">
        <div className="person-header">
          <div>
            <h3>{name || "Unnamed Student"}</h3>
            <p>{role}</p>
          </div>

          <span className="match-badge">{match} match</span>
        </div>

        <div className="skills">
          {skills.map((skill, index) => (
            <span key={`${skill}-${index}`}>{skill.trim()}</span>
          ))}
        </div>

        <div className="match">
          <div className="match-meta">
            <span>Compatibility</span>
            <b>{match}</b>
          </div>

          <div className="progress">
            <span style={{ width: match }}></span>
          </div>
        </div>

        <button className="connect" type="button" onClick={onConnect}>
          Connect <span>→</span>
        </button>
      </div>
    </div>
  );
}

function ProfileCard({ user, onEditClick }) {
  const skillsArray = user?.skills
    ? user.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  return (
    <div className="profile-card glass">
      <div className="profile-cover"></div>

      <div className="big-avatar">{getInitials(user?.name || "Student")}</div>

      <h2>{user?.name || "Student"}</h2>

      <p>
        {user?.college || "College not added"}
        {user?.section ? ` • ${user.section}` : ""}
      </p>

      {user?.domain && (
        <p style={{ fontWeight: "600", marginTop: "5px" }}>{user.domain}</p>
      )}

      <div className="profile-tags">
        {skillsArray.length > 0 ? (
          skillsArray.map((skill) => <span key={skill}>{skill}</span>)
        ) : (
          <span>Add skills from your profile</span>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          marginBottom: "15px",
        }}
      >
        {user?.linkedin && (
          <a
            href={user.linkedin}
            target="_blank"
            rel="noreferrer"
            title="LinkedIn"
            style={{ color: "#38bdf8", textDecoration: "none" }}
          >
            in
          </a>
        )}

        {user?.github && (
          <a
            href={user.github}
            target="_blank"
            rel="noreferrer"
            title="GitHub"
            style={{ color: "#38bdf8", textDecoration: "none" }}
          >
            GitHub
          </a>
        )}

        {user?.portfolio && (
          <a
            href={user.portfolio}
            target="_blank"
            rel="noreferrer"
            title="Portfolio"
            style={{ color: "#38bdf8", textDecoration: "none" }}
          >
            Site
          </a>
        )}
      </div>

      <button className="edit-btn" type="button" onClick={onEditClick}>
        Edit profile
      </button>
    </div>
  );
}

function ProjectsMini() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchWithAuth("/projects")
      .then((data) => setProjects((data || []).slice(0, 3)))
      .catch(console.error);
  }, []);

  return (
    <div className="projects glass">
      <div className="section-heading">
        <div>
          <span className="eyebrow">ACTIVE WORK</span>
          <h2>Projects</h2>
        </div>

        <span className="count">
          {String(projects.length).padStart(2, "0")}
        </span>
      </div>

      {projects.length > 0 ? (
        projects.map((project) => (
          <Project
            key={project.id}
            title={project.title}
            description={project.domain || "Ongoing project"}
            progress={`${project.progress || 0}%`}
          />
        ))
      ) : (
        <p className="empty-state">No active projects yet.</p>
      )}
    </div>
  );
}

function Project({ title, description, progress }) {
  return (
    <div className="project">
      <div className="project-icon">◫</div>

      <div>
        <h3>{title}</h3>
        <p>{description}</p>

        <div className="project-progress">
          <span style={{ width: progress }}></span>
        </div>
      </div>

      <b>{progress}</b>
    </div>
  );
}

/* =========================
   REUSABLE PAGE CONTAINER
========================= */

function PageBox({ title, description, children }) {
  return (
    <section className="page-box glass">
      <div className="page-icon"></div>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </section>
  );
}

/* =========================
   FIND TEAMMATES
========================= */

function FindTeammates() {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchWithAuth("/recommendations")
      .then((data) => setRecommendations(data || []))
      .catch(console.error);
  }, []);

  const handleConnect = async (studentId) => {
    try {
      await fetchWithAuth("/requests", {
        method: "POST",
        body: JSON.stringify({ receiver_id: studentId }),
      });

      alert("Connection request sent.");
    } catch (error) {
      alert(error.message || "Failed to send connection request.");
    }
  };

  return (
    <PageBox
      title="Find teammates"
      description="Discover students with compatible skills, interests, and working preferences."
    >
      <div className="big-page-grid">
        {recommendations.length > 0 ? (
          recommendations.map((recommendation) => (
            <div key={recommendation.id} className="match-user">
              <h3>{recommendation.name}</h3>
              <p>{recommendation.role || "Student"}</p>
              <strong>{recommendation.match_score || 0}% compatibility</strong>

              <button
                className="primary-btn"
                type="button"
                onClick={() => handleConnect(recommendation.id)}
              >
                Connect →
              </button>
            </div>
          ))
        ) : (
          <p className="empty-state">Finding teammates...</p>
        )}
      </div>
    </PageBox>
  );
}

/* =========================
   MY TEAMS
========================= */

function MyTeams() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchWithAuth("/teams")
      .then((data) => setTeams(data || []))
      .catch(console.error);
  }, []);

  return (
    <PageBox
      title="My teams"
      description="Manage your current teams and collaborate with your teammates."
    >
      <div className="team-list">
        {teams.length > 0 ? (
          teams.map((team) => (
            <div key={team.id} className="team-item">
              <span>◉</span>

              <div>
                <h3>{team.name}</h3>
                <p>
                  {team.members_count || 0} members
                  {team.category ? ` • ${team.category}` : ""}
                </p>
              </div>

              <b>{team.status || "Active"}</b>
            </div>
          ))
        ) : (
          <p className="empty-state">You have not joined a team yet.</p>
        )}
      </div>
    </PageBox>
  );
}

/* =========================
   MESSAGES
========================= */

function Messages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchWithAuth("/messages")
      .then((data) => setMessages(data || []))
      .catch(console.error);
  }, []);

  return (
    <PageBox
      title="Messages"
      description="Communicate with teammates and project collaborators."
    >
      <div className="message-list">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div key={message.id} className="message-item">
              <div className="message-avatar">
                {getInitials(message.sender_name || "Student")}
              </div>

              <div>
                <h3>{message.sender_name || "Student"}</h3>
                <p>{message.content}</p>
              </div>

              <span>{message.created_at || "Recent"}</span>
            </div>
          ))
        ) : (
          <p className="empty-state">Your inbox is empty.</p>
        )}
      </div>
    </PageBox>
  );
}

/* =========================
   PROJECTS
========================= */

function Projects() {
  const [projects, setProjects] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", domain: "" });

  // Function to grab projects from the database
  const fetchProjects = () => {
    fetchWithAuth("/projects")
      .then((data) => setProjects(data || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Function to send a new project to the database
  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      await fetchWithAuth("/projects", {
        method: "POST",
        body: JSON.stringify(newProject),
      });
      
      // Hide the form, clear the inputs, and refresh the list!
      setIsCreating(false);
      setNewProject({ title: "", domain: "" });
      fetchProjects();
    } catch (error) {
      alert("Failed to create project: " + error.message);
    }
  };

  const inputStyle = {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #26354d",
    background: "#0c1423",
    color: "#f8fafc",
    width: "100%",
    marginBottom: "10px"
  };

  return (
    <PageBox
      title="Projects"
      description="Explore and manage your college projects."
    >
      {/* The Create Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button 
          className="primary-btn" 
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? "Cancel" : "+ Create Project"}
        </button>
      </div>

      {/* The Creation Form (Only shows when button is clicked) */}
      {isCreating && (
        <form onSubmit={handleCreate} className="glass" style={{ padding: "20px", marginBottom: "20px", borderRadius: "12px" }}>
          <h3 style={{ marginBottom: "15px" }}>Start a New Project</h3>
          
          <input
            style={inputStyle}
            placeholder="Project Title (e.g., Smart Attendance System) *"
            required
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
          />
          
          <input
            style={inputStyle}
            placeholder="Domain (e.g., AI, Web Development, IoT)"
            value={newProject.domain}
            onChange={(e) => setNewProject({ ...newProject, domain: e.target.value })}
          />
          
          <button type="submit" className="primary-btn">
            Save Project
          </button>
        </form>
      )}

      {/* The Projects Grid */}
      <div className="big-page-grid">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.id} className="match-user">
              <h3>{project.title}</h3>
              <p>{project.domain || "Software project"}</p>
              <strong>{project.progress || 0}% complete</strong>
            </div>
          ))
        ) : (
          <p className="empty-state">
            No projects found. Click the button above to start building something!
          </p>
        )}
      </div>
    </PageBox>
  );
}

/* =========================
   NOTIFICATIONS (NEW)
========================= */

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchWithAuth("/notifications")
      .then((data) => setNotifications(data || []))
      .catch(console.error);
  }, []);

  return (
    <PageBox
      title="Notifications"
      description="Stay updated on team requests and project activity."
    >
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification.id} className="notification">
              <div>
                <h3>{notification.title}</h3>
                <p>{notification.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-state">No notifications yet.</p>
        )}
      </div>
    </PageBox>
  );
}

/* =========================
   SETTINGS (NEW)
========================= */

function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [aiRecs, setAiRecs] = useState(true);

  useEffect(() => {
    fetchWithAuth("/settings")
      .then(data => {
        setDarkMode(data.dark_mode);
        setNotifications(data.notifications_enabled);
        setAiRecs(data.ai_recommendations_enabled);
      })
      .catch(console.error);
  }, []);

  const toggleSetting = async (field, value) => {
    setDarkMode(field === "dark_mode" ? value : darkMode);
    setNotifications(field === "notifications_enabled" ? value : notifications);
    setAiRecs(field === "ai_recommendations_enabled" ? value : aiRecs);

    await fetchWithAuth("/settings", {
      method: "PUT",
      body: JSON.stringify({ [field]: value }),
    }).catch(console.error);
  };

  return (
    <PageBox title="Settings" description="Manage your preferences.">
      <div className="settings-list">
        <div className="setting">
          <div>
            <h3>Dark mode</h3>
            <p>Enable dark theme for the interface.</p>
          </div>
          <button
            className={`toggle ${darkMode ? "on" : ""}`}
            onClick={() => toggleSetting("dark_mode", !darkMode)}
          >
            {darkMode ? "ON" : "OFF"}
          </button>
        </div>

        <div className="setting">
          <div>
            <h3>Notifications</h3>
            <p>Receive alerts about new matches and requests.</p>
          </div>
          <button
            className={`toggle ${notifications ? "on" : ""}`}
            onClick={() => toggleSetting("notifications_enabled", !notifications)}
          >
            {notifications ? "ON" : "OFF"}
          </button>
        </div>

        <div className="setting">
          <div>
            <h3>AI recommendations</h3>
            <p>Use AI to suggest compatible teammates.</p>
          </div>
          <button
            className={`toggle ${aiRecs ? "on" : ""}`}
            onClick={() => toggleSetting("ai_recommendations_enabled", !aiRecs)}
          >
            {aiRecs ? "ON" : "OFF"}
          </button>
        </div>
      </div>
    </PageBox>
  );
}

/* =========================
   EDIT PROFILE
========================= */

function EditProfile({ user }) {
  const [profile, setProfile] = useState({
    name: "",
    college: "",
    section: "",
    domain: "",
    skills: "",
    talents: "",
    linkedin: "",
    github: "",
    portfolio: "",
    bio: "",
  });

  useEffect(() => {
    if (!user) return;

    setProfile({
      name: user.name || "",
      college: user.college || "",
      section: user.section || "",
      domain: user.domain || "",
      skills: user.skills || "",
      talents: user.talents || "",
      linkedin: user.linkedin || "",
      github: user.github || "",
      portfolio: user.portfolio || "",
      bio: user.bio || "",
    });
  }, [user]);

  const updateField = (field, value) => {
    setProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      await fetchWithAuth("/profile", {
        method: "PUT",
        body: JSON.stringify(profile),
      });

      alert("Profile updated successfully.");
      window.location.reload();
    } catch (error) {
      alert(`Failed to update profile: ${error.message}`);
      console.error(error);
    }
  };

  const inputStyle = {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #26354d",
    outline: "none",
    background: "#0c1423",
    width: "100%",
    color: "#f8fafc",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    color: "#94a3b8",
    fontSize: "0.78rem",
    fontWeight: "600",
  };

  return (
    <PageBox
      title="Edit profile"
      description="Keep your profile current to improve teammate recommendations."
    >
      <form
        onSubmit={handleSave}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Full name</label>
          <input
            style={inputStyle}
            value={profile.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>College name</label>
          <input
            style={inputStyle}
            value={profile.college}
            onChange={(event) => updateField("college", event.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Section / branch</label>
          <input
            style={inputStyle}
            value={profile.section}
            onChange={(event) => updateField("section", event.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Domain</label>
          <input
            style={inputStyle}
            placeholder="Example: AI, Web Development, IoT"
            value={profile.domain}
            onChange={(event) => updateField("domain", event.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Skills</label>
          <input
            style={inputStyle}
            placeholder="React, Python, UI Design"
            value={profile.skills}
            onChange={(event) => updateField("skills", event.target.value)}
          />
        </div>

        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Interests / hobbies</label>
          <input
            style={inputStyle}
            value={profile.talents}
            onChange={(event) => updateField("talents", event.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>LinkedIn URL</label>
          <input
            type="url"
            style={inputStyle}
            value={profile.linkedin}
            onChange={(event) => updateField("linkedin", event.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>GitHub URL</label>
          <input
            type="url"
            style={inputStyle}
            value={profile.github}
            onChange={(event) => updateField("github", event.target.value)}
          />
        </div>

        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Portfolio URL</label>
          <input
            type="url"
            style={inputStyle}
            value={profile.portfolio}
            onChange={(event) => updateField("portfolio", event.target.value)}
          />
        </div>

        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Bio</label>
          <textarea
            rows="4"
            style={{ ...inputStyle, resize: "vertical" }}
            value={profile.bio}
            onChange={(event) => updateField("bio", event.target.value)}
          />
        </div>

        <button
          type="submit"
          className="primary-btn"
          style={{
            gridColumn: "span 2",
            padding: "12px",
            fontSize: "0.95rem",
          }}
        >
          Save changes
        </button>
      </form>
    </PageBox>
  );
}

/* =========================
   AUTHENTICATION
========================= */

function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [nickname, setNickname] = useState("");
  const [dob, setDob] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    const payload = isLogin
      ? { email, password }
      : {
          name: firstName,
          first_name: firstName,
          nickname,
          dob,
          email,
          password,
        };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Authentication failed.");
      }

      const data = await response.json();

      if (!data.access_token) {
        throw new Error("No access token was returned by the server.");
      }

      localStorage.setItem("access_token", data.access_token);
      onLogin();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSocialAuth = (provider) => {
    alert(`${provider} authentication is not configured yet.`);
  };

  const inputStyle = {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #26354d",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    background: "#0c1423",
    color: "#f8fafc",
    fontSize: "0.9rem",
  };

  const socialBtnStyle = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #26354d",
    color: "#cbd5e1",
    background: "#111827",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.78rem",
    transition: "0.2s",
  };

  return (
    <div
      className="app"
      style={{
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div
        className="page-box glass"
        style={{
          maxWidth: "440px",
          width: "100%",
          padding: "2.2rem",
        }}
      >
        <div
          className="logo"
          style={{
            justifyContent: "center",
            padding: "0 0 24px",
          }}
        >
          <div className="logo-mark">TB</div>

          <div>
            <h2>TeamBloom</h2>
            <small>COLLABORATION WORKSPACE</small>
          </div>
        </div>

        <h2
          style={{
            textAlign: "center",
            marginBottom: "0.4rem",
            fontSize: "1.7rem",
          }}
        >
          {isLogin ? "Welcome back" : "Create your account"}
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#94a3b8",
            marginBottom: "1.5rem",
            fontSize: "0.88rem",
          }}
        >
          {isLogin
            ? "Sign in to access your collaboration workspace."
            : "Create a profile and start finding project teammates."}
        </p>

        <div style={{ display: "flex", gap: "10px", marginBottom: "1.2rem" }}>
          <button
            type="button"
            style={socialBtnStyle}
            onClick={() => handleSocialAuth("Google")}
          >
            Google
          </button>

          <button
            type="button"
            style={socialBtnStyle}
            onClick={() => handleSocialAuth("GitHub")}
          >
            GitHub
          </button>

          <button
            type="button"
            style={socialBtnStyle}
            onClick={() => handleSocialAuth("Facebook")}
          >
            Facebook
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "1.2rem 0",
            color: "#64748b",
            fontSize: "0.8rem",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#26354d",
            }}
          ></div>

          <span style={{ padding: "0 10px" }}>OR CONTINUE WITH EMAIL</span>

          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#26354d",
            }}
          ></div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.9rem",
          }}
        >
          {!isLogin && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.8rem",
                }}
              >
                <input
                  type="text"
                  placeholder="First name *"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  style={inputStyle}
                />

                <input
                  type="text"
                  placeholder="Nickname"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    marginBottom: "5px",
                    display: "block",
                    fontWeight: "600",
                  }}
                >
                  Date of birth *
                </label>

                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(event) => setDob(event.target.value)}
                  style={inputStyle}
                />
              </div>
            </>
          )}

          <input
            type="email"
            placeholder="Email address *"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={inputStyle}
          />

          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password *"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={{ ...inputStyle, paddingRight: "50px" }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: "600",
                padding: "0",
              }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>

          <button
            type="submit"
            className="primary-btn"
            style={{ marginTop: "0.6rem", padding: "12px" }}
          >
            {isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.2rem",
            cursor: "pointer",
            color: "#38bdf8",
            fontSize: "0.85rem",
            fontWeight: "600",
          }}
          onClick={() => {
            setIsLogin((current) => !current);
            setShowPassword(false);
          }}
        >
          {isLogin
            ? "Need an account? Create one"
            : "Already have an account? Sign in"}
        </p>
      </div>
    </div>
  );
}

/* =========================
   APP ENTRY
========================= */

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("access_token"))
  );

  if (!isAuthenticated) {
    return <AuthScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return <Dashboard />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);