const mongoose = require("../configs/database.config");

const fmlRequestSchema = new mongoose.Schema({
    userAddress: String,
    jobIds: [String],
});

module.exports = mongoose.model("fmlRequestSchema", fmlRequestSchema);
