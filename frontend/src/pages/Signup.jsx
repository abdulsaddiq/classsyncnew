import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../services/api";

function Signup() {
const navigate = useNavigate();

const [name, setName] =
    useState("");

const [rollNo, setRollNo] =
    useState("");

const [password, setPassword] =
    useState("");

const [loading, setLoading] =
    useState(false);

const [error, setError] =
    useState("");

const handleSignup = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
        setError(
            "Please enter your name"
        );
        return;
    }

    if (!rollNo.trim()) {
        setError(
            "Please enter your roll number"
        );
        return;
    }

    if (!password.trim()) {
        setError(
            "Please enter a password"
        );
        return;
    }

    if (password.length < 4) {
        setError(
            "Password must be at least 4 characters"
        );
        return;
    }

    setLoading(true);
    setError("");

    try {
        await api.post(
            "/auth/signup",
            {
                name,
                roll_no: rollNo,
                password
            }
        );

        alert(
            "Account created successfully!"
        );

        navigate("/");
    } catch (error) {
        setError(
            error.response?.data?.error ||
            "Signup failed"
        );
    } finally {
        setLoading(false);
    }
};

return (
    <div
        style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent:
                "center",
            alignItems:
                "center",
            backgroundColor:
                "#0f0f1a"
        }}
    >
        <div
            style={{
                width: "350px",
                padding: "30px",
                backgroundColor:
                    "#1a1a2e",
                borderRadius:
                    "15px",
                border:
                    "1px solid #2d2d44"
            }}
        >
            <h1
                style={{
                    color: "#fff",
                    textAlign:
                        "center",
                    marginBottom:
                        "25px"
                }}
            >
                ClassSync
            </h1>

            <form
                onSubmit={
                    handleSignup
                }
            >
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) =>
                        setName(
                            e.target.value
                        )
                    }
                    style={{
                        width: "100%",
                        padding:
                            "12px",
                        marginBottom:
                            "15px",
                        borderRadius:
                            "8px",
                        border:
                            "1px solid #444"
                    }}
                />

                <input
                    type="text"
                    placeholder="Roll Number"
                    value={rollNo}
                    onChange={(e) =>
                        setRollNo(
                            e.target.value.toUpperCase()
                        )
                    }
                    style={{
                        width: "100%",
                        padding:
                            "12px",
                        marginBottom:
                            "15px",
                        borderRadius:
                            "8px",
                        border:
                            "1px solid #444"
                    }}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(
                            e.target.value
                        )
                    }
                    style={{
                        width: "100%",
                        padding:
                            "12px",
                        marginBottom:
                            "15px",
                        borderRadius:
                            "8px",
                        border:
                            "1px solid #444"
                    }}
                />

                {error && (
                    <p
                        style={{
                            color:
                                "#ef4444",
                            marginBottom:
                                "15px",
                            textAlign:
                                "center"
                        }}
                    >
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={
                        loading
                    }
                    style={{
                        width:
                            "100%",
                        padding:
                            "12px",
                        border:
                            "none",
                        borderRadius:
                            "8px",
                        background:
                            "linear-gradient(135deg, #a78bfa, #ec4899)",
                        color:
                            "#fff",
                        fontWeight:
                            "bold",
                        cursor:
                            loading
                                ? "not-allowed"
                                : "pointer",
                        opacity:
                            loading
                                ? 0.7
                                : 1
                    }}
                >
                    {loading
                        ? "Creating Account..."
                        : "Signup"}
                </button>
            </form>

            <p
                style={{
                    textAlign:
                        "center",
                    marginTop:
                        "20px",
                    color:
                        "#cbd5e1"
                }}
            >
                Already have an
                account?{" "}
                <Link
                    to="/"
                    style={{
                        color:
                            "#a78bfa",
                        textDecoration:
                            "none"
                    }}
                >
                    Login
                </Link>
            </p>
        </div>
    </div>
);

}

export default Signup;
