import { Search, Send, MoreVertical, Phone, Video, Image as ImageIcon, Paperclip } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { useState, useEffect, useRef } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ChatPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export function ChatPage({ onNavigate }: ChatPageProps) {
  const [chatList, setChatList] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  
  // ✅ 新增：用來存放「還沒按發送」的預覽商品卡片
  const [pendingProduct, setPendingProduct] = useState<any>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : { email: 'guest@example.com' };
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, pendingProduct]); // 加入 pendingProduct 讓預覽卡片出現時也會捲動

  // 1. 初始化列表與處理跳轉
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
      } else {
        targetChat = {
          id: pendingChat.id,
          name: pendingChat.name,
          avatar: pendingChat.avatar,
          email: pendingChat.email,
          lastMessage: `準備詢問：${pendingChat.product}`,
          time: "剛剛",
          unread: 0
        };
      }

      savedChats.unshift(targetChat);
      setChatList(savedChats);
      setSelectedChat(targetChat);

      // ✅ 將商品設為「待發送預覽」，而不直接存入 messages
      setPendingProduct({
        productId: pendingChat.productId,
        productName: pendingChat.product,
        productImage: pendingChat.productImage
      });

      localStorage.removeItem('pendingChatContext');

    } else {
      setChatList(savedChats);
      if (savedChats.length > 0) {
        setSelectedChat(savedChats[0]);
      }
    }
  }, []);

  // 2. 載入該房間的對話紀錄
  useEffect(() => {
    if (!selectedChat) return;

    const currentUser = getCurrentUser();
    const roomKey = `messages_${currentUser.email}_${selectedChat.id}`;
    let roomMessages = JSON.parse(localStorage.getItem(roomKey) || '[]');

    setMessages(roomMessages);
  }, [selectedChat]);

  // 3. 發送訊息 (這時候才真正把商品卡片寫入紀錄)
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;

    const currentUser = getCurrentUser();
    const roomKey = `messages_${currentUser.email}_${selectedChat.id}`;
    const listStorageKey = `chatList_${currentUser.email}`;

    let newMessages = [...messages];

    // ✅ 如果有「待發送預覽商品」，在發文字前，先把它轉成正式訊息存進去
    if (pendingProduct) {
      newMessages.push({
        id: `prod_${Date.now()}`,
        type: "product",
        sender: "system",
        productId: pendingProduct.productId,
        productName: pendingProduct.productName,
        productImage: pendingProduct.productImage,
        time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      });
      setPendingProduct(null); // 存完就清空預覽
    }

    // ✅ 接著推入使用者輸入的文字
    const textMsg = {
      id: Date.now().toString(),
      type: "text",
      sender: "me",
      text: messageText,
      time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
    };
    newMessages.push(textMsg);

    setMessages(newMessages);
    localStorage.setItem(roomKey, JSON.stringify(newMessages));
    setMessageText("");

    setChatList(prevList => {
      const updatedList = [...prevList];
      const chatIndex = updatedList.findIndex(c => c.id === selectedChat.id);
      if (chatIndex !== -1) {
        const [chat] = updatedList.splice(chatIndex, 1);
        chat.lastMessage = messageText; // 左側列表顯示文字預覽
        chat.time = textMsg.time;
        updatedList.unshift(chat);
      }
      localStorage.setItem(listStorageKey, JSON.stringify(updatedList)); 
      return updatedList;
    });

    try {
      await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: currentUser.email,
          receiverEmail: selectedChat.email,
          text: messageText,
          type: "text"
        })
      });
    } catch (error) {
      // API 錯誤忽略
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-neutral-50">
      <div className="h-full max-w-7xl mx-auto flex overflow-hidden">
        
        {/* 左側對話列表 */}
        <div className="w-full md:w-96 bg-white border-r border-border flex flex-col h-full">
          <div className="p-4 border-b border-border shrink-0">
            <h2 className="mb-4 font-bold text-xl">訊息</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="搜尋對話..." 
                className="pl-10 h-10 rounded-xl bg-input-background border-0"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="divide-y divide-border">
              {chatList.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">目前沒有任何對話</div>
              ) : (
                chatList.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedChat(conv);
                      setPendingProduct(null); // ✅ 如果手動切換聯絡人，就清空前一個人的商品預覽
                    }}
                    className={`w-full p-4 flex gap-3 hover:bg-neutral-50 transition-colors ${
                      selectedChat?.id === conv.id ? 'bg-neutral-50' : ''
                    }`}
                  >
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage src={conv.avatar && (conv.avatar.startsWith('http') || conv.avatar.startsWith('data:')) ? conv.avatar : ""} />
                      <AvatarFallback>{conv.name?.charAt(0) || '匿'}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-start justify-between mb-1">
                        <span className="truncate font-medium">{conv.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{conv.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* 右側聊天視窗 */}
        <div className="flex-1 flex flex-col bg-white hidden md:flex h-full overflow-hidden">
          {!selectedChat ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
              <ImageIcon className="w-16 h-16 opacity-20" />
              <p>請從左側選擇一個對話，或從商品頁點擊「聊聊」發起新對話</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between shadow-sm z-10 bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedChat.avatar && (selectedChat.avatar.startsWith('http') || selectedChat.avatar.startsWith('data:')) ? selectedChat.avatar : ""} />
                    <AvatarFallback>{selectedChat.name?.charAt(0) || '匿'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedChat.name}</div>
                    <div className="text-xs text-muted-foreground">目前上線</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* 聊天內容區 */}
              <div className="flex-1 overflow-y-auto p-4 bg-[#F8F9FA]" ref={scrollAreaRef}>
                <div className="space-y-4">
                  
                  {/* 正式的歷史訊息 */}
                  {messages.map((message) => {
                    if (message.type === 'product') {
                      return (
                        <div key={message.id} className="flex justify-center my-6">
                          <Card className="w-[400px] max-w-full rounded-2xl border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 p-3 bg-white">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                                <ImageWithFallback
                                  src={message.productImage || "https://via.placeholder.com/150"}
                                  alt={message.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm line-clamp-2 leading-snug mb-1">{message.productName}</div>
                                <div className="text-xs text-muted-foreground">正在討論此商品</div>
                              </div>
                              <Button variant="secondary" size="sm" className="rounded-full text-xs font-medium px-4" onClick={() => onNavigate('product-detail', message.productId)}>
                                查看
                              </Button>
                            </div>
                          </Card>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${message.sender === 'me' ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                              message.sender === 'me'
                                ? 'bg-[#1e1e1e] text-white rounded-tr-sm'
                                : 'bg-white border border-neutral-100 rounded-tl-sm text-neutral-800'
                            }`}
                          >
                            {message.text}
                          </div>
                          <div className={`text-[11px] text-neutral-400 mt-1 px-1 ${message.sender === 'me' ? 'text-right' : 'text-left'}`}>
                            {message.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* ✅ 草稿狀態：等待發送的商品卡片 */}
                  {pendingProduct && (
                    <div className="flex justify-center my-6 opacity-90 animate-in fade-in slide-in-from-bottom-2">
                      <Card className="w-[400px] max-w-full rounded-2xl border-2 border-primary/20 overflow-hidden shadow-sm bg-blue-50/50">
                        <div className="flex items-center gap-3 p-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                            <ImageWithFallback
                              src={pendingProduct.productImage || "https://via.placeholder.com/150"}
                              alt={pendingProduct.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm line-clamp-2 leading-snug mb-1">{pendingProduct.productName}</div>
                            <div className="text-xs text-primary font-medium">✨ 發送訊息後將一併傳送此商品</div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {messages.length === 0 && !pendingProduct && (
                    <div className="flex h-full items-center justify-center text-muted-foreground mt-20">
                      <div className="bg-neutral-200/50 px-6 py-2 rounded-full text-sm">開啟新對話</div>
                    </div>
                  )}

                </div>
              </div>

              {/* 底部輸入框 */}
              <div className="p-4 border-t border-border bg-white shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)] z-10 shrink-0">
                <div className="flex gap-2 items-center">
                  <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100">
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Input
                    placeholder="輸入訊息..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 h-11 rounded-full bg-neutral-100 border-transparent focus-visible:ring-1 focus-visible:ring-primary/50 text-sm px-4"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} size="icon" className="rounded-full flex-shrink-0 h-11 w-11 shadow-sm bg-[#1e1e1e] hover:bg-black text-white">
                    <Send className="w-4 h-4 ml-0.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}