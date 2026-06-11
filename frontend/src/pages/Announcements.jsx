import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

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
      transition: "all 0.3s ease",
      cursor: "pointer"
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
    announcementContent: {
      color: "#cbd5e0",
      fontSize: "15px",
      lineHeight: "1.6",
      margin: 0
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
      transition: "all 0.2s"
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
    spinner: {
      width: "40px",
      height: "40px",
      border: "3px solid #2d3748",
      borderTopColor: "#f59e0b",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto 16px"
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
              <p style={styles.loadingText}>Loading announcements...</p>
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
              
              return (
                <div
                  key={announcement.id}
                  style={{
                    ...styles.announcementCard,
                    borderLeftColor: announcementType.color
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = announcementType.color;
                    e.currentTarget.style.boxShadow = `0 10px 25px ${announcementType.color}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "#2d3748";
                    e.currentTarget.style.boxShadow = "none";
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
                        👤 Posted by {announcement.created_by || "Admin"}
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
                    
                    {user?.role === "admin" && (
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
                    )}
                  </div>
                  
                  <p style={styles.announcementContent}>{announcement.content}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default Announcements;