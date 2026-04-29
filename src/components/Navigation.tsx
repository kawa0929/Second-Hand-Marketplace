import { Home, Package, PlusCircle, User, MessageCircle, LogIn, UserPlus, Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { LoginPromptDialog } from "./LoginPromptDialog";
import { useState, useEffect, useRef } from "react";

import { db } from "../firebase";
// 🌟 匯入 orderBy 和 limit 來幫資料庫省下大量額度！
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
}

export function Navigation({ currentPage, onNavigate, isLoggedIn }: NavigationProps) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [promptMessage, setPromptMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  // 🌟 省額度秘訣 1：用 useRef 記住目前在哪一頁，這樣切換頁面就不會觸發重新下載資料庫！
  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    if (!isLoggedIn) {
      setTotalUnread(0);
      return;
    }

    let myEmail = "";
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const currentUser = JSON.parse(userStr);
      myEmail = currentUser?.email || currentUser?.account || currentUser?.id || currentUser?.username || "";
    } catch (e) { return; }

    if (!myEmail) return;

    const listKey = `chatList_${myEmail}`;
    const processedKey = `processedMsgs_${myEmail}`; 

    const updateCount = () => {
      try {
        const rawData = localStorage.getItem(listKey);
        const savedList = rawData ? JSON.parse(rawData) : [];
        if (Array.isArray(savedList)) {
          const count = savedList.reduce((sum: number, chat: any) => sum + (chat.unread || 0), 0);
          setTotalUnread(count);
        }
      } catch (e) {}
    };

    updateCount(); 

    let unsubscribe = () => {};

    try {
      const messagesRef = collection(db, "messages");
      
      // 🌟 省額度秘訣 2：加上 orderBy 和 limit！每次只檢查最新傳給我的 30 筆訊息！
      const q = query(
        messagesRef,
        where("receiverEmail", "==", myEmail),
        orderBy("createdAt", "desc"),
        limit(30)
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        let hasNewUnread = false;
        
        let processedMsgs = JSON.parse(localStorage.getItem(processedKey) || '{}');
        let savedList = JSON.parse(localStorage.getItem(listKey) || '[]');
        if (!Array.isArray(savedList)) savedList = [];

        // 🌟 因為我們是用 desc 抓取最新的，這裡用 reverse() 反轉回來，從舊到新處理比較安全
        const changes = snapshot.docChanges().reverse();

        changes.forEach((change) => {
          if (change.type === "added") {
            const newMsg = change.doc.data();
            const msgId = change.doc.id; 
            
            if (newMsg.senderEmail === myEmail) return;
            if (processedMsgs[msgId]) return;
            processedMsgs[msgId] = true;

            // 🌟 使用 currentPageRef.current 來判斷
            if (currentPageRef.current !== 'chat') {
              const chatIndex = savedList.findIndex((c: any) => c.email === newMsg.senderEmail || c.id === newMsg.senderEmail);
              
              if (chatIndex !== -1) {
                savedList[chatIndex].unread = (savedList[chatIndex].unread || 0) + 1;
                savedList[chatIndex].lastMessage = newMsg.text || (newMsg.type === 'image' ? '[圖片]' : '[商品資訊]');
                hasNewUnread = true;
              } else {
                savedList.unshift({
                  id: newMsg.senderEmail,
                  email: newMsg.senderEmail,
                  name: newMsg.senderName || newMsg.senderEmail.split('@')[0],
                  avatar: newMsg.senderAvatar || "",
                  lastMessage: newMsg.text || (newMsg.type === 'image' ? '[圖片]' : '[商品資訊]'),
                  time: "剛剛",
                  unread: 1
                });
                hasNewUnread = true;
              }
            }
          }
        });

        localStorage.setItem(processedKey, JSON.stringify(processedMsgs));
        if (hasNewUnread) {
          localStorage.setItem(listKey, JSON.stringify(savedList));
          updateCount();
        }
      }, (error) => {
        // 🚨 捕捉可能的 Firebase 索引錯誤
        console.error("Firebase 監聽錯誤:", error);
      });
    } catch (firebaseError) {}

    window.addEventListener('storage', updateCount);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', updateCount);
    };
  // 🌟 這裡只放 isLoggedIn，拔掉 currentPage，這就是省額度最重要的一步！
  }, [isLoggedIn]); 

  const handlePostClick = () => {
    setIsMenuOpen(false);
    if (!isLoggedIn) {
      setPromptMessage("登入後即可刊登您的商品。");
      setShowLoginPrompt(true);
    } else {
      onNavigate('post');
    }
  };

  const handleCartClick = () => {
    setIsMenuOpen(false);
    if (!isLoggedIn) {
      setPromptMessage("登入後即可查看您的購物車。");
      setShowLoginPrompt(true);
    } else {
      onNavigate('cart');
    }
  };

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  const handleLoginConfirm = () => {
    setShowLoginPrompt(false);
    onNavigate('login');
  };

  return (
    <nav className="absolute top-0 z-50 w-full bg-custom-purple">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo 區域 */}
          <div className="flex items-center gap-8">
            <button onClick={() => handleNavigate('home')} className="flex items-center gap-2 font-bold">
              <Package className="w-6 h-6" />
              <span>二手好物市集</span>
            </button>

            {/* 電腦版選單 */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant={currentPage === 'home' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleNavigate('home')} className="rounded-full">
                <Home className="w-4 h-4 mr-2" /> 首頁
              </Button>
              <Button variant={currentPage === 'products' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleNavigate('products')} className="rounded-full">
                <Package className="w-4 h-4 mr-2" /> 瀏覽商品
              </Button>
              <Button variant={currentPage === 'post' ? 'secondary' : 'ghost'} size="sm" onClick={handlePostClick} className="rounded-full">
                <PlusCircle className="w-4 h-4 mr-2" /> 刊登商品
              </Button>
              
              {isLoggedIn && (
                <Button
                  variant={currentPage === 'chat' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigate('chat')}
                  className="rounded-full relative" 
                  style={{ overflow: 'visible' }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  訊息
                  {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md border-2 border-white z-50">
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* 右側按鈕區域 */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <Button variant={currentPage === 'cart' ? 'secondary' : 'ghost'} size="icon" onClick={handleCartClick} className="rounded-full relative mr-2">
                <ShoppingCart className="w-5 h-5" />
              </Button>

              {isLoggedIn ? (
                <Button variant={currentPage === 'profile' ? 'default' : 'outline'} size="sm" onClick={() => handleNavigate('profile')} className="rounded-full">
                  <User className="w-4 h-4 mr-2" /> 個人資料
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => handleNavigate('login')} className="rounded-full">
                    <LogIn className="w-4 h-4 mr-2" /> 登入
                  </Button>
                  <Button variant="default" size="sm" onClick={() => handleNavigate('register')} className="rounded-full">
                    <UserPlus className="w-4 h-4 mr-2" /> 註冊
                  </Button>
                </>
              )}
            </div>

            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-full">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 手機版下拉選單 */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-black/5 pb-4 bg-mobile-menu">
          <div className="flex flex-col gap-2 px-4 pt-4">
            <Button variant={currentPage === 'home' ? 'secondary' : 'ghost'} className="justify-start rounded-xl" onClick={() => handleNavigate('home')}>
              <Home className="w-4 h-4 mr-3" /> 首頁
            </Button>
            <Button variant={currentPage === 'products' ? 'secondary' : 'ghost'} className="justify-start rounded-xl" onClick={() => handleNavigate('products')}>
              <Package className="w-4 h-4 mr-3" /> 瀏覽商品
            </Button>
            <Button variant={currentPage === 'post' ? 'secondary' : 'ghost'} className="justify-start rounded-xl" onClick={handlePostClick}>
              <PlusCircle className="w-4 h-4 mr-3" /> 刊登商品
            </Button>
            <Button variant={currentPage === 'cart' ? 'secondary' : 'ghost'} className="justify-start rounded-xl" onClick={handleCartClick}>
              <ShoppingCart className="w-4 h-4 mr-3" /> 購物車
            </Button>

            {isLoggedIn && (
              <Button
                variant={currentPage === 'chat' ? 'secondary' : 'ghost'}
                className="justify-start rounded-xl relative"
                onClick={() => handleNavigate('chat')}
                style={{ overflow: 'visible' }}
              >
                <MessageCircle className="w-4 h-4 mr-3" /> 訊息
                {totalUnread > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md border-2 border-white">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </Button>
            )}

            <hr className="my-2 border-black/5" />

            {isLoggedIn ? (
              <Button variant={currentPage === 'profile' ? 'default' : 'outline'} className="justify-start rounded-xl" onClick={() => handleNavigate('profile')}>
                <User className="w-4 h-4 mr-3" /> 個人資料
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button variant="ghost" className="justify-start rounded-xl" onClick={() => handleNavigate('login')}>
                  <LogIn className="w-4 h-4 mr-3" /> 登入
                </Button>
                <Button variant="default" className="justify-start rounded-xl" onClick={() => handleNavigate('register')}>
                  <UserPlus className="w-4 h-4 mr-3" /> 註冊
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <LoginPromptDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt} onConfirm={handleLoginConfirm} description={promptMessage} />
    </nav>
  );
}