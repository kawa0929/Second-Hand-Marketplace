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
            role: 'user',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`🎉 Firebase 註冊成功: ${email}`);
        res.status(201).json({ success: true, message: '註冊成功！' });

    } catch (error) {
        console.error('❌ Firebase 寫入錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});

// 🌟 5. 登入 API
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // A. 去 Firebase 找這個信箱 (Document)
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        // 如果資料庫裡沒有這個信箱
        if (!doc.exists) {
            return res.status(400).json({ success: false, message: '找不到這個帳號，請先註冊喔！' });
        }

        // B. 拿資料庫裡的資料出來，準備比對密碼
        const userData = doc.data();

        // bcrypt.compare 會自動把前端傳來的明文密碼，跟資料庫裡的亂碼比對
        const isMatch = await bcrypt.compare(password, userData.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: '密碼錯誤！' });
        }

        // C. 密碼正確！登入成功，把使用者的重要資訊 (不含密碼) 傳回給前端
        console.log(`🎉 登入成功: ${email} (身分: ${userData.role})`);

        res.status(200).json({
            success: true,
            message: '登入成功！',
            user: {
                email: userData.email,
                fullname: userData.fullname,
                role: userData.role, // 把身分傳給前端，前端才能知道他是 admin 還是 user
                avatarUrl: userData.avatarUrl,
                address: userData.address, // 順便把這兩個也帶上，確保換電腦登入也能拿到最新資料
                bio: userData.bio,
                // 🌟 最關鍵的修改：把 Firebase 的 Timestamp 轉成標準的字串傳給前端
                createdAt: userData.createdAt ? userData.createdAt.toDate().toISOString() : new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ 登入發生錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});
// 🌟 6. 重設密碼 API
app.post('/api/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        // 檢查有沒有這個人
        if (!doc.exists) {
            return res.status(400).json({ success: false, message: '找不到此信箱，請確認是否輸入正確。' });
        }

        // 把新密碼加密
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 更新 Firebase 裡面的密碼欄位 (使用 update 而不是 set，才不會蓋掉他的姓名電話)
        await userRef.update({
            password: hashedPassword
        });

        console.log(`🔑 密碼重設成功: ${email}`);
        res.status(200).json({ success: true, message: '密碼重設成功' });

    } catch (error) {
        console.error('❌ 重設密碼錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});
// 🌟 7. 更新個人資料 API
app.post('/api/update-profile', async (req, res) => {
    try {
        const { email, fullname, address, bio, avatarUrl } = req.body;

        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: '找不到此用戶' });
        }

        // 更新除了密碼和 role 以外的資料
        await userRef.update({
            fullname,
            address: address || "",
            bio: bio || "",
            avatarUrl: avatarUrl || ""
        });

        console.log(`📝 資料更新成功: ${email}`);
        res.status(200).json({ success: true, message: '更新成功' });

    } catch (error) {
        console.error('❌ 更新資料錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});
// 🌟 8. 刊登商品 API (只需處理文字與圖片網址)
app.post('/api/post-item', async (req, res) => {
    try {
        const { title, description, category, condition, price, location, images, sellerEmail } = req.body;

        const newProduct = {
            title,
            description,
            category,
            condition,
            price: Number(price),
            location,
            sellerEmail,
            images, // 這是前端傳來的 ImgBB 網址陣列
            status: '上架中',
            views: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // 直接寫入 Firestore
        const docRef = await db.collection('products').add(newProduct);
        console.log(`📦 新商品刊登成功: ${title}`);

        res.status(201).json({ success: true, message: '刊登成功', productId: docRef.id });

    } catch (error) {
        console.error('❌ 刊登商品錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});
// 🌟 9. 撈取特定使用者的所有商品
app.get('/api/user-products/:email', async (req, res) => {
    try {
        const userEmail = req.params.email;

        // 去 products 集合裡面，找 sellerEmail 等於這個信箱的所有商品
        const snapshot = await db.collection('products').where('sellerEmail', '==', userEmail).get();

        const products = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            products.push({
                id: doc.id,
                title: data.title,
                price: `NT$${data.price.toLocaleString()}`, // 幫價格加上 NT$ 跟千位號
                image: data.images[0] || "", // 取第一張當封面圖
                status: data.status,
                views: data.views || 0,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
            });
        });

        res.status(200).json({ success: true, products });

    } catch (error) {
        console.error('❌ 撈取商品錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});
// 🌟 10. 獲取單一商品資訊 (包含賣家詳細資訊、刊登數量與正確日期格式)
app.get('/api/product/:id', async (req, res) => {
    try {
        const doc = await db.collection('products').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: '找不到商品' });
        }

        const productData = doc.data();

        // 處理日期
        let formattedDate = null;
        if (productData.createdAt) {
            formattedDate = productData.createdAt.toDate().toISOString();
        }

        // 🌟 賣家資訊預設值 (未來有了評價系統，可以從這裡讀取真實的好評率)
        let sellerInfo = {
            fullname: productData.sellerEmail ? productData.sellerEmail.split('@')[0] : "未知賣家",
            avatarUrl: "",
            totalProducts: 0,
            ratingRate: 100, // 預設 100%
            reviewCount: 0   // 預設 0 則評價
        };

        if (productData.sellerEmail) {
            // 1. 去 users 集合找大頭貼跟名字
            const userSnapshot = await db.collection('users').where('email', '==', productData.sellerEmail).get();
            if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                sellerInfo.fullname = userData.fullname || sellerInfo.fullname;
                sellerInfo.avatarUrl = userData.avatarUrl || "";
            }

            // 🌟 2. 去 products 集合「數」這個賣家總共刊登了幾件商品！
            const productsSnapshot = await db.collection('products').where('sellerEmail', '==', productData.sellerEmail).get();
            sellerInfo.totalProducts = productsSnapshot.size; // .size 就是資料筆數
        }

        res.status(200).json({
            success: true,
            product: {
                id: doc.id,
                ...productData,
                createdAt: formattedDate,
                sellerInfo
            }
        });
    } catch (error) {
        console.error('❌ 獲取商品錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});
// 🌟 11. 更新商品資訊 (編輯後存檔用)
app.put('/api/product/:id', async (req, res) => {
    try {
        const { title, description, category, condition, price, images } = req.body;

        const updateData = {
            title,
            description,
            category,
            condition,
            price: Number(price), // 確保是數字
            images,
            updatedAt: admin.firestore.FieldValue.serverTimestamp() // 紀錄更新時間
        };

        await db.collection('products').doc(req.params.id).update(updateData);
        console.log(`📦 商品更新成功: ${title} (ID: ${req.params.id})`);

        res.status(200).json({ success: true, message: '更新成功' });
    } catch (error) {
        console.error('❌ 更新商品錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});
// 🌟 12. 獲取使用者賣場統計資訊 (給個人資料頁使用)
app.get('/api/user-stats/:email', async (req, res) => {
    try {
        const email = req.params.email;

        // 1. 數商品總數
        const productsSnapshot = await db.collection('products').where('sellerEmail', '==', email).get();
        const totalProducts = productsSnapshot.size;

        // 2. 這裡可以預留未來計算好評率的邏輯
        const stats = {
            totalProducts,
            soldCount: 0,      // 未來實作訂單系統後可連動
            ratingRate: 100,   // 預設 100%
            reviewCount: 0     // 預設 0
        };

        res.status(200).json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});
app.get('/api/products', async (req, res) => {
    try {
        const { search } = req.query; // 🌟 接收 query 字串
        const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();

        let products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : null
        }));

        // 🌟 邏輯：如果前端有傳 search，就過濾標題或描述包含關鍵字的商品
        if (search) {
            const keyword = search.toLowerCase();
            products = products.filter(p =>
                p.title?.toLowerCase().includes(keyword) ||
                p.description?.toLowerCase().includes(keyword)
            );
        }

        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 伺服器運行在 http://localhost:${PORT}`));