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

// days from today to the given YYYY-MM-DD (parsed as a local date)
function computeDaysLeft(dateStr) {
  if (!dateStr) return 0;
  const s = String(dateStr).slice(0, 10);
  const parts = s.split("-");
  if (parts.length < 3) return 0;
  const due = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (Number.isNaN(due.getTime())) return 0;
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due.getTime() - midnight.getTime()) / (1000 * 60 * 60 * 24));
}

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
        subtitle: `${heavyCourses.map((c) => c.code).join(", ")} - plan ahead`,
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
        daysLeft: computeDaysLeft(d.due_date),
      })),
      aiSummary: c.ai_summary || "",
      description: c.description || "",
      meetingTimes: c.meeting_times || [],
      gradingScale: c.grading_scale || [],
      instructor: c.instructor || {},
      textbook: c.textbook || {},
      prerequisites: c.prerequisites || "",
    }));

    // format upcoming deadlines, recompute daysLeft from today
    const formattedDeadlines = (upcomingDeadlines || [])
      .map((d) => ({
        id: d.id,
        courseId: d.course_id,
        courseTag: d.course_tag || "",
        title: d.title,
        type: d.type,
        dueDate: d.due_date,
        daysLeft: computeDaysLeft(d.due_date),
      }))
      // drop anything already in the past and sort ascending by days left
      .filter((d) => d.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);

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
      // sort by date (stored days_left can go stale)
      .order("date", { ascending: true });

    if (error) throw error;

    const formatted = (data || []).map((n) => {
      const daysLeft = computeDaysLeft(n.date);
      // refresh severity from current days-left
      const severity =
        daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warning" : "info";
      return {
        id: n.id,
        courseTag: n.course_tag || "",
        title: n.title,
        date: n.date || "",
        daysLeft,
        severity,
      };
    });

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

// map majors to CIP 4-digit codes for the College Scorecard API
const CIP_CODES = {
  // computing
  "computer science": "1107,1101",
  "computer information": "1101,1110",
  "information technology": "1110",
  "data science": "1107,3005",
  "software": "1107,1409",
  // engineering
  "engineering": "1401",
  "computer engineering": "1409",
  "electrical engineering": "1410",
  "mechanical engineering": "1419",
  "civil engineering": "1408",
  "chemical engineering": "1407",
  "biomedical engineering": "1405",
  // sciences
  "biology": "2601",
  "biological sciences": "2601",
  "biochemistry": "2602",
  "chemistry": "4005",
  "physics": "4008",
  "geology": "4006",
  "environmental science": "0301",
  "mathematics": "2701",
  "math": "2701",
  "statistics": "2705",
  // health
  "nursing": "5138",
  "public health": "5122",
  "kinesiology": "3105",
  "exercise science": "3105",
  "pre-med": "2601",
  "premed": "2601",
  // business
  "business": "5202",
  "business administration": "5202",
  "finance": "5208",
  "accounting": "5203",
  "marketing": "5214",
  "management": "5202",
  "economics": "4506",
  // social sciences
  "psychology": "4201",
  "sociology": "4511",
  "political science": "4510",
  "anthropology": "4502",
  "history": "5401",
  "geography": "4507",
  // humanities
  "english": "2301",
  "philosophy": "3801",
  "religious studies": "3802",
  "foreign language": "1609",
  "linguistics": "1601",
  // arts + media
  "art": "5007",
  "fine arts": "5007",
  "music": "5009",
  "theater": "5005",
  "film": "5006",
  "graphic design": "5004",
  "communications": "0901",
  "journalism": "0904",
  "media": "0901",
  // applied
  "architecture": "0402",
  "education": "1301",
  "law": "2201",
  "pre-law": "4510",
  "criminal justice": "4301",
  "social work": "4407",
  "agriculture": "0101",
  "hospitality": "5209",
};

function majorToCip(major) {
  if (!major || typeof major !== "string") return null;
  const normalized = major.toLowerCase().trim();
  if (normalized === "undeclared" || normalized === "") return null;
  // exact match first
  if (CIP_CODES[normalized]) return CIP_CODES[normalized];
  // substring match (e.g. "Computer Science, BS" hits "computer science")
  for (const [key, code] of Object.entries(CIP_CODES)) {
    if (normalized.includes(key)) return code;
  }
  return null;
}

// cache search results for 10 min so we don't hit the api.data.gov rate limit
const comparisonsCache = new Map();
const COMPARISONS_CACHE_TTL_MS = 10 * 60 * 1000;

function cacheGet(key) {
  const hit = comparisonsCache.get(key);
  if (!hit) return null;
  if (hit.expires < Date.now()) {
    comparisonsCache.delete(key);
    return null;
  }
  return hit.data;
}
function cacheSet(key, data) {
  comparisonsCache.set(key, { data, expires: Date.now() + COMPARISONS_CACHE_TTL_MS });
}

function percentile(sortedAsc, p) {
  if (sortedAsc.length === 0) return null;
  const idx = Math.min(sortedAsc.length - 1, Math.floor(sortedAsc.length * p));
  return sortedAsc[idx];
}

router.get("/comparisons", async (req, res) => {
  try {
    const apiKey = process.env.SCORECARD_API_KEY;
    if (!apiKey) {
      console.error("SCORECARD_API_KEY missing from env");
      return res.status(500).json({ error: "College Scorecard API key not configured" });
    }

    // look up the user's major to filter by CIP code
    const { data: userRow } = await supabase
      .from("users")
      .select("major")
      .eq("id", req.userId)
      .single();
    const major = userRow?.major || "";
    const cipCode = majorToCip(major);
    const searchTerm = typeof req.query.q === "string" ? req.query.q.trim() : "";

    const cacheKey = `${cipCode || "all"}|${searchTerm.toLowerCase()}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const fields = [
      "id",
      "school.name",
      "school.city",
      "school.state",
      "school.ownership",
      "latest.admissions.admission_rate.overall",
      "latest.completion.rate_suppressed.overall",
      "latest.completion.completion_rate_4yr_150nt",
      "latest.earnings.10_yrs_after_entry.median",
      "latest.student.retention_rate.four_year.full_time",
      "latest.cost.attendance.academic_year",
    ];

    const params = new URLSearchParams({
      api_key: apiKey,
      fields: fields.join(","),
      per_page: "20",
      sort: "latest.earnings.10_yrs_after_entry.median:desc",
      "school.operating": "1",
      // skip schools with suppressed earnings data
      "latest.earnings.10_yrs_after_entry.median__range": "20000..",
    });

    if (searchTerm) {
      params.set("school.name", searchTerm);
    }
    if (cipCode) {
      params.set("latest.programs.cip_4_digit.code", cipCode);
    }

    const url = `https://api.data.gov/ed/collegescorecard/v1/schools?${params.toString()}`;
    const scoreRes = await fetch(url);
    if (!scoreRes.ok) {
      const body = await scoreRes.text().catch(() => "");
      console.error("Scorecard API error:", scoreRes.status, body.slice(0, 200));
      return res.status(502).json({ error: "Failed to reach College Scorecard" });
    }

    const json = await scoreRes.json();
    const schools = Array.isArray(json.results) ? json.results : [];

    // compute percentiles for strengths/weaknesses tagging
    const earningsAsc = schools
      .map((s) => s["latest.earnings.10_yrs_after_entry.median"])
      .filter((v) => typeof v === "number" && v > 0)
      .sort((a, b) => a - b);
    const gradAsc = schools
      .map((s) =>
        s["latest.completion.rate_suppressed.overall"] ??
        s["latest.completion.completion_rate_4yr_150nt"]
      )
      .filter((v) => typeof v === "number" && v > 0)
      .sort((a, b) => a - b);
    const earningsP75 = percentile(earningsAsc, 0.75);
    const earningsP25 = percentile(earningsAsc, 0.25);
    const gradP75 = percentile(gradAsc, 0.75);
    const gradP25 = percentile(gradAsc, 0.25);

    const degreeLabel = major && major !== "Undeclared" ? major : "General";

    const comparisons = schools.map((s, i) => {
      const schoolName = s["school.name"] || "Unknown institution";
      const city = s["school.city"];
      const state = s["school.state"];
      const ownership = s["school.ownership"]; // 1=public, 2=private nonprofit, 3=private for-profit
      const medianEarnings = s["latest.earnings.10_yrs_after_entry.median"] || 0;
      const gradRate =
        s["latest.completion.rate_suppressed.overall"] ??
        s["latest.completion.completion_rate_4yr_150nt"] ??
        0;
      const retentionRate = s["latest.student.retention_rate.four_year.full_time"] ?? 0;
      const admissionRate = s["latest.admissions.admission_rate.overall"];
      const costOfAttendance = s["latest.cost.attendance.academic_year"] || 0;

      // careerReadiness: earnings vs $60k benchmark + retention
      const earningsScore = Math.min(1, medianEarnings / 60000);
      const careerReadiness = Math.round(earningsScore * 70 + retentionRate * 30);

      // workloadIntensity: selectivity + completion rate
      const selectivity = typeof admissionRate === "number" ? 1 - admissionRate : 0.5;
      const workloadIntensity = Math.round(selectivity * 50 + gradRate * 50);

      const strengths = [];
      const weaknesses = [];

      if (earningsP75 && medianEarnings >= earningsP75) {
        strengths.push("Top-quartile graduate earnings");
      } else if (earningsP25 && medianEarnings > 0 && medianEarnings <= earningsP25) {
        weaknesses.push("Below-peer graduate earnings");
      }

      if (gradP75 && gradRate >= gradP75) {
        strengths.push("High graduation rate");
      } else if (gradP25 && gradRate > 0 && gradRate <= gradP25) {
        weaknesses.push("Low graduation rate");
      }

      if (typeof admissionRate === "number" && admissionRate > 0 && admissionRate < 0.3) {
        strengths.push("Selective admissions");
      }

      if (retentionRate >= 0.85) {
        strengths.push("Strong freshman retention");
      } else if (retentionRate > 0 && retentionRate < 0.7) {
        weaknesses.push("Weaker freshman retention");
      }

      if (ownership === 1) {
        strengths.push("Public - typically lower cost");
      } else if (ownership === 3) {
        weaknesses.push("For-profit institution");
      }

      if (costOfAttendance > 55000) {
        weaknesses.push("High annual cost of attendance");
      } else if (costOfAttendance > 0 && costOfAttendance < 20000) {
        strengths.push("Low annual cost of attendance");
      }

      // fallback so cards never render with empty lists
      if (strengths.length === 0) strengths.push("Reports outcome data");
      if (weaknesses.length === 0) weaknesses.push("No major concerns flagged");

      const locationSuffix = city && state ? ` (${city}, ${state})` : "";
      return {
        id: String(s.id ?? `cs_${i}`),
        institution: `${schoolName}${locationSuffix}`,
        degree: degreeLabel,
        graduationRate: Math.round(Math.max(0, Math.min(1, gradRate)) * 100),
        avgStartingSalary: Math.round(medianEarnings / 1000),
        careerReadiness: Math.max(0, Math.min(100, careerReadiness)),
        workloadIntensity: Math.max(0, Math.min(100, workloadIntensity)),
        strengths: strengths.slice(0, 3),
        weaknesses: weaknesses.slice(0, 3),
      };
    });

    cacheSet(cacheKey, comparisons);
    return res.json(comparisons);
  } catch (err) {
    console.error("Comparisons error:", err.message);
    return res.status(500).json({ error: "Failed to fetch comparisons" });
  }
});

module.exports = router;