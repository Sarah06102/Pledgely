<!-- filepath: /Users/evaro/Desktop/coding/Pledgely/README.md -->
# 🏛️ Pledgely

> **AI-powered political promise tracker.** We hold politicians accountable — automatically.

Pledgely uses AI to scrape, analyze, and audit political promises made by Canadian party leaders. Every promise gets a status, a completion percentage, and cited sources. No spin. Just facts.

---

## 🚀 Features

- 📋 **Promise Database** — Browse promises by politician, party, topic, or status
- 🤖 **AI Auditing** — Backboard AI agent searches the web and evaluates each promise
- 📊 **Live Dashboard** — Real-time stats pulled directly from MongoDB
- 🎥 **PDF Upload** — Upload PDF news articles for AI extraction to update promise progress
- ⚖️ **Compare** — Side-by-side politician comparison

---

## 🧠 How It Works

1. Promises are seeded into MongoDB from `seed.js`
2. `seedDocuments.js` sends each promise to a **Backboard AI agent** and `seedFromWeb.js` sends data from the web
3. The agent searches the web, evaluates progress, and returns:
   - `status` → Pending / In Progress / Fulfilled / Broken
   - `completion_percentage` → 0–100%
   - `ai_reasoning` → 2-sentence verdict with evidence
   - `sources` → real news article URLs or news articles as pdf's uploaded
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

### 2. Install dependencies

Install backend dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

### 3. Create a `.env` file in server

Add the following environment variables:

```
MONGO_URI=your_mongodb_connection_string
BACKBOARD_API_KEY=your_backboard_api_key
GNEWS_API_KEY=your_gnews_api_key
NEWS_API_KEY=your_news_api_key
GEMINI_API_KEY=your_gemini_api_key
REACT_APP_AUTH0_DOMAIN=your_auth0_domain
REACT_APP_AUTH0_CLIENT_ID=your_auth0_client_id
```

### 3. Create a `.env` file in client

Add the following environment variables:

```
REACT_APP_AUTH0_DOMAIN=your_auth0_domain
REACT_APP_AUTH0_CLIENT_ID=your_auth0_client_id
```

### 4. Seed the database

Run this command initally: 
```
node seed.js
```

Run these commands next to get AI-audited promises and data from the web:
```
node seedDocuments.js
node seedFromWeb.js
```

### 5. Start the backend

```
cd server
node server.js
```

### 6. Start the frontend

```
cd client
npm start
```

The app will run locally at:

```
http://localhost:3001
```

---

## 📜 License

MIT License
