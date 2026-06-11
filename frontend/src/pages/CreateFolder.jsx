import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function CreateFolder() {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (user?.role !== "admin") {
    return (
      <>
        <Navbar />
        <div style={{
          backgroundColor: "#0a0e27",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
            borderRadius: "20px",
            padding: "40px",
            textAlign: "center",
            border: "1px solid #2d3748"
          }}>
            <h2 style={{ color: "#ef4444", marginBottom: "10px" }}>⛔ Access Denied</h2>
            <p style={{ color: "#94a3b8" }}>Only administrators can access this page.</p>
          </div>
        </div>
      </>
    );
  }

  const [folderName, setFolderName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [folders, setFolders] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [parentFolderId, setParentFolderId] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
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
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!subjectId) return;
    const fetchFolders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/folders/subject/${subjectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFolders(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchFolders();
  }, [subjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!folderName.trim()) {
      alert("Please enter a folder name");
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
        "/folders",
        {
          folder_name: folderName,
          subject_id: subjectId,
          parent_folder_id: parentFolderId || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Folder created successfully!");
      setFolderName("");
      
      // Refresh folders list
      const response = await api.get(`/folders/subject/${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFolders(response.data);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "❌ Failed to create folder");
    } finally {
      setCreating(false);
    }
  };

  const getSelectedSubject = () => {
    return subjects.find(s => s.id === parseInt(subjectId));
  };

  const buildFolderTree = (foldersList, parentId = null, level = 0) => {
    return foldersList
      .filter(folder => folder.parent_folder_id === parentId)
      .map(folder => ({
        ...folder,
        level,
        children: buildFolderTree(foldersList, folder.id, level + 1)
      }));
  };

  const renderFolderTree = (foldersList) => {
    const tree = buildFolderTree(foldersList);
    return tree.map(folder => renderFolderItem(folder));
  };

  const renderFolderItem = (folder) => {
    const indent = folder.level * 24;
    return (
      <div key={folder.id}>
        <div style={{
          ...styles.folderItem,
          marginLeft: `${indent}px`
        }}>
          <span style={styles.folderIcon}>📁</span>
          <span style={styles.folderName}>{folder.folder_name}</span>
        </div>
        {folder.children.map(child => renderFolderItem(child))}
      </div>
    );
  };

  const selectedSubject = getSelectedSubject();

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
    treeSection: {
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
      boxSizing: "border-box",
      marginBottom: "20px"
    },
    button: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
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
    folderItem: {
      padding: "10px",
      borderRadius: "8px",
      marginBottom: "4px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.2s",
      cursor: "pointer"
    },
    folderIcon: {
      fontSize: "20px"
    },
    folderName: {
      color: "#cbd5e0",
      fontSize: "14px"
    },
    treeHeader: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "20px",
      padding: "12px",
      background: "rgba(139, 92, 246, 0.1)",
      borderRadius: "10px",
      borderLeft: "3px solid #8b5cf6"
    },
    treeHeaderIcon: {
      fontSize: "24px"
    },
    treeHeaderText: {
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "500"
    },
    treeHeaderSub: {
      color: "#94a3b8",
      fontSize: "12px",
      marginTop: "4px"
    },
    emptyTree: {
      textAlign: "center",
      padding: "40px",
      color: "#94a3b8"
    },
    requiredStar: {
      color: "#ef4444",
      marginLeft: "4px"
    },
    infoBox: {
      background: "rgba(139, 92, 246, 0.1)",
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
    treeTitle: {
      color: "#ffffff",
      fontSize: "18px",
      marginBottom: "15px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    folderCount: {
      background: "rgba(139, 92, 246, 0.2)",
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
            {/* Create Folder Form */}
            <div style={styles.formSection}>
              <h1 style={styles.heading}>📁 Create Folder</h1>
              <p style={styles.subheading}>Organize your subject materials</p>

              <form onSubmit={handleSubmit}>
                <label style={styles.label}>
                  Folder Name <span style={styles.requiredStar}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Lecture Notes"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#8b5cf6")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
                />

                <label style={styles.label}>
                  Subject <span style={styles.requiredStar}>*</span>
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  style={styles.select}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#8b5cf6")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
                >
                  <option value="">Select a subject...</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>

                <label style={styles.label}>Parent Folder (Optional)</label>
                <select
                  value={parentFolderId}
                  onChange={(e) => setParentFolderId(e.target.value)}
                  style={styles.select}
                  disabled={!subjectId}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#8b5cf6")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
                >
                  <option value="">📁 Root Level (No parent)</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      📁 {folder.folder_name}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={creating || !folderName.trim() || !subjectId}
                  style={{
                    ...styles.button,
                    ...((creating || !folderName.trim() || !subjectId) ? styles.buttonDisabled : {})
                  }}
                  onMouseEnter={(e) => {
                    if (!creating && folderName.trim() && subjectId) {
                      e.currentTarget.style.opacity = "0.85";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {creating ? "⏳ Creating..." : "🚀 Create Folder"}
                </button>

                <div style={styles.infoBox}>
                  <p style={styles.infoText}>
                    💡 Folders help organize files, notes, and resources
                  </p>
                </div>
              </form>
            </div>

            {/* Folder Tree Visualization */}
            <div style={styles.treeSection}>
              <div style={styles.treeTitle}>
                <span>🌳</span> Folder Structure
                <span style={styles.folderCount}>{folders.length} folders</span>
              </div>

              {!subjectId ? (
                <div style={styles.emptyTree}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>📂</div>
                  <p>Select a subject to view folder structure</p>
                  <p style={{ fontSize: "12px", marginTop: "8px" }}>Folders will appear here as a tree</p>
                </div>
              ) : folders.length === 0 ? (
                <div style={styles.emptyTree}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>📁</div>
                  <p>No folders yet in {selectedSubject?.name}</p>
                  <p style={{ fontSize: "12px", marginTop: "8px" }}>Create your first folder above</p>
                </div>
              ) : (
                <>
                  <div style={styles.treeHeader}>
                    <div style={styles.treeHeaderIcon}>📚</div>
                    <div>
                      <div style={styles.treeHeaderText}>{selectedSubject?.name}</div>
                      <div style={styles.treeHeaderSub}>Folder hierarchy</div>
                    </div>
                  </div>
                  <div>
                    {renderFolderTree(folders)}
                  </div>
                </>
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

export default CreateFolder;