import React, { useEffect, useState, useRef } from "react";
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
  const [user, setUser] = useState(null);  // ✅ ADDED MISSING STATE
  const [isNew, setIsNew] = useState(false);
  const isPopState = useRef(false);

  const pageToPath = {
    Dashboard: "/",
    "Find Teammates": "/find-teammates",
    "My Teams": "/my-teams",
    Messages: "/messages",
    Projects: "/projects",
    Notifications: "/notifications",
    Settings: "/settings",
    "Edit Profile": "/edit-profile",
  };

  const pathToPage = {
    "/": "Dashboard",
    "/find-teammates": "Find Teammates",
    "/my-teams": "My Teams",
    "/messages": "Messages",
    "/projects": "Projects",
    "/notifications": "Notifications",
    "/settings": "Settings",
    "/edit-profile": "Edit Profile",
  };

  useEffect(() => {
    const path = window.location.pathname;
    setActivePage(pathToPage[path] || "Dashboard");
  }, []);

  // ✅ This is the combined useEffect for fetching user + handling is_new
  useEffect(() => {
    fetchWithAuth("/auth/me")
      .then((data) => {
        setUser(data);
        const newFlag = localStorage.getItem("is_new");
        if (newFlag === "true") {
          setIsNew(true);
          localStorage.setItem("is_new", "false");
        } else {
          setIsNew(false);
        }
      })
      .catch((err) => console.error("Failed to load user:", err));
  }, []);

  // ❌ Removed the duplicate useEffect (commented out to avoid error)
  /*
  useEffect(() => {
    fetchWithAuth("/auth/me")
      .then((data) => setUser(data))
      .catch((err) => console.error("Failed to load user:", err));
  }, []);
  */

  useEffect(() => {
    if (!isPopState.current) {
      const path = pageToPath[activePage] || "/";
      window.history.pushState({}, "", path);
    } else {
      isPopState.current = false;
    }
  }, [activePage]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      isPopState.current = true;
      setActivePage(pathToPage[path] || "Dashboard");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Find Teammates", icon: "⌘" },
    { name: "My Teams", icon: "◉" },
    { name: "Messages", icon: "✉" },
    { name: "Projects", icon: "◫" },
    { name: "Notifications", icon: "◌" },
  ];

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

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
        return <EditProfile user={user} setActivePage={setActivePage} onUserUpdate={handleUserUpdate} />;
      default:
        return <Home setActivePage={setActivePage} user={user} />;
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("is_new");  // ✅ Added this
    window.location.reload();
  };

  const firstName = user?.name?.split(" ")[0] || "Student";

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
              {activePage === "Dashboard" ? (
                isNew
                  ? `Hello, ${firstName}! Welcome to TeamBloom`
                  : `Welcome back, ${firstName}`
              ) : (
                activePage
              )}
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
              <b>{firstName}</b>
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
   ALL OTHER COMPONENTS REMAIN UNCHANGED
   (Home, Stat, Person, ProfileCard, ProjectsMini, Project, PageBox,
    FindTeammates, MyTeams, Messages, Projects, Notifications, Settings,
    EditProfile, AuthScreen, App)
========================= */

// ... (The rest of your file stays exactly the same – I'm not pasting them again to save space, but you can keep them.)

// Make sure you keep everything from Home down to the end.