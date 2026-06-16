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

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const canManageContent = ["admin", "moderator", "cr", "lr", "coordinator"].includes(role);

  const canDeleteFile = (file) => {
    return canManageContent || file.uploaded_by === currentUser?.id;
  };

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
    if (!content?.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await api.post(
        "/comments",
        { file_id: fileId, content },
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

  const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const types = {
      pdf: "PDF",
      doc: "DOC",
      docx: "DOCX",
      png: "PNG",
      jpg: "JPG",
      jpeg: "JPEG",
      gif: "GIF",
      ppt: "PPT",
      pptx: "PPTX",
      zip: "ZIP",
      rar: "RAR",
      mp4: "MP4",
      mp3: "MP3",
      txt: "TXT"
    };
    return types[ext] || "FILE";
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
      marginBottom: "6px"
    },
    subheading: {
      color: "#94a3b8",
      fontSize: "14px",
      marginBottom: "24px"
    },
    sectionTitle: {
      color: "#ffffff",
      fontSize: "20px",
      marginBottom: "4px"
    },
    sectionSubtitle: {
      color: "#94a3b8",
      fontSize: "14px",
      marginTop: "-8px",
      marginBottom: "16px"
    },
    searchBox: {
      padding: "8px 14px",
      borderRadius: "8px",
      border: "1px solid #2d3748",
      backgroundColor: "#1a1f3a",
      color: "#ffffff",
      width: "100%",
      maxWidth: "360px",
      outline: "none",
      fontSize: "14px"
    },
    divider: {
      margin: "32px 0",
      borderTop: "2px solid #2d3748"
    },
    folderCard: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "#1a1f3a",
      borderRadius: "10px",
      border: "1px solid #2d3748",
      marginBottom: "8px",
      padding: "14px 16px",
      transition: "border-color 0.15s"
    },
    folderLink: {
      textDecoration: "none",
      color: "#cbd5e0",
      flex: 1,
      fontSize: "15px",
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },
    fileCard: {
      background: "#1a1f3a",
      padding: "16px",
      borderRadius: "10px",
      border: "1px solid #2d3748",
      transition: "border-color 0.15s",
      marginBottom: "10px"
    },
    fileHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      gap: "12px"
    },
    fileInfo: {
      flex: 1,
      minWidth: "160px"
    },
    fileName: {
      color: "#a78bfa",
      fontSize: "16px",
      fontWeight: "500",
      margin: "0 0 4px 0",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    fileType: {
      color: "#94a3b8",
      fontSize: "12px"
    },
    fileMetadata: {
      color: "#64748b",
      fontSize: "12px",
      marginTop: "4px",
      display: "flex",
      gap: "16px",
      flexWrap: "wrap"
    },
    buttonGroup: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
      alignItems: "center"
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
      transition: "opacity 0.15s"
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
      transition: "opacity 0.15s",
      textDecoration: "none",
      display: "inline-block"
    },
    openButton: {
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "6px 14px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      transition: "opacity 0.15s",
      textDecoration: "none",
      display: "inline-block"
    },
    commentsButton: {
      background: "transparent",
      border: "1px solid #2d3748",
      borderRadius: "6px",
      padding: "4px 12px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      transition: "all 0.15s",
      color: "#cbd5e0",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    },
    emptyState: {
      textAlign: "center",
      padding: "40px",
      background: "#1a1f3a",
      borderRadius: "10px",
      border: "1px solid #2d3748",
      color: "#94a3b8"
    },
    commentContainer: {
      marginTop: "16px"
    },
    commentItem: {
      background: "#1a1f3a",
      padding: "10px 12px",
      borderRadius: "8px",
      marginBottom: "8px",
      border: "1px solid #2d3748"
    },
    commentUser: {
      color: "#a78bfa",
      fontWeight: "600",
      fontSize: "13px"
    },
    commentContent: {
      color: "#e2e8f0",
      marginTop: "4px",
      fontSize: "14px"
    },
    commentTime: {
      color: "#64748b",
      fontSize: "11px",
      marginTop: "4px"
    },
    commentInput: {
      flex: 1,
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #2d3748",
      background: "#0f172a",
      color: "white",
      outline: "none",
      fontSize: "14px"
    },
    commentPost: {
      background: "#667eea",
      color: "white",
      border: "none",
      padding: "10px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "opacity 0.15s"
    }
  };

  const getEmptyMessage = (type, hasSearch) => {
    if (type === "files") {
      return hasSearch
        ? "🔍 No files match your search"
        : "📄 No files available";
    }
    return hasSearch
      ? "🔍 No folders match your search"
      : "📁 No subfolders available";
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.content}>
          
          <h1 style={styles.heading}>📂 Folder Contents</h1>
          <p style={styles.subheading}>Browse folders and study materials</p>

          {/* Subfolders Section */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
              <div>
                <h2 style={styles.sectionTitle}>📁 Folders ({folders.length})</h2>
                <p style={styles.sectionSubtitle}>Browse subfolders and organized content</p>
              </div>
            </div>

            {folders.length === 0 ? (
              <div style={styles.emptyState}>
                {getEmptyMessage("folders", false)}
              </div>
            ) : (
              folders.map(folder => (
                <div key={folder.id} style={styles.folderCard}>
                  <Link
                    to={`/folder/${folder.id}`}
                    style={styles.folderLink}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#cbd5e0"}
                  >
                    📁 {folder.folder_name}
                  </Link>
                  {canManageContent && (
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

          <div style={styles.divider} />

          {/* Files Section */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
              <div>
                <h2 style={styles.sectionTitle}>📄 Notes & Files ({filteredFiles.length})</h2>
                <p style={styles.sectionSubtitle}>{filteredFiles.length} resources available</p>
              </div>
              <input
                type="text"
                placeholder="🔍 Search notes and files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchBox}
                onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#2d3748"}
              />
            </div>

            {filteredFiles.length === 0 ? (
              <div style={styles.emptyState}>
                {getEmptyMessage("files", searchTerm.length > 0)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredFiles.map(file => {
                  const fileIcon = getFileIcon(file.file_name);
                  const fileType = getFileType(file.file_name);
                  const isOpen = openComments[file.id];
                  const commentCount = comments[file.id]?.length || 0;
                  
                  return (
                    <div
                      key={file.id}
                      style={styles.fileCard}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = "#667eea"}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}
                    >
                      <div style={styles.fileHeader}>
                        <div style={styles.fileInfo}>
                          <div style={styles.fileName}>
                            <span>{fileIcon}</span>
                            <span>{file.file_name}</span>
                          </div>
                          <div style={styles.fileType}>{fileType}</div>
                          <div style={styles.fileMetadata}>
                            {file.uploaded_by_name && (
                              <span>Uploaded by: {file.uploaded_by_name}</span>
                            )}
                            {file.uploaded_by_role && (
                              <span>Role: {file.uploaded_by_role}</span>
                            )}
                            {file.uploaded_at && (
                              <span>Uploaded: {new Date(file.uploaded_at).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        <div style={styles.buttonGroup}>
                          <a
                            href={`${import.meta.env.VITE_API_URL}/files/view/${file.id}`}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.openButton}
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
                          {canDeleteFile(file) && (
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

                      <hr style={{ borderColor: "#2d3748", margin: "14px 0 10px 0" }} />
                      
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

                      {isOpen && (
                        <div style={styles.commentContainer}>
                          {commentCount > 0 ? (
                            comments[file.id].map((comment) => (
                              <div key={comment.id} style={styles.commentItem}>
                                <div style={styles.commentUser}>{comment.username}</div>
                                <div style={styles.commentContent}>{comment.content}</div>
                                <div style={styles.commentTime}>
                                  {new Date(comment.created_at).toLocaleString()}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p style={{ color: "#94a3b8", marginBottom: "12px" }}>
                              Be the first to comment 💬
                            </p>
                          )}

                          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
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
                              style={styles.commentInput}
                              onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
                              onBlur={(e) => e.currentTarget.style.borderColor = "#2d3748"}
                            />
                            <button
                              onClick={() => postComment(file.id)}
                              style={styles.commentPost}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                            >
                              Post
                            </button>
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

export default FolderView;