const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema();

module.exports = mongoose.model("Portfolio", projectSchema);
