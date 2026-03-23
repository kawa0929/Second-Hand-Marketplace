// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // unique 代表信箱不能重複
    password: { type: String, required: true },
    avatarUrl: { type: String }, // 存那個隨機的 Emoji 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);