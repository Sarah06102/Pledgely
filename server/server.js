require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const backboardService = require("./services/backboard");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// GET all parties
app.get("/parties", (req, res) => {
  res.json([
    { id: 1, name: "Liberal Party" },
    { id: 2, name: "Conservative Party" },
    { id: 3, name: "NDP" }
  ]);
});

// GET politicians by party
app.get("/politicians/:partyId", (req, res) => {
  res.json([
    { id: 1, name: "Justin Trudeau", partyId: req.params.partyId },
    { id: 2, name: "Mark Carney", partyId: req.params.partyId }
  ]);
});

// GET promises by politician
app.get("/promises/:politicianId", (req, res) => {
  res.json([
    { id: 1, promise: "Build 10,000 affordable homes", status: "Pending" },
    { id: 2, promise: "Cut income taxes by 10%", status: "Pending" }
  ]);
});

// Update a promise
app.put("/promises/:id", (req, res) => {
  res.json({ message: `Promise ${req.params.id} updated`, updatedData: req.body });
});

// POST /ai-audit/:politicianId
app.post("/ai-audit/:politicianId", async (req, res) => {
  try {
    console.log(`🔄 Running audit for politician: ${req.params.politicianId}`);
    const promises = [
      { _id: "1", original_quote: "Build 10,000 affordable homes by 2025" },
      { _id: "2", original_quote: "Cut income taxes by 10% in first year" }
    ];
    const results = await backboardService.verifyPromises(promises);
    res.json({ success: true, results });
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