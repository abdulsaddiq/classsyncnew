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
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [openComments, setOpenComments] = useState({});

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

        // Fetch comments for each file
        const commentsData = {};
        for (const file of filesRes.data) {
          try {
            const commentsRes = await api.get(
              `/comments/file/${file.id}`,
              { headers }
            );
            commentsData[file.id] = commentsRes.data;
          } catch {
            commentsData[file.id] = [];
          }
        }
        setComments(commentsData);
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

  const postComment = async (fileId) => {
    const content = newComments[fileId];
    if (!content?.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await api.post(
        "/comments",
        {
          file_id: fileId,
          content
        },
        { headers }
      );

      const commentsRes = await api.get(
        `/comments/file/${fileId}`,
        { headers }
      );

      setComments(prev => ({
        ...prev,
        [fileId]: commentsRes.data
      }));

      setNewComments(prev => ({
        ...prev,
        [fileId]: ""
      }));

      // Auto-open comments after posting
      setOpenComments(prev => ({
        ...prev,
        [fileId]: true
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to add comment");
    }
  };

  const toggleComments = (fileId) => {
    setOpenComments(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      pdf: "📕",
      doc: "📘",
      docx: "📘",
      png: "🖼️",
      jpg: "🖼️",
      jpeg: "🖼️",
      gif: "🖼️",
      ppt: "📊",
      pptx: "📊",
      zip: "📦",
      rar: "📦",
      mp4: "🎥",
      mp3: "🎵",
      txt: "📄"
    };
    return icons[ext] || "📄";
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
    },
    downloadButton: {
      background: "linear-gradient(135deg, #10b981, #059669)",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "6px 14px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      transition: "all 0.2s",
      textDecoration: "none",
      display: "inline-block"
    },
    commentsButton: {
      background: "transparent",
      border: "1px solid #2d3748",
      borderRadius: "8px",
      padding: "6px 12px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      transition: "all 0.2s",
      color: "#cbd5e0",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }
  };

  const getEmptyMessage = (type, hasSearch) => {
    if (type === "files") {
      return hasSearch
        ? "🔍 No files match your search"
        : "📂 This folder is empty.\nUpload notes, PDFs, PPTs or resources.";
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
              <div style={{ textAlign: "center", padding: "50px", background: "rgba(167, 139, 250, 0.05)", borderRadius: "12px", border: "2px solid #2d3748", color: "#a0aec0", whiteSpace: "pre-line" }}>
                {getEmptyMessage("files", searchTerm.length > 0)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px", margin: "0 auto" }}>
                {filteredFiles.map(file => {
                  const fileIcon = getFileIcon(file.file_name);
                  const isOpen = openComments[file.id];
                  const commentCount = comments[file.id]?.length || 0;
                  
                  return (
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
                          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                            <h3 style={{ color: "#a78bfa", margin: 0, fontSize: "18px" }}>
                              {fileIcon} {file.file_name}
                            </h3>
                          </div>
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
                            📖 Open
                          </a>
                          <a
                            href={`${import.meta.env.VITE_API_URL}/files/download/${file.id}`}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.downloadButton}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                          >
                            ⬇️ Download
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

                      {/* Comments Toggle Button */}
                      <hr style={{ borderColor: "#2d3748", margin: "16px 0 12px 0" }} />
                      
                      <button
                        onClick={() => toggleComments(file.id)}
                        style={styles.commentsButton}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#1a1f3a";
                          e.currentTarget.style.borderColor = "#667eea";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = "#2d3748";
                        }}
                      >
                        {isOpen ? "▼" : "▶"} 💬 Comments ({commentCount})
                      </button>

                      {/* Collapsible Comments Section */}
                      {isOpen && (
                        <>
                          <div style={{ marginTop: "16px" }}>
                            {commentCount > 0 ? (
                              comments[file.id].map((comment) => (
                                <div
                                  key={comment.id}
                                  style={{
                                    background: "#1a1f3a",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    marginBottom: "8px"
                                  }}
                                >
                                  <div
                                    style={{
                                      color: "#a78bfa",
                                      fontWeight: "bold",
                                      fontSize: "13px"
                                    }}
                                  >
                                    {comment.username}
                                  </div>
                                  <div
                                    style={{
                                      color: "#e2e8f0",
                                      marginTop: "4px"
                                    }}
                                  >
                                    {comment.content}
                                  </div>
                                  <div
                                    style={{
                                      color: "#94a3b8",
                                      fontSize: "11px",
                                      marginTop: "4px"
                                    }}
                                  >
                                    {comment.created_at}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p style={{ color: "#94a3b8", marginBottom: "12px" }}>
                                Be the first to comment 💬
                              </p>
                            )}

                            {/* Add Comment Input */}
                            <div
                              style={{
                                display: "flex",
                                gap: "10px",
                                marginTop: "12px"
                              }}
                            >
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                value={newComments[file.id] || ""}
                                onChange={(e) =>
                                  setNewComments(prev => ({
                                    ...prev,
                                    [file.id]: e.target.value
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    postComment(file.id);
                                  }
                                }}
                                style={{
                                  flex: 1,
                                  padding: "10px",
                                  borderRadius: "8px",
                                  border: "1px solid #2d3748",
                                  background: "#1a1f3a",
                                  color: "white",
                                  outline: "none"
                                }}
                              />
                              <button
                                onClick={() => postComment(file.id)}
                                style={{
                                  background: "#667eea",
                                  color: "white",
                                  border: "none",
                                  padding: "10px 16px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  transition: "all 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                              >
                                Post
                              </button>
                            </div>
                          </div>
                        </>
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

export default FolderView;