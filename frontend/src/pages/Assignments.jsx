import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject_id: "",
    due_date: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [completionMessage, setCompletionMessage] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const roleRank = {
    admin: 5,
    moderator: 4,
    cr: 3,
    lr: 3,
    coordinator: 2,
    student: 1
  };

  const canManageAssignment = (assignment) => {
    if (!user) return false;
    
    // User can manage their own assignment
    if (assignment.created_by_id === user.id) {
      return true;
    }

    // User can manage if their role rank is higher than creator's role rank
    return (
      roleRank[user?.role] > roleRank[assignment.created_by_role]
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [assignmentsRes, subjectsRes] = await Promise.all([
        api.get("/assignments", { headers }),
        api.get("/subjects", { headers })
      ]);

      setAssignments(assignmentsRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompletion = async (assignmentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        `/assignments/${assignmentId}/toggle-completion`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const completed = response.data.completed;
      
      setAssignments(prev =>
        prev.map(a =>
          a.id === assignmentId
            ? { ...a, completed: completed }
            : a
        )
      );

      if (completed) {
        setCompletionMessage({
          id: assignmentId,
          text: "✓ Moved to Completed"
        });
        setTimeout(() => setCompletionMessage(null), 3000);
      } else {
        setCompletionMessage({
          id: assignmentId,
          text: "↩️ Moved back to Active"
        });
        setTimeout(() => setCompletionMessage(null), 3000);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update assignment status");
    }
  };

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

  const getStatusColor = (daysLeft, completed) => {
    if (completed) return "#34d399";
    if (daysLeft === null) return "#94a3b8";
    if (daysLeft < 0) return "#ef4444";
    if (daysLeft === 0) return "#f59e0b";
    if (daysLeft <= 3) return "#f59e0b";
    return "#a78bfa";
  };

  const getStatusText = (daysLeft, completed) => {
    if (completed) return "✅ Completed";
    if (daysLeft === null) return "No due date";
    if (daysLeft < 0) return "❌ Overdue";
    if (daysLeft === 0) return "📅 Due Today";
    if (daysLeft <= 3) return `⚠️ ${daysLeft} days left`;
    return `⏳ ${daysLeft} days left`;
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return "📎";
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return "📄";
    if (type.includes("doc")) return "📘";
    if (type.includes("ppt")) return "📊";
    if (type.includes("zip") || type.includes("rar")) return "📦";
    if (type.includes("png") || type.includes("jpg") || type.includes("jpeg") || 
        type.includes("gif") || type.includes("webp")) return "🖼️";
    return "📎";
  };

  const openEditModal = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || "",
      subject_id: assignment.subject_id,
      due_date: assignment.due_date || ""
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!formData.subject_id) {
      alert("Please select a subject");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await api.put(
        `/assignments/${editingAssignment.id}`,
        {
          title: formData.title,
          description: formData.description,
          subject_id: formData.subject_id,
          due_date: formData.due_date || null
        },
        { headers }
      );

      await fetchData();
      setModalOpen(false);
      setEditingAssignment(null);
      setFormData({
        title: "",
        description: "",
        subject_id: "",
        due_date: ""
      });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to update assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (assignmentId, title) => {
    if (!window.confirm(`Delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to delete assignment");
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(a => {
    const daysLeft = getDaysLeft(a.due_date);
    const isOverdue = daysLeft !== null && daysLeft < 0;

    if (filter === "all") return true;
    if (filter === "active") return a.completed === false;
    if (filter === "completed") return a.completed === true;
    if (filter === "due-today") return daysLeft === 0 && a.completed === false;
    if (filter === "overdue") return isOverdue && a.completed === false;
    return true;
  });

  // Sort: Active assignments first (by due date), then completed (by completion date)
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const daysA = getDaysLeft(a.due_date);
    const daysB = getDaysLeft(b.due_date);
    if (daysA === null && daysB === null) return 0;
    if (daysA === null) return 1;
    if (daysB === null) return -1;
    return daysA - daysB;
  });

  // Stats
  const total = assignments.length;
  const active = assignments.filter(a => a.completed === false).length;
  const completed = assignments.filter(a => a.completed === true).length;
  const dueToday = assignments.filter(a => {
    const days = getDaysLeft(a.due_date);
    return days === 0 && a.completed === false;
  }).length;
  const overdue = assignments.filter(a => {
    const days = getDaysLeft(a.due_date);
    return days !== null && days < 0 && a.completed === false;
  }).length;

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
      marginBottom: "24px"
    },
    heading: {
      color: "#ffffff",
      fontSize: "32px",
      marginBottom: "4px"
    },
    subheading: {
      color: "#a0aec0",
      fontSize: "14px"
    },
    statsRow: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      marginBottom: "20px"
    },
    statBadge: {
      padding: "4px 12px",
      borderRadius: "16px",
      fontSize: "13px",
      fontWeight: "500",
      display: "inline-block"
    },
    filterRow: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
      marginBottom: "20px"
    },
    filterButton: {
      padding: "6px 16px",
      borderRadius: "20px",
      border: "1px solid #2d3748",
      background: "transparent",
      color: "#94a3b8",
      fontSize: "13px",
      cursor: "pointer",
      fontWeight: "500",
      transition: "background 0.15s, color 0.15s, border-color 0.15s"
    },
    filterButtonActive: {
      background: "#667eea",
      borderColor: "#667eea",
      color: "#ffffff"
    },
    assignmentCard: {
      background: "#1a1f3a",
      borderRadius: "12px",
      padding: "18px",
      marginBottom: "12px",
      border: "1px solid #2d3748",
      borderLeft: "4px solid #a78bfa",
      transition: "border-color 0.15s",
      position: "relative"
    },
    assignmentCardCompleted: {
      opacity: 0.7
    },
    assignmentContent: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      gap: "12px"
    },
    assignmentLeft: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      flex: 1,
      minWidth: "200px"
    },
    checkbox: {
      marginTop: "3px",
      width: "18px",
      height: "18px",
      cursor: "pointer",
      accentColor: "#667eea",
      flexShrink: 0
    },
    assignmentMain: {
      flex: 1
    },
    assignmentTitle: {
      color: "#ffffff",
      fontSize: "18px",
      fontWeight: "600",
      margin: "0 0 4px 0"
    },
    assignmentTitleCompleted: {
      textDecoration: "line-through",
      opacity: 0.6
    },
    subjectBadge: {
      background: "#2d3748",
      padding: "2px 10px",
      borderRadius: "16px",
      fontSize: "12px",
      color: "#a78bfa",
      display: "inline-block",
      marginBottom: "8px"
    },
    assignmentMeta: {
      color: "#94a3b8",
      fontSize: "13px",
      marginBottom: "8px",
      display: "flex",
      gap: "16px",
      flexWrap: "wrap",
      alignItems: "center"
    },
    assignmentDescription: {
      color: "#cbd5e0",
      fontSize: "14px",
      lineHeight: "1.5",
      marginBottom: "12px"
    },
    descriptionCompleted: {
      opacity: 0.6
    },
    dueBox: {
      display: "inline-block",
      background: "#0f172a",
      padding: "8px 14px",
      borderRadius: "8px",
      border: "1px solid #2d3748"
    },
    dueText: {
      fontWeight: "bold",
      fontSize: "13px"
    },
    attachmentBlock: {
      marginTop: "12px",
      background: "#141a35",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "10px",
      padding: "12px 14px",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      flexWrap: "wrap"
    },
    attachmentInfo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flex: 1,
      minWidth: "120px"
    },
    attachmentIcon: {
      fontSize: "22px"
    },
    attachmentName: {
      color: "#e2e8f0",
      fontSize: "13px",
      fontWeight: "500"
    },
    attachmentButtons: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap"
    },
    attachmentButton: {
      padding: "4px 12px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "opacity 0.15s",
      border: "none",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px"
    },
    viewButton: {
      background: "#667eea",
      color: "white"
    },
    downloadButton: {
      background: "#10b981",
      color: "white"
    },
    actionButtons: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
      alignItems: "center",
      marginTop: "4px"
    },
    editButton: {
      background: "#667eea",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "4px 12px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      transition: "opacity 0.15s"
    },
    deleteButton: {
      background: "#dc2626",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "4px 12px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      transition: "opacity 0.15s"
    },
    loadingContainer: {
      textAlign: "center",
      padding: "60px",
      color: "#94a3b8"
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
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px"
    },
    modal: {
      background: "#1a1f3a",
      borderRadius: "14px",
      padding: "28px",
      maxWidth: "500px",
      width: "100%",
      border: "1px solid #2d3748"
    },
    modalTitle: {
      color: "#ffffff",
      fontSize: "22px",
      marginBottom: "4px"
    },
    modalSub: {
      color: "#94a3b8",
      fontSize: "13px",
      marginBottom: "18px"
    },
    label: {
      color: "#cbd5e0",
      fontSize: "13px",
      fontWeight: "500",
      display: "block",
      marginBottom: "4px"
    },
    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #2d3748",
      background: "#0f172a",
      color: "#fff",
      fontSize: "14px",
      outline: "none",
      marginBottom: "14px",
      boxSizing: "border-box",
      transition: "border-color 0.15s"
    },
    textarea: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #2d3748",
      background: "#0f172a",
      color: "#fff",
      fontSize: "14px",
      outline: "none",
      marginBottom: "14px",
      boxSizing: "border-box",
      fontFamily: "inherit",
      resize: "vertical",
      transition: "border-color 0.15s"
    },
    select: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #2d3748",
      background: "#0f172a",
      color: "#fff",
      fontSize: "14px",
      outline: "none",
      marginBottom: "14px",
      boxSizing: "border-box",
      transition: "border-color 0.15s"
    },
    modalButtons: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap"
    },
    saveButton: {
      flex: 1,
      padding: "10px",
      background: "#667eea",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "opacity 0.15s",
      minWidth: "70px"
    },
    cancelButton: {
      padding: "10px 18px",
      background: "#2d3748",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "opacity 0.15s"
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed"
    },
    toast: {
      position: "fixed",
      bottom: "30px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#1a1f3a",
      color: "#e2e8f0",
      padding: "12px 24px",
      borderRadius: "12px",
      border: "1px solid #2d3748",
      fontSize: "14px",
      zIndex: 10000,
      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
      maxWidth: "90%",
      textAlign: "center"
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.loadingContainer}>
              Loading assignments...
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
          <div style={styles.header}>
            <h1 style={styles.heading}>📝 Assignments</h1>
            <p style={styles.subheading}>Track all your coursework in one place</p>
          </div>

          {/* Stats */}
          <div style={styles.statsRow}>
            <span style={{ ...styles.statBadge, color: "#94a3b8", background: "#2d3748" }}>
              Total: {total}
            </span>
            <span style={{ ...styles.statBadge, color: "#f59e0b", background: "rgba(245, 158, 11, 0.15)" }}>
              Active: {active}
            </span>
            <span style={{ ...styles.statBadge, color: "#34d399", background: "rgba(16, 185, 129, 0.15)" }}>
              ✅ Completed: {completed}
            </span>
            {dueToday > 0 && (
              <span style={{ ...styles.statBadge, color: "#60a5fa", background: "rgba(96, 165, 250, 0.15)" }}>
                📅 Due Today: {dueToday}
              </span>
            )}
            {overdue > 0 && (
              <span style={{ ...styles.statBadge, color: "#ef4444", background: "rgba(239, 68, 68, 0.15)" }}>
                ❌ Overdue: {overdue}
              </span>
            )}
          </div>

          {/* Tabs */}
          <div style={styles.filterRow}>
            {["all", "active", "completed", "due-today", "overdue"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...styles.filterButton,
                  ...(filter === f ? styles.filterButtonActive : {})
                }}
              >
                {f === "all" && "All"}
                {f === "active" && "Active"}
                {f === "completed" && "Completed"}
                {f === "due-today" && "Due Today"}
                {f === "overdue" && "Overdue"}
              </button>
            ))}
          </div>

          {sortedAssignments.length === 0 ? (
            <div style={styles.emptyContainer}>
              <div style={styles.emptyIcon}>📝</div>
              <h3 style={styles.emptyTitle}>
                {filter === "all" && "No assignments yet"}
                {filter === "active" && "No active assignments"}
                {filter === "completed" && "No completed assignments"}
                {filter === "due-today" && "No assignments due today"}
                {filter === "overdue" && "No overdue assignments"}
              </h3>
              <p style={styles.emptyText}>
                {filter === "all" && "Assignments will appear here when created"}
                {filter === "active" && "Complete assignments to clear them from Active"}
                {filter === "completed" && "Complete assignments to see them here"}
                {filter === "due-today" && "No assignments due today"}
                {filter === "overdue" && "No overdue assignments"}
              </p>
            </div>
          ) : (
            sortedAssignments.map((assignment) => {
              const daysLeft = getDaysLeft(assignment.due_date);
              const statusColor = getStatusColor(daysLeft, assignment.completed);
              const isCompleted = assignment.completed === true;
              const hasAttachment = assignment.file_url;
              const fileIcon = getFileIcon(assignment.file_type);
              const canManage = canManageAssignment(assignment);
              
              return (
                <div
                  key={assignment.id}
                  style={{
                    ...styles.assignmentCard,
                    borderLeftColor: statusColor,
                    ...(isCompleted ? styles.assignmentCardCompleted : {})
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = statusColor}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}
                >
                  <div style={styles.assignmentContent}>
                    <div style={styles.assignmentLeft}>
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => toggleCompletion(assignment.id)}
                        style={styles.checkbox}
                      />
                      <div style={styles.assignmentMain}>
                        <h3 style={{
                          ...styles.assignmentTitle,
                          ...(isCompleted ? styles.assignmentTitleCompleted : {})
                        }}>
                          {assignment.title}
                        </h3>
                        <div style={styles.subjectBadge}>
                          📚 {assignment.subject_name || "Unknown Subject"}
                        </div>
                        <div style={styles.assignmentMeta}>
                          <span>👤 Posted by {assignment.created_by || "Admin"}</span>
                          {assignment.created_by_role && (
                            <span>({assignment.created_by_role.toUpperCase()})</span>
                          )}
                        </div>
                        {assignment.description && (
                          <p style={{
                            ...styles.assignmentDescription,
                            ...(isCompleted ? styles.descriptionCompleted : {})
                          }}>
                            {assignment.description}
                          </p>
                        )}
                        <div style={styles.dueBox}>
                          <div style={{ color: "#94a3b8", fontSize: "12px" }}>
                            📅 Due: {assignment.due_date ? formatDate(assignment.due_date) : "No due date"}
                          </div>
                          <div style={{ ...styles.dueText, color: statusColor }}>
                            {getStatusText(daysLeft, isCompleted)}
                          </div>
                        </div>

                        {/* Attachment Section */}
                        {hasAttachment && (
                          <div style={styles.attachmentBlock}>
                            <div style={styles.attachmentInfo}>
                              <span style={styles.attachmentIcon}>{fileIcon}</span>
                              <span style={styles.attachmentName}>{assignment.file_name || "Attachment"}</span>
                            </div>
                            <div style={styles.attachmentButtons}>
                              <button
                                onClick={() => window.open(assignment.file_url, "_blank")}
                                style={{ ...styles.attachmentButton, ...styles.viewButton }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                              >
                                👁 View
                              </button>
                              <button
                                onClick={() => window.open(`${assignment.file_url}?download=${assignment.file_name || "file"}`, "_blank")}
                                style={{ ...styles.attachmentButton, ...styles.downloadButton }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                              >
                                ⬇ Download
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {canManage && (
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => openEditModal(assignment)}
                          style={styles.editButton}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(assignment.id, assignment.title)}
                          style={styles.deleteButton}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {modalOpen && (
        <div style={styles.overlay} onClick={() => !submitting && setModalOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>✏️ Edit Assignment</h2>
            <p style={styles.modalSub}>Update assignment details</p>

            <label style={styles.label}>Title</label>
            <input
              type="text"
              placeholder="Assignment title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={styles.input}
              disabled={submitting}
              onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#2d3748"}
            />

            <label style={styles.label}>Description</label>
            <textarea
              placeholder="Assignment description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              style={styles.textarea}
              disabled={submitting}
              onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#2d3748"}
            />

            <label style={styles.label}>Subject</label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              style={styles.select}
              disabled={submitting}
              onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#2d3748"}
            >
              <option value="">Select subject...</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <label style={styles.label}>Due Date (Optional)</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              style={styles.input}
              disabled={submitting}
              onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#2d3748"}
            />

            <div style={styles.modalButtons}>
              <button
                onClick={handleSave}
                disabled={submitting}
                style={{
                  ...styles.saveButton,
                  ...(submitting ? styles.buttonDisabled : {})
                }}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => !submitting && setModalOpen(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {completionMessage && (
        <div style={styles.toast}>
          {completionMessage.text}
        </div>
      )}
    </>
  );
}

export default Assignments;