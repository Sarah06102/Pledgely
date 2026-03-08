const mongoose = require("mongoose");

const platformSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  uploader: {
    type: String,
    required: true,
  },
  promiseCount: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Platform", platformSchema);
