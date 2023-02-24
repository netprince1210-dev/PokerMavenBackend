const mongoose = require('mongoose');

const mailSchema = new mongoose.Schema({
    from: { type: String },
    to: { type: String },
    subject: { type: String },
    message: { type: String },
    files: { type: Array, default: [] },
    type: { type: String, default: 'usual' },
    to_is_deleted: { type: Boolean, default: false },
    from_is_deleted: { type: Boolean, default: false },
    is_read: { type: Boolean, default: false },
    createdAt: { type: Date },
    updatedAt: { type: Date }
},
    { timestamps: true },
);

module.exports = mongoose.model('Mail', mailSchema)