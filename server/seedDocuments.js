require("dotenv").config();
const { MongoClient } = require("mongodb");
const { verifyPromises } = require("./services/backboard");

async function seedDocuments() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    // Use the default DB from the connection string
    const db = client.db();

    const promises = await db.collection("promises").find().toArray();
    console.log(`Found ${promises.length} promises to audit`);

    const results = await verifyPromises(promises);

    // Write results back to MongoDB
    for (const result of results) {
        const existingPromise = promises.find(p => p._id.toString() === result.promise_id.toString());

        await db.collection("promises").updateOne(
            { _id: result.promise_id },
            {
                $set: {
                    status: result.status,
                    completion_percentage: result.completion_percentage,
                    ai_reasoning: result.ai_reasoning,
                    sources: result.sources || existingPromise.sources || [],
                    last_updated: new Date()
                }
            }
        );
        console.log(`Saved to MongoDB: ${result.promise_id}`);
    }

    await client.close();
    console.log("\nDone! All promises audited and saved.");
}

seedDocuments();