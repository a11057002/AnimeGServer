const mongoose = require("mongoose");

const Visit = mongoose.model(
    "Visit",
    new mongoose.Schema({
        title: String,
        count: Number
    })
);


module.exports = Visit;