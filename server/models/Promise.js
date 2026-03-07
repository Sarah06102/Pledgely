const mongoose = require("mongoose");

const PromiseSchema = new mongoose.Schema({
    text: String,
    politicianId: String,
    status: String,
    progress: Number,
    completion_percentage: Number,
    topic: String,
    ai_reasoning: String,
    sources: [String],
    createdAt: { type: Date, default: Date.now },
    last_updated: Date
});

module.exports = mongoose.model("Promise", PromiseSchema);
