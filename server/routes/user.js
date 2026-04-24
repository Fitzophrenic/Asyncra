// user.js
// Handles user profile and onboarding
// GET /user/profile - get the logged in user's profile
// PUT /user/profile - update the logged in user's profile
// PUT /user/onboarding - save onboarding answers after signup

require("dotenv").config();
const express = require("express");
const supabase = require("../supabase");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// protect all user routes - you must be logged in to access these
router.use(authMiddleware);

// helper: format database row into User shape the frontend expects
function formatUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    initials: row.initials || "",
    major: row.major || "Undeclared",
    enrollment: row.enrollment || "full-time",
    goal: row.goal || "",
    weeklyHours: row.weekly_hours || 20,
    role: row.role || "STUDENT",
    avatarColor: row.avatar_color || "#5DBFD6",
  };
}

// ----------------------------------------
// GET /user/profile
// response: User
// ----------------------------------------
router.get("/profile", async (req, res) => {
  try {
    // req.userId comes from the auth middleware
    // it reads the JWT token and extracts the user's id
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(formatUser(user));

  } catch (err) {
    console.error("Get profile error:", err.message);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ----------------------------------------
// PUT /user/profile
// body: partial User fields (name, major, enrollment, goal, weeklyHours)
// response: updated User
// ----------------------------------------
router.put("/profile", async (req, res) => {
  const { name, major, enrollment, goal, weeklyHours, avatarColor } = req.body;

  // only update fields that were actually sent
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (major !== undefined) updates.major = major;
  if (enrollment !== undefined) updates.enrollment = enrollment;
  if (goal !== undefined) updates.goal = goal;
  if (weeklyHours !== undefined) updates.weekly_hours = weeklyHours;
  if (avatarColor !== undefined) updates.avatar_color = avatarColor;

  // recalculate initials if name was updated
  if (name) {
    updates.initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  try {
    const { data: updated, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", req.userId)
      .select()
      .single();

    if (error) throw error;

    return res.json(formatUser(updated));

  } catch (err) {
    console.error("Update profile error:", err.message);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// ----------------------------------------
// PUT /user/onboarding
// body: { major, enrollment, goal, weeklyStudyHours }
// response: updated User
// ----------------------------------------
router.put("/onboarding", async (req, res) => {
  const { major, enrollment, goal, weeklyStudyHours } = req.body;

  if (!major || !enrollment || !goal || weeklyStudyHours === undefined) {
    return res.status(400).json({ 
      error: "major, enrollment, goal, and weeklyStudyHours are required" 
    });
  }

  try {
    const { data: updated, error } = await supabase
      .from("users")
      .update({
        major,
        enrollment,
        goal,
        weekly_hours: weeklyStudyHours,
      })
      .eq("id", req.userId)
      .select()
      .single();

    if (error) throw error;

    return res.json(formatUser(updated));

  } catch (err) {
    console.error("Onboarding error:", err.message);
    return res.status(500).json({ error: "Failed to save onboarding data" });
  }
});

module.exports = router;