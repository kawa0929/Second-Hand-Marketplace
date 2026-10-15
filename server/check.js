require("dotenv").config();

async function checkModels() {
    try {
        console.log("🔍 正在向 Google 查詢您的 API Key 支援的模型清單...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.log("❌ API Key 錯誤或權限不足：", data.error.message);
            return;
        }

        // 過濾出可以用來生成內容的模型，並把 "models/" 前綴拿掉
        const models = data.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name.replace("models/", ""));

        console.log("✅ 您的 API Key 確定可以使用的模型有：");
        console.log(models.join("\n"));
    } catch (error) {
        console.error("❌ 查詢失敗：", error.message);
    }
}

checkModels();