const admin = require('firebase-admin');
const oldKey = require('./old-key.json');
const newKey = require('./new-key.json');

// 初始化舊資料庫
const oldApp = admin.initializeApp({ credential: admin.credential.cert(oldKey) }, 'oldApp');
const oldDb = oldApp.firestore();

// 初始化新資料庫
const newApp = admin.initializeApp({ credential: admin.credential.cert(newKey) }, 'newApp');
const newDb = newApp.firestore();

// 你截圖中的 6 個集合
const collectionsToMigrate = ['cart', 'favorites', 'messages', 'orders', 'products', 'users'];

async function migrateData() {
    for (const collectionName of collectionsToMigrate) {
        console.log(`正在搬移集合：${collectionName}...`);
        const snapshot = await oldDb.collection(collectionName).get();

        let count = 0;
        for (const doc of snapshot.docs) {
            // 將每一筆資料原封不動（包含原本的 ID）寫入新資料庫
            await newDb.collection(collectionName).doc(doc.id).set(doc.data());
            count++;
        }
        console.log(`${collectionName} 搬移完成！共 ${count} 筆資料。`);
    }
    console.log('🎉 所有資料搬移成功！');
    process.exit(0);
}

migrateData();