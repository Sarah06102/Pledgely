require("dotenv").config();
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI);

async function seed() {
  try {
    await client.connect();
    // Use the default DB from the connection string or fallback to "test"
    const db = client.db();

    // Disabling intentional database wipes to protect the AI-audited, live data.
    // await db.collection("parties").deleteMany({});
    // await db.collection("politicians").deleteMany({});
    // await db.collection("promises").deleteMany({});

    await db.collection("parties").insertMany([
      { _id: "liberal", name: "Liberal Party", country: "Canada" },
      { _id: "conservative", name: "Conservative Party", country: "Canada" },
      { _id: "ndp", name: "New Democratic Party", country: "Canada" },
      { _id: "green", name: "Green Party", country: "Canada" },
      { _id: "bloc", name: "Bloc Québécois", country: "Canada" },
    ]);

    await db.collection("politicians").insertMany([
      { _id: "carney", name: "Mark Carney", partyId: "liberal", position: "Prime Minister" },
      { _id: "poilievre", name: "Pierre Poilievre", partyId: "conservative", position: "Opposition Leader" },
      { _id: "singh", name: "Jagmeet Singh", partyId: "ndp", position: "NDP Leader" },
      { _id: "may", name: "Elizabeth May", partyId: "green", position: "Green Party Leader" },
      { _id: "blanchet", name: "Yves-François Blanchet", partyId: "bloc", position: "Bloc Québécois Leader" },
    ]);

    await db.collection("promises").insertMany([
      // Liberal
      { text: "Build 1.4 million new homes by 2031", politicianId: "carney", status: "Pending", progress: 0, topic: "Housing", createdAt: new Date() },
      { text: "Achieve net-zero emissions by 2050", politicianId: "carney", status: "Pending", progress: 0, topic: "Climate", createdAt: new Date() },
      { text: "Expand immigration pathways for skilled workers", politicianId: "carney", status: "Pending", progress: 0, topic: "Immigration", createdAt: new Date() },
      { text: "Invest $10 billion in public education", politicianId: "carney", status: "Pending", progress: 0, topic: "Education", createdAt: new Date() },

      // Conservative
      { text: "Axe the carbon tax", politicianId: "poilievre", status: "Pending", progress: 0, topic: "Climate", createdAt: new Date() },
      { text: "Cut income taxes by 10%", politicianId: "poilievre", status: "Pending", progress: 0, topic: "Economy", createdAt: new Date() },
      { text: "Reduce immigration levels", politicianId: "poilievre", status: "Pending", progress: 0, topic: "Immigration", createdAt: new Date() },
      { text: "Cut federal funding to DEI programs in universities", politicianId: "poilievre", status: "Pending", progress: 0, topic: "Education", createdAt: new Date() },

      // NDP
      { text: "Expand dental care for all Canadians", politicianId: "singh", status: "Pending", progress: 0, topic: "Healthcare", createdAt: new Date() },
      { text: "Build 500,000 affordable homes", politicianId: "singh", status: "Pending", progress: 0, topic: "Housing", createdAt: new Date() },
      { text: "Free post-secondary tuition", politicianId: "singh", status: "Pending", progress: 0, topic: "Education", createdAt: new Date() },
      { text: "Reunite refugee families faster", politicianId: "singh", status: "Pending", progress: 0, topic: "Immigration", createdAt: new Date() },

      // Green
      { text: "100% renewable energy by 2030", politicianId: "may", status: "Pending", progress: 0, topic: "Climate", createdAt: new Date() },
      { text: "Ban single-use plastics nationally", politicianId: "may", status: "Pending", progress: 0, topic: "Climate", createdAt: new Date() },
      { text: "Universal basic income pilot", politicianId: "may", status: "Pending", progress: 0, topic: "Economy", createdAt: new Date() },
      { text: "Free tuition at public universities", politicianId: "may", status: "Pending", progress: 0, topic: "Education", createdAt: new Date() },

      // Bloc
      { text: "Increase Quebec's share of federal transfers", politicianId: "blanchet", status: "Pending", progress: 0, topic: "Economy", createdAt: new Date() },
      { text: "Protect French language in federal workplaces", politicianId: "blanchet", status: "Pending", progress: 0, topic: "Education", createdAt: new Date() },
      { text: "Quebec control over immigration selection", politicianId: "blanchet", status: "Pending", progress: 0, topic: "Immigration", createdAt: new Date() },
      { text: "Strengthen Bill 101 protections federally", politicianId: "blanchet", status: "Pending", progress: 0, topic: "Education", createdAt: new Date() },
    ]);

    console.log("Seed data inserted successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seed();