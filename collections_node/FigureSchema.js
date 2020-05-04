const mongoose = require("mongoose");

const Figure = mongoose.Schema({
    name: String,
    emojiID: String
});

module.exports = mongoose.model("Figure", Figure);