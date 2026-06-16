import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/subjects", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubjects(response.data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    header: {
      marginBottom: "30px"
    },
    backLink: {
      color: "#94a3b8",
      textDecoration: "none",
      fontSize: "14px",
      display: "inline-block",
      marginBottom: "12px",
      transition: "color 0.15s"
    },
    heading: {
      color: "#ffffff",
      fontSize: "32px",
      marginBottom: "8px"
    },
    subheading: {
      color: "#a0aec0",
      fontSize: "14px"
    },
    searchSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "12px",
      marginBottom: "20px"
    },
    searchBox: {
      padding: "10px 16px",
      borderRadius: "10px",
      border: "1px solid #2d3748",
      backgroundColor: "#1a1f3a",
      color: "#ffffff",
      fontSize: "14px",
      outline: "none",
      width: "100%",
      maxWidth: "400px",
      boxSizing: "border-box",
      transition: "border-color 0.15s"
    },
    subjectCount: {
      color: "#94a3b8",
      fontSize: "14px"
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
      gap: "16px"
    },
    subjectCard: {
      background: "#1a1f3a",
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid #2d3748",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      transition: "border-color 0.15s",
      cursor: "pointer"
    },
    subjectIcon: {
      fontSize: "28px",
      flexShrink: 0
    },
    subjectName: {
      color: "#e2e8f0",
      fontSize: "16px",
      fontWeight: "500",
      wordBreak: "break-word"
    },
    loadingContainer: {
      textAlign: "center",
      padding: "60px",
      background: "#1a1f3a",
      borderRadius: "12px",
      border: "1px solid #2d3748"
    },
    loadingText: {
      color: "#94a3b8",
      fontSize: "14px"
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
              <p style={styles.loadingText}>Loading subjects...</p>
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
          {/* Header */}
          <div style={styles.header}>
            <Link 
              to="/dashboard" 
              style={styles.backLink}
              onMouseEnter={(e) => e.currentTarget.style.color = "#a0aec0"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
            >
              ← Back to Dashboard
            </Link>
            <h1 style={styles.heading}>📚 Subjects</h1>
            <p style={styles.subheading}>
              Browse all academic subjects and resources • {subjects.length} subjects available
            </p>
          </div>

          {/* Search and Count */}
          <div style={styles.searchSection}>
            <input
              type="text"
              placeholder="🔍 Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchBox}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
            />
            <span style={styles.subjectCount}>
              Subjects ({filteredSubjects.length})
            </span>
          </div>

          {/* Subject Grid */}
          {filteredSubjects.length === 0 ? (
            <div style={styles.emptyContainer}>
              <div style={styles.emptyIcon}>
                {searchTerm ? "🔍" : "📚"}
              </div>
              <h3 style={styles.emptyTitle}>
                {searchTerm ? "No subjects match your search" : "No subjects available"}
              </h3>
              <p style={styles.emptyText}>
                {searchTerm ? "Try a different search term" : "Subjects will appear here when created"}
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredSubjects.map((subject) => (
                <Link
                  key={subject.id}
                  to={`/subject/${subject.id}`}
                  style={styles.subjectCard}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#667eea")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
                >
                  <span style={styles.subjectIcon}>📚</span>
                  <span style={styles.subjectName}>{subject.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Subjects;