import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../services/api";

function Login() {

    const navigate = useNavigate();

    const [rollNo, setRollNo] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {

        try {

            const response = await api.post(
                "/auth/login",
                {
                    roll_no: rollNo,
                    password
                }
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(
                    response.data.user
                )
            );

            navigate("/dashboard");

        } catch (error) {

            alert(
                error.response?.data?.error ||
                "Invalid credentials"
            );
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#0f0f1a"
            }}
        >
            <div
                style={{
                    width: "350px",
                    padding: "30px",
                    backgroundColor: "#1a1a2e",
                    borderRadius: "15px",
                    border: "1px solid #2d2d44"
                }}
            >
                <h1
                    style={{
                        color: "#fff",
                        textAlign: "center",
                        marginBottom: "25px"
                    }}
                >
                    ClassSync
                </h1>

                <input
                    type="text"
                    placeholder="Roll Number"
                    value={rollNo}
                    onChange={(e) =>
                        setRollNo(e.target.value)
                    }
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "15px",
                        borderRadius: "8px",
                        border: "1px solid #444"
                    }}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "20px",
                        borderRadius: "8px",
                        border: "1px solid #444"
                    }}
                />

                <button
                    onClick={handleLogin}
                    style={{
                        width: "100%",
                        padding: "12px",
                        border: "none",
                        borderRadius: "8px",
                        background:
                            "linear-gradient(135deg, #a78bfa, #ec4899)",
                        color: "#fff",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    Login
                </button>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: "20px",
                        color: "#cbd5e1"
                    }}
                >
                    Don't have an account?{" "}
                    <Link
                        to="/signup"
                        style={{
                            color: "#a78bfa",
                            textDecoration: "none"
                        }}
                    >
                        Signup
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;