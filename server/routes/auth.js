// auth.js
// Handles register, login, and logout
// POST /auth/register - creates a new user account
// POST /auth/login - logs in an existing user
// POST /auth/logout - logs out a user

require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../supabase");

const router = express.Router();

// helper: generate initials from a name
// example: "Kendric Washington" -> "KW"
function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// helper: format a database user row into the User shape the frontend expects
function formatUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    initials: row.initials || getInitials(row.name),
    major: row.major || "Undeclared",
    enrollment: row.enrollment || "full-time",
    goal: row.goal || "",
    weeklyHours: row.weekly_hours || 20,
    role: row.role || "STUDENT",
    avatarColor: row.avatar_color || "#5DBFD6",
  };
}

// ----------------------------------------
// POST /auth/register
// body: { email, password, name }
// response: { user, token }
// ----------------------------------------
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  // make sure all fields were sent
  if (!email || !password || !name) {
    return res.status(400).json({ error: "email, password, and name are required" });
  }

  try {
    // check if an account with this email already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return res.status(409).json({ error: "An account with that email already exists" });
    }

    // hash the password before saving - never store plain text passwords
    const password_hash = await bcrypt.hash(password, 10);
    const initials = getInitials(name);

    // insert the new user into the database
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({ email, password_hash, name, initials })
      .select()
      .single();

    if (error) throw error;

    // create a JWT token so the user is instantly logged in after registering
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // token expires in 7 days
    );

    return res.status(201).json({ user: formatUser(newUser), token });

  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// ----------------------------------------
// POST /auth/login
// body: { email, password }
// response: { user, token }
// ----------------------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    // look up the user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // compare the password they sent with the hashed version in the database
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // create a JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ user: formatUser(user), token });

  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ error: "Login failed" });
  }
});

// ----------------------------------------
// POST /auth/logout
// no body needed
// the frontend handles logout by deleting the token locally
// ----------------------------------------
router.post("/logout", (req, res) => {
  return res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;