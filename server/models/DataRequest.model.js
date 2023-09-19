const mongoose = require("../configs/database.config");

const dataRequestSchema = new mongoose.Schema({
    status: String,
    title: String,
    description: String,
    schema: String,
    instructions: String,
    assetAddress: [
        {
            type: String,
        },
    ],
});

module.exports = mongoose.model("DataRequest", dataRequestSchema);
