require("dotenv").config();
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI);

async function seed() {
  try {
    await client.connect();

    const db = client.db("promiseTracker");

    // Clear existing data (optional but useful for reseeding)
    await db.collection("parties").deleteMany({});
    await db.collection("politicians").deleteMany({});
    await db.collection("promises").deleteMany({});

    // Insert parties
    await db.collection("parties").insertMany([
      {
        _id: "liberal",
        name: "Liberal Party",
        country: "Canada"
      },
      {
        _id: "conservative",
        name: "Conservative Party",
        country: "Canada"
      },
      {
        _id: "ndp",
        name: "New Democratic Party",
        country: "Canada"
      }
    ]);

    // Insert politicians
    await db.collection("politicians").insertMany([
      {
        _id: "trudeau",
        name: "Justin Trudeau",
        partyId: "liberal",
        position: "Prime Minister"
      },
      {
        _id: "poilievre",
        name: "Pierre Poilievre",
        partyId: "conservative",
        position: "Opposition Leader"
      },
      {
        _id: "singh",
        name: "Jagmeet Singh",
        partyId: "ndp",
        position: "NDP Leader"
      }
    ]);

    // Insert promises
    await db.collection("promises").insertMany([
      {
        text: "Build 1.4M homes by 2030",
        politicianId: "trudeau",
        status: "in-progress",
        progress: 27,
        topic: "Housing",
        createdAt: new Date()
      },
      {
        text: "Cut housing taxes",
        politicianId: "poilievre",
        status: "planned",
        progress: 0,
        topic: "Housing",
        createdAt: new Date()
      },
      {
        text: "Expand dental care coverage",
        politicianId: "singh",
        status: "in-progress",
        progress: 40,
        topic: "Healthcare",
        createdAt: new Date()
      }
    ]);

    console.log("Seed data inserted successfully");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seed();