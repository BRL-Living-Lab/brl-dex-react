const mongoose = require("../configs/database.config");

const userSchema = new mongoose.Schema({
    userAddress: String,
});

module.exports = mongoose.model("User", userSchema);
