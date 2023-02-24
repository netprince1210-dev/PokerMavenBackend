const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    from: { type: String },
    to: { type: String },
    content: { type: String, default: '' },
    image: { type: Array },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    type: { type: String },
    like: { type: Array }
},
    { timestamps: true },
);

module.exports = mongoose.model('Post', postSchema)