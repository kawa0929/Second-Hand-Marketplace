import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 這是你專屬的 Firebase 金鑰設定
const firebaseConfig = {

  apiKey: "AIzaSyAhMlS3l_EgwmmzCfks7f-fDjqbs4bAcQ8",

  authDomain: "gen-lang-client-0600468369.firebaseapp.com",

  projectId: "gen-lang-client-0600468369",

  storageBucket: "gen-lang-client-0600468369.firebasestorage.app",

  messagingSenderId: "797175033191",

  appId: "1:797175033191:web:bed7919f5d84b9d5ced3c2"

}; 


// 初始化 Firebase 應用程式 (這行只能有一次！)
const app = initializeApp(firebaseConfig);

// 匯出資料庫 (db)，讓你的 ChatPage 可以用它來傳送跟接收訊息
export const db = getFirestore(app);