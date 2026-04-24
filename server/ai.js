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
  "aiSummary": string,
  "description": string,
  "meetingTimes": [{ "day": "Monday"|"Tuesday"|"Wednesday"|"Thursday"|"Friday"|"Saturday"|"Sunday", "type": "lecture"|"lab"|"section"|"office-hours"|"other", "start": "HH:MM", "end": "HH:MM", "location": string }],
  "gradingScale": [{ "letter": string, "minPercent": number }],
  "instructor": { "name": string, "email": string, "office": string, "phone": string, "officeHours": string },
  "textbook": { "title": string, "author": string, "edition": string, "isbn": string, "required": boolean },
  "prerequisites": string
}

STRICT RULES:
1. Return ONLY the JSON object. No markdown fences, no commentary.
2. workload: "light" (<8 hrs/wk), "medium" (8-14), "heavy" (15+).
3. deadlines.type must be exactly one of: "project", "exam", "assignment", "lab". Default "assignment" if unclear.
4. dueDate must be YYYY-MM-DD. Infer year from term if only day/month given. Omit ambiguous dates rather than guess.
5. gradeWeights values must sum to exactly 100. Fold unlisted categories into closest match (quizzes→homework, final→exams).
6. weeklyHours: [min, max], min ≤ max.
7. skills: specific tools/languages/frameworks only, 3-10 items. No generic terms.
8. aiSummary: 2-3 sentences of STUDENT-FACING ADVICE about how to succeed in this course. Focus on workload rhythm (where the heavy weeks are), study strategy (e.g. "front-load readings", "start problem sets early"), and things to watch out for. Do NOT restate the course description — if you only have a generic description to work from, comment on the pacing implied by the deadline/exam schedule instead. Write in the second person ("you'll want to...", "expect..."). Example: "Expect heavy reading weeks between chapter quizzes, with FEMA course bursts in January and March. Front-load the readings or you'll cram before quizzes. The final is cumulative, so revisit each chapter's notes in dead week."
9. description: 2-5 sentence factual summary of what the course is about, pulled directly from the syllabus's own "about" / "overview" / "course description" section. Do not invent content. Return empty string if the syllabus has no such section.
10. meetingTimes: weekly recurring class meetings. Expand ranges like "MW 3:00-4:50 PM" into one object per day. Times in 24h "HH:MM" format (e.g. "15:00" for 3 PM). Include office hours and labs when listed. If the course is online with no set meeting time, return [] — do NOT invent times. If multiple sections are listed, pick the first section's times only.
11. gradingScale: letter grade cutoffs with inclusive lower-bound percentages. E.g. "A+" at 97, "A" at 93, "A-" at 90. Include every letter tier the syllabus defines. Return [] if only a simple A=90+/B=80+ etc. is implied without being stated.
12. instructor: name is required. All other fields are optional — use empty string "" when absent. Do NOT include TA information here (instructor is the primary instructor only).
13. textbook: the primary required textbook. If multiple are listed, pick the one explicitly marked "required" or the main one. If none listed, return { "title": "", "author": "", "edition": "", "isbn": "", "required": false }. Set required=true unless the syllabus explicitly says "optional" or "recommended".
14. prerequisites: the prerequisite courses/conditions, quoted or paraphrased from the syllabus (e.g. "CSC 3102 Advanced Data Structures" or "Math 2114 with grade of C or better"). Empty string if none listed.
15. Never hallucinate. Defaults: credits=3, term="", skills=[], description="", meetingTimes=[], gradingScale=[], instructor={ "name": "", "email": "", "office": "", "phone": "", "officeHours": "" }, textbook={ "title": "", "author": "", "edition": "", "isbn": "", "required": false }, prerequisites="".`;

const VALID_WORKLOADS = ["light", "medium", "heavy"];
const VALID_DEADLINE_TYPES = ["project", "exam", "assignment", "lab"];
const VALID_WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const VALID_MEETING_TYPES = ["lecture", "lab", "section", "office-hours", "other"];
const HHMM_RE = /^\d{2}:\d{2}$/;

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
    // fall back to credit-based estimate if groq returned [0,0]
    if (max === 0) {
      min = 3 * out.credits;
      max = 4 * out.credits;
    }
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
  // distribute weekly hours across categories if groq returned all zeros
  const hbTotal =
    out.hourBreakdown.lectures +
    out.hourBreakdown.lab +
    out.hourBreakdown.reading +
    out.hourBreakdown.assignments;
  if (hbTotal === 0) {
    const target = out.weeklyHours[1] || 3 * out.credits;
    // split: 30% lecture, 0% lab, 30% reading, 30% assignments
    out.hourBreakdown = {
      lectures: Math.max(1, Math.round(target * 0.3)),
      lab: 0,
      reading: Math.max(1, Math.round(target * 0.3)),
      assignments: Math.max(1, Math.round(target * 0.3)),
    };
  }

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

  out.description = typeof out.description === "string" ? out.description.trim() : "";

  out.meetingTimes = Array.isArray(out.meetingTimes)
    ? out.meetingTimes
        .filter((m) =>
          m &&
          VALID_WEEKDAYS.includes(m.day) &&
          HHMM_RE.test(m.start) &&
          HHMM_RE.test(m.end) &&
          m.start < m.end
        )
        .map((m) => ({
          day: m.day,
          type: VALID_MEETING_TYPES.includes(m.type) ? m.type : "lecture",
          start: m.start,
          end: m.end,
          location: typeof m.location === "string" ? m.location.trim() : "",
        }))
    : [];

  out.gradingScale = Array.isArray(out.gradingScale)
    ? out.gradingScale
        .filter((g) => g && typeof g.letter === "string" && Number.isFinite(Number(g.minPercent)))
        .map((g) => ({
          letter: g.letter.trim(),
          minPercent: Math.max(0, Math.min(100, Math.round(Number(g.minPercent)))),
        }))
        .sort((a, b) => b.minPercent - a.minPercent)
    : [];

  const instr = out.instructor && typeof out.instructor === "object" ? out.instructor : {};
  out.instructor = {
    name: typeof instr.name === "string" ? instr.name.trim() : "",
    email: typeof instr.email === "string" ? instr.email.trim() : "",
    office: typeof instr.office === "string" ? instr.office.trim() : "",
    phone: typeof instr.phone === "string" ? instr.phone.trim() : "",
    officeHours: typeof instr.officeHours === "string" ? instr.officeHours.trim() : "",
  };

  const tb = out.textbook && typeof out.textbook === "object" ? out.textbook : {};
  out.textbook = {
    title: typeof tb.title === "string" ? tb.title.trim() : "",
    author: typeof tb.author === "string" ? tb.author.trim() : "",
    edition: typeof tb.edition === "string" ? tb.edition.trim() : "",
    isbn: typeof tb.isbn === "string" ? tb.isbn.trim() : "",
    required: typeof tb.required === "boolean" ? tb.required : Boolean(tb.title),
  };

  out.prerequisites = typeof out.prerequisites === "string" ? out.prerequisites.trim() : "";

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