const mongoose = require("mongoose");

const OwnedFigure = mongoose.Schema({
    userID: String,
    figureID: String,
    code: String
});

module.exports = mongoose.model("OwnedFigure", OwnedFigure);