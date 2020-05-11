const mongoose = require("mongoose");

const wikiEntry = mongoose.Schema({
    name: String,
    description: String,
    author: String,
    imageurl: String,
    price: String,
    color: String,
    releaseDate: String,
    status: String
});


module.exports = mongoose.model("WikiEntry", wikiEntry);
