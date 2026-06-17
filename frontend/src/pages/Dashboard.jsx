import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import Navbar from "../components/Navbar";

import {
    FaFolder,
    FaFile,
    FaUsers,
    FaBullhorn,
    FaFire,
    FaArrowRight,
    FaPlus,
    FaUpload,
    FaClipboardList,
    FaBook,
    FaCalendarAlt,
    FaClock,
    FaNewspaper,
    FaTasks
} from "react-icons/fa";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [timetable, setTimetable] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [activities, setActivities] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const isAdminTeam = ["admin", "moderator"].includes(user?.role);
    const isAcademicTeam = ["admin", "moderator", "cr", "lr", "coordinator"].includes(user?.role);

    const getRoleDisplay = useCallback((role) => {
        const roleMap = {
            admin: { label: "ADMIN", icon: "👑", color: "#f472b6", bg: "rgba(236, 72, 153, 0.15)" },
            moderator: { label: "MODERATOR", icon: "🛡", color: "#c084fc", bg: "rgba(168, 85, 247, 0.15)" },
            cr: { label: "CR", icon: "🎓", color: "#60a5fa", bg: "rgba(59, 130, 246, 0.15)" },
            lr: { label: "LR", icon: "🌸", color: "#f9a8d4", bg: "rgba(244, 114, 182, 0.15)" },
            coordinator: { label: "COORDINATOR", icon: "📚", color: "#fbbf24", bg: "rgba(245, 158, 11, 0.15)" },
            student: { label: "STUDENT", icon: "👤", color: "#34d399", bg: "rgba(16, 185, 129, 0.15)" }
        };
        return roleMap[role] || roleMap.student;
    }, []);

    const getDayName = useCallback(() => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[new Date().getDay()];
    }, []);

    const isLab = useCallback((name) => name?.toLowerCase().includes("lab"), []);

    const getTimeValue = useCallback((timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
    }, []);

    const getCurrentTimeValue = useCallback(() => {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    }, []);

    const getDaysLeft = useCallback((dueDate) => {
        if (!dueDate) return null;
        const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        return diff;
    }, []);

    const getStatusColor = useCallback((daysLeft) => {
        if (daysLeft === null) return "#94a3b8";
        if (daysLeft < 0) return "#ef4444";
        if (daysLeft === 0) return "#f59e0b";
        if (daysLeft <= 3) return "#f59e0b";
        return "#a78bfa";
    }, []);

    const getStatusText = useCallback((daysLeft) => {
        if (daysLeft === null) return "No due date";
        if (daysLeft < 0) return "❌ Overdue";
        if (daysLeft === 0) return "📅 Due Today";
        if (daysLeft <= 3) return `⚠️ ${daysLeft} days left`;
        return `⏳ ${daysLeft} days left`;
    }, []);

    const getRelativeTime = useCallback((dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short"
        });
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const initializeDashboard = async () => {
            try {
                const [profileRes, timetableRes, assignmentsRes, announcementsRes, activitiesRes, subjectsRes, statsRes] = await Promise.all([
                    api.get("/auth/profile", { headers }),
                    api.get("/timetable", { headers }),
                    api.get("/assignments", { headers }),
                    api.get("/announcements", { headers }),
                    api.get("/activities", { headers }),
                    api.get("/subjects", { headers }),
                    api.get("/auth/stats", { headers }).catch(() => null)
                ]);

                const userData = profileRes.data;
                setUser(userData);
                setTimetable(timetableRes.data);
                setAssignments(assignmentsRes.data);
                setAnnouncements(announcementsRes.data);
                setActivities(activitiesRes.data);
                setSubjects(subjectsRes.data);
                if (statsRes && statsRes.data) setStats(statsRes.data);
            } catch (error) {
                console.error("Error initializing dashboard:", error);
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/";
                }
            } finally {
                setLoading(false);
            }
        };

        initializeDashboard();
    }, []);

    // Memoized today's classes
    const todayData = useMemo(() => {
        const today = getDayName();
        const currentTime = getCurrentTimeValue();

        const seen = new Set();
        const uniqueEntries = timetable.filter(entry => {
            const key = `${entry.day}-${entry.start_time}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        const todayClasses = uniqueEntries
            .filter(entry => entry.day === today)
            .sort((a, b) => getTimeValue(a.start_time) - getTimeValue(b.start_time));

        let activeClass = null;
        let nextClass = null;

        for (const entry of todayClasses) {
            const start = getTimeValue(entry.start_time);
            const end = getTimeValue(entry.end_time);
            
            if (currentTime >= start && currentTime <= end) {
                activeClass = entry;
                break;
            }
            if (currentTime < start) {
                nextClass = entry;
                break;
            }
        }

        if (!activeClass && todayClasses.length > 0) {
            for (const entry of todayClasses) {
                const start = getTimeValue(entry.start_time);
                if (currentTime < start) {
                    nextClass = entry;
                    break;
                }
            }
        }

        return {
            today,
            classes: todayClasses,
            activeClass,
            nextClass,
            remaining: todayClasses.filter(c => {
                const start = getTimeValue(c.start_time);
                return start > currentTime;
            }).length
        };
    }, [timetable, getDayName, getCurrentTimeValue, getTimeValue]);

    // Memoized upcoming deadlines
    const upcomingAssignments = useMemo(() => {
        return [...assignments]
            .filter(a => {
                if (!a.due_date) return false;
                return getDaysLeft(a.due_date) >= 0;
            })
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            .slice(0, 4);
    }, [assignments, getDaysLeft]);

    // Latest announcements (2)
    const latestAnnouncements = useMemo(() => {
        return [...announcements]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 2);
    }, [announcements]);

    // Latest assignments (2)
    const latestAssignments = useMemo(() => {
        return [...assignments]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 2);
    }, [assignments]);

    // Recent activities (6)
    const recentActivities = useMemo(() => {
        return activities.slice(0, 6);
    }, [activities]);

    // Subjects preview (6)
    const subjectPreview = useMemo(() => {
        return subjects.slice(0, 6);
    }, [subjects]);

    // Snapshot stats
    const snapshotStats = {
        classesToday: todayData.classes.length,
        assignmentsDue: assignments.filter(a => {
            const days = getDaysLeft(a.due_date);
            return days !== null && days >= 0;
        }).length,
        announcementsCount: announcements.length,
        subjectsCount: subjects.length,
        filesCount: stats?.files || 0
    };

    if (loading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "#0a0e27",
                color: "#ffffff"
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "40px", marginBottom: "16px" }}>📚</div>
                    <h2 style={{ fontWeight: "400", color: "#94a3b8" }}>Loading Dashboard...</h2>
                </div>
            </div>
        );
    }

    const roleInfo = getRoleDisplay(user?.role);

    const styles = {
        container: {
            backgroundColor: "#0a0e27",
            minHeight: "100vh",
            padding: "16px 20px"
        },
        content: {
            maxWidth: "1200px",
            margin: "0 auto"
        },
        card: {
            background: "#1a1f3a",
            borderRadius: "12px",
            border: "1px solid #2d3748",
            padding: "16px",
            marginBottom: "16px"
        },
        cardTitle: {
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: "500",
            margin: "0 0 12px 0",
            display: "flex",
            alignItems: "center",
            gap: "8px"
        },
        link: {
            color: "#667eea",
            textDecoration: "none",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            paddingTop: "12px",
            marginTop: "12px",
            borderTop: "1px solid #2d3748"
        }
    };

    return (
        <div style={styles.container}>
            <Navbar />

            <div style={styles.content}>
                {/* ===== 1. HERO / OVERVIEW ===== */}
                <div style={{
                    background: "#1a1f3a",
                    borderRadius: "12px",
                    border: "1px solid #2d3748",
                    padding: "16px 18px",
                    marginBottom: "16px"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "12px"
                    }}>
                        <div>
                            <div style={{ color: "#667eea", fontSize: "13px", fontWeight: "600", letterSpacing: "0.5px" }}>
                                CLASS-SYNC STUDENT PORTAL
                            </div>
                            <h1 style={{
                                margin: "4px 0 0 0",
                                fontSize: "clamp(20px, 4vw, 26px)",
                                color: "#ffffff",
                                fontWeight: "500"
                            }}>
                                Welcome back, {user?.name?.split(' ')[0]}! 👋
                            </h1>
                            <div style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                                alignItems: "center",
                                marginTop: "6px"
                            }}>
                                <span style={{
                                    padding: "2px 10px",
                                    borderRadius: "14px",
                                    fontSize: "11px",
                                    color: "#ffffff",
                                    background: "rgba(255,255,255,0.08)"
                                }}>
                                    Roll: {user?.roll_no}
                                </span>
                                <span style={{
                                    padding: "2px 10px",
                                    borderRadius: "14px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    backgroundColor: roleInfo.bg,
                                    color: roleInfo.color
                                }}>
                                    {roleInfo.icon} {roleInfo.label}
                                </span>
                            </div>
                        </div>
                        <div style={{
                            display: "flex",
                            gap: "16px",
                            flexWrap: "wrap",
                            background: "#0f172a",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            border: "1px solid #2d3748"
                        }}>
                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                                📚 <span style={{ color: "#ffffff", fontWeight: "600" }}>{snapshotStats.classesToday}</span> Today
                            </span>
                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                                📝 <span style={{ color: "#ffffff", fontWeight: "600" }}>{snapshotStats.assignmentsDue}</span> Due
                            </span>
                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                                📢 <span style={{ color: "#ffffff", fontWeight: "600" }}>{snapshotStats.announcementsCount}</span> New
                            </span>
                        </div>
                    </div>
                </div>

                {/* ===== 2. QUICK ACTIONS ===== */}
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>⚡ Quick Actions</h2>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                        gap: "8px"
                    }}>
                        <Link to="/upload-file" style={{
                            textDecoration: "none",
                            background: "#0f172a",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #2d3748",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            transition: "border-color 0.15s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#10b981"}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                            <FaUpload style={{ color: "#10b981", fontSize: "14px" }} />
                            <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>Upload Notes</span>
                        </Link>

                        <Link to="/subjects" style={{
                            textDecoration: "none",
                            background: "#0f172a",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #2d3748",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            transition: "border-color 0.15s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#667eea"}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                            <FaBook style={{ color: "#667eea", fontSize: "14px" }} />
                            <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>Subjects</span>
                        </Link>

                        <Link to="/assignments" style={{
                            textDecoration: "none",
                            background: "#0f172a",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #2d3748",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            transition: "border-color 0.15s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                            <FaTasks style={{ color: "#a78bfa", fontSize: "14px" }} />
                            <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>Assignments</span>
                        </Link>

                        <Link to="/announcements" style={{
                            textDecoration: "none",
                            background: "#0f172a",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #2d3748",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            transition: "border-color 0.15s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#f59e0b"}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                            <FaBullhorn style={{ color: "#f59e0b", fontSize: "14px" }} />
                            <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>Announcements</span>
                        </Link>

                        <Link to="/timetable" style={{
                            textDecoration: "none",
                            background: "#0f172a",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #2d3748",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            transition: "border-color 0.15s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                            <FaCalendarAlt style={{ color: "#a78bfa", fontSize: "14px" }} />
                            <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>Timetable</span>
                        </Link>
                    </div>
                </div>

                {/* ===== 3. TODAY SUMMARY MINI STATS ===== */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "12px",
                    marginBottom: "16px"
                }}>
                    <div style={{
                        background: "#1a1f3a",
                        borderRadius: "10px",
                        border: "1px solid #2d3748",
                        padding: "12px",
                        textAlign: "center",
                        transition: "border-color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#667eea"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                        <FaBook style={{ color: "#667eea", fontSize: "18px", marginBottom: "2px" }} />
                        <p style={{ color: "#ffffff", fontSize: "20px", fontWeight: "600", margin: 0 }}>{snapshotStats.subjectsCount}</p>
                        <p style={{ color: "#94a3b8", fontSize: "11px", margin: 0 }}>Subjects</p>
                    </div>

                    <div style={{
                        background: "#1a1f3a",
                        borderRadius: "10px",
                        border: "1px solid #2d3748",
                        padding: "12px",
                        textAlign: "center",
                        transition: "border-color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                        <FaTasks style={{ color: "#a78bfa", fontSize: "18px", marginBottom: "2px" }} />
                        <p style={{ color: "#ffffff", fontSize: "20px", fontWeight: "600", margin: 0 }}>{snapshotStats.assignmentsDue}</p>
                        <p style={{ color: "#94a3b8", fontSize: "11px", margin: 0 }}>Due</p>
                    </div>

                    <div style={{
                        background: "#1a1f3a",
                        borderRadius: "10px",
                        border: "1px solid #2d3748",
                        padding: "12px",
                        textAlign: "center",
                        transition: "border-color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#f59e0b"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                        <FaBullhorn style={{ color: "#f59e0b", fontSize: "18px", marginBottom: "2px" }} />
                        <p style={{ color: "#ffffff", fontSize: "20px", fontWeight: "600", margin: 0 }}>{snapshotStats.announcementsCount}</p>
                        <p style={{ color: "#94a3b8", fontSize: "11px", margin: 0 }}>Announcements</p>
                    </div>

                    <div style={{
                        background: "#1a1f3a",
                        borderRadius: "10px",
                        border: "1px solid #2d3748",
                        padding: "12px",
                        textAlign: "center",
                        transition: "border-color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#ed8936"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                        <FaFile style={{ color: "#ed8936", fontSize: "18px", marginBottom: "2px" }} />
                        <p style={{ color: "#ffffff", fontSize: "20px", fontWeight: "600", margin: 0 }}>{snapshotStats.filesCount}</p>
                        <p style={{ color: "#94a3b8", fontSize: "11px", margin: 0 }}>Files</p>
                    </div>

                    <div style={{
                        background: "#1a1f3a",
                        borderRadius: "10px",
                        border: "1px solid #2d3748",
                        padding: "12px",
                        textAlign: "center",
                        transition: "border-color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#34d399"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                        <FaCalendarAlt style={{ color: "#34d399", fontSize: "18px", marginBottom: "2px" }} />
                        <p style={{ color: "#ffffff", fontSize: "20px", fontWeight: "600", margin: 0 }}>{snapshotStats.classesToday}</p>
                        <p style={{ color: "#94a3b8", fontSize: "11px", margin: 0 }}>Today</p>
                    </div>
                </div>

                {/* ===== 4. BROWSE SUBJECTS ===== */}
                <div style={styles.card}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginBottom: "12px"
                    }}>
                        <h2 style={{ ...styles.cardTitle, marginBottom: 0 }}>📚 Browse Subjects</h2>
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                            Total: {subjects.length}
                        </span>
                    </div>

                    {subjectPreview.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "20px",
                            color: "#94a3b8",
                            fontSize: "13px"
                        }}>
                            <div style={{ fontSize: "36px", marginBottom: "8px" }}>📚</div>
                            <div>No subjects yet</div>
                            <div style={{ fontSize: "12px", marginTop: "4px", color: "#64748b" }}>
                                Create your first subject to get started
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                            gap: "10px"
                        }}>
                            {subjectPreview.map((subject) => (
                                <Link
                                    key={subject.id}
                                    to={`/subject/${subject.id}`}
                                    style={{
                                        textDecoration: "none",
                                        background: "#0f172a",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: "1px solid #2d3748",
                                        textAlign: "center",
                                        transition: "border-color 0.15s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#667eea"}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}
                                >
                                    <span style={{ fontSize: "24px", display: "block" }}>📚</span>
                                    <span style={{
                                        color: "#e2e8f0",
                                        fontSize: "13px",
                                        fontWeight: "500",
                                        display: "block",
                                        marginTop: "4px"
                                    }}>
                                        {subject.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                    <Link to="/subjects" style={styles.link}>
                        Browse All Subjects <FaArrowRight style={{ fontSize: "12px" }} />
                    </Link>
                </div>

                {/* ===== 5. ACADEMICS (CLASSES + DEADLINES) ===== */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px"
                }}>
                    {/* Today's Classes */}
                    <div style={styles.card}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "8px",
                            marginBottom: "8px"
                        }}>
                            <h2 style={styles.cardTitle}>📅 Today's Classes</h2>
                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                                {todayData.classes.length} Classes • {todayData.remaining} Remaining
                            </span>
                        </div>

                        {todayData.classes.length === 0 ? (
                            <div style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", padding: "16px 0" }}>
                                <div style={{ fontSize: "30px", marginBottom: "8px" }}>🎉</div>
                                No classes today
                            </div>
                        ) : (
                            <div>
                                {todayData.classes.slice(0, 3).map((entry, idx) => {
                                    const lab = isLab(entry.subject_name);
                                    const isActive = todayData.activeClass?.id === entry.id;
                                    const isNext = todayData.nextClass?.id === entry.id && !isActive;
                                    const isLast = idx === todayData.classes.slice(0, 3).length - 1;

                                    return (
                                        <div
                                            key={entry.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "7px 0",
                                                borderBottom: isLast ? "none" : "1px solid #2d3748",
                                                flexWrap: "wrap",
                                                gap: "4px",
                                                ...(isActive ? {
                                                    background: "rgba(16, 185, 129, 0.06)",
                                                    borderRadius: "6px",
                                                    padding: "7px 10px",
                                                    margin: "0 -8px"
                                                } : {}),
                                                ...(isNext ? {
                                                    background: "rgba(96, 165, 250, 0.06)",
                                                    borderRadius: "6px",
                                                    padding: "7px 10px",
                                                    margin: "0 -8px"
                                                } : {})
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <span style={{ fontSize: "15px" }}>{lab ? "🧪" : "📚"}</span>
                                                <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: "500" }}>{entry.subject_name}</span>
                                                {isActive && (
                                                    <span style={{
                                                        fontSize: "9px",
                                                        fontWeight: "600",
                                                        padding: "1px 6px",
                                                        borderRadius: "10px",
                                                        background: "rgba(16,185,129,0.15)",
                                                        color: "#34d399"
                                                    }}>NOW</span>
                                                )}
                                                {isNext && !isActive && (
                                                    <span style={{
                                                        fontSize: "9px",
                                                        fontWeight: "600",
                                                        padding: "1px 6px",
                                                        borderRadius: "10px",
                                                        background: "rgba(96,165,250,0.15)",
                                                        color: "#60a5fa"
                                                    }}>NEXT</span>
                                                )}
                                            </div>
                                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>{entry.start_time} - {entry.end_time}</span>
                                        </div>
                                    );
                                })}
                                {todayData.classes.length > 3 && (
                                    <Link to="/timetable" style={{ color: "#667eea", textDecoration: "none", fontSize: "12px", display: "block", textAlign: "center", marginTop: "8px" }}>
                                        +{todayData.classes.length - 3} more classes
                                    </Link>
                                )}
                            </div>
                        )}

                        <Link to="/timetable" style={styles.link}>
                            View Full Timetable <FaArrowRight style={{ fontSize: "12px" }} />
                        </Link>
                    </div>

                    {/* Upcoming Deadlines */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>⏰ Upcoming Deadlines</h2>
                        {upcomingAssignments.length === 0 ? (
                            <div style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", padding: "16px 0" }}>
                                <div style={{ fontSize: "30px", marginBottom: "8px" }}>🎉</div>
                                All caught up!
                            </div>
                        ) : (
                            upcomingAssignments.map((assignment, idx) => {
                                const daysLeft = getDaysLeft(assignment.due_date);
                                const statusColor = getStatusColor(daysLeft);
                                const isLast = idx === upcomingAssignments.length - 1;

                                return (
                                    <div
                                        key={assignment.id}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "7px 0",
                                            borderBottom: isLast ? "none" : "1px solid #2d3748",
                                            flexWrap: "wrap",
                                            gap: "4px"
                                        }}
                                    >
                                        <div>
                                            <div style={{ color: "#ffffff", fontSize: "13px", fontWeight: "500" }}>{assignment.title}</div>
                                            <div style={{ color: "#94a3b8", fontSize: "11px" }}>📚 {assignment.subject_name || "Unknown"}</div>
                                        </div>
                                        <div style={{ color: statusColor, fontSize: "12px", fontWeight: "500" }}>
                                            {getStatusText(daysLeft)}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <Link to="/assignments" style={styles.link}>
                            View All Assignments <FaArrowRight style={{ fontSize: "12px" }} />
                        </Link>
                    </div>
                </div>

                {/* ===== 6. COMMUNITY (ANNOUNCEMENTS + ASSIGNMENTS) ===== */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px"
                }}>
                    {/* Recent Announcements */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>📢 Recent Announcements</h2>
                        {latestAnnouncements.length === 0 ? (
                            <div style={{
                                textAlign: "center",
                                padding: "20px",
                                color: "#94a3b8",
                                fontSize: "13px"
                            }}>
                                <div style={{ fontSize: "30px", marginBottom: "8px" }}>📢</div>
                                No announcements yet
                                <div style={{ fontSize: "12px", marginTop: "4px", color: "#64748b" }}>Stay tuned</div>
                            </div>
                        ) : (
                            latestAnnouncements.map((announcement, idx) => {
                                const isLast = idx === latestAnnouncements.length - 1;
                                const relativeTime = getRelativeTime(announcement.created_at);
                                return (
                                    <div
                                        key={announcement.id}
                                        style={{
                                            padding: "8px 0",
                                            borderBottom: isLast ? "none" : "1px solid #2d3748"
                                        }}
                                    >
                                        <div style={{ color: "#ffffff", fontSize: "14px", fontWeight: "500" }}>{announcement.title}</div>
                                        <div style={{
                                            display: "flex",
                                            gap: "12px",
                                            flexWrap: "wrap",
                                            alignItems: "center",
                                            marginTop: "2px"
                                        }}>
                                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                                                👤 {announcement.created_by || "Admin"}
                                                {announcement.created_by_role && (
                                                    <span style={{ marginLeft: "4px" }}>({announcement.created_by_role.toUpperCase()})</span>
                                                )}
                                            </span>
                                            {relativeTime && (
                                                <span style={{ color: "#64748b", fontSize: "11px" }}>🕒 {relativeTime}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <Link to="/announcements" style={styles.link}>
                            View All Announcements <FaArrowRight style={{ fontSize: "12px" }} />
                        </Link>
                    </div>

                    {/* Latest Assignments */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>📝 Latest Assignments</h2>
                        {latestAssignments.length === 0 ? (
                            <div style={{
                                textAlign: "center",
                                padding: "20px",
                                color: "#94a3b8",
                                fontSize: "13px"
                            }}>
                                <div style={{ fontSize: "30px", marginBottom: "8px" }}>📝</div>
                                No assignments yet
                                <div style={{ fontSize: "12px", marginTop: "4px", color: "#64748b" }}>Check back later</div>
                            </div>
                        ) : (
                            latestAssignments.map((assignment, idx) => {
                                const isLast = idx === latestAssignments.length - 1;
                                const relativeTime = getRelativeTime(assignment.created_at);
                                return (
                                    <div
                                        key={assignment.id}
                                        style={{
                                            padding: "8px 0",
                                            borderBottom: isLast ? "none" : "1px solid #2d3748"
                                        }}
                                    >
                                        <div style={{ color: "#ffffff", fontSize: "14px", fontWeight: "500" }}>{assignment.title}</div>
                                        <div style={{
                                            display: "flex",
                                            gap: "12px",
                                            flexWrap: "wrap",
                                            alignItems: "center",
                                            marginTop: "2px"
                                        }}>
                                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                                                📚 {assignment.subject_name || "Unknown"}
                                            </span>
                                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                                                👤 {assignment.created_by || "Admin"}
                                            </span>
                                            {relativeTime && (
                                                <span style={{ color: "#64748b", fontSize: "11px" }}>🕒 {relativeTime}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <Link to="/assignments" style={styles.link}>
                            View All Assignments <FaArrowRight style={{ fontSize: "12px" }} />
                        </Link>
                    </div>
                </div>

                {/* ===== 7. RECENT ACTIVITY ===== */}
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>🔥 Recent Activity</h2>
                    {recentActivities.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "16px",
                            color: "#94a3b8",
                            fontSize: "13px"
                        }}>
                            No recent activity
                        </div>
                    ) : (
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px"
                        }}>
                            {recentActivities.map((activity) => (
                                <div
                                    key={activity.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "10px",
                                        padding: "6px 0",
                                        borderBottom: "1px solid #2d3748"
                                    }}
                                >
                                    <div style={{
                                        width: "6px",
                                        height: "6px",
                                        borderRadius: "50%",
                                        backgroundColor: "#f97316",
                                        marginTop: "7px",
                                        flexShrink: 0
                                    }}></div>
                                    <p style={{
                                        margin: 0,
                                        color: "#cbd5e0",
                                        fontSize: "13px",
                                        lineHeight: "1.5"
                                    }}>
                                        {activity.message}
                                        {activity.created_at && (
                                            <span style={{ color: "#64748b", fontSize: "11px", marginLeft: "8px" }}>
                                                • {getRelativeTime(activity.created_at)}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ===== 8. STATISTICS ===== */}
                {stats && (
                    <div style={{
                        marginBottom: "16px"
                    }}>
                        <h2 style={{
                            color: "#94a3b8",
                            fontSize: "11px",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "12px",
                            borderBottom: "1px solid #2d3748",
                            paddingBottom: "8px"
                        }}>
                            📊 Platform Statistics
                        </h2>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                            gap: "10px"
                        }}>
                            {[
                                { label: "Subjects", value: stats.subjects, color: "#667eea" },
                                { label: "Folders", value: stats.folders, color: "#48bb78" },
                                { label: "Files", value: stats.files, color: "#ed8936" },
                                { label: "Users", value: stats.users, color: "#f687b3" },
                                { label: "Announcements", value: stats.announcements, color: "#4299e1" }
                            ].map((stat, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: "#1a1f3a",
                                        borderRadius: "10px",
                                        border: "1px solid #2d3748",
                                        padding: "10px",
                                        textAlign: "center",
                                        transition: "border-color 0.15s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = stat.color}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}
                                >
                                    <p style={{ color: "#ffffff", fontSize: "20px", fontWeight: "600", margin: 0 }}>{stat.value}</p>
                                    <p style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "500", margin: 0 }}>{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== 9. MANAGEMENT (ADMIN + MODERATOR ONLY) ===== */}
                {isAdminTeam && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>⚙️ Management</h2>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                            gap: "10px"
                        }}>
                            <Link to="/create-subject" style={{
                                textDecoration: "none",
                                background: "#0f172a",
                                padding: "10px 12px",
                                borderRadius: "8px",
                                border: "1px solid #2d3748",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                transition: "border-color 0.15s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                                <FaPlus style={{ color: "#a78bfa", fontSize: "14px" }} />
                                <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>Manage Subjects</span>
                            </Link>
                            <Link to="/manage-folders" style={{
                                textDecoration: "none",
                                background: "#0f172a",
                                padding: "10px 12px",
                                borderRadius: "8px",
                                border: "1px solid #2d3748",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                transition: "border-color 0.15s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                                <FaFolder style={{ color: "#a78bfa", fontSize: "14px" }} />
                                <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>Manage Folders</span>
                            </Link>
                            <Link to="/users" style={{
                                textDecoration: "none",
                                background: "#0f172a",
                                padding: "10px 12px",
                                borderRadius: "8px",
                                border: "1px solid #2d3748",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                transition: "border-color 0.15s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#f472b6"}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                                <FaUsers style={{ color: "#f472b6", fontSize: "14px" }} />
                                <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>User Management</span>
                            </Link>
                            <Link to="/create-announcement" style={{
                                textDecoration: "none",
                                background: "#0f172a",
                                padding: "10px 12px",
                                borderRadius: "8px",
                                border: "1px solid #2d3748",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                transition: "border-color 0.15s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#f59e0b"}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                                <FaPlus style={{ color: "#f59e0b", fontSize: "14px" }} />
                                <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>Create Announcement</span>
                            </Link>
                            <Link to="/create-assignment" style={{
                                textDecoration: "none",
                                background: "#0f172a",
                                padding: "10px 12px",
                                borderRadius: "8px",
                                border: "1px solid #2d3748",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                transition: "border-color 0.15s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                                <FaPlus style={{ color: "#a78bfa", fontSize: "14px" }} />
                                <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>Create Assignment</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <style>
                {`
                    @media (max-width: 900px) {
                        div[style*="grid-template-columns: 1fr 1fr"] {
                            grid-template-columns: 1fr !important;
                        }
                    }
                    @media (max-width: 768px) {
                        div[style*="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))"] {
                            grid-template-columns: repeat(2, 1fr) !important;
                        }
                    }
                    @media (max-width: 480px) {
                        div[style*="grid-template-columns: repeat(2, 1fr)"] {
                            grid-template-columns: 1fr !important;
                        }
                        div[style*="padding: 16px 18px"] {
                            padding: 12px 14px !important;
                        }
                        div[style*="padding: 16px"] {
                            padding: 14px !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default Dashboard;