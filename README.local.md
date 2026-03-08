# Pledgely

Pledgely is a political accountability platform that tracks, analyzes, and compares promises made by political leaders. It features an automated data ingestion pipeline powered by Backboard.io (for AI auditing) and NewsAPI (for fetching credible source evidence), presenting the results in an interactive React dashboard.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v16+ recommended)
- **MongoDB** (running locally on default port 27017, or a remote MongoDB cluster URI)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Pledgely
   ```

2. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies**
   ```bash
   cd ../client
   npm install
   ```

## Environment Variables

Create a `.env` file inside the `server/` directory (`server/.env`) and add the following keys. You will need to obtain API keys for Backboard and NewsAPI:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/pledgely
BACKBOARD_API_KEY=your_backboard_api_key_here
NEWS_API_KEY=your_news_api_key_here
```

## Database Seeding

To immediately populate the database with politicians, parties, and AI-audited promises backed by real news articles, you need to run the seeding scripts in the `server` directory.

1. **Seed Parties and Politicians:**
   ```bash
   cd server
   node seedDocuments.js
   ```

2. **Run the AI Ingestion Pipeline:**
   This script will scrape official platforms, extract promises using Backboard, grade them, and use NewsAPI to find citing articles. 
   *(Note: This process may take a minute or two to complete as it interacts with multiple external AI APIs).*
   ```bash
   node seedFromWeb.js
   ```

## Running the Application

You will need to run the backend server and the frontend client simultaneously in two separate terminal windows.

**Terminal 1 (Backend Server):**
```bash
cd server
node server.js
```
*The server will start on `http://localhost:3000` (or whichever port is defined).*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm start
```
*The React application will automatically open in your browser at `http://localhost:3001` (or next available port).*

## Features
- **Automated Promise Extraction:** Automatically reads manifestos and breaks them down into specific promises.
- **AI Rationale & Grading:** Uses an LLM to determine if a promise is fulfilled, broken, or in progress, along with a rationale.
- **Live Specific Sourcing:** Avoids broken "dead" links by dynamically hitting the NewsAPI to grab the single most relevant active news article proving the pledge status.
- **Head-to-Head Comparison:** Uses live MongoDB data to score politicians side-by-side on specific issues.
