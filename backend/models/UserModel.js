var mongoose = require('mongoose');

// createdAt and updatedAt respond to loginFirst and loginLatest
var UserSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        username: { type: String, required: true, index: true, unique: true },
        role: { type: String, required: true },
        title: { type: String, required: true },
        groups: { type: Array, required: true },
 isLabMember: { type: Boolean, default: false },
        isPM: { type: Boolean, default: false },
        isUser: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);