import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function CreateAnnouncement() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter an announcement title");
      return;
    }
    if (!content.trim()) {
      alert("Please enter announcement content");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/announcements",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Announcement created successfully!");
      setTitle("");
      setContent("");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to create announcement");
    } finally {
      setCreating(false);
    }
  };

  const getAnnouncementType = (titleText, contentText) => {
    const text = (titleText + " " + contentText).toLowerCase();
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

  const announcementType = getAnnouncementType(title, content);
  const hasPreview = title.trim() || content.trim();

  const styles = {
    container: {
      backgroundColor: "#0a0e27",
      minHeight: "100vh",
      padding: "30px 20px"
    },
    content: {
      maxWidth: "1200px",
      margin: "0 auto"
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "30px",
      alignItems: "start"
    },
    formSection: {
      background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
      borderRadius: "20px",
      padding: "30px",
      border: "1px solid #2d3748",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
    },
    previewSection: {
      background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
      borderRadius: "20px",
      padding: "30px",
      border: "1px solid #2d3748",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      position: "sticky",
      top: "90px"
    },
    heading: {
      color: "#ffffff",
      fontSize: "24px",
      marginBottom: "8px"
    },
    subheading: {
      color: "#a0aec0",
      fontSize: "13px",
      marginBottom: "25px"
    },
    label: {
      color: "#cbd5e0",
      fontSize: "14px",
      fontWeight: "500",
      marginBottom: "8px",
      display: "block"
    },
    input: {
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #2d3748",
      backgroundColor: "#1a1f3a",
      color: "#ffffff",
      fontSize: "14px",
      outline: "none",
      transition: "all 0.2s",
      boxSizing: "border-box"
    },
    textarea: {
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #2d3748",
      backgroundColor: "#1a1f3a",
      color: "#ffffff",
      fontSize: "14px",
      outline: "none",
      transition: "all 0.2s",
      fontFamily: "inherit",
      resize: "vertical",
      boxSizing: "border-box"
    },
    button: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #f59e0b, #d97706)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s",
      marginTop: "10px"
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed"
    },
    previewCard: {
      background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
      borderRadius: "12px",
      padding: "20px",
      border: `2px solid ${announcementType.color}`,
      transition: "all 0.3s ease"
    },
    previewHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      gap: "12px",
      marginBottom: "12px"
    },
    previewTitle: {
      color: "#ffffff",
      fontSize: "18px",
      fontWeight: "600",
      margin: 0
    },
    previewTypeBadge: {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      gap: "6px",
      backgroundColor: announcementType.bg,
      color: announcementType.color
    },
    previewMeta: {
      display: "flex",
      gap: "16px",
      flexWrap: "wrap",
      marginBottom: "16px",
      paddingBottom: "12px",
      borderBottom: "1px solid #2d3748"
    },
    previewMetaText: {
      color: "#94a3b8",
      fontSize: "12px",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    },
    previewContent: {
      color: "#cbd5e0",
      fontSize: "14px",
      lineHeight: "1.6",
      margin: 0,
      whiteSpace: "pre-wrap"
    },
    emptyPreview: {
      textAlign: "center",
      padding: "40px",
      color: "#94a3b8",
      fontSize: "14px"
    },
    charCount: {
      textAlign: "right",
      fontSize: "11px",
      color: "#94a3b8",
      marginTop: "5px"
    },
    requiredStar: {
      color: "#ef4444",
      marginLeft: "4px"
    },
    infoBox: {
      background: "rgba(245, 158, 11, 0.1)",
      padding: "12px",
      borderRadius: "10px",
      marginTop: "20px",
      textAlign: "center"
    },
    infoText: {
      color: "#94a3b8",
      fontSize: "12px",
      margin: 0
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.grid}>
            {/* Form Section */}
            <div style={styles.formSection}>
              <h1 style={styles.heading}>📢 Create Announcement</h1>
              <p style={styles.subheading}>Share important updates with the class</p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={styles.label}>
                    Title <span style={styles.requiredStar}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Mid-Term Exam Schedule"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={styles.input}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={styles.label}>
                    Content <span style={styles.requiredStar}>*</span>
                  </label>
                  <textarea
                    placeholder="Write your announcement details here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows="8"
                    style={styles.textarea}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
                  />
                  <div style={styles.charCount}>
                    {content.length} characters
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating || !title.trim() || !content.trim()}
                  style={{
                    ...styles.button,
                    ...((creating || !title.trim() || !content.trim()) ? styles.buttonDisabled : {})
                  }}
                  onMouseEnter={(e) => {
                    if (!creating && title.trim() && content.trim()) {
                      e.currentTarget.style.opacity = "0.85";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  {creating ? "⏳ Creating..." : "📢 Post Announcement"}
                </button>

                <div style={styles.infoBox}>
                  <p style={styles.infoText}>
                    💡 Any member can create announcements to help keep classmates informed.
                  </p>
                </div>
              </form>
            </div>

            {/* Live Preview Section */}
            <div style={styles.previewSection}>
              <h2 style={{ ...styles.heading, fontSize: "20px", marginBottom: "5px" }}>👁️ Live Preview</h2>
              <p style={styles.subheading}>See how it looks to students</p>

              {hasPreview ? (
                <div style={styles.previewCard}>
                  <div style={styles.previewHeader}>
                    <h3 style={styles.previewTitle}>
                      {title || "Untitled Announcement"}
                    </h3>
                    <span style={styles.previewTypeBadge}>
                      {announcementType.label}
                    </span>
                  </div>
                  
                  <div style={styles.previewMeta}>
                    <span style={styles.previewMetaText}>
                      👤 Posted by You
                    </span>
                    <span style={styles.previewMetaText}>
                      🕒 Just now
                    </span>
                  </div>
                  
                  <p style={styles.previewContent}>
                    {content || "Your announcement content will appear here..."}
                  </p>
                </div>
              ) : (
                <div style={styles.emptyPreview}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
                  <p>Start typing to see live preview</p>
                </div>
              )}

              <div style={{ ...styles.infoBox, marginTop: "20px", background: "rgba(167, 139, 250, 0.1)" }}>
                <p style={styles.infoText}>
                  ✨ Badge color changes based on announcement type
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="position: sticky"] {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </>
  );
}

export default CreateAnnouncement;