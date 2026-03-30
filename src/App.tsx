import { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./components/HomePage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { ProductListPage } from "./components/ProductListPage";
import { ProductDetailPage } from "./components/ProductDetailPage";
import { PostItemPage } from "./components/PostItemPage";
import { UserProfilePage } from "./components/UserProfilePage";
import { ChatPage } from "./components/ChatPage";
import { EditProfilePage } from "./components/EditProfilePage";
import { TransactionHistoryPage } from "./components/TransactionHistoryPage";
import { AICameraPage } from "./components/AICameraPage";
import { AIProcessingPage } from "./components/AIProcessingPage";
import { AIConfirmationPage } from "./components/AIConfirmationPage";
import { Toaster } from "./components/ui/sonner";
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { EditProductPage } from "./components/EditProductPage";
import { SellerProfilePage } from "./components/SellerProfilePage";
import { CartPage } from "./components/CartPage";
import { CheckoutPage } from "./components/CheckoutPage";

// --- 解決衝突：保留你新增的訂單詳情，也保留組員新增的賣家儀表板與 AI 工具 ---
import { OrderDetailPage } from "./components/OrderDetailPage"; 
import { SellerDashboardPage } from "./components/SellerDashboardPage";
import { generateHighConversionDescription } from "./utils/aiHelpers";
import { toast } from "sonner";

// --- 解決衝突：PageType 裡面同時加入 'order-detail' 與 'dashboard' ---
type PageType = 'home' | 'login' | 'register' | 'products' | 'product-detail' | 'post' | 'profile' | 'chat' | 'edit-profile' | 'transactions' | 'ai-camera' | 'ai-processing' | 'ai-confirmation' | 'forgot-password' | 'edit-product' | 'seller-profile' | 'cart' | 'checkout' | 'order-detail' | 'dashboard';

const aiProductData = [
  {
    image: "https://images.unsplash.com/photo-1649956736509-f359d191bbcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwbXVzaWN8ZW58MXx8fHwxNzYyODE5NzI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "無線頭戴式耳機",
    category: "electronics",
    condition: "like-new",
    description: "高級無線耳機，具有主動降噪功能。配備藍牙 5.0 連接、30 小時電池續航力，以及舒適的頭戴式設計搭配記憶海綿耳罩。附原廠收納盒和充電線。",
    price: "2850",
  },
  {
    image: "https://images.unsplash.com/photo-1656944227480-98180d2a5155?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmVha2VycyUyMHNob2VzfGVufDF8fHx8MTc2Mjg2NjY0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "經典白色球鞋",
    category: "fashion",
    condition: "excellent",
    description: "時尚的白色皮革球鞋，狀況極佳。幾乎無使用痕跡，清潔保養良好。舒適的日常鞋款，配有軟墊鞋底。適合休閒穿著。尺寸 US 9.5。",
    price: "1950",
  },
  {
    image: "https://images.unsplash.com/photo-1627803589917-65023f4a0e70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWNrcGFjayUyMGFjY2Vzc29yaWVzfGVufDF8fHx8MTc2Mjc2NjU3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "戶外旅行背包",
    category: "fashion",
    condition: "good",
    description: "耐用的旅行背包，配有多個隔層。具備加厚筆電夾層、水瓶袋和可調節背帶。非常適合登山、旅行或日常通勤。防潑水材質。",
    price: "1350",
  },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [aiGeneratedData, setAiGeneratedData] = useState<any>(null);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<PageType>('home');
  const [searchKeyword, setSearchKeyword] = useState("");
  // 🌟 新增：用來記住使用者真實上傳的相片網址
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  // 🌟 新增：專門用來記住進入刊登頁面的「真正起點」
  const [postOrigin, setPostOrigin] = useState<PageType>('home');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    const checkLoginStatus = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.email) {
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error("解析使用者資料失敗", error);
        }
      }
    };
    checkLoginStatus();
  }, []);

  const handleNavigate = (page: string, productId?: string, searchQuery?: string) => {
    // 🌟 新增邏輯：如果準備要去刊登頁 (post)，而且「不是」從 AI 相關頁面退回來的，就記住現在的頁面當起點！
    if (page === 'post' && !['ai-camera', 'ai-processing', 'ai-confirmation'].includes(currentPage)) {
      setPostOrigin(currentPage);
    }

    setPreviousPage(currentPage);
    setCurrentPage(page as PageType);

    if (productId) {
      setCurrentProductId(productId);
    }

    if (searchQuery !== undefined) {
      setSearchKeyword(searchQuery);
    } else if (page !== 'products') {
      setSearchKeyword("");
    }

    // 跳轉頁面時自動捲動回最上方
    window.scrollTo(0, 0);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('user');
  };

  // 🌟 修改：接收真實圖片並存起來
  const handleAICapture = (imageUrl?: string) => {
    setCapturedImage(imageUrl || null);
    setCurrentPage('ai-processing');
  };

  const handleAIProcessingComplete = () => {
    // 防呆：如果根本沒上傳圖片，什麼事都不做 (模擬快門按鈕在沒有串 Gemini 時，先不執行)
    if (!capturedImage) {
      toast.error("此功能目前需搭配『上傳真實圖片』才能運作喔！");
      setCurrentPage('post'); // 跳回刊登頁
      return;
    }

    // --- 👇 以下是真正的 Gemini 整合邏輯 👇 ---

    // 🌟 第一步：呼叫後端 API，傳送圖片 Base64
    fetch('http://localhost:3001/api/ai-analyze-image', { // 🌟 記得改成你們後端的 URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageBase64: capturedImage }) // capturedImage 現在是 Base64 字串
    })
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          const aiData = result.data; // 這是 Gemini 回傳的真實辨識結果 JSON

          // 🌟 第二步：使用我們寫好的全域大腦（aiHelpers）「重新算一遍」更強大的文案 (可選)
          // 或是直接使用 Gemini 回傳的描述：
          // const finalDescription = generateHighConversionDescription(aiData.title, aiData.condition);
          const finalDescription = aiData.description; // 直接用 Gemini 的描述，Demo 時更逼真

          // 🌟 第三步：完美整合真實資料與真實圖片
          const integratedProductData = {
            image: capturedImage, // 真實圖片 Base64
            title: aiData.title, // 真實 AI 辨識出的標題
            category: aiData.category, // 真實 AI 分類
            condition: aiData.condition, // 真實 AI 狀況判斷
            description: finalDescription, // 真實 AI 文案
            price: aiData.suggestedPrice.toString(), // 真實 AI 建議價格
          };

          setAiGeneratedData(integratedProductData);
          setCurrentPage('ai-confirmation'); // 跳轉到確認頁
        } else {
          // 後端回傳失敗 (例如 Gemini 雞婆加了別的字)
          toast.error("AI 辨識遇到一點小問題，請手動上傳或再試一次。");
          setCurrentPage('post');
        }
      })
      .catch(err => {
        // 伺服器掛掉或網路錯誤
        console.error("AI 辨識錯誤:", err);
        toast.error("AI 辨識服務暫時無法連線，請檢查網路或稍後再試。");
        setCurrentPage('post');
      });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 🌟 隱藏導覽列的條件加入 currentPage !== 'order-detail' */}
      {currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'edit-profile' && currentPage !== 'edit-product' && currentPage !== 'ai-camera' && currentPage !== 'ai-processing' && currentPage !== 'ai-confirmation' && currentPage !== 'seller-profile' && currentPage !== 'checkout' && currentPage !== 'order-detail' && (
        <Navigation
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
        />
      )}

      {currentPage === 'home' && (
        <HomePage onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />
      )}

      {currentPage === 'login' && (
        <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
      )}

      {currentPage === 'register' && (
        <RegisterPage onNavigate={handleNavigate} onLogin={handleLogin} />
      )}

      {currentPage === 'products' && (
        <ProductListPage
          onNavigate={handleNavigate}
          initialSearch={searchKeyword}
        />
      )}

      {currentPage === 'product-detail' && currentProductId && (
        <ProductDetailPage
          onNavigate={handleNavigate}
          productId={currentProductId}
          previousPage={previousPage}
        />
      )}

      {currentPage === 'seller-profile' && currentProductId && (
        <SellerProfilePage
          onNavigate={handleNavigate}
          sellerEmail={currentProductId}
        />
      )}

      {currentPage === 'cart' && (
        <CartPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'post' && (
        <PostItemPage
          onNavigate={handleNavigate}
          aiGeneratedData={aiGeneratedData}
          previousPage={postOrigin} // 🌟 這裡改成傳入我們記住的「真正起點」
        />
      )}

      {currentPage === 'checkout' && (
        <CheckoutPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'profile' && (
        <UserProfilePage onNavigate={handleNavigate} onLogout={handleLogout} />
      )}

      {currentPage === 'edit-profile' && (
        <EditProfilePage onNavigate={handleNavigate} />
      )}

      {currentPage === 'edit-product' && currentProductId && (
        <EditProductPage onNavigate={handleNavigate} productId={currentProductId} />
      )}

      {currentPage === 'chat' && (
        <ChatPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'transactions' && (
        <TransactionHistoryPage onNavigate={handleNavigate} />
      )}

      {/* 🌟 新增訂單詳情頁面的渲染邏輯 */}
      {currentPage === 'order-detail' && (
        <OrderDetailPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'ai-camera' && (
        <AICameraPage onNavigate={handleNavigate} onCapture={handleAICapture} />
      )}

      {currentPage === 'ai-processing' && (
        <AIProcessingPage onComplete={handleAIProcessingComplete} />
      )}

      {currentPage === 'ai-confirmation' && aiGeneratedData && (
        <AIConfirmationPage
          onNavigate={handleNavigate}
          productData={aiGeneratedData}
          onSkip={() => {
            // 🌟 1. 清空這包惱人的 AI 資料，只保留相片 (如果你連相片都不要，就把 {} 變成 null)
            setAiGeneratedData({ image: aiGeneratedData.image }); 
            // 🌟 2. 跳轉回刊登頁
            handleNavigate('post');
          }}
        />
      )}
      
      {currentPage === 'forgot-password' && (
        <ForgotPasswordPage onNavigate={(page) => setCurrentPage(page as any)} />
      )}

      {/* 🌟 你的組員新增的：賣家儀表板頁面 */}
      {currentPage === 'dashboard' && (
        <SellerDashboardPage onNavigate={handleNavigate} />
      )}

      <Toaster />
    </div>
  );
}