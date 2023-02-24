const mongoose = require('mongoose');

const baseSchema = new mongoose.Schema({
    type: { type: String },
    content: { type: String },
    parent: { type: mongoose.Types.ObjectId }
},
    { timestamps: true },
);

module.exports = mongoose.model('Base', baseSchema)