import { Home, Package, PlusCircle, User, MessageCircle, LogIn, UserPlus, Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { LoginPromptDialog } from "./LoginPromptDialog";
import { useState, useEffect, useRef } from "react";

import { db } from "../firebase";
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

    // ✅ 核心修改：更新紅點數量的函數，直接從資料源同步
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

    // 🌟 每次切換頁面或載入時，先執行一次同步歸零
    updateCount(); 

    let unsubscribe = () => {};

    try {
      const messagesRef = collection(db, "messages");
      const THREE_DAYS_AGO = Date.now() - (3 * 24 * 60 * 60 * 1000);
      
      const q = query(
        messagesRef,
        where("receiverEmail", "==", myEmail),
        where("createdAt", ">=", THREE_DAYS_AGO),
        orderBy("createdAt", "desc"),
        limit(30)
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        let hasNewUnread = false;
        let processedMsgs = JSON.parse(localStorage.getItem(processedKey) || '{}');
        let savedList = JSON.parse(localStorage.getItem(listKey) || '[]');
        if (!Array.isArray(savedList)) savedList = [];

        const changes = snapshot.docChanges().reverse();

        changes.forEach((change) => {
          if (change.type === "added") {
            const newMsg = change.doc.data();
            const msgId = change.doc.id; 
            
            // ✅ 防呆 1：如果是自己傳的，或已經算過的，絕對不重複計算
            if (newMsg.senderEmail === myEmail) return;
            if (processedMsgs[msgId]) return;

            processedMsgs[msgId] = true; // 立即標記

            // ✅ 防呆 2：只有當 user 「不在」聊天頁面時，才增加紅點
            if (currentPageRef.current !== 'chat') {
              const chatIndex = savedList.findIndex((c: any) => 
                c.email === newMsg.senderEmail || c.id === newMsg.senderEmail
              );
              
              if (chatIndex !== -1) {
                savedList[chatIndex].unread = (savedList[chatIndex].unread || 0) + 1;
                savedList[chatIndex].lastMessage = newMsg.text || (newMsg.type === 'image' ? '[圖片]' : '[商品資訊]');
                savedList[chatIndex].lastTimestamp = newMsg.createdAt || Date.now();
              } else {
                savedList.unshift({
                  id: newMsg.senderEmail,
                  email: newMsg.senderEmail,
                  name: newMsg.senderName || newMsg.senderEmail.split('@')[0],
                  avatar: newMsg.senderAvatar || "",
                  lastMessage: newMsg.text || (newMsg.type === 'image' ? '[圖片]' : '[商品資訊]'),
                  time: "剛剛",
                  lastTimestamp: newMsg.createdAt || Date.now(),
                  unread: 1
                });
              }
              hasNewUnread = true;
            }
          }
        });

        // 🌟 立即儲存已處理清單，防止下一次 snapshot 抖動導致重複
        localStorage.setItem(processedKey, JSON.stringify(processedMsgs));

        if (hasNewUnread) {
          localStorage.setItem(listKey, JSON.stringify(savedList));
          updateCount();
        }
      }, (error) => {
        console.error("Firebase 監聽錯誤:", error);
      });
    } catch (firebaseError) {}

    // 監聽其他視窗的存儲變動
    window.addEventListener('storage', updateCount);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', updateCount);
    };
    // 🌟 這裡加入 currentPage 依賴，確保切換分頁時會重新執行初始化與同步
  }, [isLoggedIn, currentPage]); 

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  // ... 略過 handlePostClick 等按鈕處理邏輯（與原版相同） ...
  
  const handleLoginConfirm = () => {
    setShowLoginPrompt(false);
    onNavigate('login');
  };

  return (
    <nav className="absolute top-0 z-50 w-full bg-custom-purple">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button onClick={() => handleNavigate('home')} className="flex items-center gap-2 font-bold">
              <Package className="w-6 h-6" />
              <span>二手好物市集</span>
            </button>

            <div className="hidden md:flex items-center gap-2">
              <Button variant={currentPage === 'home' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleNavigate('home')} className="rounded-full">
                <Home className="w-4 h-4 mr-2" /> 首頁
              </Button>
              <Button variant={currentPage === 'products' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleNavigate('products')} className="rounded-full">
                <Package className="w-4 h-4 mr-2" /> 瀏覽商品
              </Button>
              <Button variant={currentPage === 'post' ? 'secondary' : 'ghost'} size="sm" onClick={() => onNavigate('post')} className="rounded-full">
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
                  {/* 🌟 只有當大於 0 時才渲染，點擊切換後 totalUnread 會變成 0 自動消失 */}
                  {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md border-2 border-white z-50">
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* ... 右側按鈕區域保持不變 ... */}
          <div className="flex items-center gap-2">
             <div className="hidden md:flex items-center gap-2">
                <Button variant={currentPage === 'cart' ? 'secondary' : 'ghost'} size="icon" onClick={() => onNavigate('cart')} className="rounded-full relative mr-2">
                   <ShoppingCart className="w-5 h-5" />
                </Button>
                {/* ... 登入/註冊/個人資料按鈕 ... */}
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
          </div>
        </div>
      </div>
      {/* ... 手機版選單邏輯保持不變 ... */}
      <LoginPromptDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt} onConfirm={handleLoginConfirm} description={promptMessage} />
    </nav>
  );
}