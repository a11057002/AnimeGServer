const mongoose = require("mongoose");

const Danmoku = mongoose.model(
    "Danmoku",
    new mongoose.Schema({
        content: String,
    })
);


module.exports = Danmoku;