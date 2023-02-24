const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: {
        firstname: { type: String, required: true },
        lastname: { type: String, required: true },
        email: { type: String, required: true },
        usertype: { type: String, required: true }
    },
    content: {
        subject: { type: String },
        message: { type: String, required: true }
    }
},
    { timestamps: true },
);

module.exports = mongoose.model('Favorite', favoriteSchema)