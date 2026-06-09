const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log(" MongoDB connected successfully"))
  .catch((err) => console.error(" MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!", timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});
// Temporary test route - REMOVE AFTER TESTING
app.get("/api/debug/users", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const users = await db.collection("users").find({}).toArray();
    res.json({
      count: users.length,
      users: users.map((u) => ({
        username: u.username,
        name: u.name,
        role: u.role,
      })),
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/api/test`);
});
