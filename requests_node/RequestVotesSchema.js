const mongoose = require("mongoose");

const FigureRequestVote = mongoose.Schema({
    requestID: String,
    voterID: String
});

module.exports = mongoose.model("FigureRequestVote", FigureRequestVote);