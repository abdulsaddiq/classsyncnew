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
    FaFire
} from "react-icons/fa";

function Dashboard() {

    const [user, setUser] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);

    useEffect(() => {

        const token =
            localStorage.getItem("token");

        const headers = {
            Authorization:
                `Bearer ${token}`
        };

        const fetchProfile = async () => {

            try {

                const response = await api.get(
                    "/auth/profile",
                    { headers }
                );

                setUser(response.data);

            } catch (error) {

                console.error(error);

                alert(
                    "Failed to load profile"
                );
            }
        };

        const fetchSubjects = async () => {

            try {

                const response = await api.get(
                    "/subjects",
                    { headers }
                );

                setSubjects(response.data);

            } catch (error) {

                console.error(error);
            }
        };

        const fetchAnnouncements = async () => {

            try {

                const response = await api.get(
                    "/announcements",
                    { headers }
                );

                setAnnouncements(
                    response.data
                );

            } catch (error) {

                console.error(error);
            }
        };

        const fetchStats = async () => {

            try {

                const response = await api.get(
                    "/auth/stats",
                    { headers }
                );

                setStats(
                    response.data
                );

            } catch (error) {

                console.error(error);
            }
        };

        const fetchActivities = async () => {

            try {

                const response = await api.get(
                    "/activities",
                    { headers }
                );

                setActivities(
                    response.data
                );

            } catch (error) {

                console.error(error);
            }
        };

        fetchProfile();
        fetchSubjects();
        fetchAnnouncements();
        fetchStats();
        fetchActivities();

    }, []);

    if (!user) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "#0a0e27",
                color: "#ffffff"
            }}>
                <div style={{
                    textAlign: "center"
                }}>
                    <div style={{
                        width: "40px",
                        height: "40px",
                        border: "3px solid #2d3748",
                        borderTopColor: "#667eea",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto 20px"
                    }}></div>
                    <h2>Loading...</h2>
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

            <div
                style={{
                    padding: "30px",
                    maxWidth: "1400px",
                    margin: "0 auto"
                }}
            >
                {/* Welcome Card */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        padding: "30px",
                        borderRadius: "20px",
                        marginBottom: "30px",
                        boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)"
                    }}
                >
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "20px"
                    }}>
                        <div>
                            <h1 style={{
                                margin: "0 0 10px 0",
                                fontSize: "32px",
                                color: "#ffffff"
                            }}>
                                Welcome back, {user.name}! 👋
                            </h1>
                            <div style={{
                                display: "flex",
                                gap: "15px",
                                flexWrap: "wrap",
                                marginTop: "10px"
                            }}>
                                <p style={{
                                    margin: 0,
                                    padding: "5px 12px",
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    borderRadius: "20px",
                                    fontSize: "14px",
                                    color: "#ffffff"
                                }}>
                                    Role: {user.role}
                                </p>
                                <p style={{
                                    margin: 0,
                                    padding: "5px 12px",
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    borderRadius: "20px",
                                    fontSize: "14px",
                                    color: "#ffffff"
                                }}>
                                    Roll No: {user.roll_no}
                                </p>
                            </div>
                        </div>
                        <div style={{
                            fontSize: "48px"
                        }}>
                            🎓
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "20px",
                            marginBottom: "40px"
                        }}
                    >
                        <div
                            style={{
                                background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
                                padding: "20px",
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
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <div>
                                    <p style={{
                                        margin: "0 0 10px 0",
                                        color: "#a0aec0",
                                        fontSize: "14px",
                                        fontWeight: "500"
                                    }}>Subjects</p>
                                    <h2 style={{
                                        margin: 0,
                                        fontSize: "36px",
                                        color: "#667eea"
                                    }}>
                                        {stats.subjects}
                                    </h2>
                                </div>
                                <FaBook style={{
                                    fontSize: "40px",
                                    color: "#667eea",
                                    opacity: 0.7
                                }} />
                            </div>
                        </div>

                        <div
                            style={{
                                background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
                                padding: "20px",
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
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <div>
                                    <p style={{
                                        margin: "0 0 10px 0",
                                        color: "#a0aec0",
                                        fontSize: "14px",
                                        fontWeight: "500"
                                    }}>Folders</p>
                                    <h2 style={{
                                        margin: 0,
                                        fontSize: "36px",
                                        color: "#48bb78"
                                    }}>
                                        {stats.folders}
                                    </h2>
                                </div>
                                <FaFolder style={{
                                    fontSize: "40px",
                                    color: "#48bb78",
                                    opacity: 0.7
                                }} />
                            </div>
                        </div>

                        <div
                            style={{
                                background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
                                padding: "20px",
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
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <div>
                                    <p style={{
                                        margin: "0 0 10px 0",
                                        color: "#a0aec0",
                                        fontSize: "14px",
                                        fontWeight: "500"
                                    }}>Files</p>
                                    <h2 style={{
                                        margin: 0,
                                        fontSize: "36px",
                                        color: "#ed8936"
                                    }}>
                                        {stats.files}
                                    </h2>
                                </div>
                                <FaFile style={{
                                    fontSize: "40px",
                                    color: "#ed8936",
                                    opacity: 0.7
                                }} />
                            </div>
                        </div>

                        <div
                            style={{
                                background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
                                padding: "20px",
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
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <div>
                                    <p style={{
                                        margin: "0 0 10px 0",
                                        color: "#a0aec0",
                                        fontSize: "14px",
                                        fontWeight: "500"
                                    }}>Users</p>
                                    <h2 style={{
                                        margin: 0,
                                        fontSize: "36px",
                                        color: "#f687b3"
                                    }}>
                                        {stats.users}
                                    </h2>
                                </div>
                                <FaUsers style={{
                                    fontSize: "40px",
                                    color: "#f687b3",
                                    opacity: 0.7
                                }} />
                            </div>
                        </div>

                        <div
                            style={{
                                background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
                                padding: "20px",
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
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <div>
                                    <p style={{
                                        margin: "0 0 10px 0",
                                        color: "#a0aec0",
                                        fontSize: "14px",
                                        fontWeight: "500"
                                    }}>Announcements</p>
                                    <h2 style={{
                                        margin: 0,
                                        fontSize: "36px",
                                        color: "#4299e1"
                                    }}>
                                        {stats.announcements}
                                    </h2>
                                </div>
                                <FaBullhorn style={{
                                    fontSize: "40px",
                                    color: "#4299e1",
                                    opacity: 0.7
                                }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Activity Section */}
                <div style={{
                    marginBottom: "40px"
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "20px"
                    }}>
                        <FaFire style={{
                            color: "#f97316",
                            fontSize: "24px"
                        }} />
                        <h2 style={{
                            color: "#ffffff",
                            margin: 0
                        }}>
                            Recent Activity
                        </h2>
                        <div style={{
                            height: "3px",
                            flex: 1,
                            background: "linear-gradient(90deg, #f97316, transparent)"
                        }}></div>
                    </div>

                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px"
                    }}>
                        {activities.length > 0 ? (
                            activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    style={{
                                        background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
                                        padding: "16px 20px",
                                        borderRadius: "12px",
                                        border: "1px solid #2d3748",
                                        transition: "all 0.3s ease",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px"
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
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "50%",
                                        backgroundColor: "#f97316",
                                        animation: "pulse 2s infinite"
                                    }}></div>
                                    <p style={{
                                        margin: 0,
                                        color: "#cbd5e0",
                                        fontSize: "14px",
                                        lineHeight: "1.5"
                                    }}>
                                        {activity.message}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div style={{
                                background: "#1a1f3a",
                                padding: "40px",
                                borderRadius: "15px",
                                textAlign: "center",
                                color: "#a0aec0"
                            }}>
                                No recent activities yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Announcements Section */}
                <div style={{
                    marginBottom: "40px"
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "20px"
                    }}>
                        <h2 style={{
                            color: "#ffffff",
                            margin: 0
                        }}>
                            📢 Announcements
                        </h2>
                        <div style={{
                            height: "3px",
                            flex: 1,
                            background: "linear-gradient(90deg, #667eea, transparent)"
                        }}></div>
                    </div>

                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px"
                    }}>
                        {announcements.map(
                            (announcement) => (
                                <div
                                    key={announcement.id}
                                    style={{
                                        background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
                                        padding: "20px",
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
                                        color: "#667eea"
                                    }}>
                                        {announcement.title}
                                    </h3>
                                    <p style={{
                                        margin: 0,
                                        color: "#cbd5e0",
                                        lineHeight: "1.6"
                                    }}>
                                        {announcement.content}
                                    </p>
                                </div>
                            )
                        )}
                        {announcements.length === 0 && (
                            <div style={{
                                background: "#1a1f3a",
                                padding: "40px",
                                borderRadius: "15px",
                                textAlign: "center",
                                color: "#a0aec0"
                            }}>
                                No announcements yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Subjects Section */}
                <div>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "20px"
                    }}>
                        <h2 style={{
                            color: "#ffffff",
                            margin: 0
                        }}>
                            📚 Subjects
                        </h2>
                        <div style={{
                            height: "3px",
                            flex: 1,
                            background: "linear-gradient(90deg, #667eea, transparent)"
                        }}></div>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "15px"
                    }}>
                        {subjects.map(
                            (subject) => (
                                <Link
                                    key={subject.id}
                                    to={`/subject/${subject.id}`}
                                    style={{
                                        textDecoration: "none"
                                    }}
                                >
                                    <div
                                        style={{
                                            background: "linear-gradient(135deg, #1a1f3a 0%, #13172e 100%)",
                                            padding: "20px",
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
                                            fontSize: "28px"
                                        }}>
                                            📚
                                        </div>
                                        <span style={{
                                            color: "#cbd5e0",
                                            fontSize: "16px",
                                            fontWeight: "500"
                                        }}>
                                            {subject.name}
                                        </span>
                                    </div>
                                </Link>
                            )
                        )}
                        {subjects.length === 0 && (
                            <div style={{
                                background: "#1a1f3a",
                                padding: "40px",
                                borderRadius: "15px",
                                textAlign: "center",
                                color: "#a0aec0",
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
                        0%, 100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.5;
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default Dashboard;