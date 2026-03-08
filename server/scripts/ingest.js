require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const fs = require("fs");
const pdfParse = require("pdf-parse"); // Ensure pdf-parse is required this way
const { GoogleGenerativeAI } = require("@google/generative-ai");
const PromiseModel = require("../models/Promise");
const Platform = require("../models/Platform");

// Validate API key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing from .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("❌ Please provide a path to a PDF file.\nUsage: node ingest.js <path-to-pdf> [fallbackPoliticianId]");
    process.exit(1);
  }

  const fallbackPoliticianId = process.argv[3] || "Unknown Politician";

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Extract text from PDF
    console.log(`📄 Reading PDF: ${filePath}...`);
    const dataBuffer = fs.readFileSync(filePath);
    const textResult = await pdfParse(dataBuffer);
    const text = textResult.text;

    console.log("✅ Extracted text from PDF. Sending to Gemini for analysis...");

    // Send to Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a political data extractor analyzing a political document.
    
    First, determine the publishing year of this document based on the text.
    Second, determine the specific NAME of the human politician (e.g. "Justin Trudeau", "Pierre Poilievre") that this document belongs to. Do not just return the name of the political party. If no specific person's name is found, return "Unknown".
    
    Then, extract a concise list of up to 10 key political claims, promises, or policy points from the text. 
    
    IMPORTANT: You must format the response STRICTLY as a valid JSON object. Do not include any markdown formatting or backticks.
    
    Example structure:
    {
      "publishing_year": 2024,
      "politician": "Name of Politician or Party",
      "claims": [
        {
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
    - "description" MUST BE INCLUDED. Write a succinct 1-2 sentence explanation of what this claim means in plain English.
    - "status" must be one of: "Pending", "In Progress", "Fulfilled", or "Broken".
    - "progress" must be a number from 0 to 100.
    
    Text snippet (first 10000 chars):
    ${text.substring(0, 10000)}`;

    const response = await model.generateContent(prompt);
    let outputText = response.response.text();

    // Clean up potential markdown formatting in response
    outputText = outputText.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    const parsedData = JSON.parse(outputText);
    console.log("✅ Gemini Analysis Complete!");

    const { publishing_year, politician, claims } = parsedData;
    
    if (!claims || claims.length === 0) {
      console.log("⚠️ No claims extracted.");
      return;
    }

    const finalPoliticianId = politician && politician !== "Unknown" ? politician : fallbackPoliticianId;

    // Save Platform Record
    const fileName = filePath.split('/').pop();
    const platform = new Platform({
      title: fileName,
      uploader: "DataIngestionScript",
      promiseCount: claims.length,
    });
    await platform.save();

    // Map and insert promises
    const promisesToInsert = claims.map(c => ({
      original_quote: c.claim || "Unknown claim",
      text: c.claim || "Unknown claim",
      topic: c.topic || "Uncategorized",
      politicianId: finalPoliticianId,
      rationale: c.description || "",
      ai_reasoning: c.description || "",
      platformId: platform._id,
      status: c.status || "Pending",
      progress: c.progress || 0,
      completion_percentage: c.progress || 0,
      sources: ["PDF Extraction via Script"]
    }));

    await PromiseModel.insertMany(promisesToInsert);
    console.log(`✅ Successfully inserted ${promisesToInsert.length} promises for ${finalPoliticianId} into the database!`);

  } catch (error) {
    console.error("❌ Error during ingestion:", error);
  } finally {
    mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");
  }
}

main();
