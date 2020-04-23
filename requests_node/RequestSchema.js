const mongoose = require("mongoose");

const FigureRequest = mongoose.Schema({
    name: String,
    createdby: String,
    votes: {type: Number, default: 1}
});

module.exports = mongoose.model("FigureRequest", FigureRequest);