// server/index.js
const express = require('express');
const { Resend } = require('resend');
const cors = require('cors');
require('dotenv').config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

// 這裡就是前端會呼叫的「發送驗證碼」接口
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;

    // 生成隨機 6 位數驗證碼
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', // 測試階段只能用這個寄件者
            to: email,                     // 接收者的信箱
            subject: '您的二手市集驗證碼',
            html: `<h1>歡迎加入！</h1><p>您的實名驗證碼是：<strong>${otp}</strong></p><p>驗證碼將於 10 分鐘後過期。</p>`
        });

        console.log('郵件已寄出:', data);
        res.status(200).json({ success: true, message: '驗證碼已寄出', otp }); // 開發階段把 otp 傳回前端方便測試
    } catch (error) {
        console.error('發信失敗:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`後端伺服器運行在 http://localhost:${PORT}`);
});