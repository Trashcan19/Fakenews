// TruthLens Backend — server.js
// Final verdict = AI only. Dataset runs silently for cross-check badge only.
// Run: npm install && node server.js

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ─── CONFIG ────────────────────────────────────────────────────────────────
const GROQ_API_KEY = "use given in txt file"; // 🔑 Replace with your key
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const FAKE_CSV = path.join(__dirname, "Fake.csv");
const REAL_CSV = path.join(__dirname, "True.csv");
// ────────────────────────────────────────────────────────────────────────────

// ─── DATASET (silent cross-check only) ──────────────────────────────────────
let fakeWordFreq = {};
let realWordFreq = {};
let datasetLoaded = false;
let datasetStats = { fake: 0, real: 0 };

const STOPWORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with",
  "is","are","was","were","be","been","have","has","had","do","does","did",
  "will","would","could","should","may","might","it","its","this","that",
  "these","those","from","by","as","not","no","so","if","up","out","about",
  "into","than","then","when","where","who","which","what","how","all","said",
  "after","before","over","under","between","through","during","against",
  "says","say","also","just","more","most","some","such","other","new",
  "one","two","three","first","second","last","can","get","got","us","we",
  "they","them","their","our","your","his","her","he","she","i","my","me"
]);

function extractKeywords(text) {
  if (!text) return [];
  return [...new Set(
    text.toLowerCase().replace(/[^a-z0-9\s]/g," ").split(/\s+/)
      .filter(w => w.length > 4 && !STOPWORDS.has(w))
  )];
}

async function loadCSV(filePath, label) {
  return new Promise((resolve) => {
    if (!fs.existsSync(filePath)) { console.log(`⚠️  ${label} CSV not found`); resolve(0); return; }
    const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });
    let count = 0, firstLine = true;
    const freq = label === "FAKE" ? fakeWordFreq : realWordFreq;
    rl.on("line", line => {
      if (firstLine) { firstLine = false; return; }
      const title = line.split(",")[0].replace(/^"|"$/g,"").trim();
      extractKeywords(title).forEach(w => { freq[w] = (freq[w]||0)+1; });
      count++;
    });
    rl.on("close", () => { console.log(`✅ ${label}: ${count} articles loaded`); resolve(count); });
    rl.on("error", () => resolve(0));
  });
}

async function loadDatasets() {
  console.log("\n📂 Loading datasets...");
  datasetStats.fake = await loadCSV(FAKE_CSV, "FAKE");
  datasetStats.real = await loadCSV(REAL_CSV, "REAL");
  datasetLoaded = datasetStats.fake > 0 || datasetStats.real > 0;
  if (datasetLoaded) {
    console.log(`📊 Dataset ready — ${Object.keys(fakeWordFreq).length} fake / ${Object.keys(realWordFreq).length} real keywords\n`);
  } else {
    console.log("⚠️  Dataset not found — cross-check badge will show 'not loaded'\n");
  }
}

// Dataset runs silently — only returns a simple status for the badge
function silentDatasetCheck(text) {
  if (!datasetLoaded) return { status: "unavailable" };

  const words = extractKeywords(text);
  if (words.length === 0) return { status: "insufficient" };

  const total = datasetStats.fake + datasetStats.real;
  let significantMatches = 0;

  words.forEach(word => {
    const ff = fakeWordFreq[word] || 0;
    const rf = realWordFreq[word] || 0;
    const t = ff + rf;
    if (t < 5) return;
    const fakeRatio = ff / datasetStats.fake;
    const realRatio = rf / datasetStats.real;
    if (fakeRatio > realRatio * 2 || realRatio > fakeRatio * 2) significantMatches++;
  });

  if (significantMatches < 3) return { status: "low_match", matches: significantMatches };
  return { status: "checked", matches: significantMatches };
}

// ─── GROQ AI (sole verdict source) ──────────────────────────────────────────
function buildPrompt(type, value) {
  const base = `You are a professional fact-checker and misinformation analyst. Analyze the following content and determine if it is REAL, FAKE, or UNCERTAIN news.

Respond ONLY with a valid JSON object in this exact format — no markdown, no code blocks, raw JSON only:
{
  "verdict": "REAL" | "FAKE" | "UNCERTAIN",
  "confidence": <number 0-100>,
  "reasoning": "<2-4 sentences explaining your verdict clearly>",
  "flags": ["<red flag 1>", "<red flag 2>", ...]
}

Rules:
- "flags": short phrases describing suspicious elements e.g. "Sensationalist language", "No credible sources", "Unverified claims", "Emotional manipulation". Return [] if none.
- "confidence": your certainty level 0-100.
- Be factual, concise, and neutral in your reasoning.

`;
  switch(type) {
    case "text": return base + `Content to analyze:\n"""\n${value}\n"""`;
    case "url":  return base + `Article text extracted from URL:\n"""\n${value}\n"""`;
    case "headline": return base + `Headline only (no article body):\n"""\n${value}\n"""\nNote: lean toward UNCERTAIN since no article body is available.`;
    default: return base + `Content:\n"""\n${value}\n"""`;
  }
}

async function analyzeWithGroq(type, content) {
  const res = await axios.post(GROQ_URL, {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are a professional fact-checker. Always respond in raw JSON only. No markdown, no preamble." },
      { role: "user", content: buildPrompt(type, content) }
    ],
    temperature: 0.15,
    max_tokens: 1024,
  }, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
    timeout: 30000
  });

  const raw = res.data?.choices?.[0]?.message?.content || "";
  try {
    return JSON.parse(raw.replace(/```json|```/g,"").trim());
  } catch {
    return { verdict: "UNCERTAIN", confidence: 50, reasoning: raw || "Could not parse AI response.", flags: [] };
  }
}

// ─── ROUTE: /analyze ─────────────────────────────────────────────────────────
app.post("/analyze", async (req, res) => {
  const { type, value } = req.body;
  if (!type || !value) return res.status(400).json({ error: "Missing type or value" });

  try {
    let content = value;

    // Scrape URL if needed
    if (type === "url") {
      try {
        const { data: html } = await axios.get(value, {
          timeout: 8000,
          headers: { "User-Agent": "Mozilla/5.0 (compatible; TruthLens/1.0)" }
        });
        const $ = cheerio.load(html);
        $("script,style,nav,footer,header,aside").remove();
        const paras = [];
        $("p").each((_, el) => { const t=$(el).text().trim(); if(t.length>40) paras.push(t); });
        content = paras.slice(0,30).join("\n\n") || $("body").text().slice(0,3000);
      } catch(e) {
        return res.status(422).json({ error: "Could not fetch URL: " + e.message });
      }
    }

    // Run AI analysis (primary) and dataset check (silent) in parallel
    const [aiResult, datasetResult] = await Promise.all([
      analyzeWithGroq(type, content),
      Promise.resolve(silentDatasetCheck(content))
    ]);

    // Return AI result as-is — dataset result only used for badge display
    return res.json({ aiResult, datasetResult });

  } catch(err) {
    console.error("Error:", err?.response?.data || err.message);
    return res.status(500).json({
      error: "Analysis failed: " + (err?.response?.data?.error?.message || err.message)
    });
  }
});

app.get("/dataset-status", (req, res) => res.json({ loaded: datasetLoaded, stats: datasetStats }));
app.get("/", (req, res) => res.json({ status: "TruthLens running ✅" }));

const PORT = 3000;
loadDatasets().then(() => {
  app.listen(PORT, () => console.log(`✅ TruthLens running at http://localhost:${PORT}\n`));
});
