require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const backboardService = require("./services/backboard");
const Party = require("./models/Party");
const Politician = require("./models/Politician");
const Platform = require("./models/Platform");
const PromiseModel = require("./models/Promise");
const multer = require("multer");
const { PDFParse } = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// GET all parties
// GET all parties
app.get("/parties", async (req, res) => {
  try {
    const parties = await Party.find();
    res.json(parties.map(p => ({ id: p._id, name: p.name })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all platforms (Community Library)
app.get("/platforms", async (req, res) => {
  try {
    const platforms = await Platform.find().sort({ createdAt: -1 }).limit(10);

    // Map to frontend expected format
    const formattedPlatforms = platforms.map((p) => ({
      id: p._id,
      title: p.title,
      uploader: p.uploader,
      promiseCount: p.promiseCount,
      time: new Date(p.createdAt).toLocaleDateString() // Or a relative time formatter
    }));

    res.json(formattedPlatforms);
  } catch (err) {
    console.error("Error fetching platforms:", err);
    res.status(500).json({ error: "Failed to fetch platforms" });
  }
});

// GET politicians by party
app.get("/politicians/:partyId", async (req, res) => {
  try {
    const politicians = await Politician.find({ partyId: req.params.partyId });
    res.json(politicians.map(p => ({ id: p._id, name: p.name, partyId: p.partyId })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET promises by politician
app.get("/promises/:politicianId", async (req, res) => {
  try {
    const promises = await PromiseModel.find({ politicianId: req.params.politicianId });
    res.json(promises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/parties", (req, res) => {
  res.json([
    { id: 1, name: "Liberal Party" },
    { id: 2, name: "Conservative Party" },
    { id: 3, name: "NDP" }
  ]);
});

// GET distinct topics from all promises (for dynamic filters)
app.get("/topics", async (req, res) => {
  try {
    const topics = await PromiseModel.distinct("topic");
    const sorted = topics.filter((t) => t && String(t).trim()).sort((a, b) => a.localeCompare(b));
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all promises
app.get("/promises", async (req, res) => {
  try {
    const filter = {};
    if (req.query.politicianId) filter.politicianId = req.query.politicianId;

    const promises = await PromiseModel.find(filter).sort({ createdAt: -1 });
    // Format them for the frontend
    const formatted = promises.map(p => ({
      id: p._id,
      promise: p.original_quote || p.text,
      politician: p.politicianId,
      topic: p.topic,
      status: p.status,
      progress: p.progress || p.completion_percentage,
      rationale: p.rationale || p.ai_reasoning,
      sources: p.sources || p.evidence_links || []
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch promises" });
  }
});
// Update a promise
app.put("/promises/:id", async (req, res) => {
  try {
    const updated = await PromiseModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: `Promise ${req.params.id} updated`, updatedData: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update promise" });
  }
});

// POST /ai-audit/:politicianId
app.post("/ai-audit/:politicianId", async (req, res) => {
  try {
    const politicianId = req.params.politicianId;
    console.log(`🔄 Running audit for politician: ${politicianId}`);

    // Fetch real promises from DB
    const promises = await PromiseModel.find({ politicianId });
    if (promises.length === 0) {
      return res.status(404).json({ error: "No promises found for this politician." });
    }

    // Map schema to what verifyPromises expects (handling both 'text' and 'original_quote')
    const mappedPromises = promises.map(p => ({
      _id: p._id,
      original_quote: p.text || p.original_quote
    }));

    const results = await backboardService.verifyPromises(mappedPromises);

    // Save results back to DB
    for (const result of results) {
      const existingPromise = promises.find(p => p._id.toString() === result.promise_id.toString());

      await PromiseModel.findByIdAndUpdate(result.promise_id, {
        status: result.status,
        completion_percentage: result.completion_percentage,
        ai_reasoning: result.rationale || result.ai_reasoning,
        sources: result.sources || existingPromise.sources || [],
        last_updated: new Date()
      });
    }

    // Return the updated promises
    const updatedPromises = await PromiseModel.find({ politicianId });
    res.json({ success: true, results: updatedPromises });
  } catch (err) {
    console.error("❌ Audit error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /upload/analyze
app.post("/upload/analyze", upload.single("auditPdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDFs are allowed." });
    }

    // Prevent duplicate uploads by checking if a Platform with this title already exists
    const existingPlatform = await Platform.findOne({ title: req.file.originalname });
    if (existingPlatform) {
      return res.status(400).json({ error: "This document has already been analyzed and is in the Community Library." });
    }

    // 1. Extract text from PDF
    const parser = new PDFParse({ data: req.file.buffer });
    const textResult = await parser.getText();
    const text = textResult.text;

    // Fetch currently tracked promises to pass to Gemini for matching
    const politicianId = req.body.politicianId || "Unknown";
    const existingPromises = await PromiseModel.find({ politicianId }).select('_id text original_quote');

    // normalize for Gemini
    const mappedExistingPromises = existingPromises.map(ep => ({
      _id: ep._id,
      original_quote: ep.text || ep.original_quote
    }));

    // 2. Extract claims using Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are analyzing a political document.
    
    First, determine the publishing year of this document based on the text.
    Second, determine the specific NAME of the human politician (e.g. "Justin Trudeau", "Pierre Poilievre") that this document belongs to. Do not just return the name of the political party. If no specific person's name is found, return "Unknown".
    
    Then, extract a concise list of up to 5 key political claims, promises, or policy points from the text. 
    
    Here are the currently tracked promises for this politician:
    ${JSON.stringify(mappedExistingPromises)}
    
    CRITICAL INSTRUCTION FOR MATCHING ("matched_id"):
    - You must ONLY provide a "matched_id" if the new claim is undeniably referring to the EXACT SAME specific policy, target, or goal as the existing tracked promise.
    - If the new document is just repeating the same promise without new progress, or if it is a slightly different policy, you MUST set "matched_id" to null. 
    - A match should only occur when a document is clearly providing a STATUS UPDATE on an older, existing promise.
    
    IMPORTANT: You must format the response STRICTLY as a valid JSON object. Do not include any markdown formatting or backticks.
    
    Example structure:
    {
      "publishing_year": 2024,
      "politician": "Name of Politician or Party",
      "claims": [
        {
          "matched_id": "existing_id_here_or_null",
          "claim": "The extracted promise or claim",
          "topic": "Housing",
          "verdict": "Plausible",
          "progress": 50,
          "status": "In Progress",
          "description": "A 1-2 sentence explanation or context about this promise based on the text."
        }
      ]
    }
    
    Note for status, progress, and description: 
    - "description" MUST BE INCLUDED. Write a succinct 1-2 sentence explanation of what this claim means in plain English. This cannot be empty.
    - "status" must be one of: "Pending", "In Progress", "Fulfilled", or "Broken".
    - "progress" must be a number from 0 to 100.
    - CRITICAL PROGRESS LOGIC: Analyze the text carefully to determine progress. If a statement says "We will build it", progress is 0 and status is Pending. If the statement says "We have invested $5M into building step 1 out of 4", status is In Progress and progress should be 25. If the target is achieved, status is Fulfilled and progress is 100. DO NOT default to Pending/0% if the text implies action is already happening.
    
    Text snippet (first 5000 chars):
    ${text.substring(0, 5000)}`;

    const response = await model.generateContent(prompt);
    let outputText = response.response.text();

    // Clean up potential markdown formatting in response
    outputText = outputText.replace(/```json/gi, "").replace(/```/g, "").trim();

    let parsedData = null;
    try {
      parsedData = JSON.parse(outputText);
    } catch (parseError) {
      console.error("Failed to parse Gemini output:", outputText);
      return res.status(500).json({ error: "Failed to parse document format." });
    }

    const { publishing_year, politician, claims } = parsedData;

    // Reject if older than 4 years
    const currentYear = new Date().getFullYear();
    if (publishing_year && (currentYear - publishing_year > 4)) {
      return res.status(400).json({
        error: `This document appears to be from ${publishing_year}. Please upload something written within the last 4 years to maintain relevance.`
      });
    }

    if (!claims || !Array.isArray(claims)) {
      return res.status(500).json({ error: "Failed to extract claims." });
    }

    const finalPoliticianId = politician && politician !== "Unknown" ? politician : (politicianId !== "Unknown" ? politicianId : "Unknown Politician");

    // 3. Save new Platform to Community Library
    const platform = new Platform({
      title: req.file.originalname,
      uploader: "CitizenAudit", // In a real app, this comes from auth
      promiseCount: claims.length,
    });
    await platform.save();

    // 4. Update or Create Promises in DB based on Gemini's matching
    const formattedResults = [];
    for (const c of claims) {
      if (c.matched_id) {
        // Update existing promise progress and status
        const updated = await PromiseModel.findByIdAndUpdate(c.matched_id, {
          $set: {
            rationale: "Updated via latest file (" + req.file.originalname + "): " + c.verdict,
            ai_reasoning: "Updated via latest file (" + req.file.originalname + "): " + c.verdict,
            status: c.status || "In Progress",
            progress: c.progress || 50,
            completion_percentage: c.progress || 50
          }
        }, { new: true });

        if (updated) {
          formattedResults.push({
            id: updated._id,
            promise: updated.original_quote || updated.text,
            politicianId: updated.politicianId,
            topic: updated.topic,
            status: updated.status,
            progress: updated.progress || updated.completion_percentage,
            reasoning: updated.rationale || updated.ai_reasoning,
            isNew: false,
            sources: updated.sources || updated.evidence_links || []
          });
          continue;
        }
      }

      // Create new tracking
      const newPromise = await PromiseModel.create({
        original_quote: c.claim || "Unknown claim",
        text: c.claim || "Unknown claim",
        topic: c.topic || "Uncategorized",
        politicianId: finalPoliticianId,
        rationale: c.description || "",
        ai_reasoning: c.description || "",
        platformId: platform._id,
        status: c.status !== undefined ? c.status : "Pending",
        progress: c.progress !== undefined ? c.progress : 0,
        completion_percentage: c.progress !== undefined ? c.progress : 0,
        sources: ["PDF Extraction"]
      });

      formattedResults.push({
        id: newPromise._id,
        promise: newPromise.original_quote || newPromise.text,
        politicianId: newPromise.politicianId,
        topic: newPromise.topic,
        status: newPromise.status,
        progress: newPromise.progress,
        reasoning: newPromise.rationale,
        isNew: true,
        sources: newPromise.sources || newPromise.evidence_links || []
      });
    }

    res.json({
      success: true,
      summary: {
        fulfilled: formattedResults.filter(r => r.status === "Fulfilled").length,
        inProgress: formattedResults.filter(r => r.status === "In Progress").length,
        pending: formattedResults.filter(r => r.status === "Pending" || r.status === "New").length,
        broken: formattedResults.filter(r => r.status === "Broken").length,
      },
      results: formattedResults
    });
  } catch (err) {
    console.error("Audit Error:", err);
    res.status(500).json({ error: "Analysis failed: " + err.message });
  }
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
