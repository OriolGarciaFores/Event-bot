const mongoose = require("mongoose");

module.exports = mongoose.model("guilds", new mongoose.Schema({
    id: { type: String },
    nombre: {type: String},
    channelsId : [],
    registeredAt: { type: Number, default: Date.now() }
}));