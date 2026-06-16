import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function SubjectPage() {
  const { id } = useParams();
  const [folders, setFolders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        const foldersRes = await api.get(`/subjects/${id}/folders`, { headers });
        setFolders(foldersRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [id]);

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
      transition: "border-color 0.15s",
      marginBottom: "8px"
    }
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
          <p style={styles.subheading}>Browse notes, folders and study materials</p>

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
                onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#2d3748"}
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
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#667eea"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2d3748"; }}
                >
                  📁 {folder.folder_name}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SubjectPage;