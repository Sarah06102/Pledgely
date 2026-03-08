require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const backboardService = require("./services/backboard");

const Party = require("./models/Party");
const Politician = require("./models/Politician");
const PromiseModel = require("./models/Promise");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// GET all parties
app.get("/parties", async (req, res) => {
  try {
    const parties = await Party.find();
    res.json(parties.map(p => ({ id: p._id, name: p.name })));
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// Update a promise
app.put("/promises/:id", (req, res) => {
  res.json({ message: `Promise ${req.params.id} updated`, updatedData: req.body });
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
      original_quote: p.text
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

// POST /upload/analyze - stub for video upload + analysis
// TODO: Add multer for file upload, Cloudinary for storage, Gemini for transcript + claim extraction
app.post("/upload/analyze", (req, res) => {
  res.status(501).json({
    error: "Video upload/analyze not yet implemented. Add multer, Cloudinary, and Gemini API.",
  });
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));