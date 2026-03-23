// server/index.js
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const serviceAccount = require('./firebase-key.json'); // 引入你的金鑰

const app = express();
app.use(cors());
app.use(express.json());

// 🌟 1. 初始化 Firebase 連線
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
console.log('✅ 成功連線到 Firebase Firestore 資料庫！');

let otpStore = {};

// 🌟 2. 寄送驗證碼 (Mocking 保持不變)
app.post('/api/send-otp', (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;
    console.log(`\n🚨 [測試模式] 驗證碼: ${otp} (目標: ${email})\n`);
    res.status(200).json({ success: true, message: '驗證碼已發送' });
});

// 🌟 3. 比對驗證碼
app.post('/api/verify-otp', (req, res) => {
    const { email, code } = req.body;
    if (otpStore[email] === code) {
        delete otpStore[email];
        res.status(200).json({ success: true, message: '驗證成功！' });
    } else {
        res.status(400).json({ success: false, message: '驗證碼錯誤' });
    }
});

// 🌟 4. 修改：註冊並寫入 Firebase
app.post('/api/register', async (req, res) => {
    try {
        const { fullname, phone, email, password, avatarUrl } = req.body;

        // A. 檢查信箱是否重複
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();
        if (doc.exists) {
            return res.status(400).json({ success: false, message: '這個信箱已經註冊過囉！' });
        }

        // B. 密碼加密
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // C. 存入 Firestore
        await userRef.set({
            fullname,
            phone,
            email,
            password: hashedPassword,
            avatarUrl,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`🎉 Firebase 註冊成功: ${email}`);
        res.status(201).json({ success: true, message: '註冊成功！' });

    } catch (error) {
        console.error('❌ Firebase 寫入錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 伺服器運行在 http://localhost:${PORT}`));