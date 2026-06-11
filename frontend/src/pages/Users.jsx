import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/auth/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("⚠️ Delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter((user) => user.id !== userId));
      alert("✅ User deleted successfully");
    } catch (error) {
      console.error(error);
      alert("❌ Delete failed");
    }
  };

  const toggleRole = async (userId) => {
    setUpdating(userId);
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(
        `/auth/users/${userId}/role`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: response.data.role } : user
        )
      );
      alert(`✅ User role updated to ${response.data.role}`);
    } catch (error) {
      console.error(error);
      alert("❌ Role update failed");
    } finally {
      setUpdating(null);
    }
  };

  const getInitials = (name) => {
    return name.charAt(0).toUpperCase();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.roll_no.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    students: users.filter((u) => u.role === "student").length
  };

  const styles = {
    container: {
      backgroundColor: "#0a0e27",
      minHeight: "100vh",
      padding: "30px 20px"
    },
    content: {
      maxWidth: "900px",
      margin: "0 auto"
    },
    heading: {
      color: "#ffffff",
      fontSize: "28px",
      marginBottom: "8px"
    },
    subheading: {
      color: "#a0aec0",
      fontSize: "14px",
      marginBottom: "25px"
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "15px",
      marginBottom: "25px"
    },
    statCard: {
      background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
      padding: "16px",
      borderRadius: "12px",
      border: "1px solid #2d3748",
      textAlign: "center"
    },
    statValue: {
      color: "#ffffff",
      fontSize: "28px",
      fontWeight: "700",
      marginBottom: "4px"
    },
    statLabel: {
      color: "#94a3b8",
      fontSize: "13px"
    },
    searchBox: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "10px",
      border: "1px solid #2d3748",
      backgroundColor: "#1a1f3a",
      color: "#ffffff",
      fontSize: "14px",
      outline: "none",
      transition: "all 0.2s",
      marginBottom: "20px",
      boxSizing: "border-box"
    },
    userCard: {
      background: "#1a1f3a",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "12px",
      border: "1px solid #2d3748",
      transition: "all 0.3s ease"
    },
    userCardContent: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap"
    },
    avatar: {
      width: "55px",
      height: "55px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "700",
      fontSize: "22px",
      flexShrink: 0
    },
    userDetails: {
      flex: 1,
      minWidth: "180px"
    },
    userName: {
      color: "#ffffff",
      fontSize: "18px",
      fontWeight: "600",
      margin: "0 0 6px 0",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flexWrap: "wrap"
    },
    userRollNo: {
      color: "#94a3b8",
      fontSize: "13px",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "6px"
    },
    roleBadge: {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600"
    },
    roleAdmin: {
      background: "rgba(236, 72, 153, 0.2)",
      color: "#f472b6"
    },
    roleStudent: {
      background: "rgba(16, 185, 129, 0.2)",
      color: "#34d399"
    },
    buttonGroup: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap"
    },
    buttonMakeAdmin: {
      background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "8px 16px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      transition: "all 0.2s"
    },
    buttonMakeStudent: {
      background: "linear-gradient(135deg, #10b981, #059669)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "8px 16px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      transition: "all 0.2s"
    },
    buttonDelete: {
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "8px 16px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      transition: "all 0.2s"
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed"
    },
    loadingContainer: {
      textAlign: "center",
      padding: "60px",
      background: "#1a1f3a",
      borderRadius: "12px",
      border: "1px solid #2d3748"
    },
    spinner: {
      width: "40px",
      height: "40px",
      border: "3px solid #2d3748",
      borderTopColor: "#667eea",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto 16px"
    },
    emptyContainer: {
      textAlign: "center",
      padding: "60px",
      background: "#1a1f3a",
      borderRadius: "12px",
      border: "1px solid #2d3748"
    },
    emptyIcon: {
      fontSize: "48px",
      marginBottom: "16px"
    },
    emptyTitle: {
      color: "#ffffff",
      fontSize: "18px",
      marginBottom: "8px"
    },
    emptyText: {
      color: "#94a3b8",
      fontSize: "14px",
      margin: 0
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={{ color: "#94a3b8" }}>Loading users...</p>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.heading}>👥 Users</h1>
          <p style={styles.subheading}>Manage students and administrators</p>

          {/* Stats Bar */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.total}</div>
              <div style={styles.statLabel}>Total Users</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.admins}</div>
              <div style={styles.statLabel}>👑 Admins</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.students}</div>
              <div style={styles.statLabel}>🎓 Students</div>
            </div>
          </div>

          <input
            type="text"
            placeholder="🔍 Search by name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchBox}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
          />

          {filteredUsers.length === 0 ? (
            <div style={styles.emptyContainer}>
              <div style={styles.emptyIcon}>🔍</div>
              <h3 style={styles.emptyTitle}>No users found</h3>
              <p style={styles.emptyText}>Try a different search term</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                style={styles.userCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(5px)";
                  e.currentTarget.style.borderColor = "#667eea";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.borderColor = "#2d3748";
                }}
              >
                <div style={styles.userCardContent}>
                  <div style={styles.avatar}>
                    {getInitials(user.name)}
                  </div>
                  
                  <div style={styles.userDetails}>
                    <div style={styles.userName}>
                      {user.name}
                      <span
                        style={{
                          ...styles.roleBadge,
                          ...(user.role === "admin" ? styles.roleAdmin : styles.roleStudent)
                        }}
                      >
                        {user.role === "admin" ? "👑 Admin" : "🎓 Student"}
                      </span>
                    </div>
                    <p style={styles.userRollNo}>
                      <span>🎫</span> Roll No: {user.roll_no}
                    </p>
                  </div>

                  <div style={styles.buttonGroup}>
                    <button
                      onClick={() => toggleRole(user.id)}
                      disabled={updating === user.id}
                      style={{
                        ...(user.role === "admin" ? styles.buttonMakeStudent : styles.buttonMakeAdmin),
                        ...(updating === user.id ? styles.buttonDisabled : {})
                      }}
                      onMouseEnter={(e) => {
                        if (updating !== user.id) e.currentTarget.style.opacity = "0.85";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      {updating === user.id
                        ? "⏳ Updating..."
                        : user.role === "admin"
                        ? "⬇ Make Student"
                        : "⬆ Make Admin"}
                    </button>

                    {user.role !== "admin" && (
                      <button
                        onClick={() => deleteUser(user.id)}
                        style={styles.buttonDelete}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        🗑 Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Users;