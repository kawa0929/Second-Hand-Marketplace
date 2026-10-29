import { Home, Package, PlusCircle, User, MessageCircle, LogIn, UserPlus, Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { LoginPromptDialog } from "./LoginPromptDialog";
import { useState, useEffect, useRef } from "react";

import { db } from "../firebase";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
// @ts-ignore
import LogoImg from '../public/logo.png';

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

    const updateCount = () => {
      try {
        const rawData = localStorage.getItem(listKey);
        const savedList = rawData ? JSON.parse(rawData) : [];
        if (Array.isArray(savedList)) {
          const count = savedList.reduce((sum: number, chat: any) => sum + (chat.unread || 0), 0);
          setTotalUnread(count);
        }
      } catch (e) { }
    };

    updateCount();

    let unsubscribe = () => { };

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

            if (newMsg.senderEmail === myEmail) return;
            if (processedMsgs[msgId]) return;

            processedMsgs[msgId] = true;

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

        localStorage.setItem(processedKey, JSON.stringify(processedMsgs));

        if (hasNewUnread) {
          localStorage.setItem(listKey, JSON.stringify(savedList));
          updateCount();
        }
      }, (error) => {
        console.error("Firebase 監聽錯誤:", error);
      });
    } catch (firebaseError) { }

    window.addEventListener('storage', updateCount);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', updateCount);
    };
  }, [isLoggedIn, currentPage]);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false); // 切換頁面後自動關閉手機選單
  };

  const handleLoginConfirm = () => {
    setShowLoginPrompt(false);
    onNavigate('login');
  };

  return (
    <nav className="absolute top-0 z-50 w-full bg-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button onClick={() => handleNavigate('home')} className="flex items-center gap-2 font-bold">
              <img src={LogoImg} alt="物遇 WUYU Logo" className="h-20 w-auto" />
            </button>

            {/* 電腦版左側選單 */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={currentPage === 'home' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleNavigate('home')}
                className={`rounded-full ${currentPage === 'home' ? '' : 'text-gray-200 hover:text-white hover:bg-slate-800'}`}
              >
                <Home className="w-4 h-4 mr-2" /> 首頁
              </Button>
              <Button
                variant={currentPage === 'products' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleNavigate('products')}
                className={`rounded-full ${currentPage === 'products' ? '' : 'text-gray-200 hover:text-white hover:bg-slate-800'}`}
              >
                <Package className="w-4 h-4 mr-2" /> 瀏覽商品
              </Button>
              <Button
                variant={currentPage === 'post' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('post')}
                className={`rounded-full ${currentPage === 'post' ? '' : 'text-gray-200 hover:text-white hover:bg-slate-800'}`}
              >
                <PlusCircle className="w-4 h-4 mr-2" /> 刊登商品
              </Button>

              {isLoggedIn && (
                <Button
                  variant={currentPage === 'chat' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigate('chat')}
                  className={`rounded-full relative ${currentPage === 'chat' ? '' : 'text-gray-200 hover:text-white hover:bg-slate-800'}`}
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

          <div className="flex items-center gap-2">
            {/* 電腦版右側按鈕 */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={currentPage === 'cart' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => onNavigate('cart')}
                className={`rounded-full relative mr-2 ${currentPage === 'cart' ? '' : 'text-gray-200 hover:text-white hover:bg-slate-800'}`}
              >
                <ShoppingCart className="w-5 h-5" />
              </Button>
              {isLoggedIn ? (
                <Button
                  variant={currentPage === 'profile' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigate('profile')}
                  className={`rounded-full border border-slate-700 ${currentPage === 'profile' ? '' : 'text-gray-200 hover:text-white hover:bg-slate-800'}`}
                >
                  <User className="w-4 h-4 mr-2" /> 個人資料
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate('login')}
                    className="rounded-full text-gray-200 hover:text-white hover:bg-slate-800"
                  >
                    <LogIn className="w-4 h-4 mr-2" /> 登入
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleNavigate('register')}
                    className="rounded-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" /> 註冊
                  </Button>
                </>
              )}
            </div>

            {/* 手機版漢堡按鈕 */}
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-200 hover:text-white hover:bg-slate-800"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 手機版下拉選單邏輯 (白底不用改字體顏色) */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/70 backdrop-blur-md border border-white/40 shadow-2xl absolute left-4 right-4 top-[76px] rounded-2xl p-1 z-40">
          <div className="px-4 pt-2 pb-4 space-y-2 flex flex-col">
            <Button variant={currentPage === 'home' ? 'secondary' : 'ghost'} className="justify-start w-full" onClick={() => handleNavigate('home')}>
              <Home className="w-4 h-4 mr-3" /> 首頁
            </Button>
            <Button variant={currentPage === 'products' ? 'secondary' : 'ghost'} className="justify-start w-full" onClick={() => handleNavigate('products')}>
              <Package className="w-4 h-4 mr-3" /> 瀏覽商品
            </Button>
            <Button variant={currentPage === 'post' ? 'secondary' : 'ghost'} className="justify-start w-full" onClick={() => handleNavigate('post')}>
              <PlusCircle className="w-4 h-4 mr-3" /> 刊登商品
            </Button>

            {isLoggedIn && (
              <Button variant={currentPage === 'chat' ? 'secondary' : 'ghost'} className="justify-start w-full" onClick={() => handleNavigate('chat')}>
                <MessageCircle className="w-4 h-4 mr-3" /> 訊息
                {totalUnread > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </Button>
            )}

            <div className="h-px bg-gray-100 my-2" />

            <Button variant={currentPage === 'cart' ? 'secondary' : 'ghost'} className="justify-start w-full" onClick={() => handleNavigate('cart')}>
              <ShoppingCart className="w-4 h-4 mr-3" /> 購物車
            </Button>

            {isLoggedIn ? (
              <Button variant={currentPage === 'profile' ? 'default' : 'ghost'} className="justify-start w-full" onClick={() => handleNavigate('profile')}>
                <User className="w-4 h-4 mr-3" /> 個人資料
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button variant="outline" className="w-full" onClick={() => handleNavigate('login')}>
                  <LogIn className="w-4 h-4 mr-2" /> 登入
                </Button>
                <Button variant="default" className="w-full" onClick={() => handleNavigate('register')}>
                  <UserPlus className="w-4 h-4 mr-2" /> 註冊
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