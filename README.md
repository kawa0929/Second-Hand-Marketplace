# ♻️ 物遇 WUYU | 結合 AI 技術的現代化二手商品交易平台

**「讓對的好物，遇見對的主人」**
本專案致力於延長商品使用壽命並落實永續循環。為解決傳統二手拍賣中「定價困難」、「商品描述耗時」以及「實拍防詐騙」等三大痛點，我們導入了多項 AI 技術，提供買賣雙方更安全、高效且智能的交易體驗。

## ✨ 核心功能 (Core Features)

*   🤖 **AI 智慧上架與文案生成**：上傳圖片即可自動辨識商品特徵與分類，一鍵生成具吸引力的銷售文案與 SEO 隱藏標籤，大幅節省上架時間。
*   🛡️ **多視角實拍防詐騙驗證**：強制要求賣家上傳至少兩張不同視角的照片，透過 Gemini 視覺模型自動比對物體一致性，杜絕盜圖與重複上傳。通過驗證的商品將獲得「實拍認證標章」。
*   💰 **AI 智慧估價系統**：整合 SerpApi 即時爬取 Google Shopping 市場定價，並根據商品新舊狀況自動計算，給予賣家最具競爭力的合理二手售價建議。
*   🔍 **智慧以圖搜圖與多條件搜尋**：只需上傳商品圖片，AI 即可自動辨識物品並轉換為精準關鍵字進行搜尋，精準且快速媒合買家需求。

## 🛠️ 技術堆疊 (Tech Stack)

**前端 (Frontend)**
- React / Vite / TypeScript
- Tailwind CSS / Shadcn UI / Lucide React / Framer Motion

**後端 (Backend)**
- Node.js / Express.js
- 密碼加密：Bcryptjs
- 郵件服務：Resend API (支援註冊歡迎信與訂單通知)

**資料庫與雲端 (Database & Cloud)**
- Firebase Authentication - 安全的會員身分驗證與狀態管理
- Firebase Firestore - NoSQL 資料庫與即時資料同步
- Google Cloud Storage - 靜態資源與圖片託管
- Vercel - 前端與 Serverless API 自動化部署託管

**AI 與第三方串接 (AI & APIs)**
- Google Generative AI (Gemini Flash) - 視覺辨識與自然語言生成
- Google Vision API - 圖像特徵分析與審查
- SerpApi - 跨網搜尋與爬蟲數據分析

---

## 🚀 本地端運行 (Getting Started)

請依照以下步驟在本地環境運行此專案：

### 1. 複製專案與安裝依賴套件
請在「前端根目錄」與「後端 `server` 資料夾」下分別執行安裝：

```bash
# 安裝前端套件
npm install

# 進入後端資料夾並安裝套件
cd server
npm install
