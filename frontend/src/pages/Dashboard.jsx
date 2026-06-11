import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import Navbar from "../components/Navbar";

import {
    FaBook,
    FaFolder,
    FaFile,
    FaUsers,
    FaBullhorn,
    FaFire,
    FaArrowRight
} from "react-icons/fa";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const initializeDashboard = async () => {
            try {
                // Fetch profile first
                const profileResponse = await api.get("/auth/profile", { headers });
                const userData = profileResponse.data;
                setUser(userData);

                // Fetch data that's available to everyone
                await Promise.all([
                    fetchSubjects(headers),
                    fetchAnnouncements(headers),
                    fetchActivities(headers)
                ]);

                // Only fetch stats if user is admin
                if (userData.role === "admin") {
                    await fetchStats(headers);
                }
            } catch (error) {
                console.error("Error initializing dashboard:", error);
                if (error.response?.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/";
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchSubjects = async (headers) => {
            try {
                const response = await api.get("/subjects", { headers });
                setSubjects(response.data);
            } catch (error) {
                console.error("Error fetching subjects:", error);
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
                    <div style={{
                        width: "40px",
                        height: "40px",
                        border: "3px solid #2d3748",
                        borderTopColor: "#667eea",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto 20px"
                    }}></div>
                    <h2>Loading Dashboard...</h2>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

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
                {/* Welcome Card - Enhanced for mobile */}
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
                                flexWrap: "wrap"
                            }}>
                                <span style={{
                                    padding: "4px 12px",
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    color: "#ffffff"
                                }}>
                                    Role: {user?.role}
                                </span>
                                <span style={{
                                    padding: "4px 12px",
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    color: "#ffffff"
                                }}>
                                    Roll No: {user?.roll_no}
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

                {/* Stats Grid - Responsive */}
                {stats && (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                        gap: "15px",
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
                                    background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
                                    padding: "clamp(15px, 4vw, 20px)",
                                    borderRadius: "15px",
                                    border: "1px solid #2d3748",
                                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                    cursor: "pointer"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-5px)";
                                    e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.3)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: "10px"
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{
                                            margin: "0 0 8px 0",
                                            color: "#a0aec0",
                                            fontSize: "clamp(11px, 3vw, 14px)",
                                            fontWeight: "500"
                                        }}>{stat.label}</p>
                                        <h2 style={{
                                            margin: 0,
                                            fontSize: "clamp(24px, 6vw, 36px)",
                                            color: stat.color
                                        }}>
                                            {stat.value}
                                        </h2>
                                    </div>
                                    <stat.icon style={{
                                        fontSize: "clamp(28px, 7vw, 40px)",
                                        color: stat.color,
                                        opacity: 0.7
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Two Column Layout for Recent Activity and Announcements */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "clamp(20px, 4vw, 30px)",
                    marginBottom: "30px"
                }}>
                    {/* Recent Activity Section */}
                    <div>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "15px",
                            flexWrap: "wrap"
                        }}>
                            <FaFire style={{ color: "#f97316", fontSize: "clamp(20px, 5vw, 24px)" }} />
                            <h2 style={{
                                color: "#ffffff",
                                margin: 0,
                                fontSize: "clamp(18px, 5vw, 24px)"
                            }}>
                                Recent Activity
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
                            gap: "10px",
                            maxHeight: "400px",
                            overflowY: "auto"
                        }}>
                            {activities.length > 0 ? (
                                activities.slice(0, 5).map((activity) => (
                                    <div
                                        key={activity.id}
                                        style={{
                                            background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
                                            padding: "clamp(12px, 3vw, 16px)",
                                            borderRadius: "12px",
                                            border: "1px solid #2d3748",
                                            transition: "all 0.3s ease",
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "10px"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateX(5px)";
                                            e.currentTarget.style.borderColor = "#f97316";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateX(0)";
                                            e.currentTarget.style.borderColor = "#2d3748";
                                        }}
                                    >
                                        <div style={{
                                            width: "6px",
                                            height: "6px",
                                            borderRadius: "50%",
                                            backgroundColor: "#f97316",
                                            marginTop: "8px",
                                            flexShrink: 0,
                                            animation: "pulse 2s infinite"
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
                                    borderRadius: "15px",
                                    textAlign: "center",
                                    color: "#a0aec0",
                                    fontSize: "clamp(12px, 3.5vw, 14px)"
                                }}>
                                    No recent activities yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Announcements Section */}
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
                                fontSize: "clamp(18px, 5vw, 24px)"
                            }}>
                                📢 Announcements
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
                            gap: "12px",
                            maxHeight: "400px",
                            overflowY: "auto"
                        }}>
                            {announcements.slice(0, 3).map((announcement) => (
                                <div
                                    key={announcement.id}
                                    style={{
                                        background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
                                        padding: "clamp(15px, 4vw, 20px)",
                                        borderRadius: "15px",
                                        border: "1px solid #2d3748",
                                        transition: "transform 0.3s ease",
                                        cursor: "pointer"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateX(5px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateX(0)";
                                    }}
                                >
                                    <h3 style={{
                                        margin: "0 0 10px 0",
                                        color: "#667eea",
                                        fontSize: "clamp(14px, 4vw, 18px)",
                                        wordBreak: "break-word"
                                    }}>
                                        {announcement.title}
                                    </h3>
                                    <p style={{
                                        margin: 0,
                                        color: "#cbd5e0",
                                        lineHeight: "1.6",
                                        fontSize: "clamp(12px, 3.5vw, 14px)",
                                        wordBreak: "break-word"
                                    }}>
                                        {announcement.content.length > 150 
                                            ? announcement.content.substring(0, 150) + "..." 
                                            : announcement.content}
                                    </p>
                                </div>
                            ))}
                            {announcements.length === 0 && (
                                <div style={{
                                    background: "#1a1f3a",
                                    padding: "clamp(30px, 8vw, 40px)",
                                    borderRadius: "15px",
                                    textAlign: "center",
                                    color: "#a0aec0",
                                    fontSize: "clamp(12px, 3.5vw, 14px)"
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
                                    gap: "5px",
                                    transition: "gap 0.3s ease"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.gap = "10px"}
                                onMouseLeave={(e) => e.currentTarget.style.gap = "5px"}>
                                    View All Announcements <FaArrowRight style={{ fontSize: "12px" }} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Subjects Section */}
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
                            fontSize: "clamp(18px, 5vw, 24px)"
                        }}>
                            📚 Your Subjects
                        </h2>
                        <div style={{
                            height: "2px",
                            flex: 1,
                            background: "linear-gradient(90deg, #667eea, transparent)"
                        }}></div>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                        gap: "12px"
                    }}>
                        {subjects.map((subject) => (
                            <Link
                                key={subject.id}
                                to={`/subject/${subject.id}`}
                                style={{ textDecoration: "none" }}
                            >
                                <div
                                    style={{
                                        background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
                                        padding: "clamp(15px, 4vw, 20px)",
                                        borderRadius: "15px",
                                        border: "1px solid #2d3748",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-5px)";
                                        e.currentTarget.style.borderColor = "#667eea";
                                        e.currentTarget.style.boxShadow = "0 10px 25px rgba(102, 126, 234, 0.2)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.borderColor = "#2d3748";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    <div style={{
                                        fontSize: "clamp(20px, 5vw, 28px)",
                                        flexShrink: 0
                                    }}>
                                        📚
                                    </div>
                                    <span style={{
                                        color: "#cbd5e0",
                                        fontSize: "clamp(13px, 3.5vw, 16px)",
                                        fontWeight: "500",
                                        wordBreak: "break-word",
                                        flex: 1
                                    }}>
                                        {subject.name}
                                    </span>
                                    <FaArrowRight style={{
                                        color: "#667eea",
                                        fontSize: "clamp(12px, 3vw, 14px)",
                                        opacity: 0,
                                        transition: "opacity 0.3s ease",
                                        flexShrink: 0
                                    }} />
                                </div>
                            </Link>
                        ))}
                        {subjects.length === 0 && (
                            <div style={{
                                background: "#1a1f3a",
                                padding: "clamp(30px, 8vw, 40px)",
                                borderRadius: "15px",
                                textAlign: "center",
                                color: "#a0aec0",
                                fontSize: "clamp(12px, 3.5vw, 14px)",
                                gridColumn: "1/-1"
                            }}>
                                No subjects available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>
                {`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                    
                    /* Custom scrollbar */
                    ::-webkit-scrollbar {
                        width: 8px;
                    }
                    
                    ::-webkit-scrollbar-track {
                        background: #1a1f3a;
                        border-radius: 10px;
                    }
                    
                    ::-webkit-scrollbar-thumb {
                        background: #667eea;
                        border-radius: 10px;
                    }
                    
                    ::-webkit-scrollbar-thumb:hover {
                        background: #764ba2;
                    }
                    
                    /* Mobile optimizations */
                    @media (max-width: 768px) {
                        .dashboard-container {
                            padding: 10px !important;
                        }
                        
                        /* Better touch targets for mobile */
                        a, button, [role="button"] {
                            touch-action: manipulation;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        /* Adjust grid for very small screens */
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