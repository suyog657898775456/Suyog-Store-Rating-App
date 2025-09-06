import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // import CSS

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/login", form);
      setMessage(res.data.message);

      // ✅ Redirect based on role
      if (res.data.role === "user") {
        navigate("/user-dashboard");
      } else if (res.data.role === "owner") {
        navigate("/owner-dashboard");
      } else if (res.data.role === "admin") {
        navigate("/admin-dashboard");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Error logging in");
    }
  };

  return (
    <div className="login-container animate-fadeIn">
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p className="message">{message}</p>
      </div>
    </div>
  );
}

export default Login;
