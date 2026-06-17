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
    FaTasks,
    FaInfoCircle,
    FaChartBar
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
    const [showPermissions, setShowPermissions] = useState(false);

    const canManage = ["admin", "moderator", "cr", "lr", "coordinator"].includes(user?.role);

    const getRoleDisplay = useCallback((role) => {
        const roleMap = {
            admin: { label: "ADMIN", icon: "👑", color: "#f472b6", bg: "rgba(236, 72, 153, 0.2)", permissions: ["Upload Notes", "Create Assignments", "Create Announcements", "Manage Subjects", "Manage Folders", "Moderate Content", "User Management"] },
            moderator: { label: "MODERATOR", icon: "🛡", color: "#c084fc", bg: "rgba(168, 85, 247, 0.2)", permissions: ["Upload Notes", "Create Assignments", "Create Announcements", "Manage Subjects", "Manage Folders", "Moderate Content"] },
            cr: { label: "CR", icon: "🎓", color: "#60a5fa", bg: "rgba(59, 130, 246, 0.2)", permissions: ["Upload Notes", "Create Assignments", "Create Announcements", "Manage Subjects", "Manage Folders"] },
            lr: { label: "LR", icon: "🌸", color: "#f9a8d4", bg: "rgba(244, 114, 182, 0.2)", permissions: ["Upload Notes", "Create Assignments", "Create Announcements", "Manage Subjects", "Manage Folders"] },
            coordinator: { label: "COORDINATOR", icon: "📚", color: "#fbbf24", bg: "rgba(245, 158, 11, 0.2)", permissions: ["Upload Notes", "Create Assignments", "Create Announcements"] },
            student: { label: "STUDENT", icon: "👤", color: "#34d399", bg: "rgba(16, 185, 129, 0.2)", permissions: ["Upload Notes", "Create Assignments", "Create Announcements", "Browse Subjects"] }
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
            .slice(0, 5);
    }, [assignments, getDaysLeft]);

    // Latest announcements (3)
    const latestAnnouncements = useMemo(() => {
        return [...announcements]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);
    }, [announcements]);

    // Latest assignments (3)
    const latestAssignments = useMemo(() => {
        return [...assignments]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);
    }, [assignments]);

    // Recent activities (5)
    const recentActivities = useMemo(() => {
        return activities.slice(0, 5);
    }, [activities]);

    // Subjects preview (4)
    const subjectPreview = useMemo(() => {
        return subjects.slice(0, 4);
    }, [subjects]);

    // Today summary stats
    const todaySummary = useMemo(() => {
        const activeAssignments = assignments.filter(a => {
            const days = getDaysLeft(a.due_date);
            return days !== null && days >= 0;
        }).length;

        const overdueAssignments = assignments.filter(a => {
            const days = getDaysLeft(a.due_date);
            return days !== null && days < 0;
        }).length;

        const totalSubjects = subjects.length;
        const totalAnnouncements = announcements.length;
        const totalFiles = stats?.files || 0;

        return {
            remainingClasses: todayData.remaining,
            activeAssignments,
            overdueAssignments,
            totalSubjects,
            totalAnnouncements,
            totalFiles
        };
    }, [assignments, announcements, subjects, stats, todayData.remaining, getDaysLeft]);

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
        sectionTitle: {
            color: "#94a3b8",
            fontSize: "11px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "12px",
            borderBottom: "1px solid #2d3748",
            paddingBottom: "8px"
        },
        card: {
            background: "#1a1f3a",
            borderRadius: "12px",
            border: "1px solid #2d3748",
            padding: "18px",
            marginBottom: "16px"
        },
        heading: {
            color: "#ffffff",
            fontSize: "18px",
            fontWeight: "500",
            margin: 0
        },
        subheading: {
            color: "#94a3b8",
            fontSize: "12px",
            margin: "2px 0 0 0"
        },
        link: {
            color: "#667eea",
            textDecoration: "none",
            fontSize: "13px",
            transition: "gap 0.15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            paddingTop: "12px",
            marginTop: "12px",
            borderTop: "1px solid #2d3748"
        },
        clickableItem: {
            padding: "10px 0",
            borderBottom: "1px solid #2d3748",
            cursor: "pointer",
            transition: "background 0.15s",
            borderRadius: "6px",
            padding: "8px 10px",
            margin: "0 -10px"
        }
    };

    return (
        <div style={{
            backgroundColor: "#0a0e27",
            minHeight: "100vh"
        }}>
            <Navbar />

            <div style={{
                padding: "20px",
                paddingTop: "20px",
                maxWidth: "1400px",
                margin: "0 auto",
                width: "100%",
                boxSizing: "border-box"
            }}>
                {/* ===== OVERVIEW SECTION ===== */}
                <div style={styles.sectionTitle}>📊 Overview</div>

                {/* Welcome Card */}
                <div style={{
                    ...styles.card,
                    background: "#1a1f3a",
                    border: "1px solid #2d3748"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "15px"
                    }}>
                        <div style={{ flex: 1 }}>
                            <h1 style={{
                                margin: "0 0 6px 0",
                                fontSize: "clamp(20px, 6vw, 28px)",
                                color: "#ffffff",
                                wordBreak: "break-word",
                                fontWeight: "500"
                            }}>
                                Welcome back, {user?.name?.split(' ')[0]}! 👋
                            </h1>
                            <div style={{
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                                alignItems: "center"
                            }}>
                                <span style={{
                                    padding: "4px 12px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    color: "#ffffff",
                                    backgroundColor: "rgba(255,255,255,0.1)"
                                }}>
                                    Roll No: {user?.roll_no}
                                </span>
                                <span style={{
                                    padding: "4px 12px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    backgroundColor: roleInfo.bg,
                                    color: roleInfo.color
                                }}>
                                    {roleInfo.icon} {roleInfo.label}
                                </span>
                                <span style={{
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    fontSize: "10px",
                                    color: "#64748b",
                                    cursor: "pointer",
                                    background: "rgba(100, 116, 139, 0.1)"
                                }}
                                onClick={() => setShowPermissions(!showPermissions)}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(100, 116, 139, 0.2)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(100, 116, 139, 0.1)"}>
                                    {showPermissions ? "Hide Permissions" : `${roleInfo.permissions.length} Permissions`}
                                </span>
                            </div>
                            {showPermissions && (
                                <div style={{
                                    marginTop: "12px",
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "8px"
                                }}>
                                    {roleInfo.permissions.map((perm, idx) => (
                                        <span key={idx} style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            background: "rgba(16, 185, 129, 0.1)",
                                            color: "#34d399",
                                            padding: "2px 10px",
                                            borderRadius: "12px",
                                            fontSize: "11px",
                                            fontWeight: "500"
                                        }}>
                                            ✓ {perm}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{
                            fontSize: "clamp(36px, 10vw, 44px)"
                        }}>
                            🎓
                        </div>
                    </div>
                </div>

                {/* Today Summary Card */}
                <div style={{
                    ...styles.card,
                    padding: "14px"
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "10px"
                    }}>
                        <FaInfoCircle style={{ color: "#a78bfa", fontSize: "16px" }} />
                        <h2 style={{ ...styles.heading, fontSize: "15px" }}>📌 Today Summary</h2>
                    </div>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                        gap: "8px"
                    }}>
                        {todaySummary.remainingClasses > 0 && (
                            <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                                📚 Classes remaining: <span style={{ color: "#ffffff", fontWeight: "600" }}>{todaySummary.remainingClasses}</span>
                            </span>
                        )}
                        {todaySummary.activeAssignments > 0 && (
                            <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                                📝 Assignments due: <span style={{ color: "#ffffff", fontWeight: "600" }}>{todaySummary.activeAssignments}</span>
                            </span>
                        )}
                        {todaySummary.overdueAssignments > 0 && (
                            <span style={{ color: "#ef4444", fontSize: "13px" }}>
                                ❌ Overdue: <span style={{ fontWeight: "600" }}>{todaySummary.overdueAssignments}</span>
                            </span>
                        )}
                        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                            📢 Announcements: <span style={{ color: "#ffffff", fontWeight: "600" }}>{todaySummary.totalAnnouncements}</span>
                        </span>
                        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                            📄 Total Files: <span style={{ color: "#ffffff", fontWeight: "600" }}>{todaySummary.totalFiles}</span>
                        </span>
                        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                            📚 Subjects: <span style={{ color: "#ffffff", fontWeight: "600" }}>{todaySummary.totalSubjects}</span>
                        </span>
                    </div>
                </div>

                {/* ===== ACTIONS SECTION ===== */}
                <div style={styles.sectionTitle}>⚡ Quick Actions</div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "10px",
                    marginBottom: "16px"
                }}>
                    <Link to="/upload-file" style={{
                        textDecoration: "none",
                        background: "#1a1f3a",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid #2d3748",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "border-color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#10b981"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                        <FaUpload style={{ color: "#10b981", fontSize: "16px" }} />
                        <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>Upload Notes</span>
                    </Link>

                    <Link to="/create-announcement" style={{
                        textDecoration: "none",
                        background: "#1a1f3a",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid #2d3748",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "border-color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#f59e0b"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                        <FaPlus style={{ color: "#f59e0b", fontSize: "16px" }} />
                        <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>Create Announcement</span>
                    </Link>

                    <Link to="/create-assignment" style={{
                        textDecoration: "none",
                        background: "#1a1f3a",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid #2d3748",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "border-color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                        <FaPlus style={{ color: "#a78bfa", fontSize: "16px" }} />
                        <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>Create Assignment</span>
                    </Link>

                    <Link to="/announcements" style={{
                        textDecoration: "none",
                        background: "#1a1f3a",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid #2d3748",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "border-color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#f59e0b"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                        <FaBullhorn style={{ color: "#f59e0b", fontSize: "16px" }} />
                        <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>Announcements</span>
                    </Link>

                    <Link to="/assignments" style={{
                        textDecoration: "none",
                        background: "#1a1f3a",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid #2d3748",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "border-color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                        <FaTasks style={{ color: "#a78bfa", fontSize: "16px" }} />
                        <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>Assignments</span>
                    </Link>

                    <Link to="/subjects" style={{
                        textDecoration: "none",
                        background: "#1a1f3a",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid #2d3748",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "border-color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#667eea"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                        <FaBook style={{ color: "#667eea", fontSize: "16px" }} />
                        <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>Subjects</span>
                    </Link>

                    <Link to="/timetable" style={{
                        textDecoration: "none",
                        background: "#1a1f3a",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid #2d3748",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "border-color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                        <FaCalendarAlt style={{ color: "#a78bfa", fontSize: "16px" }} />
                        <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: "500" }}>Timetable</span>
                    </Link>
                </div>

                {/* ===== ACADEMICS SECTION ===== */}
                <div style={styles.sectionTitle}>📚 Academics</div>

                {/* Today's Classes + Upcoming Deadlines */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
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
                            marginBottom: "12px"
                        }}>
                            <div>
                                <h2 style={styles.heading}>📅 Today's Classes</h2>
                                <p style={styles.subheading}>
                                    {todayData.today} • {todayData.classes.length} Classes
                                </p>
                            </div>
                        </div>

                        {todayData.classes.length === 0 ? (
                            <div style={{
                                textAlign: "center",
                                padding: "20px",
                                color: "#94a3b8",
                                fontSize: "13px"
                            }}>
                                📅 No classes today
                            </div>
                        ) : (
                            <div>
                                {todayData.classes.slice(0, 3).map((entry) => {
                                    const lab = isLab(entry.subject_name);
                                    const isActive = todayData.activeClass?.id === entry.id;
                                    const isNext = todayData.nextClass?.id === entry.id && !isActive;

                                    return (
                                        <div
                                            key={entry.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "8px 0",
                                                borderBottom: "1px solid #2d3748",
                                                flexWrap: "wrap",
                                                gap: "4px",
                                                ...(isActive ? {
                                                    background: "rgba(16, 185, 129, 0.05)",
                                                    borderRadius: "6px",
                                                    padding: "8px 10px",
                                                    margin: "0 -10px"
                                                } : {}),
                                                ...(isNext ? {
                                                    background: "rgba(96, 165, 250, 0.05)",
                                                    borderRadius: "6px",
                                                    padding: "8px 10px",
                                                    margin: "0 -10px"
                                                } : {})
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <span style={{ fontSize: "16px" }}>
                                                    {lab ? "🧪" : "📚"}
                                                </span>
                                                <div>
                                                    <div style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "6px",
                                                        flexWrap: "wrap"
                                                    }}>
                                                        <span style={{
                                                            color: "#ffffff",
                                                            fontSize: "13px",
                                                            fontWeight: "500"
                                                        }}>
                                                            {entry.subject_name}
                                                        </span>
                                                        {isActive && (
                                                            <span style={{
                                                                background: "rgba(16, 185, 129, 0.15)",
                                                                color: "#34d399",
                                                                fontSize: "9px",
                                                                fontWeight: "600",
                                                                padding: "2px 6px",
                                                                borderRadius: "10px"
                                                            }}>
                                                                NOW
                                                            </span>
                                                        )}
                                                        {isNext && !isActive && (
                                                            <span style={{
                                                                background: "rgba(96, 165, 250, 0.15)",
                                                                color: "#60a5fa",
                                                                fontSize: "9px",
                                                                fontWeight: "600",
                                                                padding: "2px 6px",
                                                                borderRadius: "10px"
                                                            }}>
                                                                NEXT
                                                            </span>
                                                        )}
                                                    </div>
                                                    {entry.room && lab && (
                                                        <div style={{
                                                            color: "#94a3b8",
                                                            fontSize: "11px"
                                                        }}>
                                                            🏫 {entry.room}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{
                                                color: "#94a3b8",
                                                fontSize: "12px",
                                                whiteSpace: "nowrap"
                                            }}>
                                                {entry.start_time} - {entry.end_time}
                                            </div>
                                        </div>
                                    );
                                })}
                                {todayData.classes.length > 3 && (
                                    <Link
                                        to="/timetable"
                                        style={{
                                            display: "block",
                                            textAlign: "center",
                                            color: "#667eea",
                                            textDecoration: "none",
                                            fontSize: "12px",
                                            marginTop: "10px"
                                        }}
                                    >
                                        +{todayData.classes.length - 3} more classes
                                    </Link>
                                )}
                            </div>
                        )}

                        <Link
                            to="/timetable"
                            style={styles.link}
                            onMouseEnter={(e) => e.currentTarget.style.gap = "10px"}
                            onMouseLeave={(e) => e.currentTarget.style.gap = "6px"}
                        >
                            View Full Timetable <FaArrowRight style={{ fontSize: "12px" }} />
                        </Link>
                    </div>

                    {/* Upcoming Deadlines */}
                    <div style={styles.card}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "12px"
                        }}>
                            <FaClock style={{ color: "#f59e0b", fontSize: "18px" }} />
                            <h2 style={styles.heading}>⏰ Upcoming Deadlines</h2>
                        </div>

                        {upcomingAssignments.length === 0 ? (
                            <div style={{
                                textAlign: "center",
                                padding: "20px",
                                color: "#94a3b8",
                                fontSize: "13px"
                            }}>
                                🎉 All caught up!
                            </div>
                        ) : (
                            <div>
                                {upcomingAssignments.slice(0, 3).map((assignment) => {
                                    const daysLeft = getDaysLeft(assignment.due_date);
                                    const statusColor = getStatusColor(daysLeft);
                                    
                                    return (
                                        <div
                                            key={assignment.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "8px 0",
                                                borderBottom: "1px solid #2d3748",
                                                flexWrap: "wrap",
                                                gap: "4px"
                                            }}
                                        >
                                            <div>
                                                <div style={{
                                                    color: "#ffffff",
                                                    fontSize: "13px",
                                                    fontWeight: "500"
                                                }}>
                                                    {assignment.title}
                                                </div>
                                                <div style={{
                                                    color: "#94a3b8",
                                                    fontSize: "11px"
                                                }}>
                                                    📚 {assignment.subject_name || "Unknown Subject"}
                                                </div>
                                            </div>
                                            <div style={{
                                                color: statusColor,
                                                fontSize: "12px",
                                                fontWeight: "500"
                                            }}>
                                                {getStatusText(daysLeft)}
                                            </div>
                                        </div>
                                    );
                                })}
                                {upcomingAssignments.length > 3 && (
                                    <div style={{
                                        textAlign: "center",
                                        color: "#94a3b8",
                                        fontSize: "12px",
                                        marginTop: "8px"
                                    }}>
                                        +{upcomingAssignments.length - 3} more deadlines
                                    </div>
                                )}
                            </div>
                        )}

                        <Link
                            to="/assignments"
                            style={styles.link}
                            onMouseEnter={(e) => e.currentTarget.style.gap = "10px"}
                            onMouseLeave={(e) => e.currentTarget.style.gap = "6px"}
                        >
                            View All Assignments <FaArrowRight style={{ fontSize: "12px" }} />
                        </Link>
                    </div>
                </div>

                {/* Browse Subjects Preview */}
                <div style={styles.card}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "12px"
                    }}>
                        <FaBook style={{ color: "#667eea", fontSize: "18px" }} />
                        <h2 style={styles.heading}>📚 Browse Subjects</h2>
                        <span style={{
                            color: "#94a3b8",
                            fontSize: "12px",
                            marginLeft: "auto"
                        }}>
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
                            No subjects available
                        </div>
                    ) : (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
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
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        transition: "border-color 0.15s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#667eea"}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}
                                >
                                    <span style={{ fontSize: "20px" }}>📚</span>
                                    <span style={{
                                        color: "#e2e8f0",
                                        fontSize: "13px",
                                        fontWeight: "500"
                                    }}>
                                        {subject.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                    <Link
                        to="/subjects"
                        style={styles.link}
                        onMouseEnter={(e) => e.currentTarget.style.gap = "10px"}
                        onMouseLeave={(e) => e.currentTarget.style.gap = "6px"}
                    >
                        Browse All Subjects <FaArrowRight style={{ fontSize: "12px" }} />
                    </Link>
                </div>

                {/* ===== COMMUNITY SECTION ===== */}
                <div style={styles.sectionTitle}>💬 Community</div>

                {/* Recent Announcements + Latest Assignments */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "16px",
                    marginBottom: "16px"
                }}>
                    {/* Recent Announcements */}
                    <div style={styles.card}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "12px"
                        }}>
                            <FaNewspaper style={{ color: "#f59e0b", fontSize: "18px" }} />
                            <h2 style={styles.heading}>📢 Recent Announcements</h2>
                        </div>

                        {latestAnnouncements.length === 0 ? (
                            <div style={{
                                textAlign: "center",
                                padding: "20px",
                                color: "#94a3b8",
                                fontSize: "13px"
                            }}>
                                No announcements yet
                            </div>
                        ) : (
                            <div>
                                {latestAnnouncements.map((announcement) => (
                                    <Link
                                        key={announcement.id}
                                        to="/announcements"
                                        style={{
                                            ...styles.clickableItem,
                                            display: "block",
                                            textDecoration: "none"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(102, 126, 234, 0.05)"}
                                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                    >
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}>
                                            <div style={{
                                                color: "#ffffff",
                                                fontSize: "14px",
                                                fontWeight: "500"
                                            }}>
                                                {announcement.title}
                                            </div>
                                            <FaArrowRight style={{ color: "#667eea", fontSize: "12px" }} />
                                        </div>
                                        <div style={{
                                            color: "#94a3b8",
                                            fontSize: "12px",
                                            marginTop: "4px"
                                        }}>
                                            👤 {announcement.created_by || "Admin"}
                                            {announcement.created_by_role && (
                                                <span style={{ marginLeft: "4px" }}>
                                                    ({announcement.created_by_role.toUpperCase()})
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        <Link
                            to="/announcements"
                            style={styles.link}
                            onMouseEnter={(e) => e.currentTarget.style.gap = "10px"}
                            onMouseLeave={(e) => e.currentTarget.style.gap = "6px"}
                        >
                            View All Announcements <FaArrowRight style={{ fontSize: "12px" }} />
                        </Link>
                    </div>

                    {/* Latest Assignments */}
                    <div style={styles.card}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "12px"
                        }}>
                            <FaTasks style={{ color: "#a78bfa", fontSize: "18px" }} />
                            <h2 style={styles.heading}>📝 Latest Assignments</h2>
                        </div>

                        {latestAssignments.length === 0 ? (
                            <div style={{
                                textAlign: "center",
                                padding: "20px",
                                color: "#94a3b8",
                                fontSize: "13px"
                            }}>
                                No assignments yet
                            </div>
                        ) : (
                            <div>
                                {latestAssignments.map((assignment) => (
                                    <Link
                                        key={assignment.id}
                                        to="/assignments"
                                        style={{
                                            ...styles.clickableItem,
                                            display: "block",
                                            textDecoration: "none"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(102, 126, 234, 0.05)"}
                                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                    >
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}>
                                            <div style={{
                                                color: "#ffffff",
                                                fontSize: "14px",
                                                fontWeight: "500"
                                            }}>
                                                {assignment.title}
                                            </div>
                                            <FaArrowRight style={{ color: "#667eea", fontSize: "12px" }} />
                                        </div>
                                        <div style={{
                                            color: "#94a3b8",
                                            fontSize: "12px",
                                            marginTop: "4px",
                                            display: "flex",
                                            gap: "12px",
                                            flexWrap: "wrap"
                                        }}>
                                            <span>📚 {assignment.subject_name || "Unknown Subject"}</span>
                                            <span>👤 {assignment.created_by || "Admin"}</span>
                                            {assignment.due_date && (
                                                <span>📅 {new Date(assignment.due_date).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        <Link
                            to="/assignments"
                            style={styles.link}
                            onMouseEnter={(e) => e.currentTarget.style.gap = "10px"}
                            onMouseLeave={(e) => e.currentTarget.style.gap = "6px"}
                        >
                            View All Assignments <FaArrowRight style={{ fontSize: "12px" }} />
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div style={styles.card}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "12px"
                    }}>
                        <FaFire style={{ color: "#f97316", fontSize: "18px" }} />
                        <h2 style={styles.heading}>🔥 Recent Activity</h2>
                    </div>

                    {recentActivities.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "20px",
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
                                        padding: "8px 0",
                                        borderBottom: "1px solid #2d3748"
                                    }}
                                >
                                    <div style={{
                                        width: "6px",
                                        height: "6px",
                                        borderRadius: "50%",
                                        backgroundColor: "#f97316",
                                        marginTop: "6px",
                                        flexShrink: 0
                                    }}></div>
                                    <p style={{
                                        margin: 0,
                                        color: "#cbd5e0",
                                        fontSize: "13px",
                                        lineHeight: "1.5"
                                    }}>
                                        {activity.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ===== STATISTICS SECTION ===== */}
                {stats && (
                    <>
                        <div style={styles.sectionTitle}>📊 Statistics</div>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                            gap: "10px",
                            marginBottom: "16px"
                        }}>
                            {[
                                { label: "Subjects", value: stats.subjects, icon: FaBook, color: "#667eea" },
                                { label: "Folders", value: stats.folders, icon: FaFolder, color: "#48bb78" },
                                { label: "Files", value: stats.files, icon: FaFile, color: "#ed8936" },
                                { label: "Users", value: stats.users, icon: FaUsers, color: "#f687b3" },
                                { label: "Announcements", value: stats.announcements, icon: FaBullhorn, color: "#4299e1" }
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    style={{
                                        ...styles.card,
                                        marginBottom: 0,
                                        padding: "12px"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = stat.color}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}
                                >
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: "8px"
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{
                                                margin: "0 0 2px 0",
                                                color: "#94a3b8",
                                                fontSize: "11px",
                                                fontWeight: "500"
                                            }}>{stat.label}</p>
                                            <h2 style={{
                                                margin: 0,
                                                fontSize: "22px",
                                                color: "#ffffff",
                                                fontWeight: "600"
                                            }}>
                                                {stat.value}
                                            </h2>
                                        </div>
                                        <stat.icon style={{
                                            fontSize: "22px",
                                            color: stat.color,
                                            opacity: 0.6
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ===== MANAGEMENT SECTION (ONLY ADMIN) ===== */}
                {user?.role === "admin" && (
                    <>
                        <div style={styles.sectionTitle}>⚙️ Management</div>
                        <div style={styles.card}>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                gap: "10px"
                            }}>
                                <Link to="/create-subject" style={{
                                    textDecoration: "none",
                                    background: "#0f172a",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid #2d3748",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "border-color 0.15s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                                    <FaBook style={{ color: "#a78bfa", fontSize: "16px" }} />
                                    <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "500" }}>Manage Subjects</span>
                                </Link>
                                <Link to="/create-folder" style={{
                                    textDecoration: "none",
                                    background: "#0f172a",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid #2d3748",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "border-color 0.15s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                                    <FaFolder style={{ color: "#a78bfa", fontSize: "16px" }} />
                                    <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "500" }}>Manage Folders</span>
                                </Link>
                                <Link to="/users" style={{
                                    textDecoration: "none",
                                    background: "#0f172a",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid #2d3748",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "border-color 0.15s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#f472b6"}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                                    <FaUsers style={{ color: "#f472b6", fontSize: "16px" }} />
                                    <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "500" }}>User Management</span>
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style>
                {`
                    ::-webkit-scrollbar {
                        width: 6px;
                    }
                    
                    ::-webkit-scrollbar-track {
                        background: #1a1f3a;
                        border-radius: 8px;
                    }
                    
                    ::-webkit-scrollbar-thumb {
                        background: #667eea;
                        border-radius: 8px;
                    }
                    
                    ::-webkit-scrollbar-thumb:hover {
                        background: #764ba2;
                    }
                    
                    @media (max-width: 768px) {
                        a, button, [role="button"] {
                            touch-action: manipulation;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        div[style*="grid-template-columns"] {
                            grid-template-columns: 1fr !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default Dashboard;