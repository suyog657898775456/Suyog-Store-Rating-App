import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserDashboard.css";

function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [userId] = useState(1); // replace with logged-in user id
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  

  // Fetch all stores
  useEffect(() => {
    axios
      .get("http://localhost:8080/stores")
      .then((res) => {
        setStores(res.data);
        setFilteredStores(res.data); // initially all stores
      })
      .catch((err) => console.error(err));
  }, []);

  // Filter stores based on search term
  useEffect(() => {
    const filtered = stores.filter((store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStores(filtered);
  }, [searchTerm, stores]);

  const handleRating = async (storeId, storeName, rating) => {
    try {
      const res = await axios.post("http://localhost:8080/rate-store", {
        store_id: storeId,
        store_name: storeName,
        user_id: userId,
        rating,
      });
      setMessage(res.data.message);
      const updated = await axios.get("http://localhost:8080/stores");
      setStores(updated.data);
    } catch (err) {
      setMessage("Error submitting rating");
    }
  };

  return (
    <div className="dashboard-container">
      <h2>All Stores</h2>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search stores by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      <p className="message">{message}</p>

      <div className="store-grid">
        {filteredStores.map((store) => (
          <div key={store.store_id} className="store-card">
            <h3>{store.name}</h3>
            <p>
              <b>Category:</b> {store.category}
            </p>
            <p>
              <b>Address:</b> {store.address}
            </p>
            <p>
              <b>Average Rating:</b> ⭐{" "}
              {parseFloat(store.avg_rating).toFixed(1)}
            </p>
            <div className="rating-options">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  className="rating-btn"
                  onClick={() => handleRating(store.store_id, store.name, r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserDashboard;
