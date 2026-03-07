const express = require("express");
const app = express();

app.use(express.json());

// GET all parties
app.get("/parties", (req, res) => {
  res.json([
    { id: 1, name: "Liberal Party" },
    { id: 2, name: "Conservative Party" },
    { id: 3, name: "Green Party" }
  ]);
});

// GET politicians by party
app.get("/politicians/:partyId", (req, res) => {
  const partyId = req.params.partyId;

  res.json([
    { id: 1, name: "Politician A", partyId: partyId },
    { id: 2, name: "Politician B", partyId: partyId }
  ]);
});

// GET promises by politician
app.get("/promises/:politicianId", (req, res) => {
  const politicianId = req.params.politicianId;

  res.json([
    { id: 1, promise: "Lower taxes", politicianId: politicianId },
    { id: 2, promise: "Improve healthcare", politicianId: politicianId }
  ]);
});

// update a promise
app.put("/promises/:id", (req, res) => {
  const id = req.params.id;
  const data = req.body;

  res.json({
    message: `Promise ${id} updated`,
    updatedData: data
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});