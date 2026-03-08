<!-- filepath: /Users/evaro/Desktop/coding/Pledgely/README.md -->
# 🏛️ Pledgely

> **AI-powered political promise tracker.** We hold politicians accountable — automatically.

Pledgely uses AI to scrape, analyze, and audit political promises made by Canadian party leaders. Every promise gets a status, a completion percentage, and cited sources. No spin. Just facts.

---

## 🚀 Features

- 📋 **Promise Database** — Browse promises by politician, party, topic, or status
- 🤖 **AI Auditing** — Backboard AI agent searches the web and evaluates each promise
- 📊 **Live Dashboard** — Real-time stats pulled directly from MongoDB
- 🎥 **PDF Upload** — Upload PDF's for AI claim extraction using Gemini API
- ⚖️ **Compare** — Side-by-side politician comparison

---

## 🧠 How It Works

1. Promises are seeded into MongoDB from `seed.js`
2. `seedDocuments.js` sends each promise to a **Backboard AI agent**
3. The agent searches the web, evaluates progress, and returns:
   - `status` → Pending / In Progress / Fulfilled / Broken
   - `completion_percentage` → 0–100%
   - `ai_reasoning` → 2-sentence verdict with evidence
   - `sources` → real news article URLs
4. Results are saved back to MongoDB
5. The React frontend fetches and displays everything live

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, Axios |
| Backend | Node.js, Express, Gemini API |
| Database | MongoDB, Auth0 |
| AI Agent | Backboard.io |
| Dev Tools | Git, npm, dotenv |

---

## ⚙️ Setup

### 1. Clone the repo
```bash
git clone https://github.com/Sarah06102/Pledgely.git
cd Pledgely
