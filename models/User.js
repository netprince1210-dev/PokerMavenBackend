const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    realname: {
        first: { type: String, required: true },
        last: { type: String, required: true }
    },
    username: { type: String, required: true },
    birth: { type: Date },
    email: { type: String, required: true, minlength: 6, maxlength: 200, unique: true },
    password: { type: String, minlength: 6, maxlength: 1024 },
    role: { type: Number, default: 0 },
    verify: { type: Boolean, default: false },
    address: {
        city: { type: String },
        state: { type: String }
    },
    usertype: { type: String, required: true },
    category: { type: String, required: false },
    profile: {
        about: { type: String },
        social: { type: Object },
        notification: { type: Object },
        avatar: { type: String }
    }
},
    { timestamps: true },
);

module.exports = mongoose.model('User', userSchema)