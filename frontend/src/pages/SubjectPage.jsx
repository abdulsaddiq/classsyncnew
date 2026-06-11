import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function SubjectPage() {
  const { id } = useParams();
  const [folders, setFolders] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        const [foldersRes, assignmentsRes] = await Promise.all([
          api.get(`/subjects/${id}/folders`, { headers }),
          api.get(`/assignments/subject/${id}`, { headers })
        ]);
        setFolders(foldersRes.data);
        setAssignments(assignmentsRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [id]);

  const getDaysLeft = (dueDate) => {
    if (!dueDate) return null;
    const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const filteredFolders = folders.filter(f => 
    f.folder_name.toLowerCase().includes(searchTerm.toLowerCase())
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
    heading: { 
      color: "#ffffff", 
      fontSize: "28px", 
      marginBottom: "8px" 
    },
    subheading: { 
      color: "#a0aec0", 
      marginBottom: "30px" 
    },
    sectionTitle: { 
      color: "#ffffff", 
      fontSize: "20px", 
      marginBottom: "5px" 
    },
    sectionSubtitle: {
      color: "#94a3b8",
      fontSize: "14px",
      marginTop: "-10px",
      marginBottom: "20px"
    },
    searchBox: {
      padding: "8px 12px",
      borderRadius: "8px",
      border: "1px solid #2d3748",
      backgroundColor: "#1a1f3a",
      color: "#ffffff",
      width: "100%",
      maxWidth: "400px",
      outline: "none"
    },
    folderItem: {
      display: "block",
      padding: "14px",
      background: "#1a1f3a",
      borderRadius: "10px",
      border: "1px solid #2d3748",
      textDecoration: "none",
      color: "#cbd5e0",
      transition: "all 0.2s",
      marginBottom: "8px"
    },
    divider: {
      margin: "40px 0",
      borderTop: "3px solid #2d3748"
    }
  };

  const getStatusColor = (isOverdue, isUrgent, isDueToday) => {
    if (isOverdue) return "#ef4444";
    if (isUrgent || isDueToday) return "#f59e0b";
    return "#a78bfa";
  };

  const getEmptyMessage = (type, hasSearch) => {
    if (type === "folders") {
      return hasSearch 
        ? "🔍 No folders match your search"
        : "📁 No folders created yet";
    }
    return "📝 No assignments have been posted yet";
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.content}>
          
          {/* Header */}
          <h1 style={styles.heading}>📚 Subject Resources</h1>
          <p style={styles.subheading}>Browse notes, folders and assignments</p>

          {/* Folders Section */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "15px" }}>
              <div>
                <h2 style={styles.sectionTitle}>📁 Folders ({filteredFolders.length})</h2>
                <p style={styles.sectionSubtitle}>Browse notes, PDFs and study materials</p>
              </div>
              <input
                type="text"
                placeholder="🔍 Search notes and folders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchBox}
              />
            </div>

            {filteredFolders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", background: "#1a1f3a", borderRadius: "10px", color: "#a0aec0" }}>
                {getEmptyMessage("folders", searchTerm.length > 0)}
              </div>
            ) : (
              filteredFolders.map(folder => (
                <Link
                  key={folder.id}
                  to={`/folder/${folder.id}`}
                  style={styles.folderItem}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(8px)"; e.currentTarget.style.borderColor = "#667eea"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.borderColor = "#2d3748"; }}
                >
                  📁 {folder.folder_name}
                </Link>
              ))
            )}
          </div>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Assignments Section */}
          <div>
            <div style={{ textAlign: "center", marginBottom: "25px" }}>
              <h2 style={{ ...styles.sectionTitle, fontSize: "24px" }}>📝 Assignments</h2>
              <p style={{ ...styles.sectionSubtitle, fontSize: "15px" }}>
                {assignments.length === 0 
                  ? "No Assignments Available"
                  : `${assignments.length} ${assignments.length === 1 ? "Assignment Available" : "Assignments Available"}`
                }
              </p>
              <p style={{ ...styles.sectionSubtitle, marginTop: "0px" }}>Track coursework and upcoming deadlines</p>
            </div>

            {assignments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px", background: "rgba(167, 139, 250, 0.05)", borderRadius: "12px", border: "2px solid #2d3748", color: "#a0aec0" }}>
                {getEmptyMessage("assignments", false)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px", margin: "0 auto" }}>
                {assignments.map(assignment => {
                  const daysLeft = getDaysLeft(assignment.due_date);
                  const isOverdue = daysLeft < 0;
                  const isDueToday = daysLeft === 0;
                  const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;
                  const statusColor = getStatusColor(isOverdue, isUrgent, isDueToday);
                  
                  return (
                    <div 
                      key={assignment.id} 
                      style={{
                        borderLeft: `4px solid ${statusColor}`,
                        background: "rgba(167, 139, 250, 0.08)",
                        padding: "20px",
                        borderRadius: "12px",
                        border: "2px solid #2d3748",
                        borderLeftWidth: "4px",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.3)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)"; }}
                    >
                      <h3 style={{ 
                        color: statusColor,
                        margin: "0 0 10px 0", 
                        fontSize: "20px",
                        fontWeight: "600"
                      }}>
                        {assignment.title}
                      </h3>
                      <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "12px" }}>
                        👤 Posted by {assignment.created_by}
                      </p>
                      <p style={{ color: "#cbd5e0", lineHeight: "1.6", marginBottom: "16px", fontSize: "14px" }}>
                        {assignment.description?.trim() || "No description provided."}
                      </p>
                      
                      {assignment.due_date && (
                        <div style={{ 
                          display: "inline-block", 
                          background: "#1a1f3a", 
                          padding: "10px 16px", 
                          borderRadius: "10px",
                          border: `1px solid ${statusColor}20`
                        }}>
                          <div style={{ color: "#a0aec0", fontSize: "13px", marginBottom: "5px" }}>
                            📅 Due: {formatDate(assignment.due_date)}
                          </div>
                          <div style={{ 
                            color: statusColor,
                            fontWeight: "bold", 
                            fontSize: "14px"
                          }}>
                            {isOverdue 
                              ? "❌ Overdue" 
                              : isDueToday 
                              ? "📅 Due Today" 
                              : isUrgent 
                              ? "⚠️ Urgent! Due soon" 
                              : `⏳ ${daysLeft} days left`
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SubjectPage;