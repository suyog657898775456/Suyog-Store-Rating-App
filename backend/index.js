const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs"); // safer on Windows

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// ✅ MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "ratings",
  password: "Suyog@123",
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Error connecting to DB:", err.message);
    return;
  }
  console.log("✅ Connected to MySQL!");
});

// ✅ Health Check API
app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

// ✅ SIGNUP API
app.post("/signup", async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!["user", "owner", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role selected" });
  }

  try {
    // Check duplicate username/email
    connection.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
          return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        connection.query(
          "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
          [username, email, hashedPassword, role],
          (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "✅ User registered successfully!" });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ LOGIN API
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  connection.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length === 0) {
        return res.status(400).json({ error: "User not found" });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // ✅ Send back role for redirect
      res.json({
        message: "✅ Login successful",
        role: user.role,
        username: user.username,
      });
    }
  );
});

// ADD STORE API (Owner only)
app.post("/add-store", (req, res) => {
  const { name, email, address, category, owner_id } = req.body;

  if (!name || !email || !address || !category || !owner_id) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    INSERT INTO stores (name, email, address, category, owner_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(
    query,
    [name, email, address, category, owner_id],
    (err, result) => {
      if (err) {
        console.error("Error inserting store:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Store added successfully!" });
    }
  );
});

// Example: Get all stores with average rating
app.get("/stores", (req, res) => {
  const query = `
    SELECT s.id AS store_id, s.name, s.address, s.category,
           IFNULL(AVG(r.rating), 0) AS avg_rating
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    GROUP BY s.id
  `;

  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Example: Rate a store
app.post("/rate-store", (req, res) => {
  const { store_id, store_name, user_id, rating } = req.body;

  const query = `
    INSERT INTO ratings (store_id, store_name, user_id, rating)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE rating = ?
  `;

  connection.query(
    query,
    [store_id, store_name, user_id, rating, rating],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Rating submitted successfully!" });
    }
  );
});

// GET /dashboard-stats
// GET /dashboard-stats
app.get("/dashboard-stats", (req, res) => {
  const queryUsers =
    "SELECT COUNT(*) AS total_users FROM users WHERE role='user'";
  const queryOwners =
    "SELECT COUNT(*) AS total_owners FROM users WHERE role='owner'";
  const queryStores = "SELECT COUNT(*) AS total_stores FROM stores";
  const queryRatings = "SELECT COUNT(*) AS total_ratings FROM ratings";

  connection.query(queryUsers, (err, usersResult) => {
    if (err) return res.status(500).json({ error: err.message });

    connection.query(queryOwners, (err, ownersResult) => {
      if (err) return res.status(500).json({ error: err.message });

      connection.query(queryStores, (err, storesResult) => {
        if (err) return res.status(500).json({ error: err.message });

        connection.query(queryRatings, (err, ratingsResult) => {
          if (err) return res.status(500).json({ error: err.message });

          res.json({
            totalUsers: usersResult[0].total_users,
            totalOwners: ownersResult[0].total_owners,
            totalStores: storesResult[0].total_stores,
            totalRatings: ratingsResult[0].total_ratings,
          });
        });
      });
    });
  });
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
