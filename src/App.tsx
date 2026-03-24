import { useState } from "react";
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

type PageType = 'home' | 'login' | 'register' | 'products' | 'product-detail' | 'post' | 'profile' | 'chat' | 'edit-profile' | 'transactions' | 'ai-camera' | 'ai-processing' | 'ai-confirmation' | 'forgot-password';

// Mock AI recognition data for different products
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

  const handleNavigate = (page: string, productId?: string) => {
    setCurrentPage(page as PageType);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleAICapture = () => {
    // Navigate to processing page
    setCurrentPage('ai-processing');
  };

  const handleAIProcessingComplete = () => {
    // Select a random product from AI data
    const productData = aiProductData[Math.floor(Math.random() * aiProductData.length)];
    setAiGeneratedData(productData);
    
    // Navigate to confirmation page
    setCurrentPage('ai-confirmation');
  };

  return (
    <div className="min-h-screen bg-background">
      {currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'edit-profile' && currentPage !== 'ai-camera' && currentPage !== 'ai-processing' && currentPage !== 'ai-confirmation' && (
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
        <ProductListPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'product-detail' && (
        <ProductDetailPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'post' && (
        <PostItemPage onNavigate={handleNavigate} aiGeneratedData={aiGeneratedData} />
      )}

      {currentPage === 'profile' && (
        <UserProfilePage onNavigate={handleNavigate} onLogout={handleLogout} />
      )}

      {currentPage === 'edit-profile' && (
        <EditProfilePage onNavigate={handleNavigate} />
      )}

      {currentPage === 'chat' && (
        <ChatPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'transactions' && (
        <TransactionHistoryPage onNavigate={handleNavigate} />
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
        />
      )}
      {currentPage === 'forgot-password' && (
        <ForgotPasswordPage onNavigate={(page) => setCurrentPage(page as any)} />
      )}

      <Toaster />
    </div>
  );
}