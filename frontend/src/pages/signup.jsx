import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Signup() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {

    e.preventDefault();

    try {

      await api.post("/auth/signup", {
        name,
        roll_no: rollNo,
        password
      });

      alert("Account created successfully");

      navigate("/");

    } catch (error) {

      alert(
        error.response?.data?.error ||
        "Signup failed"
      );
    }
  };

  return (
    <div className="login-container">

      <h1>ClassSync Signup</h1>

      <form onSubmit={handleSignup}>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Roll Number"
          value={rollNo}
          onChange={(e) =>
            setRollNo(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button type="submit">
          Signup
        </button>

      </form>

      <p>
        Already have an account?
        {" "}
        <Link to="/">
          Login
        </Link>
      </p>

    </div>
  );
}

export default Signup; 
