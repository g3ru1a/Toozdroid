const mongoose = require("mongoose");

const Rule = mongoose.Schema({
    roleID: String,
    figureCount: String
});

module.exports = mongoose.model("Rule", Rule);
