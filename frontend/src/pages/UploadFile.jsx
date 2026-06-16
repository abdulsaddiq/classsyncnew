import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function UploadFile() {
  const [subjects, setSubjects] = useState([]);
  const [folders, setFolders] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [folderId, setFolderId] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

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
    if (!subjectId) {
      setFolders([]);
      setFolderId("");
      return;
    }
    const fetchFolders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/folders/subject/${subjectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFolders(response.data);
        setFolderId("");
      } catch (error) {
        console.error(error);
      }
    };
    fetchFolders();
  }, [subjectId]);

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      pdf: { icon: "📕", label: "PDF" },
      doc: { icon: "📘", label: "DOC" },
      docx: { icon: "📘", label: "DOCX" },
      png: { icon: "🖼️", label: "PNG" },
      jpg: { icon: "🖼️", label: "JPG" },
      jpeg: { icon: "🖼️", label: "JPEG" },
      gif: { icon: "🖼️", label: "GIF" },
      ppt: { icon: "📊", label: "PPT" },
      pptx: { icon: "📊", label: "PPTX" },
      zip: { icon: "📦", label: "ZIP" },
      rar: { icon: "📦", label: "RAR" },
      mp4: { icon: "🎥", label: "MP4" },
      mp3: { icon: "🎵", label: "MP3" },
      txt: { icon: "📄", label: "TXT" },
      xls: { icon: "📗", label: "XLS" },
      xlsx: { icon: "📗", label: "XLSX" },
      html: { icon: "🌐", label: "HTML" },
      css: { icon: "🎨", label: "CSS" },
      js: { icon: "📜", label: "JS" },
      json: { icon: "📋", label: "JSON" },
      md: { icon: "📝", label: "MD" }
    };
    return icons[ext] || { icon: "📄", label: "FILE" };
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    const progress = {};
    selectedFiles.forEach(file => {
      progress[file.name] = 0;
    });
    setUploadProgress(progress);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    const newProgress = { ...uploadProgress };
    delete newProgress[files[index].name];
    setUploadProgress(newProgress);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Please select at least one file");
      return;
    }
    if (!folderId) {
      alert("Please select a folder");
      return;
    }

    // Check for large files (50MB)
    const largeFiles = files.filter(file => file.size > 50 * 1024 * 1024);
    if (largeFiles.length > 0) {
      const names = largeFiles.map(f => f.name).join(", ");
      const confirmed = window.confirm(
        `⚠️ The following file(s) are larger than 50MB:\n\n${names}\n\nUploading large files may take time. Continue?`
      );
      if (!confirmed) {
        return;
      }
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder_id", folderId);

        await api.post("/files/upload", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        successCount++;
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100
        }));
      } catch (error) {
        console.error(error);
        failCount++;
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: -1
        }));
      }
    }

    setUploading(false);
    
    if (successCount > 0) {
      alert(`✅ ${successCount} file(s) uploaded successfully!${failCount > 0 ? ` ❌ ${failCount} failed.` : ''}`);
      if (successCount === files.length) {
        setFiles([]);
        setFolderId("");
        setSubjectId("");
        setFolders([]);
        setUploadProgress({});
        document.getElementById("file-input").value = "";
      }
    } else {
      alert("❌ Upload failed. Please try again.");
    }
  };

  const getTotalSize = () => {
    const total = files.reduce((sum, file) => sum + file.size, 0);
    return (total / 1024 / 1024).toFixed(2);
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
    card: {
      background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
      borderRadius: "20px",
      padding: "35px",
      border: "1px solid #2d3748",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
    },
    heading: {
      color: "#ffffff",
      fontSize: "28px",
      marginBottom: "8px",
      textAlign: "center"
    },
    subheading: {
      color: "#a0aec0",
      fontSize: "14px",
      marginBottom: "30px",
      textAlign: "center"
    },
    label: {
      color: "#cbd5e0",
      fontSize: "14px",
      fontWeight: "500",
      marginBottom: "8px",
      display: "block"
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
      transition: "border-color 0.15s",
      cursor: "pointer",
      boxSizing: "border-box"
    },
    fileInput: {
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #2d3748",
      backgroundColor: "#1a1f3a",
      color: "#ffffff",
      fontSize: "14px",
      cursor: "pointer",
      boxSizing: "border-box"
    },
    button: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "opacity 0.15s"
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed"
    },
    fileList: {
      marginTop: "20px",
      maxHeight: "350px",
      overflowY: "auto"
    },
    fileItem: {
      background: "#1a1f3a",
      padding: "12px",
      borderRadius: "10px",
      marginBottom: "10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      border: "1px solid #2d3748",
      transition: "border-color 0.15s"
    },
    fileInfo: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    fileIcon: {
      fontSize: "28px"
    },
    fileDetails: {
      flex: 1
    },
    fileName: {
      color: "#e2e8f0",
      fontSize: "14px",
      fontWeight: "500",
      marginBottom: "4px"
    },
    fileSize: {
      color: "#94a3b8",
      fontSize: "11px"
    },
    fileType: {
      color: "#a78bfa",
      fontSize: "10px",
      fontWeight: "600",
      marginTop: "2px"
    },
    removeButton: {
      background: "#dc2626",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "6px 12px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      transition: "opacity 0.15s"
    },
    progressBar: {
      width: "100%",
      height: "3px",
      background: "#2d3748",
      borderRadius: "2px",
      marginTop: "6px",
      overflow: "hidden"
    },
    progressFill: {
      height: "100%",
      background: "linear-gradient(90deg, #10b981, #059669)",
      transition: "width 0.3s ease"
    },
    progressError: {
      height: "100%",
      background: "#ef4444",
      width: "100%"
    },
    statusIcon: {
      marginLeft: "8px",
      fontSize: "14px"
    },
    totalInfo: {
      background: "rgba(102, 126, 234, 0.1)",
      padding: "12px",
      borderRadius: "10px",
      marginTop: "15px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    totalText: {
      color: "#cbd5e0",
      fontSize: "13px"
    },
    infoBox: {
      background: "rgba(102, 126, 234, 0.1)",
      padding: "15px",
      borderRadius: "10px",
      marginTop: "20px",
      textAlign: "center"
    },
    infoText: {
      color: "#94a3b8",
      fontSize: "13px",
      margin: 0
    },
    noFoldersMessage: {
      color: "#94a3b8",
      fontSize: "13px",
      padding: "8px 12px",
      textAlign: "center",
      fontStyle: "italic"
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.card}>
            <h1 style={styles.heading}>📤 Upload Files</h1>
            <p style={styles.subheading}>Share notes, PDFs, and study materials</p>

            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: "20px" }}>
                <label style={styles.label}>📚 Select Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setFolderId("");
                  }}
                  style={styles.select}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
                  required
                >
                  <option value="">Choose a subject...</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={styles.label}>📁 Select Folder</label>
                <select
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  style={styles.select}
                  disabled={!subjectId}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
                  required
                >
                  <option value="">
                    {subjectId ? "Choose a folder..." : "Select a subject first"}
                  </option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.folder_name}
                    </option>
                  ))}
                </select>
                {subjectId && folders.length === 0 && (
                  <div style={styles.noFoldersMessage}>
                    No folders available. Ask a CR, LR, Moderator or Admin to create one.
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={styles.label}>📎 Choose Files (Multiple allowed)</label>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  style={styles.fileInput}
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <>
                  <div style={styles.fileList}>
                    {files.map((file, index) => {
                      const fileIcon = getFileIcon(file.name);
                      const progress = uploadProgress[file.name];
                      const isError = progress === -1;
                      const isSuccess = progress === 100;
                      
                      return (
                        <div key={index} style={styles.fileItem}>
                          <div style={styles.fileInfo}>
                            <div style={styles.fileIcon}>{fileIcon.icon}</div>
                            <div style={styles.fileDetails}>
                              <div style={styles.fileName}>
                                {file.name}
                                {isSuccess && <span style={styles.statusIcon}> ✅</span>}
                                {isError && <span style={styles.statusIcon}> ❌</span>}
                              </div>
                              <div style={styles.fileSize}>
                                {(file.size / 1024).toFixed(1)} KB
                              </div>
                              <div style={styles.fileType}>{fileIcon.label}</div>
                              {progress !== undefined && progress > 0 && progress < 100 && (
                                <div style={styles.progressBar}>
                                  <div style={{ ...styles.progressFill, width: `${progress}%` }}></div>
                                </div>
                              )}
                              {isError && (
                                <div style={styles.progressBar}>
                                  <div style={styles.progressError}></div>
                                </div>
                              )}
                            </div>
                          </div>
                          {!uploading && !isSuccess && (
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              style={styles.removeButton}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={styles.totalInfo}>
                    <span style={styles.totalText}>
                      📦 Total: {files.length} file(s)
                    </span>
                    <span style={styles.totalText}>
                      💾 Total size: {getTotalSize()} MB
                    </span>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={uploading || files.length === 0 || !folderId}
                style={{
                  ...styles.button,
                  ...((uploading || files.length === 0 || !folderId) ? styles.buttonDisabled : {})
                }}
                onMouseEnter={(e) => {
                  if (!uploading && files.length > 0 && folderId) {
                    e.currentTarget.style.opacity = "0.85";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {uploading ? "⏳ Uploading..." : `🚀 Upload ${files.length} File(s)`}
              </button>

              <div style={styles.infoBox}>
                <p style={styles.infoText}>
                  💡 Supported files: PDF, DOCX, PPT, Images, ZIP, and more<br />
                  ✨ You can select multiple files at once
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default UploadFile;