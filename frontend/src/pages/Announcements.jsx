import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const ROLE_LEVELS = {
    student: 1,
    coordinator: 2,
    cr: 3,
    lr: 3,
    moderator: 4,
    admin: 5
  };

  const canManageAnnouncement = (announcement) => {
    if (!user) return false;

    // User can edit/delete their own announcement
    if (announcement.created_by_id === user.id) {
      return true;
    }

    // User can manage if their role is higher than creator's role
    return (
      ROLE_LEVELS[user.role] > ROLE_LEVELS[announcement.created_by_role]
    );
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/announcements", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (announcementId, title) => {
    if (!window.confirm(`⚠️ Delete announcement "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(announcementId);
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/announcements/${announcementId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchAnnouncements();
      alert("✅ Announcement deleted successfully");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to delete announcement");
    } finally {
      setDeleting(null);
    }
  };

  const openEditModal = (announcement) => {
    setEditing(announcement.id);
    setEditForm({
      title: announcement.title,
      content: announcement.content
    });
  };

  const closeEditModal = () => {
    setEditing(null);
    setEditForm({ title: "", content: "" });
  };

  const handleEditSave = async () => {
    if (!editForm.title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!editForm.content.trim()) {
      alert("Please enter content");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/announcements/${editing}`,
        {
          title: editForm.title,
          content: editForm.content
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchAnnouncements();
      closeEditModal();
      alert("✅ Announcement updated successfully");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "❌ Failed to update announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getAnnouncementType = (title, content) => {
    const text = (title + " " + content).toLowerCase();
    if (text.includes("exam") || text.includes("test") || text.includes("midterm")) {
      return { label: "📝 Exam", color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" };
    }
    if (text.includes("holiday") || text.includes("break") || text.includes("vacation")) {
      return { label: "🎉 Holiday", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" };
    }
    if (text.includes("assignment") || text.includes("homework") || text.includes("submit")) {
      return { label: "📚 Assignment", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" };
    }
    if (text.includes("event") || text.includes("workshop") || text.includes("seminar")) {
      return { label: "🎪 Event", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)" };
    }
    return { label: "📢 Announcement", color: "#a78bfa", bg: "rgba(167, 139, 250, 0.1)" };
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
      fontSize: "32px",
      marginBottom: "8px",
      textAlign: "center"
    },
    subheading: {
      color: "#a0aec0",
      fontSize: "14px",
      marginBottom: "30px",
      textAlign: "center"
    },
    announcementCard: {
      background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "20px",
      border: "1px solid #2d3748",
      borderLeft: "4px solid #f59e0b",
      transition: "border-color 0.15s"
    },
    announcementHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      gap: "12px",
      marginBottom: "12px"
    },
    announcementTitle: {
      color: "#ffffff",
      fontSize: "20px",
      fontWeight: "600",
      margin: 0,
      flex: 1
    },
    typeBadge: {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      gap: "6px"
    },
    announcementMeta: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
      marginBottom: "16px",
      paddingBottom: "12px",
      borderBottom: "1px solid #2d3748"
    },
    metaLeft: {
      display: "flex",
      gap: "16px",
      flexWrap: "wrap"
    },
    metaText: {
      color: "#94a3b8",
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    },
    creatorRole: {
      color: "#a78bfa",
      fontSize: "11px",
      fontWeight: "600",
      marginLeft: "4px"
    },
    announcementContent: {
      color: "#cbd5e0",
      fontSize: "15px",
      lineHeight: "1.6",
      margin: 0
    },
    actionButtons: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
      alignItems: "center"
    },
    editButton: {
      background: "#667eea",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "6px 14px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      transition: "opacity 0.15s"
    },
    deleteButton: {
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "6px 14px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      transition: "opacity 0.15s"
    },
    deleteButtonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed"
    },
    loadingContainer: {
      textAlign: "center",
      padding: "60px",
      background: "#1a1f3a",
      borderRadius: "16px",
      border: "1px solid #2d3748"
    },
    loadingText: {
      color: "#a0aec0",
      fontSize: "14px"
    },
    emptyContainer: {
      textAlign: "center",
      padding: "60px",
      background: "#1a1f3a",
      borderRadius: "16px",
      border: "1px solid #2d3748"
    },
    emptyIcon: {
      fontSize: "48px",
      marginBottom: "16px"
    },
    emptyTitle: {
      color: "#ffffff",
      fontSize: "20px",
      marginBottom: "8px"
    },
    emptyText: {
      color: "#94a3b8",
      fontSize: "14px",
      margin: 0
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px"
    },
    modal: {
      background: "#1a1f3a",
      borderRadius: "14px",
      padding: "28px",
      maxWidth: "500px",
      width: "100%",
      border: "1px solid #2d3748"
    },
    modalTitle: {
      color: "#ffffff",
      fontSize: "22px",
      marginBottom: "4px"
    },
    modalSub: {
      color: "#94a3b8",
      fontSize: "13px",
      marginBottom: "18px"
    },
    label: {
      color: "#cbd5e0",
      fontSize: "13px",
      fontWeight: "500",
      display: "block",
      marginBottom: "4px"
    },
    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #2d3748",
      background: "#0f172a",
      color: "#fff",
      fontSize: "14px",
      outline: "none",
      marginBottom: "14px",
      boxSizing: "border-box",
      transition: "border-color 0.15s"
    },
    textarea: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #2d3748",
      background: "#0f172a",
      color: "#fff",
      fontSize: "14px",
      outline: "none",
      marginBottom: "14px",
      boxSizing: "border-box",
      fontFamily: "inherit",
      resize: "vertical",
      transition: "border-color 0.15s"
    },
    modalButtons: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap"
    },
    saveButton: {
      flex: 1,
      padding: "10px",
      background: "#667eea",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "opacity 0.15s",
      minWidth: "70px"
    },
    cancelButton: {
      padding: "10px 18px",
      background: "#2d3748",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "opacity 0.15s"
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed"
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.loadingContainer}>
              <p style={styles.loadingText}>Loading announcements...</p>
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
          <h1 style={styles.heading}>📢 Announcements</h1>
          <p style={styles.subheading}>Important updates and notices</p>

          {announcements.length === 0 ? (
            <div style={styles.emptyContainer}>
              <div style={styles.emptyIcon}>📢</div>
              <h3 style={styles.emptyTitle}>No announcements yet</h3>
              <p style={styles.emptyText}>Check back later for important updates</p>
            </div>
          ) : (
            announcements.map((announcement) => {
              const announcementType = getAnnouncementType(announcement.title, announcement.content);
              const relativeTime = getRelativeTime(announcement.created_at);
              const canManage = canManageAnnouncement(announcement);
              
              return (
                <div
                  key={announcement.id}
                  style={{
                    ...styles.announcementCard,
                    borderLeftColor: announcementType.color
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = announcementType.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#2d3748";
                  }}
                >
                  <div style={styles.announcementHeader}>
                    <h3 style={styles.announcementTitle}>{announcement.title}</h3>
                    <span
                      style={{
                        ...styles.typeBadge,
                        backgroundColor: announcementType.bg,
                        color: announcementType.color
                      }}
                    >
                      {announcementType.label}
                    </span>
                  </div>
                  
                  <div style={styles.announcementMeta}>
                    <div style={styles.metaLeft}>
                      <span style={styles.metaText}>
                        👤 {announcement.created_by || "Admin"}
                        {announcement.created_by_role && (
                          <span style={styles.creatorRole}>
                            ({announcement.created_by_role.toUpperCase()})
                          </span>
                        )}
                      </span>
                      {relativeTime && (
                        <span style={styles.metaText}>
                          🕒 {relativeTime}
                        </span>
                      )}
                      {announcement.created_at && !relativeTime && (
                        <span style={styles.metaText}>
                          📅 {new Date(announcement.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </span>
                      )}
                    </div>
                    
                    {canManage && (
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => openEditModal(announcement)}
                          style={styles.editButton}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteAnnouncement(announcement.id, announcement.title)}
                          disabled={deleting === announcement.id}
                          style={{
                            ...styles.deleteButton,
                            ...(deleting === announcement.id ? styles.deleteButtonDisabled : {})
                          }}
                          onMouseEnter={(e) => {
                            if (deleting !== announcement.id) e.currentTarget.style.opacity = "0.85";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "1";
                          }}
                        >
                          {deleting === announcement.id ? "⏳ Deleting..." : "🗑 Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <p style={styles.announcementContent}>{announcement.content}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div style={styles.overlay} onClick={() => !submitting && closeEditModal()}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>✏️ Edit Announcement</h2>
            <p style={styles.modalSub}>Update announcement details</p>

            <label style={styles.label}>Title</label>
            <input
              type="text"
              placeholder="Announcement title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              style={styles.input}
              disabled={submitting}
              onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#2d3748"}
            />

            <label style={styles.label}>Content</label>
            <textarea
              placeholder="Announcement content"
              value={editForm.content}
              onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
              rows="5"
              style={styles.textarea}
              disabled={submitting}
              onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#2d3748"}
            />

            <div style={styles.modalButtons}>
              <button
                onClick={handleEditSave}
                disabled={submitting}
                style={{
                  ...styles.saveButton,
                  ...(submitting ? styles.buttonDisabled : {})
                }}
                onMouseEnter={(e) => {
                  if (!submitting) e.currentTarget.style.opacity = "0.85";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => !submitting && closeEditModal()}
                style={styles.cancelButton}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Announcements;