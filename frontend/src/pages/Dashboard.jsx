import { useEffect, useState } from "react";
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
    const [loading, setLoading] = useState(true);

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
                    fetchActivities(headers)
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

        initializeDashboard();
    }, []);

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
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    padding: "clamp(20px, 5vw, 30px)",
                    borderRadius: "20px",
                    marginBottom: "clamp(20px, 5vw, 30px)",
                    boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)"
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
                                fontSize: "clamp(20px, 6vw, 32px)",
                                color: "#ffffff",
                                wordBreak: "break-word"
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
                                    backgroundColor: "rgba(255,255,255,0.2)"
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
                            fontSize: "clamp(36px, 10vw, 48px)"
                        }}>
                            🎓
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "12px",
                    marginBottom: "30px"
                }}>
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
                        <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "500" }}>Announcement</span>
                    </Link>
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
                        <FaClipboardList style={{ color: "#a78bfa", fontSize: "16px" }} />
                        <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "500" }}>Assignment</span>
                    </Link>
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
                                    background: "#1a1f3a",
                                    padding: "clamp(14px, 4vw, 18px)",
                                    borderRadius: "12px",
                                    border: "1px solid #2d3748",
                                    transition: "border-color 0.15s"
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
                            <FaFire style={{ color: "#f97316", fontSize: "clamp(18px, 4vw, 22px)" }} />
                            <h2 style={{
                                color: "#ffffff",
                                margin: 0,
                                fontSize: "clamp(18px, 4vw, 22px)",
                                fontWeight: "500"
                            }}>
                                Recent Activity ({activities.length})
                            </h2>
                            <div style={{
                                height: "2px",
                                flex: 1,
                                background: "linear-gradient(90deg, #f97316, transparent)"
                            }}></div>
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
                                            background: "#1a1f3a",
                                            padding: "clamp(12px, 3vw, 14px)",
                                            borderRadius: "10px",
                                            border: "1px solid #2d3748",
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "10px",
                                            transition: "border-color 0.15s"
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
                                    background: "#1a1f3a",
                                    padding: "clamp(30px, 8vw, 40px)",
                                    borderRadius: "12px",
                                    textAlign: "center",
                                    color: "#94a3b8",
                                    fontSize: "clamp(12px, 3.5vw, 14px)",
                                    border: "1px solid #2d3748"
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
                                fontSize: "clamp(18px, 4vw, 22px)",
                                fontWeight: "500"
                            }}>
                                📢 Announcements ({announcements.length})
                            </h2>
                            <div style={{
                                height: "2px",
                                flex: 1,
                                background: "linear-gradient(90deg, #667eea, transparent)"
                            }}></div>
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
                                            background: "#1a1f3a",
                                            padding: "clamp(14px, 4vw, 18px)",
                                            borderRadius: "12px",
                                            border: "1px solid #2d3748",
                                            transition: "border-color 0.15s"
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
                                    background: "#1a1f3a",
                                    padding: "clamp(30px, 8vw, 40px)",
                                    borderRadius: "12px",
                                    textAlign: "center",
                                    color: "#94a3b8",
                                    fontSize: "clamp(12px, 3.5vw, 14px)",
                                    border: "1px solid #2d3748"
                                }}>
                                    No announcements yet
                                </div>
                            )}
                            {announcements.length > 3 && (
                                <Link to="/announcements" style={{
                                    textAlign: "center",
                                    color: "#667eea",
                                    textDecoration: "none",
                                    fontSize: "clamp(12px, 3.5vw, 14px)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                    padding: "8px",
                                    borderRadius: "8px",
                                    background: "rgba(102, 126, 234, 0.05)"
                                }}>
                                    View All Announcements <FaArrowRight style={{ fontSize: "12px" }} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Timetable Section */}
                <div style={{ marginBottom: "30px" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "15px",
                        flexWrap: "wrap"
                    }}>
                        <FaCalendarAlt style={{ color: "#a78bfa", fontSize: "clamp(18px, 4vw, 22px)" }} />
                        <h2 style={{
                            color: "#ffffff",
                            margin: 0,
                            fontSize: "clamp(18px, 4vw, 22px)",
                            fontWeight: "500"
                        }}>
                            Today's Schedule
                        </h2>
                        <div style={{
                            height: "2px",
                            flex: 1,
                            background: "linear-gradient(90deg, #a78bfa, transparent)"
                        }}></div>
                    </div>

                    <div style={{
                        background: "#1a1f3a",
                        padding: "clamp(30px, 5vw, 40px)",
                        borderRadius: "12px",
                        border: "1px solid #2d3748",
                        textAlign: "center"
                    }}>
                        <div style={{ fontSize: "32px", marginBottom: "12px" }}>📅</div>
                        <h3 style={{ color: "#ffffff", marginBottom: "8px", fontWeight: "500" }}>No Timetable Available</h3>
                        <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
                            Timetable integration will appear here when configured.
                        </p>
                    </div>
                </div>
            </div>

            <style>
                {`
                    /* Custom scrollbar */
                    ::-webkit-scrollbar {
                        width: 6px;
                    }
                    
                    ::-webkit-scrollbar-track {
                        background: #1a1f3a;
                        borderRadius: 8px;
                    }
                    
                    ::-webkit-scrollbar-thumb {
                        background: #667eea;
                        borderRadius: 8px;
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