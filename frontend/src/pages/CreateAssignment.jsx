import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function CreateAssignment() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/subjects", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createAssignment = async () => {
    if (!title.trim()) {
      alert("Please enter assignment title");
      return;
    }
    if (!subjectId) {
      alert("Please select a subject");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/assignments",
        {
          title,
          description,
          subject_id: subjectId,
          due_date: dueDate || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Assignment created successfully!");
      setTitle("");
      setDescription("");
      setSubjectId("");
      setDueDate("");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to create assignment");
    } finally {
      setCreating(false);
    }
  };

  const getSelectedSubject = () => {
    return subjects.find(s => s.id === parseInt(subjectId));
  };

  const selectedSubject = getSelectedSubject();
  const hasSummary = title.trim() || subjectId || dueDate;

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const getDaysLeft = (date) => {
    if (!date) return null;
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysLeft = getDaysLeft(dueDate);
  const today = new Date().toISOString().split('T')[0];

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
    summarySection: {
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
    select: {
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #2d3748",
      backgroundColor: "#1a1f3a",
      color: "#ffffff",
      fontSize: "14px",
      outline: "none",
      transition: "all 0.2s",
      cursor: "pointer",
      boxSizing: "border-box"
    },
    dateInput: {
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
    button: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
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
    summaryCard: {
      background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
      borderRadius: "16px",
      padding: "24px",
      border: "1px solid #a78bfa",
      transition: "all 0.3s ease"
    },
    summaryTitle: {
      color: "#a78bfa",
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    summaryItem: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 0",
      borderBottom: "1px solid #2d3748"
    },
    summaryIcon: {
      fontSize: "20px",
      minWidth: "32px"
    },
    summaryLabel: {
      color: "#94a3b8",
      fontSize: "13px",
      minWidth: "70px"
    },
    summaryValue: {
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "500",
      flex: 1
    },
    summaryTitleValue: {
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: "600",
      flex: 1
    },
    dueBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600"
    },
    emptySummary: {
      textAlign: "center",
      padding: "40px",
      color: "#94a3b8",
      fontSize: "14px"
    },
    requiredStar: {
      color: "#ef4444",
      marginLeft: "4px"
    },
    infoBox: {
      background: "rgba(167, 139, 250, 0.1)",
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
              <h1 style={styles.heading}>📝 Create Assignment</h1>
              <p style={styles.subheading}>Post coursework, homework, or projects</p>

              <div style={{ marginBottom: "20px" }}>
                <label style={styles.label}>
                  Title <span style={styles.requiredStar}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Database Design Project"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={styles.label}>Description</label>
                <textarea
                  placeholder="Describe the assignment requirements, guidelines, or additional resources..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="5"
                  style={styles.textarea}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={styles.label}>
                  Subject <span style={styles.requiredStar}>*</span>
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  style={styles.select}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
                >
                  <option value="">Select a subject...</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label style={styles.label}>📅 Due Date (Optional)</label>
                <input
                  type="date"
                  value={dueDate}
                  min={today}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={styles.dateInput}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
                />
              </div>

              <button
                onClick={createAssignment}
                disabled={creating || !title.trim() || !subjectId}
                style={{
                  ...styles.button,
                  ...((creating || !title.trim() || !subjectId) ? styles.buttonDisabled : {})
                }}
                onMouseEnter={(e) => {
                  if (!creating && title.trim() && subjectId) {
                    e.currentTarget.style.opacity = "0.85";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {creating ? "⏳ Creating..." : "🚀 Create Assignment"}
              </button>

              <div style={styles.infoBox}>
                <p style={styles.infoText}>
                  💡 This assignment will appear inside the selected subject page
                </p>
              </div>
            </div>

            {/* Assignment Summary Section */}
            <div style={styles.summarySection}>
              <h2 style={{ ...styles.heading, fontSize: "20px", marginBottom: "5px" }}>📋 Assignment Summary</h2>
              <p style={styles.subheading}>Review before posting</p>

              {hasSummary ? (
                <div style={styles.summaryCard}>
                  <div style={styles.summaryTitle}>
                    <span>📝</span> Assignment Details
                  </div>
                  
                  <div style={styles.summaryItem}>
                    <div style={styles.summaryIcon}>📌</div>
                    <div style={styles.summaryLabel}>Title</div>
                    <div style={styles.summaryTitleValue}>
                      {title || "Untitled Assignment"}
                    </div>
                  </div>

                  <div style={styles.summaryItem}>
                    <div style={styles.summaryIcon}>📚</div>
                    <div style={styles.summaryLabel}>Subject</div>
                    <div style={styles.summaryValue}>
                      {selectedSubject ? selectedSubject.name : "Not selected"}
                    </div>
                  </div>

                  {dueDate && (
                    <div style={styles.summaryItem}>
                      <div style={styles.summaryIcon}>📅</div>
                      <div style={styles.summaryLabel}>Due Date</div>
                      <div style={styles.summaryValue}>
                        <span
                          style={{
                            ...styles.dueBadge,
                            background: daysLeft < 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)",
                            color: daysLeft < 0 ? "#ef4444" : "#f59e0b"
                          }}
                        >
                          {daysLeft < 0 ? "⚠️ Overdue" : daysLeft === 0 ? "📅 Today" : `⏳ ${daysLeft} days left`}
                        </span>
                        <div style={{ marginTop: "8px", fontSize: "13px", color: "#cbd5e0" }}>
                          {formatDate(dueDate)}
                        </div>
                      </div>
                    </div>
                  )}

                  {description && (
                    <div style={styles.summaryItem}>
                      <div style={styles.summaryIcon}>📄</div>
                      <div style={styles.summaryLabel}>Description</div>
                      <div style={{ ...styles.summaryValue, fontSize: "13px", lineHeight: "1.5" }}>
                        {description.length > 100 ? description.substring(0, 100) + "..." : description}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.emptySummary}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
                  <p>Fill in assignment details to see summary</p>
                </div>
              )}

              <div style={{ ...styles.infoBox, marginTop: "20px", background: "rgba(167, 139, 250, 0.1)" }}>
                <p style={styles.infoText}>
                  ✨ Summary updates live as you fill the form
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

export default CreateAssignment;