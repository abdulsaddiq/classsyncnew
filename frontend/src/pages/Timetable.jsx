import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Timetable() {
  const [entries, setEntries] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({ subject_id: "", room: "", day: "", start_time: "", end_time: "" });
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const canEdit = ["admin", "moderator", "cr", "lr"].includes(user?.role);

  const timeSlots = [
    { start: "08:30", end: "09:30" },
    { start: "09:30", end: "10:20" },
    { start: "10:20", end: "11:10" },
    { start: "11:10", end: "12:00" },
    { start: "12:00", end: "12:50" },
    { start: "13:50", end: "14:40" },
    { start: "14:40", end: "15:30" },
    { start: "15:30", end: "16:20" }
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    fetchData();
    if (canEdit) fetchSubjects();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/timetable", { headers: { Authorization: `Bearer ${token}` } });
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/subjects", { headers: { Authorization: `Bearer ${token}` } });
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getEntry = (day, start) => entries.find(e => e.day === day && e.start_time === start);

  const isLab = (name) => name?.toLowerCase().includes("lab");

  const openModal = (day, start, end, entry) => {
    if (!canEdit) return;
    setEditingEntry(entry || null);
    setFormData({
      subject_id: entry?.subject_id || "",
      room: entry?.room || "",
      day: entry?.day || day,
      start_time: entry?.start_time || start,
      end_time: entry?.end_time || end
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.subject_id) return alert("Select a subject");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = { subject_id: formData.subject_id, room: formData.room, day: formData.day, start_time: formData.start_time, end_time: formData.end_time };

      if (editingEntry) {
        await api.put(`/timetable/${editingEntry.id}`, payload, { headers });
      } else {
        await api.post("/timetable", payload, { headers });
      }
      await fetchData();
      setModalOpen(false);
      setEditingEntry(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this class?")) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/timetable/${editingEntry.id}`, { headers: { Authorization: `Bearer ${token}` } });
      await fetchData();
      setModalOpen(false);
      setEditingEntry(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ backgroundColor: "#0a0e27", minHeight: "100vh", padding: "30px 20px" }}>
          <div style={{ textAlign: "center", color: "#94a3b8" }}>Loading timetable...</div>
        </div>
      </>
    );
  }

  const validEntries = entries.filter(e =>
    days.includes(e.day) &&
    timeSlots.some(t => t.start === e.start_time)
  );

  const styles = {
    page: { backgroundColor: "#0a0e27", minHeight: "100vh", padding: "30px 20px" },
    container: { maxWidth: "1200px", margin: "0 auto" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "4px" },
    heading: { color: "#ffffff", fontSize: "28px", margin: 0 },
    classCount: { color: "#94a3b8", fontSize: "13px" },
    subheading: { color: "#94a3b8", fontSize: "14px", marginBottom: "6px" },
    hint: { color: "#64748b", fontSize: "13px", marginBottom: "20px" },
    wrapper: { background: "#1a1f3a", borderRadius: "12px", border: "1px solid #2d3748", overflowX: "auto", padding: "2px" },
    table: { width: "100%", borderCollapse: "collapse", minWidth: "700px", fontSize: "13px" },
    th: { padding: "10px 12px", textAlign: "left", color: "#a78bfa", fontWeight: "600", borderBottom: "2px solid #2d3748", borderRight: "1px solid #2d3748", position: "sticky", top: 0, background: "#1a1f3a", zIndex: 2 },
    thFirst: { padding: "10px 12px", textAlign: "left", color: "#a78bfa", fontWeight: "600", borderBottom: "2px solid #2d3748", borderRight: "1px solid #2d3748", minWidth: "75px", position: "sticky", top: 0, background: "#1a1f3a", zIndex: 2 },
    td: { padding: "6px 8px", borderBottom: "1px solid #2d3748", borderRight: "1px solid #2d3748", height: "65px", minWidth: "100px", cursor: canEdit ? "pointer" : "default" },
    tdFirst: { padding: "6px 12px", borderBottom: "1px solid #2d3748", borderRight: "1px solid #2d3748", color: "#94a3b8", fontWeight: "500", minWidth: "75px", textAlign: "center" },
    cellTheory: { padding: "6px 8px", borderRadius: "6px", borderLeft: "3px solid #60a5fa" },
    cellLab: { padding: "6px 8px", borderRadius: "6px", borderLeft: "3px solid #34d399" },
    subject: { color: "#ffffff", fontWeight: "600", fontSize: "12px" },
    room: { color: "#94a3b8", fontSize: "11px" },
    empty: { color: "#64748b", fontSize: "20px", textAlign: "center", padding: "2px" },
    emptyText: { color: "#64748b", fontSize: "11px" },
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" },
    modal: { background: "#1a1f3a", borderRadius: "14px", padding: "28px", maxWidth: "440px", width: "100%", border: "1px solid #2d3748" },
    modalTitle: { color: "#ffffff", fontSize: "22px", marginBottom: "4px" },
    modalSub: { color: "#94a3b8", fontSize: "13px", marginBottom: "18px" },
    label: { color: "#cbd5e0", fontSize: "13px", fontWeight: "500", display: "block", marginBottom: "4px" },
    select: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #2d3748", background: "#0f172a", color: "#fff", fontSize: "14px", outline: "none", marginBottom: "14px", boxSizing: "border-box", transition: "border-color 0.15s" },
    input: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #2d3748", background: "#0f172a", color: "#fff", fontSize: "14px", outline: "none", marginBottom: "14px", boxSizing: "border-box", transition: "border-color 0.15s" },
    buttons: { display: "flex", gap: "10px", flexWrap: "wrap" },
    save: { flex: 1, padding: "10px", background: "#667eea", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "opacity 0.15s", minWidth: "70px" },
    del: { padding: "10px 18px", background: "#dc2626", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "opacity 0.15s" },
    cancel: { padding: "10px 18px", background: "#2d3748", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "opacity 0.15s" }
  };

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.heading}>📅 Class Timetable</h1>
            <span style={styles.classCount}>Classes: {validEntries.length}</span>
          </div>
          <p style={styles.subheading}>Weekly class schedule</p>
          {canEdit && <p style={styles.hint}>Click any slot to add or manage classes</p>}

          <div style={styles.wrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.thFirst}>Time</th>
                  {days.map(d => <th key={d} style={styles.th}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => (
                  <tr key={slot.start}>
                    <td style={styles.tdFirst}>{slot.start} - {slot.end}</td>
                    {days.map(day => {
                      const entry = getEntry(day, slot.start);
                      const lab = entry && isLab(entry.subject_name);
                      return (
                        <td key={`${day}-${slot.start}`} style={styles.td} onClick={() => openModal(day, slot.start, slot.end, entry)}>
                          {entry ? (
                            <div style={lab ? styles.cellLab : styles.cellTheory}>
                              <div style={styles.subject}>📚 {entry.subject_name}</div>
                              {entry.room && lab && <div style={styles.room}>🏫 {entry.room}</div>}
                            </div>
                          ) : (
                            <div style={styles.empty}>
                              {canEdit ? "+" : "—"}
                              {canEdit && <div style={styles.emptyText}>Add</div>}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div style={styles.overlay} onClick={() => !submitting && setModalOpen(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{editingEntry ? "✏️ Edit Class" : "➕ Add Class"}</h2>
            <p style={styles.modalSub}>{formData.day} • {formData.start_time} - {formData.end_time}</p>

            <label style={styles.label}>Subject</label>
            <select
              value={formData.subject_id}
              onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
              style={styles.select}
              disabled={submitting}
              onFocus={e => e.currentTarget.style.borderColor = "#667eea"}
              onBlur={e => e.currentTarget.style.borderColor = "#2d3748"}
            >
              <option value="">Select subject...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <label style={styles.label}>Room (optional)</label>
            <input
              type="text"
              placeholder="e.g., 401"
              value={formData.room}
              onChange={e => setFormData({ ...formData, room: e.target.value })}
              style={styles.input}
              disabled={submitting}
              onFocus={e => e.currentTarget.style.borderColor = "#667eea"}
              onBlur={e => e.currentTarget.style.borderColor = "#2d3748"}
            />

            <div style={styles.buttons}>
              <button
                onClick={handleSave}
                disabled={submitting}
                style={{ ...styles.save, ...(submitting ? { opacity: 0.6, cursor: "not-allowed" } : {}) }}
              >
                {submitting ? "Saving..." : editingEntry ? "Save" : "Add"}
              </button>
              {editingEntry && (
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  style={{ ...styles.del, ...(submitting ? { opacity: 0.6, cursor: "not-allowed" } : {}) }}
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => !submitting && setModalOpen(false)}
                style={styles.cancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Timetable;