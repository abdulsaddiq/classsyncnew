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

  // Role-based visibility helpers
  const canViewManagement = () => {
    return user && ["admin", "moderator", "cr", "lr", "coordinator"].includes(user.role);
  };

  const linkStyle = {
    padding: "8px 16px",
    textDecoration: "none",
    color: "#e2e8f0",
    fontWeight: "500",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    fontSize: "14px",
  };

  const linkHover = {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    color: "#a78bfa",
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
          padding: "12px 24px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}>
          {/* Logo */}
          <div style={{
            fontSize: "22px",
            fontWeight: "800",
            background: "linear-gradient(135deg, #a78bfa, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px",
          }}>
            CLASS-SYNC
          </div>

          {/* Desktop Nav */}
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }} className="desktop-nav">
            <Link to="/dashboard" style={linkStyle} onMouseEnter={(e) => Object.assign(e.target.style, linkHover)} onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: "transparent", color: "#e2e8f0" })}>Dashboard</Link>
            <Link to="/announcements" style={linkStyle} onMouseEnter={(e) => Object.assign(e.target.style, linkHover)} onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: "transparent", color: "#e2e8f0" })}>Announcements</Link>
            
            {/* Visible to everyone */}
            <Link to="/create-announcement" style={linkStyle} onMouseEnter={(e) => Object.assign(e.target.style, linkHover)} onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: "transparent", color: "#e2e8f0" })}>Create Announcement</Link>
            <Link to="/upload-file" style={linkStyle} onMouseEnter={(e) => Object.assign(e.target.style, linkHover)} onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: "transparent", color: "#e2e8f0" })}>Upload Notes</Link>
            <Link to="/create-assignment" style={linkStyle} onMouseEnter={(e) => Object.assign(e.target.style, linkHover)} onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: "transparent", color: "#e2e8f0" })}>Create Assignment</Link>
            <Link to="/users" style={linkStyle} onMouseEnter={(e) => Object.assign(e.target.style, linkHover)} onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: "transparent", color: "#e2e8f0" })}>Class Directory</Link>
            
            {/* Management tools - visible to admin, moderator, cr, lr, coordinator */}
            {canViewManagement() && (
              <>
                <Link to="/create-subject" style={linkStyle} onMouseEnter={(e) => Object.assign(e.target.style, linkHover)} onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: "transparent", color: "#e2e8f0" })}>Manage Subjects</Link>
                <Link to="/create-folder" style={linkStyle} onMouseEnter={(e) => Object.assign(e.target.style, linkHover)} onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: "transparent", color: "#e2e8f0" })}>Manage Folders</Link>
              </>
            )}
          </div>

          {/* User Area */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {user && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 12px", background: "#1a1a2e", borderRadius: "24px", border: "1px solid #2d2d44" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #a78bfa, #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "14px" }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ color: "#e2e8f0", fontWeight: "500", fontSize: "14px" }}>{user.name}</span>
                {user.role && (
                  <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: user.role === "admin" ? "rgba(236, 72, 153, 0.2)" : "rgba(16, 185, 129, 0.2)", color: user.role === "admin" ? "#f472b6" : "#34d399", fontWeight: "600" }}>
                    {user.role}
                  </span>
                )}
              </div>
            )}
            <button onClick={logout} style={{ padding: "6px 18px", background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "13px", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.target.style.opacity = "0.85"; e.target.style.transform = "scale(1.02)" }}
              onMouseLeave={(e) => { e.target.style.opacity = "1"; e.target.style.transform = "scale(1)" }}>
              Logout
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: "none", background: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: "8px", fontSize: "20px", cursor: "pointer", padding: "6px 12px", color: "#a78bfa" }} className="mobile-menu-btn">
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{ position: "fixed", top: "64px", left: 0, right: 0, background: "#0f0f1a", borderBottom: "1px solid #1a1a2e", padding: "20px", zIndex: 999, display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Dashboard</Link>
          <Link to="/announcements" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Announcements</Link>
          
          {/* Visible to everyone */}
          <Link to="/create-announcement" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Create Announcement</Link>
          <Link to="/upload-file" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Upload Notes</Link>
          <Link to="/create-assignment" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Create Assignment</Link>
          <Link to="/users" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Class Directory</Link>
          
          {/* Management tools - visible to admin, moderator, cr, lr, coordinator */}
          {canViewManagement() && (
            <>
              <Link to="/create-subject" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Manage Subjects</Link>
              <Link to="/create-folder" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Manage Folders</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .desktop-nav { display: none !important; } .mobile-menu-btn { display: flex !important; } }
        @media (min-width: 769px) { .mobile-menu-btn { display: none !important; } }
        * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        a.active { color: #a78bfa !important; background: rgba(102, 126, 234, 0.1) !important; }
      `}</style>
    </>
  );
}

export default Navbar;