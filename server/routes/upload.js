// upload.js
// Handles PDF syllabus uploads and AI analysis
// POST /upload/preview - public, analyzes a PDF without saving (pre-signup teaser)
// POST /upload/syllabus - receives a PDF file, extracts text, sends to AI, saves
// POST /upload/syllabus-url - receives a URL to a PDF, extracts text, sends to AI, saves
// POST /upload/save - persists an already-analyzed SyllabusAnalysis as a course

require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { PDFParse } = require("pdf-parse");

// helper: extract text from a PDF buffer using pdf-parse v2 API
async function extractPdfText(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}
const supabase = require("../supabase");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// configure multer to store the uploaded file in memory as a buffer
// this means the file never touches your hard drive
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  fileFilter: (req, file, cb) => {
    // only allow PDF files
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// ----------------------------------------
// POST /upload/preview
// PUBLIC - no auth required. Analyzes a PDF and returns the result without saving.
// Used during onboarding before the user has an account.
// body: FormData with "file" field containing a PDF
// response: SyllabusAnalysis
// ----------------------------------------
router.post("/preview", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }

  try {
    const syllabusText = await extractPdfText(req.file.buffer);

    if (!syllabusText || syllabusText.trim().length < 50) {
      return res.status(422).json({ error: "Could not extract readable text from PDF" });
    }

    const { analyzeSyllabus } = require("../ai");
    const analysis = await analyzeSyllabus(syllabusText);

    return res.json(analysis);
  } catch (err) {
    console.error("Preview upload error:", err.message);
    return res.status(500).json({ error: err.message || "Failed to analyze syllabus" });
  }
});

// protect all routes below - must be logged in
router.use(authMiddleware);

// helper: save the AI analysis results to Supabase
// creates a course row and all its deadline rows
async function saveCourseFromAnalysis(userId, analysis) {
  // insert the course into the database
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .insert({
      user_id: userId,
      title: analysis.title,
      code: analysis.code,
      term: analysis.term,
      credits: analysis.credits,
      weekly_hours_min: analysis.weeklyHours[0],
      weekly_hours_max: analysis.weeklyHours[1],
      workload: analysis.workload,
      grade_weights: analysis.gradeWeights,
      hour_breakdown: analysis.hourBreakdown,
      skills: analysis.skills,
      ai_summary: analysis.aiSummary,
      description: analysis.description || "",
      meeting_times: analysis.meetingTimes || [],
      grading_scale: analysis.gradingScale || [],
      instructor: analysis.instructor || {},
      textbook: analysis.textbook || {},
      prerequisites: analysis.prerequisites || "",
    })
    .select()
    .single();

  if (courseError) throw courseError;

  // insert all the deadlines for this course
  if (analysis.deadlines && analysis.deadlines.length > 0) {
    const deadlineRows = analysis.deadlines.map((d) => {
      // calculate how many days until this deadline
      const due = new Date(d.dueDate);
      const today = new Date();
      const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

      return {
        course_id: course.id,
        course_tag: analysis.code,
        title: d.title,
        type: d.type,
        due_date: d.dueDate,
        days_left: daysLeft,
      };
    });

    const { error: deadlineError } = await supabase
      .from("deadlines")
      .insert(deadlineRows);

    if (deadlineError) throw deadlineError;

    // create notifications for deadlines coming up in the next 14 days
    const notifRows = deadlineRows
      .filter((d) => d.days_left >= 0 && d.days_left <= 14)
      .map((d) => ({
        user_id: userId,
        course_tag: d.course_tag,
        title: `${d.title} due`,
        date: d.due_date,
        days_left: d.days_left,
        // danger if due in 3 days, warning if 7 days, info if 14 days
        severity: d.days_left <= 3 ? "danger" : d.days_left <= 7 ? "warning" : "info",
      }));

    if (notifRows.length > 0) {
      await supabase.from("notifications").insert(notifRows);
    }
  }

  // return the analysis so the frontend can display it immediately
  return analysis;
}

// ----------------------------------------
// POST /upload/syllabus
// body: FormData with "file" field containing a PDF
// response: SyllabusAnalysis
// ----------------------------------------
router.post("/syllabus", upload.single("file"), async (req, res) => {
  // make sure a file was actually sent
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }

  try {
    const syllabusText = await extractPdfText(req.file.buffer);

    // make sure we actually got readable text
    if (!syllabusText || syllabusText.trim().length < 50) {
      return res.status(422).json({ error: "Could not extract readable text from PDF" });
    }

    // send the text to AI for analysis
    const { analyzeSyllabus } = require("../ai");
    const analysis = await analyzeSyllabus(syllabusText);

    // save the course and deadlines to Supabase
    await saveCourseFromAnalysis(req.userId, analysis);

    // send the analysis back to the frontend
    return res.json(analysis);

  } catch (err) {
    console.error("Syllabus upload error:", err.message);
    return res.status(500).json({ error: err.message || "Failed to analyze syllabus" });
  }
});

// ----------------------------------------
// POST /upload/syllabus-url
// body: { url } - a direct link to a PDF online
// response: SyllabusAnalysis
// ----------------------------------------
router.post("/syllabus-url", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "url is required" });
  }

  try {
    // fetch the PDF from the URL
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(400).json({ error: "Failed to fetch PDF from URL" });
    }

    // convert the response to a buffer so pdf-parse can read it
    const buffer = Buffer.from(await response.arrayBuffer());
    const syllabusText = await extractPdfText(buffer);

    if (!syllabusText || syllabusText.trim().length < 50) {
      return res.status(422).json({ error: "Could not extract readable text from PDF" });
    }

    // same AI call as the file upload route
    const { analyzeSyllabus } = require("../ai");
    const analysis = await analyzeSyllabus(syllabusText);

    await saveCourseFromAnalysis(req.userId, analysis);

    return res.json(analysis);

  } catch (err) {
    console.error("Syllabus URL error:", err.message);
    return res.status(500).json({ error: "Failed to analyze syllabus from URL" });
  }
});

// ----------------------------------------
// POST /upload/save
// Persists an already-analyzed SyllabusAnalysis as a course for the logged-in user.
// Used after signup when we already ran /upload/preview during onboarding.
// body: SyllabusAnalysis object
// response: SyllabusAnalysis (echoed back)
// ----------------------------------------
router.post("/save", async (req, res) => {
  const analysis = req.body;

  if (!analysis || !analysis.title || !analysis.code) {
    return res.status(400).json({ error: "Invalid SyllabusAnalysis payload" });
  }

  try {
    await saveCourseFromAnalysis(req.userId, analysis);
    return res.json(analysis);
  } catch (err) {
    console.error("Save analysis error:", err.message);
    return res.status(500).json({ error: "Failed to save course" });
  }
});

module.exports = router;