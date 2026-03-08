const mongoose = require("mongoose");

const PartySchema = new mongoose.Schema({
    _id: String,
    name: String,
    country: String
});

module.exports = mongoose.model("Party", PartySchema);
