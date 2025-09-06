import React, { useState } from "react";
import axios from "axios";
import "./OwnerDashboard.css"; // ✅ import CSS file

function OwnerDashboard() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    category: "",
    owner_id: 1, // ⚡ later replace with logged-in owner's id
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/add-store", form);
      setMessage(res.data.message);
      setForm({ name: "", email: "", address: "", category: "", owner_id: 1 });
    } catch (err) {
      setMessage(err.response?.data?.error || "Error adding store");
    }
  };

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-card slide-up">
        <h2>Owner Dashboard</h2>
        <form onSubmit={handleAddStore}>
          <input
            type="text"
            name="name"
            placeholder="Store Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Store Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="address"
            placeholder="Store Address"
            value={form.address}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Category (e.g., Grocery, Electronics)"
            value={form.category}
            onChange={handleChange}
            required
          />
          <button type="submit">➕ Add Store</button>
        </form>
        <p className="message">{message}</p>
      </div>
    </div>
  );
}

export default OwnerDashboard;
