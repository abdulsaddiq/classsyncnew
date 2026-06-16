import { useEffect, useState, useMemo } from "react";
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
    FaCalendarAlt
} from "react-icons/fa";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const canManage = ["admin", "moderator", "cr", "lr", "coordinator"].includes(user?.role);

    const getRoleDisplay = (role) => {
        const roleMap = {
            admin: { label: "ADMIN", icon: "👑", color: "#f472b6", bg: "rgba(236, 72, 153, 0.2)" },
            moderator: { label: "MODERATOR", icon: "🛡", color: "#c084fc", bg: "rgba(168, 85, 247, 0.2)" },
            cr: { label: "CR", icon: "🎓", color: "#60a5fa", bg: "rgba(59, 130, 246, 0.2)" },
            lr: { label: "LR", icon: "🌸", color: "#f9a8d4", bg: "rgba(244, 114, 182, 0.2)" },
            coordinator: { label: "COORDINATOR", icon: "📚", color: "#fbbf24", bg: "rgba(245, 158, 11, 0.2)" },
            student: { label: "STUDENT", icon: "👤", color: "#34d399", bg: "rgba(16, 185, 129, 0.2)" }
        };
        return roleMap[role] || roleMap.student;
    };

    const getDayName = () => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[new Date().getDay()];
    };

    const isLab = (name) => name?.toLowerCase().includes("lab");

    const getTimeValue = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
    };

    const getCurrentTimeValue = () => {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    };

    const getDaysLeft = (dueDate) => {
        if (!dueDate) return null;
        const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const getStatusColor = (daysLeft) => {
        if (daysLeft === null) return "#94a3b8";
        if (daysLeft < 0) return "#ef4444";
        if (daysLeft === 0) return "#f59e0b";
        if (daysLeft <= 3) return "#f59e0b";
        return "#a78bfa";
    };

    const getStatusText = (daysLeft) => {
        if (daysLeft === null) return "No due date";
        if (daysLeft < 0) return "❌ Overdue";
        if (daysLeft === 0) return "📅 Due Today";
        if (daysLeft <= 3) return `⚠️ ${daysLeft} days left`;
        return `⏳ ${daysLeft} days left`;
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const initializeDashboard = async () => {
            try {
                const profileResponse = await api.get("/auth/profile", { headers });
                const userData = profileResponse.data;
                setUser(userData);

                await Promise.all([
                    fetchAnnouncements(headers),
                    fetchActivities(headers),
                    fetchTimetable(headers),
                    fetchAssignments(headers)
                ]);

                if (userData.role === "admin") {
                    await fetchStats(headers);
                }
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

        const fetchAnnouncements = async (headers) => {
            try {
                const response = await api.get("/announcements", { headers });
                setAnnouncements(response.data);
            } catch (error) {
                console.error("Error fetching announcements:", error);
            }
        };

        const fetchStats = async (headers) => {
            try {
                const response = await api.get("/auth/stats", { headers });
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        const fetchActivities = async (headers) => {
            try {
                const response = await api.get("/activities", { headers });
                setActivities(response.data);
            } catch (error) {
                console.error("Error fetching activities:", error);
            }
        };

        const fetchTimetable = async (headers) => {
            try {
                const response = await api.get("/timetable", { headers });
                setTimetable(response.data);
            } catch (error) {
                console.error("Error fetching timetable:", error);
            }
        };

        const fetchAssignments = async (headers) => {
            try {
                const response = await api.get("/assignments", { headers });
                setAssignments(response.data);
            } catch (error) {
                console.error("Error fetching assignments:", error);
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
            nextClass
        };
    }, [timetable]);

    // Memoized upcoming deadlines (only upcoming, not overdue)
    const upcomingAssignments = useMemo(() => {
        return [...assignments]
            .filter(a => {
                if (!a.due_date) return false;
                return getDaysLeft(a.due_date) >= 0;
            })
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            .slice(0, 5);
    }, [assignments]);

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
        card: {
            background: "#1a1f3a",
            borderRadius: "12px",
            border: "1px solid #2d3748",
            padding: "20px",
            marginBottom: "30px"
        },
        heading: {
            color: "#ffffff",
            fontSize: "20px",
            fontWeight: "500",
            margin: 0
        },
        subheading: {
            color: "#94a3b8",
            fontSize: "13px",
            margin: "4px 0 0 0"
        },
        link: {
            color: "#667eea",
            textDecoration: "none",
            fontSize: "14px",
            transition: "gap 0.15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            paddingTop: "14px",
            marginTop: "16px",
            borderTop: "1px solid #2d3748"
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
                                margin: "0 0 10px 0",
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
                            </div>
                        </div>
                        <div style={{
                            fontSize: "clamp(36px, 10vw, 44px)"
                        }}>
                            🎓
                        </div>
                    </div>
                </div>

                {/* Quick Actions - Permission based */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "12px",
                    marginBottom: "30px"
                }}>
                    {canManage && (
                        <Link to="/create-announcement" style={{
                            textDecoration: "none",
                            background: "#1a1f3a",
                            padding: "14px",
                            borderRadius: "12px",
                            border: "1px solid #2d3748",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            transition: "border-color 0.15s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#f59e0b"}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                            <FaPlus style={{ color: "#f59e0b", fontSize: "16px" }} />
                            <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "500" }}>Create Announcement</span>
                        </Link>
                    )}
                    
                    {canManage && (
                        <Link to="/create-assignment" style={{
                            textDecoration: "none",
                            background: "#1a1f3a",
                            padding: "14px",
                            borderRadius: "12px",
                            border: "1px solid #2d3748",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            transition: "border-color 0.15s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                            <FaPlus style={{ color: "#a78bfa", fontSize: "16px" }} />
                            <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "500" }}>Create Assignment</span>
                        </Link>
                    )}

                    <Link to="/upload-file" style={{
                        textDecoration: "none",
                        background: "#1a1f3a",
                        padding: "14px",
                        borderRadius: "12px",
                        border: "1px solid #2d3748",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "border-color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#10b981"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                        <FaUpload style={{ color: "#10b981", fontSize: "16px" }} />
                        <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "500" }}>Upload Notes</span>
                    </Link>

                    <Link to="/assignments" style={{
                        textDecoration: "none",
                        background: "#1a1f3a",
                        padding: "14px",
                        borderRadius: "12px",
                        border: "1px solid #2d3748",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "border-color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                        <FaClipboardList style={{ color: "#a78bfa", fontSize: "16px" }} />
                        <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "500" }}>Assignments</span>
                    </Link>

                    <Link to="/subjects" style={{
                        textDecoration: "none",
                        background: "#1a1f3a",
                        padding: "14px",
                        borderRadius: "12px",
                        border: "1px solid #2d3748",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "border-color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#667eea"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}>
                        <FaBook style={{ color: "#667eea", fontSize: "16px" }} />
                        <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "500" }}>Browse Subjects</span>
                    </Link>
                </div>

                {/* Upcoming Deadlines - Moved Up */}
                <div style={styles.card}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "16px"
                    }}>
                        <h2 style={styles.heading}>📝 Upcoming Deadlines</h2>
                    </div>

                    {upcomingAssignments.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "20px",
                            color: "#94a3b8",
                            fontSize: "14px"
                        }}>
                            🎉 You're all caught up!
                            <div style={{ fontSize: "13px", marginTop: "4px", color: "#64748b" }}>
                                No assignments due
                            </div>
                        </div>
                    ) : (
                        <div>
                            {upcomingAssignments.map((assignment) => {
                                const daysLeft = getDaysLeft(assignment.due_date);
                                const statusColor = getStatusColor(daysLeft);
                                
                                return (
                                    <div
                                        key={assignment.id}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "10px 12px",
                                            borderBottom: "1px solid #2d3748",
                                            flexWrap: "wrap",
                                            gap: "6px"
                                        }}
                                    >
                                        <div>
                                            <div style={{
                                                color: "#ffffff",
                                                fontSize: "14px",
                                                fontWeight: "500"
                                            }}>
                                                {assignment.title}
                                            </div>
                                            <div style={{
                                                color: "#94a3b8",
                                                fontSize: "12px"
                                            }}>
                                                📚 {assignment.subject_name || "Unknown Subject"}
                                            </div>
                                        </div>
                                        <div style={{
                                            color: statusColor,
                                            fontSize: "13px",
                                            fontWeight: "500"
                                        }}>
                                            {getStatusText(daysLeft)}
                                        </div>
                                    </div>
                                );
                            })}
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

                {/* Today's Classes */}
                <div style={styles.card}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px",
                        marginBottom: "16px"
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
                            padding: "30px",
                            color: "#94a3b8",
                            fontSize: "14px"
                        }}>
                            📅 No classes scheduled today
                            <div style={{ fontSize: "13px", marginTop: "4px", color: "#64748b" }}>
                                Enjoy your free day!
                            </div>
                        </div>
                    ) : (
                        <div>
                            {todayData.classes.map((entry) => {
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
                                            padding: "10px 12px",
                                            borderBottom: "1px solid #2d3748",
                                            flexWrap: "wrap",
                                            gap: "8px",
                                            ...(isActive ? {
                                                background: "rgba(16, 185, 129, 0.08)",
                                                borderRadius: "6px",
                                                marginBottom: "2px"
                                            } : {}),
                                            ...(isNext ? {
                                                background: "rgba(96, 165, 250, 0.08)",
                                                borderRadius: "6px",
                                                marginBottom: "2px"
                                            } : {})
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                                            <span style={{ fontSize: "18px" }}>
                                                {lab ? "🧪" : "📚"}
                                            </span>
                                            <div>
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    flexWrap: "wrap"
                                                }}>
                                                    <span style={{
                                                        color: "#ffffff",
                                                        fontSize: "14px",
                                                        fontWeight: "500"
                                                    }}>
                                                        {entry.subject_name}
                                                    </span>
                                                    {isActive && (
                                                        <span style={{
                                                            background: "rgba(16, 185, 129, 0.15)",
                                                            color: "#34d399",
                                                            fontSize: "10px",
                                                            fontWeight: "600",
                                                            padding: "2px 8px",
                                                            borderRadius: "12px"
                                                        }}>
                                                            NOW
                                                        </span>
                                                    )}
                                                    {isNext && !isActive && (
                                                        <span style={{
                                                            background: "rgba(96, 165, 250, 0.15)",
                                                            color: "#60a5fa",
                                                            fontSize: "10px",
                                                            fontWeight: "600",
                                                            padding: "2px 8px",
                                                            borderRadius: "12px"
                                                        }}>
                                                            NEXT
                                                        </span>
                                                    )}
                                                </div>
                                                {entry.room && lab && (
                                                    <div style={{
                                                        color: "#94a3b8",
                                                        fontSize: "12px"
                                                    }}>
                                                        🏫 {entry.room}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{
                                            color: "#94a3b8",
                                            fontSize: "13px",
                                            whiteSpace: "nowrap"
                                        }}>
                                            {entry.start_time} - {entry.end_time}
                                        </div>
                                    </div>
                                );
                            })}
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

                {/* Stats Grid */}
                {stats && (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: "12px",
                        marginBottom: "30px"
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
                                    padding: "clamp(14px, 4vw, 18px)"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = stat.color}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}
                            >
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: "10px"
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{
                                            margin: "0 0 6px 0",
                                            color: "#94a3b8",
                                            fontSize: "clamp(11px, 3vw, 13px)",
                                            fontWeight: "500"
                                        }}>{stat.label}</p>
                                        <h2 style={{
                                            margin: 0,
                                            fontSize: "clamp(24px, 6vw, 32px)",
                                            color: "#ffffff",
                                            fontWeight: "600"
                                        }}>
                                            {stat.value}
                                        </h2>
                                    </div>
                                    <stat.icon style={{
                                        fontSize: "clamp(24px, 6vw, 34px)",
                                        color: stat.color,
                                        opacity: 0.6
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Two Column Layout */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "clamp(20px, 4vw, 30px)",
                    marginBottom: "30px"
                }}>
                    {/* Recent Activity */}
                    <div>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "15px",
                            flexWrap: "wrap"
                        }}>
                            <FaFire style={{ color: "#f97316", fontSize: "clamp(18px, 4vw, 20px)" }} />
                            <h2 style={{
                                color: "#ffffff",
                                margin: 0,
                                fontSize: "clamp(18px, 4vw, 20px)",
                                fontWeight: "500"
                            }}>
                                Recent Activity ({activities.length})
                            </h2>
                        </div>

                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            maxHeight: "400px",
                            overflowY: "auto"
                        }}>
                            {activities.length > 0 ? (
                                activities.slice(0, 5).map((activity) => (
                                    <div
                                        key={activity.id}
                                        style={{
                                            ...styles.card,
                                            marginBottom: 0,
                                            padding: "clamp(12px, 3vw, 14px)",
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "10px",
                                            border: "1px solid #2d3748"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#f97316"}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}
                                    >
                                        <div style={{
                                            width: "6px",
                                            height: "6px",
                                            borderRadius: "50%",
                                            backgroundColor: "#f97316",
                                            marginTop: "8px",
                                            flexShrink: 0
                                        }}></div>
                                        <p style={{
                                            margin: 0,
                                            color: "#cbd5e0",
                                            fontSize: "clamp(12px, 3.5vw, 14px)",
                                            lineHeight: "1.5",
                                            wordBreak: "break-word"
                                        }}>
                                            {activity.message}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div style={{
                                    ...styles.card,
                                    marginBottom: 0,
                                    textAlign: "center",
                                    color: "#94a3b8",
                                    fontSize: "14px",
                                    padding: "clamp(30px, 8vw, 40px)"
                                }}>
                                    No recent activities yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Announcements */}
                    <div>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "15px",
                            flexWrap: "wrap"
                        }}>
                            <h2 style={{
                                color: "#ffffff",
                                margin: 0,
                                fontSize: "clamp(18px, 4vw, 20px)",
                                fontWeight: "500"
                            }}>
                                📢 Announcements ({announcements.length})
                            </h2>
                        </div>

                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            maxHeight: "400px",
                            overflowY: "auto"
                        }}>
                            {announcements.slice(0, 3).map((announcement) => {
                                const creatorRole = getRoleDisplay(announcement.created_by_role);
                                
                                return (
                                    <div
                                        key={announcement.id}
                                        style={{
                                            ...styles.card,
                                            marginBottom: 0,
                                            padding: "clamp(14px, 4vw, 18px)",
                                            border: "1px solid #2d3748"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#667eea"}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2d3748"}
                                    >
                                        <h3 style={{
                                            margin: "0 0 6px 0",
                                            color: "#667eea",
                                            fontSize: "clamp(14px, 4vw, 17px)",
                                            fontWeight: "500",
                                            wordBreak: "break-word"
                                        }}>
                                            {announcement.title}
                                        </h3>
                                        <div style={{
                                            display: "flex",
                                            gap: "8px",
                                            marginBottom: "8px",
                                            flexWrap: "wrap",
                                            alignItems: "center"
                                        }}>
                                            <span style={{
                                                color: "#94a3b8",
                                                fontSize: "12px"
                                            }}>
                                                By {announcement.created_by || "Admin"}
                                            </span>
                                            {announcement.created_by_role && (
                                                <span style={{
                                                    padding: "2px 8px",
                                                    borderRadius: "12px",
                                                    fontSize: "10px",
                                                    fontWeight: "600",
                                                    backgroundColor: creatorRole.bg,
                                                    color: creatorRole.color
                                                }}>
                                                    {creatorRole.icon} {creatorRole.label}
                                                </span>
                                            )}
                                        </div>
                                        <p style={{
                                            margin: 0,
                                            color: "#cbd5e0",
                                            lineHeight: "1.5",
                                            fontSize: "clamp(12px, 3.5vw, 14px)",
                                            wordBreak: "break-word"
                                        }}>
                                            {announcement.content.length > 120 
                                                ? announcement.content.substring(0, 120) + "..." 
                                                : announcement.content}
                                        </p>
                                    </div>
                                );
                            })}
                            {announcements.length === 0 && (
                                <div style={{
                                    ...styles.card,
                                    marginBottom: 0,
                                    textAlign: "center",
                                    color: "#94a3b8",
                                    fontSize: "14px",
                                    padding: "clamp(30px, 8vw, 40px)"
                                }}>
                                    No announcements yet
                                </div>
                            )}
                            {announcements.length > 3 && (
                                <Link
                                    to="/announcements"
                                    style={styles.link}
                                    onMouseEnter={(e) => e.currentTarget.style.gap = "10px"}
                                    onMouseLeave={(e) => e.currentTarget.style.gap = "6px"}
                                >
                                    View All Announcements <FaArrowRight style={{ fontSize: "12px" }} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
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