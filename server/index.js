// index.js
// This is the main entry point of our Express server
// Run this file with "node server/index.js" to start the server

require("dotenv").config();
const express = require("express");
const cors = require("cors");

// import your route files 
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const courseRoutes = require("./routes/courses");
const uploadRoutes = require("./routes/upload");
const otherRoutes = require("./routes/other");

// create the Express app
const app = express();
const PORT = process.env.PORT || 3001;

// middleware - runs on every request before it hits your routes
app.use(cors());                  // allows frontend app to talk to this server
app.use(express.json());          // lets server read JSON from request bodies
app.use(express.urlencoded({ extended: true })); // lets server read form data

// health check - just confirms the server is running
app.get("/", (req, res) => {
  res.json({ message: "Asyncra backend is running" });
});

// routes - each group of endpoints has its own file
app.use("/auth", authRoutes);         // /auth/register, /auth/login, /auth/logout
app.use("/user", userRoutes);         // /user/profile, /user/onboarding
app.use("/courses", courseRoutes);    // /courses, /courses/:id
app.use("/upload", uploadRoutes);     // /upload/syllabus, /upload/syllabus-url
app.use("/", otherRoutes);            // /dashboard, /notifications, /comparisons

// start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}`);
});