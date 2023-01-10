const mongoose = require("mongoose");

// Define a schema
const Schema = mongoose.Schema;

const Match = new Schema({
    matchid: String,
    gameDuration: Number,
    gameCreation: Number,
    queueId: Number

});

module.exports = mongoose.models.Match || mongoose.model("Match", Match);
