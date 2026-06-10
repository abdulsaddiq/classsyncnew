import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
                    password: password
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
                "Invalid credentials"
            );
        }
    };

    return (
        <div>

            <h1>ClassSync Login</h1>

            <input
                placeholder="Roll Number"
                value={rollNo}
                onChange={(e) =>
                    setRollNo(e.target.value)
                }
            />

            <br />
            <br />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                    setPassword(e.target.value)
                }
            />

            <br />
            <br />

            <button
                onClick={handleLogin}
            >
                Login
            </button>

        </div>
    );
}

export default Login;