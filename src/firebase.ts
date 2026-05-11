import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 這是你專屬的 Firebase 金鑰設定
const firebaseConfig = {
  apiKey: "AIzaSyADM2X1JLfFDtusfvFRVrr3ZSgbKYdOoig",
  authDomain: "second-hand-market-fcac4.firebaseapp.com",
  projectId: "second-hand-market-fcac4",
  storageBucket: "second-hand-market-fcac4.firebasestorage.app",
  messagingSenderId: "501576910480",
  appId: "1:501576910480:web:e4885c639db87ee3e2ba15",
  measurementId: "G-MV3CJPJHN5"
};

// 初始化 Firebase 應用程式 (這行只能有一次！)
const app = initializeApp(firebaseConfig);

// 匯出資料庫 (db)，讓你的 ChatPage 可以用它來傳送跟接收訊息
export const db = getFirestore(app);