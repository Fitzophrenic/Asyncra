// other.js
// Handles dashboard, notifications, and program comparisons
// GET /dashboard - returns all data needed for the home screen
// GET /notifications - returns all notifications for the logged in user
// DELETE /notifications/:id - dismisses a notification
// GET /comparisons?q=search - returns program comparison data

require("dotenv").config();
const express = require("express");
const supabase = require("../supabase");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// protect all routes - must be logged in
router.use(authMiddleware);

// ----------------------------------------
// GET /dashboard
// response: DashboardData
// ----------------------------------------
router.get("/dashboard", async (req, res) => {
  try {
    // fetch the logged in user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // fetch all courses with their deadlines in one query
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("*, deadlines(*)")
      .eq("user_id", req.userId)
      .order("created_at", { ascending: false });

    if (coursesError) throw coursesError;

    // fetch upcoming deadlines in the next 14 days
    const today = new Date().toISOString().split("T")[0];
    const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const { data: upcomingDeadlines } = await supabase
      .from("deadlines")
      .select("*, courses!inner(user_id)")
      .eq("courses.user_id", req.userId)
      .gte("due_date", today)
      .lte("due_date", twoWeeks)
      .order("due_date", { ascending: true })
      .limit(5);

    // calculate total credits across all courses
    const totalCredits = (courses || []).reduce(
      (sum, c) => sum + (c.credits || 0), 0
    );

    // calculate total weekly hours range across all courses
    const weeklyMin = (courses || []).reduce(
      (sum, c) => sum + (c.weekly_hours_min || 0), 0
    );
    const weeklyMax = (courses || []).reduce(
      (sum, c) => sum + (c.weekly_hours_max || 0), 0
    );

    // generate alerts for heavy workload courses
    const alerts = [];
    const heavyCourses = (courses || []).filter((c) => c.workload === "heavy");
    if (heavyCourses.length > 0) {
      alerts.push({
        severity: "warning",
        title: "Heavy week detected",
        subtitle: `${heavyCourses.map((c) => c.code).join(", ")} — plan ahead`,
      });
    }

    // format courses into the shape the frontend expects
    const formattedCourses = (courses || []).map((c) => ({
      id: c.id,
      title: c.title,
      code: c.code,
      term: c.term || "",
      credits: c.credits || 0,
      weeklyHours: [c.weekly_hours_min || 0, c.weekly_hours_max || 0],
      workload: c.workload || "medium",
      gradeWeights: c.grade_weights || {},
      hourBreakdown: c.hour_breakdown || {},
      skills: c.skills || [],
      deadlines: (c.deadlines || []).map((d) => ({
        id: d.id,
        courseId: c.id,
        courseTag: d.course_tag || c.code,
        title: d.title,
        type: d.type,
        dueDate: d.due_date,
        daysLeft: d.days_left || 0,
      })),
      aiSummary: c.ai_summary || "",
    }));

    // format upcoming deadlines
    const formattedDeadlines = (upcomingDeadlines || []).map((d) => ({
      id: d.id,
      courseId: d.course_id,
      courseTag: d.course_tag || "",
      title: d.title,
      type: d.type,
      dueDate: d.due_date,
      daysLeft: d.days_left || 0,
    }));

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        initials: user.initials || "",
        major: user.major || "Undeclared",
        enrollment: user.enrollment || "full-time",
        goal: user.goal || "",
        weeklyHours: user.weekly_hours || 20,
        role: user.role || "STUDENT",
        avatarColor: user.avatar_color || "#5DBFD6",
      },
      totalCredits,
      weeklyHours: [weeklyMin, weeklyMax],
      alerts,
      courses: formattedCourses,
      upcomingDeadlines: formattedDeadlines,
    });

  } catch (err) {
    console.error("Dashboard error:", err.message);
    return res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

// ----------------------------------------
// GET /notifications
// response: Notification[]
// ----------------------------------------
router.get("/notifications", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", req.userId)
      .order("days_left", { ascending: true });

    if (error) throw error;

    const formatted = (data || []).map((n) => ({
      id: n.id,
      courseTag: n.course_tag || "",
      title: n.title,
      date: n.date || "",
      daysLeft: n.days_left || 0,
      severity: n.severity || "info",
    }));

    return res.json(formatted);

  } catch (err) {
    console.error("Notifications error:", err.message);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// ----------------------------------------
// DELETE /notifications/:id
// dismisses a notification
// ----------------------------------------
router.delete("/notifications/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.userId);

    if (error) throw error;

    return res.status(204).send();

  } catch (err) {
    console.error("Delete notification error:", err.message);
    return res.status(500).json({ error: "Failed to delete notification" });
  }
});

// ----------------------------------------
// GET /comparisons?q=searchterm
// response: ProgramComparison[]
// ----------------------------------------
router.get("/comparisons", async (req, res) => {
  try {
    let query = supabase.from("comparisons").select("*");

    // if a search term was provided filter by institution or degree name
    if (req.query.q) {
      query = query.or(
        `institution.ilike.%${req.query.q}%,degree.ilike.%${req.query.q}%`
      );
    }

    const { data, error } = await query.limit(20);

    if (error) throw error;

    const formatted = (data || []).map((c) => ({
      id: c.id,
      institution: c.institution,
      degree: c.degree || "",
      graduationRate: c.graduation_rate || 0,
      avgStartingSalary: c.avg_starting_salary || 0,
      careerReadiness: c.career_readiness || 0,
      workloadIntensity: c.workload_intensity || 0,
      strengths: c.strengths || [],
      weaknesses: c.weaknesses || [],
    }));

    return res.json(formatted);

  } catch (err) {
    console.error("Comparisons error:", err.message);
    return res.status(500).json({ error: "Failed to fetch comparisons" });
  }
});

module.exports = router;