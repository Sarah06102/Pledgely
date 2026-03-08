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

Pledgely automatically tracks and audits Canadian political promises using AI. Here’s the end-to-end flow:

1. **Data Collection**  
   - `seedFromWeb.js` pulls the **official platform text** for major Canadian political leaders.  
   - This includes party platforms, policy pages, and other verified sources.  

2. **AI-Powered Promise Extraction**  
   - The platform text is sent to a **Backboard AI Assistant**.  
   - Backboard extracts **concrete, forward-looking promises** and categorizes each by topic (Housing, Economy, Healthcare, Climate, Education, Immigration).  
   - Every promise starts with a **status of Pending** and **0% completion**.  

3. **PDF Uploads & Gemini Extraction**  
   - Users can upload **PDFs of news articles, press releases, or reports**.  
   - The **Gemini AI service** parses these PDFs and extracts any political promises automatically.  
   - Extracted promises are added to MongoDB alongside their source file, ready for AI auditing.

4. **Database Storage**  
   - Extracted promises, along with their source URLs or uploaded PDFs, and politician metadata, are saved into **MongoDB**.  
   - Parties and politicians are automatically seeded if they aren’t already in the database.  

5. **AI Promise Evaluation**  
   - Backboard AI audits each promise in real-time.  
   - Each promise receives:  
     - `status`: Pending / In Progress / Fulfilled / Broken  
     - `completion_percentage`: 0–100%  
     - `ai_reasoning`: a short 2-sentence explanation with evidence  
     - `sources`: links to news articles, PDFs, or official platform pages  

6. **News Verification**  
   - To ensure credibility, Pledgely checks **NewsAPI** and **GNews** for relevant, recent articles.  
   - PDF uploads are included in the verification pipeline, ensuring only verifiable information is used.  

7. **Frontend Display**  
   - The React frontend fetches all promise data from MongoDB live.  
   - Users can browse promises by **politician, party, topic, or status**, and compare leaders side by side.
  
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

Run this commands next to get AI-audited promises and data from the web:
```
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
