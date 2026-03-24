import { Home, Package, PlusCircle, User, MessageCircle, LogIn, UserPlus } from "lucide-react";
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

  const handlePostClick = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
    } else {
      onNavigate('post');
    }
  };

  const handleLoginConfirm = () => {
    setShowLoginPrompt(false);
    onNavigate('login');
  };

  return (
   <nav className="sticky top-0 z-50 w-full border-b border-border shadow-sm" style={{ backgroundColor: '#D5C1DC' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2"
            >
              <Package className="w-6 h-6" />
              <span>二手好物市集</span>
            </button>
            
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={currentPage === 'home' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('home')}
                className="rounded-full"
              >
                <Home className="w-4 h-4 mr-2" />
                首頁
              </Button>
              <Button
                variant={currentPage === 'products' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('products')}
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
                  onClick={() => onNavigate('chat')}
                  className="rounded-full"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  訊息
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Button
                variant={currentPage === 'profile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onNavigate('profile')}
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
                  onClick={() => onNavigate('login')}
                  className="rounded-full"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  登入
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onNavigate('register')}
                  className="rounded-full"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  註冊
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <LoginPromptDialog
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        onConfirm={handleLoginConfirm}
      />
    </nav>
  );
}