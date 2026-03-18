# 🔍 TruthLens — AI Fake News Detection Platform

> **"Because truth matters more than ever."**

TruthLens is a real-time AI-powered fake news detection platform that analyzes news articles, URLs, and headlines to instantly deliver a verdict — **REAL**, **FAKE**, or **UNCERTAIN** — using Groq AI (Llama 3.3-70B) and the ISOT Fake News Dataset for dual-layer verification.

---

## 🖥️ Live Demo

> Run locally by following the setup instructions below.

---

## 📸 Screenshots

| Dashboard | Result — FAKE | Result — REAL |
|---|---|---|
| Idle state with animated orbit | Red verdict with red flags | Green verdict with confidence ring |
<img width="767" height="353" alt="image" src="https://github.com/user-attachments/assets/5699282a-f591-45f5-a9f5-1d656061cf94" />
<img width="768" height="623" alt="Screenshot 2026-03-18 212723" src="https://github.com/user-attachments/assets/c0f69354-41fe-4296-8ce5-1f10cc8c8c96" />
<img width="766" height="418" alt="Screenshot 2026-03-18 212751" src="https://github.com/user-attachments/assets/191eb369-9ba9-47b2-ac35-0d31e4359e56" />




---

## ✨ Features

- 🧠 **AI Analysis** — Llama 3.3-70B via Groq analyzes language patterns, tone, sourcing, and factual claims
- 🗄️ **Dataset Cross-Check** — 44,000+ ISOT labeled articles silently verify content in the background
- 🔗 **URL Scraping** — Auto-fetches and extracts article text from any news URL
- 📊 **Confidence Score** — 0–100% score showing how certain the AI is
- ⚑ **Red Flags** — Highlights suspicious elements like emotional language, missing sources
- 🔁 **Re-Analyze** — Re-run the same content for consistency verification
- 🔗 **Share Result** — Copy summary or download a full analysis report as .txt
- ⚑ **Flag as Wrong** — Report incorrect verdicts to help improve the model
- 💡 **What is a FACT?** — Educational popup explaining facts vs opinions and rumors
- 🛡️ **Safety First** — Guide on misinformation types and how to stay safe online
- 📈 **Live Dashboard** — Session stats, history, accuracy meter, live clock, status bar

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5 + CSS3 + Vanilla JavaScript |
| Backend | Node.js + Express.js |
| AI Model | Llama 3.3-70B via Groq API (Free) |
| Dataset | ISOT Fake News Dataset (Kaggle) |
| HTTP Client | Axios |
| Web Scraping | Cheerio |
| Fonts | Google Fonts (Bebas Neue, Outfit, JetBrains Mono) |
| Package Manager | npm |

---

## 📁 Project Structure

```
TruthLens/
│
├── index.html              ← Complete frontend (HTML + CSS + JS)
│
└── backend/
    ├── server.js           ← Node.js Express backend
    ├── package.json        ← npm dependencies
    ├── node_modules/       ← Auto-generated (do not push to GitHub)
    ├── Fake.csv            ← ISOT fake news dataset (download separately)
    └── True.csv            ← ISOT real news dataset (download separately)
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org) (v18 or above)
- npm (comes with Node.js)

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/truthlens.git
cd truthlens
```

### Step 2 — Get a Free Groq API Key

1. Go to 👉 [https://console.groq.com/keys](https://console.groq.com/keys)
2. Sign up with Google (free — no credit card needed)
3. Click **Create API Key**
4. Copy the key (starts with `gsk_...`)

### Step 3 — Download the Dataset

1. Go to 👉 [https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset)
2. Sign in to Kaggle (free)
3. Click **Download** and extract the zip file
4. Copy **Fake.csv** and **True.csv** into the `backend/` folder

### Step 4 — Configure the API Key

Open `backend/server.js` and replace line 10:

```js
const GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE";
```

with your actual key:

```js
const GROQ_API_KEY = "gsk_your_actual_key_here";
```

### Step 5 — Install Dependencies

```bash
cd backend
npm install
```

### Step 6 — Start the Backend

```bash
node server.js
```

You should see:
```
✅ TruthLens backend running at http://localhost:3000
📊 Dataset ready — XXXX fake keywords, XXXX real keywords
```

### Step 7 — Open the Frontend

Open `index.html` directly in your browser (no build step needed).

> ✅ That's it! TruthLens is now fully running.

---

## 🔌 API Reference

### POST `/analyze`

Analyzes content and returns a verdict.

**Request Body:**
```json
{
  "type": "text" | "url" | "headline",
  "value": "your content here"
}
```

**Response:**
```json
{
  "aiResult": {
    "verdict": "REAL" | "FAKE" | "UNCERTAIN",
    "confidence": 85,
    "reasoning": "Explanation of the verdict...",
    "flags": ["Sensationalist language", "No sources cited"]
  },
  "datasetResult": {
    "status": "checked" | "low_match" | "unavailable"
  }
}
```

### GET `/dataset-status`

Returns the current dataset load status.

```json
{
  "loaded": true,
  "stats": {
    "fake": 23481,
    "real": 21417
  }
}
```

---

## 📊 Dataset Information

- **Name:** ISOT Fake News Dataset
- **Source:** University of Victoria / Kaggle
- **Size:** 44,898 labeled articles
  - Fake.csv — 23,481 fake news articles
  - True.csv — 21,417 real news articles
- **Usage:** Silent background cross-check only. The AI verdict is always the final result.

> ⚠️ The dataset files are **not included** in this repository due to their size. Please download them from Kaggle using the link above.

---

## ⚠️ Important Notes

- The Groq API key must **never** be committed to GitHub. Add it to `.env` or keep it only in your local `server.js`.
- Add a `.gitignore` file to exclude `node_modules/` and any `.env` files.
- AI-generated results should not be used as the sole source of truth. Always cross-reference with trusted sources.

---

## 📄 .gitignore (Recommended)

Create a `.gitignore` file in the root folder with:

```
backend/node_modules/
backend/.env
*.csv
```

---

## 🗺️ Roadmap

- [x] AI verdict with Groq API
- [x] ISOT Dataset cross-check
- [x] URL scraping
- [x] Share, Re-analyze, Flag as Wrong buttons
- [x] Educational modals (FACT + Safety First)
- [ ] User authentication
- [ ] MongoDB database integration
- [ ] Browser extension
- [ ] WhatsApp bot
- [ ] Regional language support (Tamil, Hindi, Telugu)
- [ ] Mobile app (Android + iOS)
- [ ] Public REST API

---

## 👥 Team

| Name | Role |
|---|---|
| Member 1 | Backend & API Integration, AI & Dataset Reasearch |
| Member 2 | Frontend Development, ppt design |

---

## 📜 License

This project is built for hackathon purposes. The ISOT Dataset is subject to its own license from the University of Victoria. Groq API usage is subject to [Groq's Terms of Service](https://groq.com/terms).

---

## 🙏 Acknowledgements

- [Groq](https://groq.com) — for providing a free, blazing-fast LLM API
- [ISOT Research Lab](https://www.uvic.ca/ecs/ece/isot/datasets/fake-news/index.php) — for the labeled fake news dataset
- [Kaggle](https://www.kaggle.com) — for hosting the dataset publicly
- [Google Fonts](https://fonts.google.com) — for Bebas Neue, Outfit, JetBrains Mono

---

<div align="center">
  <strong>TruthLens v1.0</strong> · Built with ❤️ at Axiora Hackathon 2026<br/>
  <em>AI Fact Verification Platform · Groq + ISOT Dataset · Node.js + Express</em>
</div>
