import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function FolderView() {
  const { id } = useParams();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [role, setRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setRole(user.role);

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        const [filesRes, foldersRes] = await Promise.all([
          api.get(`/folders/${id}/files`, { headers }),
          api.get(`/folders/${id}/children`, { headers })
        ]);
        
        setFiles(filesRes.data);
        setFolders(foldersRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [id]);

  const deleteFile = async (fileId) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(files.filter(file => file.id !== fileId));
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  const deleteFolder = async (folderId) => {
    if (!window.confirm("Delete this folder?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/folders/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFolders(folders.filter(folder => folder.id !== folderId));
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const filteredFiles = files.filter(file =>
    file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
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
    },
    deleteButton: {
      background: "linear-gradient(135deg, #dc2626, #b91c1c)",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "6px 14px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      transition: "all 0.2s"
    }
  };

  const getEmptyMessage = (type, hasSearch) => {
    if (type === "files") {
      return hasSearch
        ? "🔍 No files match your search"
        : "📄 No notes uploaded yet";
    }
    return hasSearch
      ? "🔍 No folders match your search"
      : "📁 No subfolders found";
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.content}>
          
          {/* Header */}
          <h1 style={styles.heading}>📂 Folder Contents</h1>
          <p style={styles.subheading}>Browse folders and study materials</p>

          {/* Subfolders Section */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "15px" }}>
              <div>
                <h2 style={styles.sectionTitle}>📁 Folders ({folders.length})</h2>
                <p style={styles.sectionSubtitle}>Browse subfolders and organized content</p>
              </div>
            </div>

            {folders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", background: "#1a1f3a", borderRadius: "10px", color: "#a0aec0" }}>
                {getEmptyMessage("folders", false)}
              </div>
            ) : (
              folders.map(folder => (
                <div
                  key={folder.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#1a1f3a",
                    borderRadius: "10px",
                    border: "1px solid #2d3748",
                    marginBottom: "8px",
                    padding: "14px"
                  }}
                >
                  <Link
                    to={`/folder/${folder.id}`}
                    style={{
                      textDecoration: "none",
                      color: "#cbd5e0",
                      flex: 1,
                      transition: "transform 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(5px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}
                  >
                    📁 {folder.folder_name}
                  </Link>
                  {role === "admin" && (
                    <button
                      onClick={() => deleteFolder(folder.id)}
                      style={styles.deleteButton}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Files Section */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "15px" }}>
              <div>
                <h2 style={styles.sectionTitle}>📄 Notes & Files ({filteredFiles.length})</h2>
                <p style={styles.sectionSubtitle}>Study materials, PDFs and resources</p>
              </div>
              <input
                type="text"
                placeholder="🔍 Search notes and files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchBox}
              />
            </div>

            {filteredFiles.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px", background: "rgba(167, 139, 250, 0.05)", borderRadius: "12px", border: "2px solid #2d3748", color: "#a0aec0" }}>
                {getEmptyMessage("files", searchTerm.length > 0)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px", margin: "0 auto" }}>
                {filteredFiles.map(file => (
                  <div
                    key={file.id}
                    style={{
                      background: "rgba(167, 139, 250, 0.05)",
                      padding: "18px",
                      borderRadius: "12px",
                      border: "2px solid #2d3748",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: "#a78bfa", margin: "0 0 8px 0", fontSize: "18px" }}>
                          📄 {file.file_name}
                        </h3>
                        {file.uploaded_by && (
                          <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>
                            👤 Uploaded by {file.uploaded_by}
                          </p>
                        )}
                        {file.created_at && (
                          <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "0" }}>
                            📅 Uploaded {formatDate(file.created_at)}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <a
                          href={`${import.meta.env.VITE_API_URL}/files/view/${file.id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                            color: "white",
                            textDecoration: "none",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "600",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                        >
                          📖 Open File
                        </a>
                        {role === "admin" && (
                          <button
                            onClick={() => deleteFile(file.id)}
                            style={styles.deleteButton}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                          >
                            🗑 Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default FolderView;