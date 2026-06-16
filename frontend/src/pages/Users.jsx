import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("user"));

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

  const updateRole = async (userId, role) => {
    setUpdating(userId);

    try {
      const token = localStorage.getItem("token");

      const response = await api.put(
        `/auth/users/${userId}/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, role: response.data.role }
            : user
        )
      );
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

  const getRoleInfo = (role) => {
    const roleMap = {
      admin: { label: "Admin", icon: "👑", style: { background: "rgba(236, 72, 153, 0.15)", color: "#f472b6" } },
      moderator: { label: "Moderator", icon: "🛡", style: { background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" } },
      cr: { label: "CR", icon: "🎓", style: { background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" } },
      lr: { label: "LR", icon: "🌸", style: { background: "rgba(244, 114, 182, 0.15)", color: "#f9a8d4" } },
      coordinator: { label: "Coordinator", icon: "📚", style: { background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" } }
    };
    return roleMap[role] || { label: "Student", icon: "👤", style: { background: "rgba(16, 185, 129, 0.15)", color: "#34d399" } };
  };

  const canManageUser = (targetUser) => {
    if (currentUser?.id === targetUser.id) {
      return false;
    }
    if (currentUser?.role === "admin") {
      return true;
    }
    if (currentUser?.role === "moderator") {
      return !["admin", "moderator"].includes(targetUser.role);
    }
    return false;
  };

  const getAvailableRoles = (targetUser) => {
    if (currentUser?.role === "admin") {
      return ["student", "coordinator", "cr", "lr", "moderator", "admin"];
    }
    if (currentUser?.role === "moderator") {
      return ["student", "coordinator", "cr", "lr"];
    }
    return [];
  };

  const canViewMemberSince = () => {
    return ["admin", "moderator", "cr", "lr"].includes(currentUser?.role);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.roll_no.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
  );

  const leadershipRoles = ["admin", "moderator", "cr", "lr", "coordinator"];
  const roleOrder = {
    admin: 1,
    moderator: 2,
    cr: 3,
    lr: 4,
    coordinator: 5
  };

  let leadershipUsers = filteredUsers.filter(user =>
    leadershipRoles.includes(user.role)
  );
  leadershipUsers.sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);

  const regularUsers = filteredUsers.filter(user =>
    !leadershipRoles.includes(user.role)
  );

  const stats = {
    total: users.length,
    leadership: users.filter(u => leadershipRoles.includes(u.role)).length,
    students: users.filter((u) => u.role === "student").length
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
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
      marginBottom: "6px",
      fontWeight: "600"
    },
    subheading: {
      color: "#94a3b8",
      fontSize: "14px",
      marginBottom: "24px"
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      gap: "12px",
      marginBottom: "24px"
    },
    statCard: {
      background: "#1a1f3a",
      padding: "14px",
      borderRadius: "10px",
      border: "1px solid #2d3748",
      textAlign: "center"
    },
    statValue: {
      color: "#ffffff",
      fontSize: "24px",
      fontWeight: "600",
      marginBottom: "2px"
    },
    statLabel: {
      color: "#94a3b8",
      fontSize: "12px"
    },
    searchBox: {
      width: "100%",
      padding: "10px 14px",
      borderRadius: "10px",
      border: "1px solid #2d3748",
      backgroundColor: "#1a1f3a",
      color: "#ffffff",
      fontSize: "14px",
      outline: "none",
      marginBottom: "20px",
      boxSizing: "border-box"
    },
    sectionTitle: {
      color: "#ffffff",
      fontSize: "18px",
      fontWeight: "500",
      marginBottom: "14px",
      marginTop: "20px"
    },
    userCard: {
      background: "#1a1f3a",
      borderRadius: "10px",
      padding: "14px",
      marginBottom: "8px",
      border: "1px solid #2d3748",
      transition: "border-color 0.15s"
    },
    userCardContent: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      flexWrap: "wrap"
    },
    avatar: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "600",
      fontSize: "18px",
      flexShrink: 0
    },
    userInfo: {
      flex: 1,
      minWidth: "160px"
    },
    userNameRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      flexWrap: "wrap",
      marginBottom: "4px"
    },
    userName: {
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: "500",
      margin: 0
    },
    userMeta: {
      display: "flex",
      flexDirection: "column",
      gap: "2px"
    },
    userRollNo: {
      color: "#94a3b8",
      fontSize: "13px",
      margin: 0
    },
    memberSince: {
      color: "#64748b",
      fontSize: "12px",
      margin: 0
    },
    roleBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "2px 10px",
      borderRadius: "14px",
      fontSize: "11px",
      fontWeight: "500"
    },
    buttonGroup: {
      display: "flex",
      gap: "6px",
      flexWrap: "wrap",
      alignItems: "center"
    },
    roleSelect: {
      background: "#0f172a",
      color: "#e2e8f0",
      border: "1px solid #334155",
      borderRadius: "6px",
      padding: "5px 8px",
      fontSize: "12px",
      cursor: "pointer",
      outline: "none"
    },
    buttonDelete: {
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "5px 12px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      transition: "opacity 0.15s"
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: "not-allowed"
    },
    loadingContainer: {
      textAlign: "center",
      padding: "60px",
      background: "#1a1f3a",
      borderRadius: "10px",
      border: "1px solid #2d3748"
    },
    emptyContainer: {
      textAlign: "center",
      padding: "60px",
      background: "#1a1f3a",
      borderRadius: "10px",
      border: "1px solid #2d3748"
    },
    emptyIcon: {
      fontSize: "40px",
      marginBottom: "12px"
    },
    emptyTitle: {
      color: "#ffffff",
      fontSize: "18px",
      marginBottom: "6px"
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
              <p style={{ color: "#94a3b8" }}>Loading class directory...</p>
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
          <h1 style={styles.heading}>👥 Class Directory</h1>
          <p style={styles.subheading}>View class members and leadership roles</p>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.total}</div>
              <div style={styles.statLabel}>Total Members</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.leadership}</div>
              <div style={styles.statLabel}>Leadership</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.students}</div>
              <div style={styles.statLabel}>Students</div>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search by name, roll number, or role..."
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
            <>
              {leadershipUsers.length > 0 && (
                <>
                  <h2 style={styles.sectionTitle}>👑 Leadership</h2>
                  {leadershipUsers.map((user) => (
                    <div
                      key={user.id}
                      style={styles.userCard}
                    >
                      <div style={styles.userCardContent}>
                        <div style={styles.avatar}>
                          {getInitials(user.name)}
                        </div>

                        <div style={styles.userInfo}>
                          <div style={styles.userNameRow}>
                            <span style={styles.userName}>{user.name}</span>
                            <span
                              style={{
                                ...styles.roleBadge,
                                ...getRoleInfo(user.role).style
                              }}
                            >
                              {getRoleInfo(user.role).icon} {getRoleInfo(user.role).label}
                            </span>
                          </div>
                          <div style={styles.userMeta}>
                            <p style={styles.userRollNo}>Roll No: {user.roll_no}</p>
                            {canViewMemberSince() && user.created_at && (
                              <p style={styles.memberSince}>
                                Member Since: {formatDate(user.created_at)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div style={styles.buttonGroup}>
                          {canManageUser(user) && (
                            <select
                              value={user.role}
                              disabled={updating === user.id}
                              onChange={(e) => updateRole(user.id, e.target.value)}
                              style={{
                                ...styles.roleSelect,
                                ...(updating === user.id ? styles.buttonDisabled : {})
                              }}
                            >
                              {getAvailableRoles(user).map((role) => (
                                <option key={role} value={role}>
                                  {getRoleInfo(role).icon} {getRoleInfo(role).label}
                                </option>
                              ))}
                            </select>
                          )}
                          {canManageUser(user) && (
                            <button
                              onClick={() => deleteUser(user.id)}
                              style={styles.buttonDelete}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {regularUsers.length > 0 && (
                <>
                  <h2 style={styles.sectionTitle}>👥 Class Members</h2>
                  {regularUsers.map((user) => (
                    <div
                      key={user.id}
                      style={styles.userCard}
                    >
                      <div style={styles.userCardContent}>
                        <div style={styles.avatar}>
                          {getInitials(user.name)}
                        </div>

                        <div style={styles.userInfo}>
                          <div style={styles.userNameRow}>
                            <span style={styles.userName}>{user.name}</span>
                            <span
                              style={{
                                ...styles.roleBadge,
                                ...getRoleInfo(user.role).style
                              }}
                            >
                              {getRoleInfo(user.role).icon} {getRoleInfo(user.role).label}
                            </span>
                          </div>
                          <div style={styles.userMeta}>
                            <p style={styles.userRollNo}>Roll No: {user.roll_no}</p>
                            {canViewMemberSince() && user.created_at && (
                              <p style={styles.memberSince}>
                                Member Since: {formatDate(user.created_at)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div style={styles.buttonGroup}>
                          {canManageUser(user) && (
                            <select
                              value={user.role}
                              disabled={updating === user.id}
                              onChange={(e) => updateRole(user.id, e.target.value)}
                              style={{
                                ...styles.roleSelect,
                                ...(updating === user.id ? styles.buttonDisabled : {})
                              }}
                            >
                              {getAvailableRoles(user).map((role) => (
                                <option key={role} value={role}>
                                  {getRoleInfo(role).icon} {getRoleInfo(role).label}
                                </option>
                              ))}
                            </select>
                          )}
                          {canManageUser(user) && (
                            <button
                              onClick={() => deleteUser(user.id)}
                              style={styles.buttonDelete}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Users;