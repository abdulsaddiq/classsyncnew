import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function CreateSubject() {
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a subject name");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/subjects",
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Subject created successfully!");
      setName("");
      await fetchSubjects();
    } catch (error) {
      console.error(error);
      alert("❌ Failed to create subject");
    } finally {
      setCreating(false);
    }
  };

  const deleteSubject = async (subjectId, subjectName) => {
    if (!window.confirm(`⚠️ Delete "${subjectName}"? This will also delete all associated folders and files.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/subjects/${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchSubjects();
      alert("✅ Subject deleted successfully");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to delete subject");
    }
  };

  const styles = {
    container: {
      backgroundColor: "#0a0e27",
      minHeight: "100vh",
      padding: "30px 20px"
    },
    content: {
      maxWidth: "1000px",
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
    listSection: {
      background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
      borderRadius: "20px",
      padding: "30px",
      border: "1px solid #2d3748",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      position: "sticky",
      top: "90px",
      maxHeight: "calc(100vh - 120px)",
      overflowY: "auto"
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
      boxSizing: "border-box",
      marginBottom: "20px"
    },
    button: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #10b981, #059669)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s"
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed"
    },
    subjectCard: {
      background: "#1a1f3a",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "12px",
      border: "1px solid #2d3748",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      transition: "all 0.2s ease"
    },
    subjectInfo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flex: 1
    },
    subjectIcon: {
      fontSize: "28px"
    },
    subjectName: {
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: "500"
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
    emptyState: {
      textAlign: "center",
      padding: "40px",
      color: "#94a3b8"
    },
    loadingContainer: {
      textAlign: "center",
      padding: "40px",
      color: "#94a3b8"
    },
    spinner: {
      width: "30px",
      height: "30px",
      border: "3px solid #2d3748",
      borderTopColor: "#10b981",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto 16px"
    },
    requiredStar: {
      color: "#ef4444",
      marginLeft: "4px"
    },
    infoBox: {
      background: "rgba(16, 185, 129, 0.1)",
      padding: "12px",
      borderRadius: "10px",
      marginTop: "20px",
      textAlign: "center"
    },
    infoText: {
      color: "#94a3b8",
      fontSize: "12px",
      margin: 0
    },
    listHeading: {
      color: "#ffffff",
      fontSize: "18px",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    subjectCount: {
      background: "rgba(102, 126, 234, 0.2)",
      padding: "2px 8px",
      borderRadius: "12px",
      fontSize: "12px",
      color: "#a78bfa"
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.grid}>
            {/* Create Subject Form */}
            <div style={styles.formSection}>
              <h1 style={styles.heading}>📚 Create Subject</h1>
              <p style={styles.subheading}>Add a new course or subject</p>

              <form onSubmit={handleSubmit}>
                <label style={styles.label}>
                  Subject Name <span style={styles.requiredStar}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Database Management Systems"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#10b981")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
                />

                <button
                  type="submit"
                  disabled={creating || !name.trim()}
                  style={{
                    ...styles.button,
                    ...((creating || !name.trim()) ? styles.buttonDisabled : {})
                  }}
                  onMouseEnter={(e) => {
                    if (!creating && name.trim()) {
                      e.currentTarget.style.opacity = "0.85";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {creating ? "⏳ Creating..." : "🚀 Create Subject"}
                </button>

                <div style={styles.infoBox}>
                  <p style={styles.infoText}>
                    💡 Subjects can contain folders, files, and assignments
                  </p>
                </div>
              </form>
            </div>

            {/* Existing Subjects List */}
            <div style={styles.listSection}>
              <div style={styles.listHeading}>
                <span>📋</span> Existing Subjects
                <span style={styles.subjectCount}>{subjects.length}</span>
              </div>

              {loading ? (
                <div style={styles.loadingContainer}>
                  <div style={styles.spinner}></div>
                  <p>Loading subjects...</p>
                  <style>{`
                    @keyframes spin {
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : subjects.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
                  <p>No subjects created yet</p>
                  <p style={{ fontSize: "12px", marginTop: "8px" }}>Create your first subject above</p>
                </div>
              ) : (
                subjects.map((subject) => (
                  <div
                    key={subject.id}
                    style={styles.subjectCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(5px)";
                      e.currentTarget.style.borderColor = "#10b981";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.borderColor = "#2d3748";
                    }}
                  >
                    <div style={styles.subjectInfo}>
                      <div style={styles.subjectIcon}>📚</div>
                      <div style={styles.subjectName}>{subject.name}</div>
                    </div>
                    <button
                      onClick={() => deleteSubject(subject.id, subject.name)}
                      style={styles.deleteButton}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                    >
                      🗑 Delete
                    </button>
                  </div>
                ))
              )}
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

export default CreateSubject;