import { Home, Package, PlusCircle, User, MessageCircle, LogIn, UserPlus, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { LoginPromptDialog } from "./LoginPromptDialog";
import { useState } from "react";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
}

export function Navigation({ currentPage, onNavigate, isLoggedIn }: NavigationProps) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 🌟 控制漢堡選單開關

  const handlePostClick = () => {
    setIsMenuOpen(false); // 點擊後關閉手機選單
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
    } else {
      onNavigate('post');
    }
  };

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false); // 點擊後關閉手機選單
  };

  const handleLoginConfirm = () => {
    setShowLoginPrompt(false);
    onNavigate('login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border shadow-sm" style={{ backgroundColor: '#D5C1DC' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo 區域 */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-2 font-bold"
            >
              <Package className="w-6 h-6" />
              <span>二手好物市集</span>
            </button>

            {/* 電腦版選單 (md 以上才顯示) */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={currentPage === 'home' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleNavigate('home')}
                className="rounded-full"
              >
                <Home className="w-4 h-4 mr-2" />
                首頁
              </Button>
              <Button
                variant={currentPage === 'products' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleNavigate('products')}
                className="rounded-full"
              >
                <Package className="w-4 h-4 mr-2" />
                瀏覽商品
              </Button>
              <Button
                variant={currentPage === 'post' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={handlePostClick}
                className="rounded-full"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                刊登商品
              </Button>
              {isLoggedIn && (
                <Button
                  variant={currentPage === 'chat' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigate('chat')}
                  className="rounded-full"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  訊息
                </Button>
              )}
            </div>
          </div>

          {/* 右側按鈕區域 */}
          <div className="flex items-center gap-2">
            {/* 電腦版右側按鈕 (md 以上才顯示) */}
            <div className="hidden md:flex items-center gap-2">
              {isLoggedIn ? (
                <Button
                  variant={currentPage === 'profile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleNavigate('profile')}
                  className="rounded-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  個人資料
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate('login')}
                    className="rounded-full"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    登入
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleNavigate('register')}
                    className="rounded-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    註冊
                  </Button>
                </>
              )}
            </div>

            {/* 🌟 漢堡選單按鈕 (僅在手機版 md 以下顯示) */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="rounded-full"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 手機版下拉選單內容 */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-black/5 pb-4" style={{ backgroundColor: '#D5C1DC' }}>
          <div className="flex flex-col gap-2 px-4 pt-4">
            <Button
              variant={currentPage === 'home' ? 'secondary' : 'ghost'}
              className="justify-start rounded-xl"
              onClick={() => handleNavigate('home')}
            >
              <Home className="w-4 h-4 mr-3" /> 首頁
            </Button>
            <Button
              variant={currentPage === 'products' ? 'secondary' : 'ghost'}
              className="justify-start rounded-xl"
              onClick={() => handleNavigate('products')}
            >
              <Package className="w-4 h-4 mr-3" /> 瀏覽商品
            </Button>
            <Button
              variant={currentPage === 'post' ? 'secondary' : 'ghost'}
              className="justify-start rounded-xl"
              onClick={handlePostClick}
            >
              <PlusCircle className="w-4 h-4 mr-3" /> 刊登商品
            </Button>
            {isLoggedIn && (
              <Button
                variant={currentPage === 'chat' ? 'secondary' : 'ghost'}
                className="justify-start rounded-xl"
                onClick={() => handleNavigate('chat')}
              >
                <MessageCircle className="w-4 h-4 mr-3" /> 訊息
              </Button>
            )}
            <hr className="my-2 border-black/5" />
            {isLoggedIn ? (
              <Button
                variant={currentPage === 'profile' ? 'default' : 'outline'}
                className="justify-start rounded-xl"
                onClick={() => handleNavigate('profile')}
              >
                <User className="w-4 h-4 mr-3" /> 個人資料
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="justify-start rounded-xl"
                  onClick={() => handleNavigate('login')}
                >
                  <LogIn className="w-4 h-4 mr-3" /> 登入
                </Button>
                <Button
                  variant="default"
                  className="justify-start rounded-xl"
                  onClick={() => handleNavigate('register')}
                >
                  <UserPlus className="w-4 h-4 mr-3" /> 註冊
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <LoginPromptDialog
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        onConfirm={handleLoginConfirm}
      />
    </nav>
  );
}