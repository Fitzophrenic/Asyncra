const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a syllabus analysis assistant. You will receive the raw text of a university course syllabus and must extract structured information from it.

Your output MUST be a single valid JSON object that strictly matches this schema:

{
  "title": string,
  "code": string,
  "term": string,
  "credits": number,
  "weeklyHours": [number, number],
  "workload": "light" | "medium" | "heavy",
  "gradeWeights": { "exams": number, "projects": number, "homework": number, "participation": number },
  "hourBreakdown": { "lectures": number, "lab": number, "reading": number, "assignments": number },
  "skills": string[],
  "deadlines": [{ "title": string, "type": "project" | "exam" | "assignment" | "lab", "dueDate": "YYYY-MM-DD" }],
  "aiSummary": string
}

STRICT RULES:
1. Return ONLY the JSON object. No markdown fences, no commentary.
2. workload: "light" (<8 hrs/wk), "medium" (8-14), "heavy" (15+).
3. deadlines.type must be exactly one of: "project", "exam", "assignment", "lab". Default "assignment" if unclear.
4. dueDate must be YYYY-MM-DD. Infer year from term if only day/month given. Omit ambiguous dates rather than guess.
5. gradeWeights values must sum to exactly 100. Fold unlisted categories into closest match (quizzes→homework, final→exams).
6. weeklyHours: [min, max], min ≤ max.
7. skills: specific tools/languages/frameworks only, 3-10 items. No generic terms.
8. aiSummary: 2-3 sentences, student-facing, mention focus + weekly hours + workload character.
9. Never hallucinate. Defaults: credits=3, term="", skills=[].`;

const VALID_WORKLOADS = ["light", "medium", "heavy"];
const VALID_DEADLINE_TYPES = ["project", "exam", "assignment", "lab"];

function validateAndFix(data) {
  const out = { ...data };
  out.title = typeof out.title === "string" ? out.title.trim() : "Untitled Course";
  out.code = typeof out.code === "string" ? out.code.trim() : "";
  out.term = typeof out.term === "string" ? out.term.trim() : "";
  out.aiSummary = typeof out.aiSummary === "string" ? out.aiSummary.trim() : "";
  out.credits = Number.isFinite(out.credits) ? Math.round(out.credits) : 3;

  if (!Array.isArray(out.weeklyHours) || out.weeklyHours.length !== 2) {
    out.weeklyHours = [3 * out.credits, 4 * out.credits];
  } else {
    let [min, max] = out.weeklyHours.map((n) => Math.max(0, Math.round(Number(n) || 0)));
    if (min > max) [min, max] = [max, min];
    out.weeklyHours = [min, max];
  }

  if (!VALID_WORKLOADS.includes(out.workload)) {
    const maxHrs = out.weeklyHours[1];
    out.workload = maxHrs < 8 ? "light" : maxHrs < 15 ? "medium" : "heavy";
  }

  const gw = out.gradeWeights || {};
  const weights = {
    exams: Math.max(0, Number(gw.exams) || 0),
    projects: Math.max(0, Number(gw.projects) || 0),
    homework: Math.max(0, Number(gw.homework) || 0),
    participation: Math.max(0, Number(gw.participation) || 0),
  };
  const sum = weights.exams + weights.projects + weights.homework + weights.participation;
  if (sum === 0) {
    out.gradeWeights = { exams: 40, projects: 30, homework: 20, participation: 10 };
  } else if (sum !== 100) {
    const scale = 100 / sum;
    const scaled = {
      exams: Math.round(weights.exams * scale),
      projects: Math.round(weights.projects * scale),
      homework: Math.round(weights.homework * scale),
      participation: Math.round(weights.participation * scale),
    };
    const drift = 100 - (scaled.exams + scaled.projects + scaled.homework + scaled.participation);
    scaled.exams += drift;
    out.gradeWeights = scaled;
  } else {
    out.gradeWeights = weights;
  }

  const hb = out.hourBreakdown || {};
  out.hourBreakdown = {
    lectures: Math.max(0, Math.round(Number(hb.lectures) || 0)),
    lab: Math.max(0, Math.round(Number(hb.lab) || 0)),
    reading: Math.max(0, Math.round(Number(hb.reading) || 0)),
    assignments: Math.max(0, Math.round(Number(hb.assignments) || 0)),
  };

  out.skills = Array.isArray(out.skills)
    ? out.skills.filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim()).slice(0, 10)
    : [];

  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  out.deadlines = Array.isArray(out.deadlines)
    ? out.deadlines
        .filter((d) => d && typeof d.title === "string" && isoDate.test(d.dueDate))
        .map((d) => ({
          title: d.title.trim(),
          type: VALID_DEADLINE_TYPES.includes(d.type) ? d.type : "assignment",
          dueDate: d.dueDate,
        }))
    : [];

  return out;
}

async function analyzeSyllabus(syllabusText) {
  const text = syllabusText.length > 100000 ? syllabusText.slice(0, 100000) : syllabusText;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const raw = completion.choices[0].message.content;
      const parsed = JSON.parse(raw);
      return validateAndFix(parsed);
    } catch (err) {
      if (attempt === 1) {
        console.error("AI analysis failed after retry:", err.message);
        throw new Error("Failed to analyze syllabus — AI returned invalid output");
      }
      console.warn("AI analysis retry:", err.message);
    }
  }
}

module.exports = { analyzeSyllabus };