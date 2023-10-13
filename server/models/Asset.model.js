const mongoose = require("../configs/database.config");

const assetSchema = new mongoose.Schema({
    assetAddress: String,
    userAddress: String,
});

module.exports = mongoose.model("Asset", assetSchema);
