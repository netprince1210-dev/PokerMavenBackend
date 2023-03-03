const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name: { type: String, required: true },
    password: {type: String, required: true},
    email: { type: String, required: true, minlength: 6, maxlength: 200, unique: true },
    role: { type: Number, default: 0 },
    location: { type: String },
    avatar: { type: Number },
    real_name: { type: String }
},
    { timestamps: true },
);

module.exports = mongoose.model('User', userSchema)