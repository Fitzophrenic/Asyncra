// courses.js
// Handles fetching and deleting courses
// GET /courses - get all courses for the logged in user
// GET /courses/:id - get a single course by id
// DELETE /courses/:id - delete a course by id

require("dotenv").config();
const express = require("express");
const supabase = require("../supabase");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// protect all course routes - must be logged in
router.use(authMiddleware);

// helper: format a course row + its deadlines into the Course shape
function formatCourse(row, deadlines = []) {
  return {
    id: row.id,
    title: row.title,
    code: row.code,
    term: row.term || "",
    credits: row.credits || 0,
    weeklyHours: [row.weekly_hours_min || 0, row.weekly_hours_max || 0],
    workload: row.workload || "medium",
    gradeWeights: row.grade_weights || {
      exams: 0,
      projects: 0,
      homework: 0,
      participation: 0,
    },
    hourBreakdown: row.hour_breakdown || {
      lectures: 0,
      lab: 0,
      reading: 0,
      assignments: 0,
    },
    skills: row.skills || [],
    deadlines: deadlines.map((d) => ({
      id: d.id,
      courseId: row.id,
      courseTag: d.course_tag || row.code,
      title: d.title,
      type: d.type,
      dueDate: d.due_date,
      daysLeft: d.days_left || 0,
    })),
    aiSummary: row.ai_summary || "",
  };
}

// ----------------------------------------
// GET /courses
// response: Course[]
// ----------------------------------------
router.get("/", async (req, res) => {
  try {
    // fetch all courses for this user including their deadlines
    const { data: courses, error } = await supabase
      .from("courses")
      .select("*, deadlines(*)")
      .eq("user_id", req.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // format each course into the shape the frontend expects
    const formatted = (courses || []).map((c) =>
      formatCourse(c, c.deadlines || [])
    );

    return res.json(formatted);

  } catch (err) {
    console.error("List courses error:", err.message);
    return res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// ----------------------------------------
// GET /courses/:id
// response: Course
// ----------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const { data: course, error } = await supabase
      .from("courses")
      .select("*, deadlines(*)")
      .eq("id", req.params.id)
      .eq("user_id", req.userId) // make sure this course belongs to this user
      .single();

    if (error || !course) {
      return res.status(404).json({ error: "Course not found" });
    }

    return res.json(formatCourse(course, course.deadlines || []));

  } catch (err) {
    console.error("Get course error:", err.message);
    return res.status(500).json({ error: "Failed to fetch course" });
  }
});

// ----------------------------------------
// DELETE /courses/:id
// ----------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    // first verify this course belongs to this user
    // you don't want someone deleting another user's course
    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("id", req.params.id)
      .eq("user_id", req.userId)
      .single();

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // delete the course - deadlines get deleted automatically
    // because of the ON DELETE CASCADE we set up in the database schema
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    // 204 means success with no content to return
    return res.status(204).send();

  } catch (err) {
    console.error("Delete course error:", err.message);
    return res.status(500).json({ error: "Failed to delete course" });
  }
});

module.exports = router;