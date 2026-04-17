// ai.js
// This is the AI analysis function that Orange (Chase) will build out
// It receives raw text extracted from a syllabus PDF
// and returns structured JSON matching the SyllabusAnalysis type in lib/types.ts

// Orange - this is where your Groq integration goes
// Replace the placeholder below with your actual Groq API call
// The function must return an object matching this exact shape:
// {
//   title, code, term, credits, weeklyHours, workload,
//   gradeWeights, hourBreakdown, skills, deadlines, aiSummary
// }

async function analyzeSyllabus(syllabusText) {
  // TODO: Orange replaces this with the real Groq implementation
  throw new Error("AI function not yet implemented - Orange needs to build this");
}

module.exports = { analyzeSyllabus };