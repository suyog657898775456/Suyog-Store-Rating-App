import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";


function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  useEffect(() => {
    axios
      .get("http://localhost:8080/dashboard-stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="admin-dashboard-container">
      <h2>Admin Dashboard</h2>

      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>

        <div className="stat-card">
          <h3>Total Store Owners</h3>
          <p>{stats.totalOwners}</p>
        </div>

        <div className="stat-card">
          <h3>Total Stores</h3>
          <p>{stats.totalStores}</p>
        </div>

        <div className="stat-card">
          <h3>Total Ratings</h3>
          <p>{stats.totalRatings}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
