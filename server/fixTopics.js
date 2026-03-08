require("dotenv").config();
const mongoose = require("mongoose");
const PromiseModel = require("./models/Promise");

async function fixTopics() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Fix "Environment" to "Climate"
        const envUpdate = await PromiseModel.updateMany(
            { topic: "Environment" },
            { $set: { topic: "Climate" } }
        );
        console.log(`🌍 Converted ${envUpdate.modifiedCount} 'Environment' promises to 'Climate'.`);

        // 2. Fix "Other" to "Economy" (Usually Blanchet's transfer demands get put here)
        // Or "Climate" depending on context, but let's just make them visible as requested.
        const otherUpdate = await PromiseModel.updateMany(
            { topic: "Other" },
            { $set: { topic: "Economy" } } // Defaulting Bloc's systemic demands to Economy
        );
        console.log(`Converted ${otherUpdate.modifiedCount} 'Other' promises to 'Economy'.`);

        console.log("Database successfully patched!");
        process.exit(0);
    } catch (err) {
        console.error("Error patching database:", err);
        process.exit(1);
    }
}

fixTopics();
