const mongoose = require("mongoose");

const PoliticianSchema = new mongoose.Schema({
    _id: String,
    name: String,
    partyId: String,
    position: String
});

module.exports = mongoose.model("Politician", PoliticianSchema);
