const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true
}));
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

app.get("/api/ping", (req, res) => {
  res.json({
    message: "API is connected",
    frontend: "React + Vite",
    backend: "Express",
    database: mongoose.connection.readyState === 1
      ? "MongoDB connected"
      : (global.useFallbackDb ? "Local persistent database active (MongoDB offline)" : "MongoDB not connected")
  });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/upload", require("./routes/upload"));

// Serve Frontend in Production / when built
const frontendDistPath = fs.existsSync(path.join(__dirname, "../frontend/dist"))
  ? path.join(__dirname, "../frontend/dist")
  : path.join(__dirname, "../Frontend/dist");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

mongoose.connection.on("error", (err) => {
  console.warn("MongoDB connection event error:", err.message);
  global.useFallbackDb = true;
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Switched to persistent fallback database.");
  global.useFallbackDb = true;
});

process.on("uncaughtException", (err) => {
  console.error("Unhandled process exception caught:", err.message || err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection caught:", reason);
});

async function start() {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri) {
    try {
      console.log(`Connecting to MongoDB at: ${mongoUri}...`);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
      global.useFallbackDb = false;
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.warn("MongoDB connection failed:", error.message);
      console.warn("Falling back to local persistent JSON database (backend/data/db.json).");
      global.useFallbackDb = true;
    }
  } else {
    console.log("No MONGO_URI specified. Using local persistent JSON database (backend/data/db.json).");
    global.useFallbackDb = true;
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

start();
