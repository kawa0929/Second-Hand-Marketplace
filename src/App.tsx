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
import { OrderDetailPage } from "./components/OrderDetailPage"; 
import { SellerDashboardPage } from "./components/SellerDashboardPage";
import { toast } from "sonner";

// 定義頁面型別
type PageType = 'home' | 'login' | 'register' | 'products' | 'product-detail' | 'post' | 'profile' | 'chat' | 'edit-profile' | 'transactions' | 'ai-camera' | 'ai-processing' | 'ai-confirmation' | 'forgot-password' | 'edit-product' | 'seller-profile' | 'cart' | 'checkout' | 'order-detail' | 'dashboard';

// 🌟 定義路由物件格式：包含頁面名稱與攜帶的資料 (如 productId)
interface Route {
  page: PageType;
  data?: any;
}

export default function App() {
  // 🌟 核心修改：改用陣列來儲存歷史紀錄足跡
  const [history, setHistory] = useState<Route[]>([{ page: 'home' }]);
  
  // 🌟 目前顯示的路由永遠是陣列的最後一個
  const currentRoute = history[history.length - 1];
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [aiGeneratedData, setAiGeneratedData] = useState<any>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [postOrigin, setPostOrigin] = useState<PageType>('home');

  // 切換頁面時自動捲動到最上方
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentRoute.page]);

  // 登入狀態檢查
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

  // 🌟 升級版導覽處理函式
  const handleNavigate = (page: string, data?: any, searchQuery?: string) => {
    // 🔙 處理「BACK」指令：回到上一頁
    if (page === 'BACK') {
      setHistory((prev) => {
        if (prev.length <= 1) return prev; // 只剩首頁則不動作
        const newHistory = [...prev];
        newHistory.pop(); // 彈出最後一個頁面，自然回到前一個
        return newHistory;
      });
      return;
    }

    const targetPage = page as PageType;

    // 處理刊登起點邏輯
    if (targetPage === 'post' && !['ai-camera', 'ai-processing', 'ai-confirmation'].includes(currentRoute.page)) {
      setPostOrigin(currentRoute.page);
    }

    // 處理搜尋關鍵字邏輯
    if (searchQuery !== undefined) {
      setSearchKeyword(searchQuery);
    } else if (targetPage !== 'products') {
      setSearchKeyword("");
    }

    // 🚀 前進邏輯：將新頁面推入歷史足跡堆疊
    setHistory((prev) => {
      // 防止重複推入完全相同的頁面
      const last = prev[prev.length - 1];
      if (last.page === targetPage && last.data === data) return prev;
      return [...prev, { page: targetPage, data }];
    });
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    // 登出後清空歷史，強制重設回首頁
    setHistory([{ page: 'home' }]);
  };

  const handleAICapture = (imageUrl?: string) => {
    setCapturedImage(imageUrl || null);
    handleNavigate('ai-processing');
  };

  const handleAIProcessingComplete = () => {
    if (!capturedImage) {
      toast.error("此功能目前需搭配『上傳真實圖片』才能運作喔！");
      handleNavigate('post');
      return;
    }

    fetch('http://localhost:3001/api/ai-analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: capturedImage })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          const aiData = result.data;
          const integratedProductData = {
            image: capturedImage,
            title: aiData.title,
            category: aiData.category,
            condition: aiData.condition,
            description: aiData.description,
            price: aiData.suggestedPrice.toString(),
          };

          setAiGeneratedData(integratedProductData);
          handleNavigate('ai-confirmation');
        } else {
          toast.error("AI 辨識遇到一點小問題，請手動上傳或再試一次。");
          handleNavigate('post');
        }
      })
      .catch(err => {
        console.error("AI 辨識錯誤:", err);
        toast.error("AI 辨識服務暫時無法連線，請檢查網路或稍後再試。");
        handleNavigate('post');
      });
  };

  // 判斷是否隱藏導覽列的白名單
  const shouldHideNav = [
    'login', 'register', 'edit-profile', 'edit-product', 
    'ai-camera', 'ai-processing', 'ai-confirmation', 
    'seller-profile', 'checkout', 'order-detail'
  ].includes(currentRoute.page);

  return (
    <div className="min-h-screen bg-background">
      {/* 🌟 根據目前的頁面決定是否顯示導覽列 */}
      {!shouldHideNav && (
        <Navigation
          currentPage={currentRoute.page}
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* 🌟 以下所有頁面渲染邏輯均改為判斷 currentRoute.page */}

      {currentRoute.page === 'home' && (
        <HomePage onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />
      )}

      {currentRoute.page === 'login' && (
        <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
      )}

      {currentRoute.page === 'register' && (
        <RegisterPage onNavigate={handleNavigate} onLogin={handleLogin} />
      )}

      {currentRoute.page === 'products' && (
        <ProductListPage
          onNavigate={handleNavigate}
          initialSearch={searchKeyword}
        />
      )}

      {currentRoute.page === 'product-detail' && (
        <ProductDetailPage
          onNavigate={handleNavigate}
          productId={currentRoute.data} // 從 history data 取得 ID
        />
      )}

      {currentRoute.page === 'seller-profile' && (
        <SellerProfilePage
          onNavigate={handleNavigate}
          sellerEmail={currentRoute.data} // 從 history data 取得 email
        />
      )}

      {currentRoute.page === 'cart' && (
        <CartPage onNavigate={handleNavigate} />
      )}

      {currentRoute.page === 'post' && (
        <PostItemPage
          onNavigate={handleNavigate}
          aiGeneratedData={aiGeneratedData}
          previousPage={postOrigin}
        />
      )}

      {/* 🌟 結帳頁面：不再需要傳 productId，因為它會從 localStorage 撈取 checkout_items */}
      {currentRoute.page === 'checkout' && (
        <CheckoutPage onNavigate={handleNavigate} />
      )}

      {currentRoute.page === 'profile' && (
        <UserProfilePage onNavigate={handleNavigate} onLogout={handleLogout} />
      )}

      {currentRoute.page === 'edit-profile' && (
        <EditProfilePage onNavigate={handleNavigate} />
      )}

      {currentRoute.page === 'edit-product' && (
        <EditProductPage onNavigate={handleNavigate} productId={currentRoute.data} />
      )}

      {currentRoute.page === 'chat' && (
        <ChatPage onNavigate={handleNavigate} />
      )}

      {currentRoute.page === 'transactions' && (
        <TransactionHistoryPage onNavigate={handleNavigate} />
      )}

      {currentRoute.page === 'order-detail' && (
        <OrderDetailPage onNavigate={handleNavigate} />
      )}

      {currentRoute.page === 'ai-camera' && (
        <AICameraPage onNavigate={handleNavigate} onCapture={handleAICapture} />
      )}

      {currentRoute.page === 'ai-processing' && (
        <AIProcessingPage onComplete={handleAIProcessingComplete} />
      )}

      {currentRoute.page === 'ai-confirmation' && aiGeneratedData && (
        <AIConfirmationPage
          onNavigate={handleNavigate}
          productData={aiGeneratedData}
          onSkip={() => {
            setAiGeneratedData({ image: aiGeneratedData.image }); 
            handleNavigate('post');
          }}
        />
      )}
      
      {currentRoute.page === 'forgot-password' && (
        <ForgotPasswordPage onNavigate={(page) => handleNavigate(page)} />
      )}

      {currentRoute.page === 'dashboard' && (
        <SellerDashboardPage onNavigate={handleNavigate} />
      )}

      <Toaster />
    </div>
  );
}