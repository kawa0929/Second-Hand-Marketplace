// server/index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // 引入我們剛剛寫的資料格式
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 🌟 1. 連線到 MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ 成功連線到 MongoDB 資料庫！'))
    .catch((err) => console.error('❌ 資料庫連線失敗：', err));

let otpStore = {};

// 🌟 2. 寄送驗證碼 (Mocking 測試模式)
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    console.log(`\n======================================`);
    console.log(`🚨 [開發測試模式] 驗證信已攔截 🚨`);
    console.log(`目標信箱: ${email}`);
    console.log(`測試驗證碼: ${otp}`);
    console.log(`======================================\n`);

    res.status(200).json({ success: true, message: '驗證碼已模擬發送 (請查看後端終端機)' });
});

// 🌟 3. 比對驗證碼
app.post('/api/verify-otp', (req, res) => {
    const { email, code } = req.body;
    if (otpStore[email] === code) {
        delete otpStore[email];
        res.status(200).json({ success: true, message: '驗證成功！' });
    } else {
        res.status(400).json({ success: false, message: '驗證碼錯誤或已過期' });
    }
});

// 🌟 4. 新增：真正把註冊資料寫進資料庫！
app.post('/api/register', async (req, res) => {
    try {
        const { fullname, phone, email, password, avatarUrl } = req.body;

        // 檢查信箱是不是已經註冊過了
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: '這個信箱已經註冊過囉！' });
        }

        // 把密碼加密 (加鹽處理，保護使用者資安)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 建立新使用者
        const newUser = new User({
            fullname,
            phone,
            email,
            password: hashedPassword,
            avatarUrl
        });

        // 存入 MongoDB！
        await newUser.save();

        console.log(`🎉 恭喜！新使用者 ${fullname} (${email}) 註冊成功並寫入資料庫！`);
        res.status(201).json({ success: true, message: '註冊成功！' });

    } catch (error) {
        console.error('❌ 註冊寫入資料庫時發生錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器發生錯誤' });
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 後端伺服器運行在 http://localhost:${PORT}`));