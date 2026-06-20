import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const canViewManagement = () => {
    return user && ["admin", "moderator", "cr", "lr", "coordinator"].includes(user.role);
  };

  const linkStyle = {
    padding: "8px 14px",
    textDecoration: "none",
    color: "#e2e8f0",
    fontWeight: "500",
    borderRadius: "8px",
    transition: "border-color 0.15s",
    fontSize: "13px",
    border: "1px solid transparent"
  };

  const linkHover = {
    borderColor: "rgba(102, 126, 234, 0.2)"
  };

  return (
    <>
      <nav style={{
        backgroundColor: "#0f0f1a",
        borderBottom: "1px solid #1a1a2e",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}>
          {/* Logo */}
          <div style={{
            fontSize: "20px",
            fontWeight: "800",
            background: "linear-gradient(135deg, #a78bfa, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px",
          }}>
            CLASS-SYNC
          </div>

          {/* Desktop Nav */}
          <div style={{ display: "flex", gap: "2px", alignItems: "center" }} className="desktop-nav">
            <Link to="/dashboard" style={linkStyle} onMouseEnter={(e) => Object.assign(e.target.style, linkHover)} onMouseLeave={(e) => Object.assign(e.target.style, { borderColor: "transparent" })}>Dashboard</Link>
            <Link to="/subjects" style={linkStyle} onMouseEnter={(e) => Object.assign(e.target.style, linkHover)} onMouseLeave={(e) => Object.assign(e.target.style, { borderColor: "transparent" })}>Subjects</Link>
            <Link to="/create-assignment" style={linkStyle} onMouseEnter={(e) => Object.assign(e.target.style, linkHover)} onMouseLeave={(e) => Object.assign(e.target.style, { borderColor: "transparent" })}>Create Assignment</Link>
            <Link to="/timetable" style={linkStyle} onMouseEnter={(e) => Object.assign(e.target.style, linkHover)} onMouseLeave={(e) => Object.assign(e.target.style, { borderColor: "transparent" })}>Timetable</Link>
            <Link to="/announcements" style={linkStyle} onMouseEnter={(e) => Object.assign(e.target.style, linkHover)} onMouseLeave={(e) => Object.assign(e.target.style, { borderColor: "transparent" })}>Announcements</Link>
            <Link to="/users" style={linkStyle} onMouseEnter={(e) => Object.assign(e.target.style, linkHover)} onMouseLeave={(e) => Object.assign(e.target.style, { borderColor: "transparent" })}>Class Directory</Link>
            
            {canViewManagement() && (
              <>
                <Link to="/create-subject" style={linkStyle} onMouseEnter={(e) => Object.assign(e.target.style, linkHover)} onMouseLeave={(e) => Object.assign(e.target.style, { borderColor: "transparent" })}>Manage Subjects</Link>
                <Link to="/manage-folders" style={linkStyle} onMouseEnter={(e) => Object.assign(e.target.style, linkHover)} onMouseLeave={(e) => Object.assign(e.target.style, { borderColor: "transparent" })}>Manage Folders</Link>
              </>
            )}
          </div>

          {/* User Area - Compact */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {user && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 10px",
                background: "#1a1a2e",
                borderRadius: "20px",
                border: "1px solid #2d2d44"
              }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #a78bfa, #ec4899)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "12px"
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ color: "#e2e8f0", fontWeight: "500", fontSize: "13px" }}>{user.name}</span>
                {user.role && (
                  <span style={{
                    fontSize: "10px",
                    padding: "2px 8px",
                    borderRadius: "14px",
                    background: user.role === "admin" ? "rgba(236, 72, 153, 0.15)" : "rgba(16, 185, 129, 0.15)",
                    color: user.role === "admin" ? "#f472b6" : "#34d399",
                    fontWeight: "600"
                  }}>
                    {user.role}
                  </span>
                )}
              </div>
            )}
            <button
              onClick={logout}
              style={{
                padding: "5px 14px",
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "12px",
                transition: "opacity 0.15s"
              }}
              onMouseEnter={(e) => e.target.style.opacity = "0.85"}
              onMouseLeave={(e) => e.target.style.opacity = "1"}
            >
              Logout
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: "none",
                background: "#1a1a2e",
                border: "1px solid #2d2d44",
                borderRadius: "6px",
                fontSize: "18px",
                cursor: "pointer",
                padding: "4px 10px",
                color: "#a78bfa"
              }}
              className="mobile-menu-btn"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: "fixed",
          top: "56px",
          left: 0,
          right: 0,
          background: "#0f0f1a",
          borderBottom: "1px solid #1a1a2e",
          padding: "16px 20px",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          maxHeight: "calc(100vh - 56px)",
          overflowY: "auto"
        }}>
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Dashboard</Link>
          <Link to="/subjects" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Subjects</Link>
          <Link to="/create-assignment" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Create Assignment</Link>
          <Link to="/timetable" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Timetable</Link>
          <Link to="/announcements" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Announcements</Link>
          <Link to="/users" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Class Directory</Link>
          
          {canViewManagement() && (
            <>
              <Link to="/create-subject" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Manage Subjects</Link>
              <Link to="/manage-folders" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Manage Folders</Link>
            </>
          )}
          <div style={{
            borderTop: "1px solid #2d3748",
            paddingTop: "10px",
            marginTop: "4px"
          }}>
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px",
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .desktop-nav { display: none !important; } .mobile-menu-btn { display: flex !important; } }
        @media (min-width: 769px) { .mobile-menu-btn { display: none !important; } }
        * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        a.active { color: #a78bfa !important; background: rgba(102, 126, 234, 0.08) !important; border-color: rgba(102, 126, 234, 0.2) !important; }
      `}</style>
    </>
  );
}

export default Navbar;