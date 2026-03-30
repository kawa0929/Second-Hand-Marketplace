// src/utils/aiHelpers.ts

/**
 * ✨ AI 全域行銷大腦 ✨
 * 根據輸入的標題與狀況，生成帶有 Emoji 與專業電商排版的高轉換率銷售文案。
 * @param title 商品標題
 * @param condition 商品狀況 (like-new, excellent, good 等)
 * @returns 格式化後的行銷文案
 */
export const generateHighConversionDescription = (title: string, condition: string): string => {
    if (!title) return ""; // 防呆，沒標題就不生成

    // 建立狀況的對應中文名稱 (如果 condition 沒有提供正確的對應，給個預設值)
    let conditionText = "";
    switch (condition) {
        case 'new': conditionText = '全新未使用'; break;
        case 'like-new': conditionText = '近全新，保存良好'; break;
        case 'excellent': conditionText = '極佳，幾乎無使用痕跡'; break;
        case 'good': conditionText = '良好，有正常使用痕跡'; break;
        case 'fair': conditionText = '尚可'; break;
        default: conditionText = '狀況良好，如圖所示';
    }

    // 🌟 回傳超炫的樣板字串，確保不論哪裡呼叫，格式通通一致！
    return `【嚴選好物】${title} ✨\n\n🔹 商品狀況：${conditionText}\n\n這件商品目前狀態非常不錯，因為個人近期比較少用到，所以決定割愛售出，希望能找到下一個愛惜它的主人！\n\n💡 特色亮點：\n- 實體拍攝，狀況如圖所示，沒有過度修圖\n- 功能一切正常，無任何損壞\n- 價格誠可小議，歡迎有緣人帶走它！\n\n📦 寄送方式：支援超商取貨或面交\n💬 有任何細節想了解，都歡迎直接使用聊聊詢問喔！下單前請先確認庫存，謝謝！`;
};