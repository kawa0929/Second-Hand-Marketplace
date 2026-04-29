import { Search, Send, MoreVertical, Phone, Video, Image as ImageIcon, Upload, Library, X, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useState, useEffect, useRef, useCallback } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

import { db } from "../firebase";
// 🌟 這裡新增了 orderBy 和 limit 的匯入，用來幫資料庫省額度！
import { collection, addDoc, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";

interface ChatPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export function ChatPage({ onNavigate }: ChatPageProps) {
  const [chatList, setChatList] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [pendingProduct, setPendingProduct] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return { email: 'guest@example.com' };
      const user = JSON.parse(userStr);
      const userEmail = user.email || user.account || user.id || user.username || 'guest@example.com';
      return { ...user, email: userEmail };
    } catch (e) {
      return { email: 'guest@example.com' };
    }
  };

  const markAsRead = (chatId: string) => {
    const currentUser = getCurrentUser();
    const listStorageKey = `chatList_${currentUser.email}`;
    
    let currentStorageList = JSON.parse(localStorage.getItem(listStorageKey) || '[]');
    currentStorageList = currentStorageList.map((c: any) => 
      c.id === chatId ? { ...c, unread: 0 } : c
    );
    localStorage.setItem(listStorageKey, JSON.stringify(currentStorageList));
    setChatList(currentStorageList);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, pendingProduct, pendingImage]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    const listStorageKey = `chatList_${currentUser.email}`;
    let savedChats = JSON.parse(localStorage.getItem(listStorageKey) || '[]');

    const pendingChatStr = localStorage.getItem('pendingChatContext');
    
    if (pendingChatStr) {
      const pendingChat = JSON.parse(pendingChatStr);
      const existingChatIndex = savedChats.findIndex((c: any) => c.id === pendingChat.id);
      let targetChat;

      if (existingChatIndex !== -1) {
        [targetChat] = savedChats.splice(existingChatIndex, 1);
        targetChat.product = pendingChat.product;
        targetChat.productImage = pendingChat.productImage;
      } else {
        targetChat = {
          id: pendingChat.id,
          name: pendingChat.name,
          avatar: pendingChat.avatar || "", 
          email: pendingChat.email || pendingChat.id,
          product: pendingChat.product,             
          productImage: pendingChat.productImage,   
          lastMessage: `準備詢問：${pendingChat.product}`,
          time: "剛剛",
          unread: 0
        };
      }
      savedChats.unshift(targetChat);
      localStorage.setItem(listStorageKey, JSON.stringify(savedChats)); 
      setChatList(savedChats);
      setSelectedChat(targetChat);
      setPendingProduct({
        productId: pendingChat.productId,
        productName: pendingChat.product,
        productImage: pendingChat.productImage
      });
      localStorage.removeItem('pendingChatContext');
    } else {
      setChatList(savedChats);
    }
  }, []);

  useEffect(() => {
    // 🌟 修正重點 2：依賴陣列從 [selectedChat] 改為 [selectedChat?.id]
    if (!selectedChat) return;

    const currentUser = getCurrentUser();
    const myEmail = currentUser.email;
    const partnerEmail = selectedChat.email || selectedChat.id || 'unknown';
    const emails = [myEmail, partnerEmail].sort();
    const roomId = `${emails[0]}_${emails[1]}`;

    const messagesRef = collection(db, "messages");
    
    // 🌟 修正重點 1：加入 orderBy 抓取最新訊息，並使用 limit(30) 限制數量省額度！
    const q = query(
      messagesRef,
      where("roomId", "==", roomId),
      orderBy("createdAt", "desc"),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // 因為上面是用 desc 抓最新的，這裡要在前端轉正，確保最新的訊息在畫面最下方
      loadedMessages.sort((a: any, b: any) => (a.createdAt || 0) - (b.createdAt || 0));
      setMessages(loadedMessages);

      if (loadedMessages.length > 0) {
        const lastMsg = loadedMessages[loadedMessages.length - 1];
        const displayBody = lastMsg.type === 'product' ? "[商品資訊]" : (lastMsg.type === 'image' ? "[圖片]" : lastMsg.text);
        const isFromPartner = lastMsg.senderEmail !== myEmail;

        const listStorageKey = `chatList_${myEmail}`;
        let currentStorageList = JSON.parse(localStorage.getItem(listStorageKey) || '[]');
        const chatIndex = currentStorageList.findIndex((c: any) => c.id === selectedChat.id);
        
        if (chatIndex !== -1) {
          const isWatchingThisChat = selectedChat && selectedChat.id === currentStorageList[chatIndex].id;
          const partnerEmailInList = currentStorageList[chatIndex].email || currentStorageList[chatIndex].id;
          const lastPartnerMsg = [...loadedMessages].reverse().find(m => m.senderEmail === partnerEmailInList);
          
          currentStorageList[chatIndex] = {
            ...currentStorageList[chatIndex],
            name: lastPartnerMsg?.senderName || currentStorageList[chatIndex].name,
            avatar: lastPartnerMsg?.senderAvatar || currentStorageList[chatIndex].avatar,
            lastMessage: displayBody,
            time: lastMsg.time || "剛剛",
            unread: (isFromPartner && !isWatchingThisChat) ? (currentStorageList[chatIndex].unread || 0) + 1 : 0
          };
          
          if (isWatchingThisChat) {
             setSelectedChat((prev: any) => ({
                 ...prev,
                 avatar: lastPartnerMsg?.senderAvatar || prev.avatar,
                 name: lastPartnerMsg?.senderName || prev.name
             }));
          }

          const [movedItem] = currentStorageList.splice(chatIndex, 1);
          currentStorageList.unshift(movedItem);
        } else {
          currentStorageList.unshift({
            id: selectedChat.id,
            email: selectedChat.email,
            name: selectedChat.name,
            avatar: selectedChat.avatar,
            lastMessage: displayBody,
            time: lastMsg.time || "剛剛",
            unread: 0
          });
        }
        
        localStorage.setItem(listStorageKey, JSON.stringify(currentStorageList));
        setChatList(currentStorageList);
      }
    });

    return () => unsubscribe();
  }, [selectedChat?.id]);

  useEffect(() => {
    const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setIsMobile(mobile);
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim() && !pendingProduct && !pendingImage) return;
    if (!selectedChat) return;

    const currentUser = getCurrentUser();
    const myEmail = currentUser.email || 'guest@example.com';
    const myName = currentUser.name || currentUser.username || myEmail.split('@')[0];
    const myAvatar = currentUser.avatar || currentUser.profileImage || currentUser.photoURL || ""; 
    
    const partnerEmail = selectedChat.email || selectedChat.id || 'unknown';
    const emails = [myEmail, partnerEmail].sort();
    const roomId = `${emails[0]}_${emails[1]}`;

    try {
      if (pendingProduct) {
        await addDoc(collection(db, "messages"), {
          roomId: roomId,
          type: "product",
          senderEmail: myEmail,
          senderName: myName,
          senderAvatar: myAvatar,
          receiverEmail: partnerEmail,
          productId: pendingProduct.productId,
          productName: pendingProduct.productName,
          productImage: pendingProduct.productImage,
          time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
          createdAt: Date.now()
        });
        setPendingProduct(null); 
      }

      if (pendingImage) {
        await addDoc(collection(db, "messages"), {
          roomId: roomId,
          type: "image",
          senderEmail: myEmail,
          senderName: myName,
          senderAvatar: myAvatar,
          receiverEmail: partnerEmail,
          imageUrl: pendingImage,
          time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
          createdAt: Date.now()
        });
        setPendingImage(null); 
      }

      if (messageText.trim()) {
        await addDoc(collection(db, "messages"), {
          roomId: roomId,
          type: "text",
          senderEmail: myEmail,
          senderName: myName,
          senderAvatar: myAvatar,
          receiverEmail: partnerEmail,
          text: messageText,
          time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
          createdAt: Date.now() + 1
        });
      }
      setMessageText("");
    } catch (error: any) {
      alert("發送失敗：" + error.message);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-neutral-50">
      <div className="h-full max-w-7xl mx-auto flex overflow-hidden">
        
        <div className={`w-full md:w-96 bg-white border-r border-border flex-col h-full ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-border shrink-0 text-left">
            <h2 className="mb-4 font-bold text-xl">訊息</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="搜尋對話..." className="pl-10 h-10 rounded-xl bg-input-background border-0" />
            </div>
          </div>

          <ScrollArea className="flex-1 text-left">
            <div className="divide-y divide-border">
              {chatList.map((conv) => {
                const isSelected = selectedChat?.id === conv.id;
                const hasUnread = conv.unread > 0;

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedChat(conv);
                      setPendingProduct(null);
                      markAsRead(conv.id);
                    }}
                    className={`w-full p-4 flex gap-4 hover:bg-neutral-50 transition-colors border-l-4 ${
                      isSelected ? 'bg-neutral-50 border-primary' : 'border-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conv.avatar} />
                        <AvatarFallback>{conv.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {hasUnread && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white min-w-[20px] text-center">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 text-left flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`truncate text-sm ${hasUnread ? 'font-extrabold text-neutral-900' : 'font-medium text-neutral-700'}`}>
                          {conv.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 ml-2 whitespace-nowrap">
                          {conv.time}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${
                        hasUnread ? 'font-bold text-neutral-900' : 'text-neutral-400'
                      }`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className={`flex-1 flex-col bg-white h-full overflow-hidden ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
          {!selectedChat ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
              <ImageIcon className="w-16 h-16 opacity-20" />
              <p>選擇對話開始聊聊</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between shadow-sm z-10 bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" className="md:hidden mr-1 -ml-2 px-2" onClick={() => setSelectedChat(null)} >
                    <ArrowLeft className="w-5 h-5 text-neutral-600" />
                    <span className="text-sm font-bold text-neutral-600 ml-1">返回</span>
                  </Button>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedChat.avatar} />
                    <AvatarFallback>{selectedChat.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left flex flex-col justify-center">
                    <div className="font-medium">{selectedChat.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="rounded-full"><Phone className="w-5 h-5 text-neutral-500" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="w-5 h-5 text-neutral-500" /></Button>
                </div>
              </div>

              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />

              <div className="flex-1 overflow-y-auto p-4 bg-[#F8F9FA]" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isMe = message.senderEmail === getCurrentUser().email;
                    if (message.type === 'product') {
                      return (
                        <div key={message.id} className="flex justify-center my-6">
                          <Card className="w-[350px] max-w-full rounded-2xl border-border overflow-hidden shadow-sm bg-white">
                            <div className="flex items-center gap-3 p-3">
                              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                                <ImageWithFallback src={message.productImage} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <div className="font-medium text-sm line-clamp-2">{message.productName}</div>
                                <div className="text-[11px] text-muted-foreground">正在討論商品</div>
                              </div>
                              <Button variant="secondary" size="sm" className="rounded-full text-xs h-8" onClick={() => onNavigate('product-detail', message.productId)}>查看</Button>
                            </div>
                          </Card>
                        </div>
                      );
                    }
                    if (message.type === 'image') {
                      return (
                        <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} my-2`}>
                          <div className={`max-w-[50%] p-1 rounded-2xl border border-border bg-white shadow-sm overflow-hidden`}>
                            <ImageWithFallback src={message.imageUrl} className="w-full h-auto object-contain rounded-xl" />
                            <div className={`text-[11px] text-neutral-400 mt-1 px-1 ${isMe ? 'text-right' : 'text-left'}`}>{message.time}</div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                          <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm ${isMe ? 'bg-[#333] text-white rounded-tr-sm' : 'bg-white border border-neutral-100 rounded-tl-sm text-neutral-800'}`}>{message.text}</div>
                          <div className={`text-[11px] text-neutral-400 mt-1 px-1 ${isMe ? 'text-right' : 'text-left'}`}>{message.time}</div>
                        </div>
                      </div>
                    );
                  })}

                  {pendingProduct && (
                    <div className="flex justify-center my-6">
                      <Card className="w-[350px] max-w-full rounded-2xl border-2 border-primary/20 bg-blue-50/50">
                        <div className="flex items-center gap-3 p-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"><img src={pendingProduct.productImage} className="w-full h-full object-cover" /></div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="font-medium text-sm line-clamp-2">{pendingProduct.productName}</div>
                            <div className="text-[11px] text-primary font-medium">✨ 發送訊息後將一併傳送商品</div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {pendingImage && (
                    <div className="flex justify-center my-6">
                      <Card className="w-[300px] max-w-full rounded-2xl border-2 border-primary/20 bg-blue-50/50 p-2 relative">
                        <Button 
                          variant="ghost" size="icon" 
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/70 hover:bg-white text-neutral-500"
                          onClick={() => setPendingImage(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <img src={pendingImage} className="w-full h-auto max-h-[200px] object-contain rounded-xl" />
                        <div className="text-[11px] text-primary font-medium text-center mt-1">✨ 發送訊息後將一併傳送圖片</div>
                      </Card>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-border bg-white shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2 items-center">
                  {!isMobile ? (
                    <Button type="button" variant="ghost" size="icon" className="rounded-full text-neutral-500" onClick={openFilePicker}>
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="rounded-full text-neutral-500">
                          <ImageIcon className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[200px] rounded-xl p-2">
                        <DropdownMenuItem onClick={openFilePicker} className="flex gap-3 text-sm py-2.5 px-3 rounded-lg cursor-pointer hover:bg-neutral-100">
                          <Upload className="w-4 h-4 text-neutral-500" />
                          <span>上傳照片 (電腦)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={openFilePicker} className="flex gap-3 text-sm py-2.5 px-3 rounded-lg cursor-pointer hover:bg-neutral-100">
                          <Library className="w-4 h-4 text-neutral-500" />
                          <span>照片圖庫 (手機)</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  
                  <Input placeholder="輸入訊息..." value={messageText} onChange={(e) => setMessageText(e.target.value)} className="flex-1 h-11 rounded-full bg-neutral-100 border-transparent text-sm px-4" />
                  
                  <Button type="submit" size="icon" className={`rounded-full h-11 w-11 shadow-sm ${messageText.trim() || pendingProduct || pendingImage ? 'bg-[#333] text-white' : 'bg-neutral-200 text-neutral-400'}`}>
                    <Send className="w-4 h-4 ml-0.5" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}