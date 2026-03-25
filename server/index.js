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

// 🌟 2. 寄送驗證碼
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

// 🌟 4. 註冊並寫入 Firebase
app.post('/api/register', async (req, res) => {
    try {
        const { fullname, phone, email, password, avatarUrl } = req.body;

        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();
        if (doc.exists) {
            return res.status(400).json({ success: false, message: '這個信箱已經註冊過囉！' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

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

        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(400).json({ success: false, message: '找不到這個帳號，請先註冊喔！' });
        }

        const userData = doc.data();
        const isMatch = await bcrypt.compare(password, userData.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: '密碼錯誤！' });
        }

        console.log(`🎉 登入成功: ${email} (身分: ${userData.role})`);

        res.status(200).json({
            success: true,
            message: '登入成功！',
            user: {
                email: userData.email,
                fullname: userData.fullname,
                role: userData.role,
                avatarUrl: userData.avatarUrl,
                address: userData.address,
                bio: userData.bio,
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

        if (!doc.exists) {
            return res.status(400).json({ success: false, message: '找不到此信箱，請確認是否輸入正確。' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

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

// 🌟 8. 刊登商品 API (支援多規格 variations)
app.post('/api/post-item', async (req, res) => {
    try {
        // 🌟 解構出 variations
        const { title, description, category, condition, price, stock, location, images, sellerEmail, variations } = req.body;

        const newProduct = {
            title,
            description,
            category,
            condition,
            price: Number(price),
            stock: Number(stock) || 1,
            location: location || "",
            sellerEmail,
            images,
            variations: variations || [], // 🌟 將規格陣列存入資料庫
            status: '上架中',
            views: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('products').add(newProduct);
        console.log(`📦 新商品刊登成功: ${title} (包含 ${variations?.length || 1} 種規格)`);

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
        const snapshot = await db.collection('products').where('sellerEmail', '==', userEmail).get();

        let products = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            products.push({
                id: doc.id,
                title: data.title,
                price: `NT$${data.price.toLocaleString()}`,
                image: data.images && data.images.length > 0 ? data.images[0] : "",
                status: data.status,
                stock: data.stock || 1, // 🌟 舊商品防呆：沒數量預設 1
                views: data.views || 0,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : "1970-01-01T00:00:00.000Z"
            });
        });

        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.status(200).json({ success: true, products });

    } catch (error) {
        console.error('❌ 撈取商品錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});

// 🌟 10. 獲取單一商品資訊
app.get('/api/product/:id', async (req, res) => {
    try {
        const doc = await db.collection('products').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: '找不到商品' });
        }

        const productData = doc.data();
        let formattedDate = productData.createdAt ? productData.createdAt.toDate().toISOString() : null;

        let sellerInfo = {
            fullname: productData.sellerEmail ? productData.sellerEmail.split('@')[0] : "未知賣家",
            avatarUrl: "",
            totalProducts: 0,
            ratingRate: 100,
            reviewCount: 0
        };

        if (productData.sellerEmail) {
            const userSnapshot = await db.collection('users').where('email', '==', productData.sellerEmail).get();
            if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                sellerInfo.fullname = userData.fullname || sellerInfo.fullname;
                sellerInfo.avatarUrl = userData.avatarUrl || "";
            }

            const productsSnapshot = await db.collection('products').where('sellerEmail', '==', productData.sellerEmail).get();
            sellerInfo.totalProducts = productsSnapshot.size;
        }

        res.status(200).json({
            success: true,
            product: {
                id: doc.id,
                ...productData,
                stock: productData.stock || 1, // 🌟 舊商品防呆：沒數量預設 1
                createdAt: formattedDate,
                sellerInfo
            }
        });
    } catch (error) {
        console.error('❌ 獲取商品錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});

// 🌟 11. 更新商品資訊 (編輯後存檔用，支援多規格)
app.put('/api/product/:id', async (req, res) => {
    try {
        const { title, description, category, condition, price, stock, images, variations } = req.body;

        const updateData = {
            title,
            description,
            category,
            condition,
            price: Number(price),
            stock: Number(stock) || 1,
            images,
            variations: variations || [], // 🌟 編輯時如果有改規格，存進去
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('products').doc(req.params.id).update(updateData);
        console.log(`📦 商品更新成功: ${title} (ID: ${req.params.id})`);

        res.status(200).json({ success: true, message: '更新成功' });
    } catch (error) {
        console.error('❌ 更新商品錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});

// 🌟 12. 獲取使用者賣場統計資訊
app.get('/api/user-stats/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const userRef = db.collection('users').doc(email);
        const userDoc = await userRef.get();

        let userInfo = {
            fullname: email.split('@')[0],
            avatarUrl: "",
            createdAt: null
        };

        if (userDoc.exists) {
            const data = userDoc.data();
            userInfo.fullname = data.fullname || userInfo.fullname;
            userInfo.avatarUrl = data.avatarUrl || "";
            userInfo.createdAt = data.createdAt ? data.createdAt.toDate().toISOString() : null;
        }

        const productsSnapshot = await db.collection('products').where('sellerEmail', '==', email).get();
        const totalProducts = productsSnapshot.size;

        const stats = {
            totalProducts,
            soldCount: 0,
            ratingRate: 100,
            reviewCount: 0
        };

        res.status(200).json({ success: true, stats, userInfo });
    } catch (error) {
        console.error('❌ 獲取賣家資料錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});

// 🌟 13. 首頁或搜尋獲取所有商品
app.get('/api/products', async (req, res) => {
    try {
        const { search } = req.query;
        const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();

        let products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            stock: doc.data().stock || 1, // 🌟 舊商品防呆：沒數量預設 1
            createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : null
        }));

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
// 🌟 14. 更新商品狀態 (上下架切換)
app.put('/api/product/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await db.collection('products').doc(req.params.id).update({
            status: status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`🔄 商品狀態更新: ${req.params.id} -> ${status}`);
        res.status(200).json({ success: true, message: `商品已${status}` });
    } catch (error) {
        console.error('❌ 更新狀態錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});

// 🌟 15. 刪除商品 (永久刪除)
app.delete('/api/product/:id', async (req, res) => {
    try {
        await db.collection('products').doc(req.params.id).delete();
        console.log(`🗑️ 商品永久刪除成功: (ID: ${req.params.id})`);
        res.status(200).json({ success: true, message: '商品已刪除' });
    } catch (error) {
        console.error('❌ 刪除商品錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});
// 🌟 16. 切換收藏狀態 (如果已收藏則取消，未收藏則新增)
app.post('/api/favorites/toggle', async (req, res) => {
    try {
        const { email, productId } = req.body;
        const favId = `${email}_${productId}`; // 建立唯一的收藏 ID
        const favRef = db.collection('favorites').doc(favId);
        const doc = await favRef.get();

        if (doc.exists) {
            await favRef.delete();
            res.status(200).json({ success: true, isFavorite: false, message: '已取消收藏' });
        } else {
            await favRef.set({
                userEmail: email,
                productId: productId,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            res.status(200).json({ success: true, isFavorite: true, message: '已加入收藏' });
        }
    } catch (error) {
        console.error('❌ 收藏切換錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});

// 🌟 17. 撈取使用者的所有收藏商品詳細資料
app.get('/api/favorites/:email', async (req, res) => {
    try {
        const userEmail = req.params.email;
        // 先找收藏關聯表
        const favSnapshot = await db.collection('favorites').where('userEmail', '==', userEmail).get();

        if (favSnapshot.empty) {
            return res.status(200).json({ success: true, favorites: [] });
        }

        const productIds = favSnapshot.docs.map(doc => doc.data().productId);

        // 根據商品 ID 陣列去撈取真正的商品資料
        const products = [];
        for (const id of productIds) {
            const productDoc = await db.collection('products').doc(id).get();
            if (productDoc.exists) {
                const data = productDoc.data();
                products.push({
                    id: productDoc.id,
                    ...data,
                    price: `NT$${data.price.toLocaleString()}`,
                    image: data.images?.[0] || ""
                });
            }
        }

        res.status(200).json({ success: true, favorites: products });
    } catch (error) {
        console.error('❌ 獲取收藏錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});

// 🌟 18. 檢查單一商品是否被特定使用者收藏
app.get('/api/favorites/check', async (req, res) => {
    const { email, productId } = req.query;
    if (!email || !productId) return res.json({ isFavorite: false });

    const favId = `${email}_${productId}`;
    const doc = await db.collection('favorites').doc(favId).get();
    res.json({ isFavorite: doc.exists });
});
// 🌟 19. 加入/更新購物車 (支援多規格辨識)
app.post('/api/cart/add', async (req, res) => {
    try {
        const { email, productId, quantity, variationName = "單一款式" } = req.body;

        // 🌟 核心魔法：用「信箱 + 商品ID + 款式名稱」當作購物車的獨一無二 ID
        // 這樣買家買 A 款跟 B 款，在購物車裡就會是兩筆獨立的項目！
        const cartId = `${email}_${productId}_${variationName}`;
        const cartRef = db.collection('cart').doc(cartId);
        const doc = await cartRef.get();

        if (doc.exists) {
            const currentQuantity = doc.data().quantity;
            const newQuantity = currentQuantity + quantity;
            if (newQuantity <= 0) {
                await cartRef.delete();
            } else {
                await cartRef.update({ quantity: newQuantity });
            }
        } else {
            if (quantity > 0) {
                await cartRef.set({
                    email,
                    productId,
                    variationName, // 🌟 把款式名稱存起來
                    quantity,
                    addedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }
        res.status(200).json({ success: true, message: '購物車已更新' });
    } catch (error) {
        console.error('❌ 更新購物車錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});

// 🌟 20. 撈取使用者的購物車清單 (支援抓出對應款式的價格與庫存)
app.get('/api/cart/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const cartSnapshot = await db.collection('cart').where('email', '==', email).get();

        const cartItems = [];
        for (const doc of cartSnapshot.docs) {
            const cartData = doc.data();
            const productDoc = await db.collection('products').doc(cartData.productId).get();

            if (productDoc.exists) {
                const p = productDoc.data();
                const variationName = cartData.variationName || "單一款式";

                let itemPrice = p.price;
                let itemStock = p.stock || 1;

                if (p.variations && p.variations.length > 0) {
                    const matchedVariation = p.variations.find(v => v.name === variationName);
                    if (matchedVariation) {
                        itemPrice = matchedVariation.price;
                        itemStock = matchedVariation.stock;
                    }
                }

                cartItems.push({
                    cartId: doc.id,
                    productId: productDoc.id,
                    variationName: variationName,
                    title: p.title, // 🌟 改回純淨的原始標題，不再加括號
                    price: itemPrice,
                    image: p.images?.[0] || "",
                    quantity: cartData.quantity,
                    seller: p.sellerEmail ? p.sellerEmail.split('@')[0] : "未知賣家",
                    stock: itemStock,
                    status: p.status || '上架中'
                });
            }
        }

        res.status(200).json({ success: true, cart: cartItems });
    } catch (error) {
        console.error('❌ 讀取購物車錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});

// 🌟 21. 從購物車移除商品
app.delete('/api/cart/:cartId', async (req, res) => {
    try {
        await db.collection('cart').doc(req.params.cartId).delete();
        res.status(200).json({ success: true, message: '已從購物車移除' });
    } catch (error) {
        res.status(500).json({ success: false, message: '移除失敗' });
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 伺服器運行在 http://localhost:${PORT}`));