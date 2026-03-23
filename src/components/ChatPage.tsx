import { Search, Send, MoreVertical, Phone, Video, Image, Paperclip } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ChatPageProps {
  onNavigate: (page: string) => void;
}

const conversations = [
  {
    id: "1",
    name: "陳佳玲",
    lastMessage: "這個還有在賣嗎？",
    time: "2 分鐘前",
    unread: 2,
    avatar: "陳",
    product: "復古實木椅",
    productImage: "https://images.unsplash.com/photo-1759643161985-5fcb6dfc9a13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZnVybml0dXJlJTIwY2hhaXJ8ZW58MXx8fHwxNzYyODY0NDA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "2",
    name: "李志明",
    lastMessage: "謝謝你的快速回覆！",
    time: "1 小時前",
    unread: 0,
    avatar: "李",
    product: "復古相機組",
    productImage: "https://images.unsplash.com/photo-1530519507795-42213b27dabf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWNvbmRoYW5kJTIwY2FtZXJhfGVufDF8fHx8MTc2Mjg2OTY5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "3",
    name: "黃美惠",
    lastMessage: "我們可以明天見面嗎？",
    time: "3 小時前",
    unread: 0,
    avatar: "黃",
    product: "登山自行車",
    productImage: "https://images.unsplash.com/photo-1652640867694-afdac071d881?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWN5Y2xlJTIwb3V0ZG9vcnxlbnwxfHx8fDE3NjI4Mzk3MjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "4",
    name: "張大衛",
    lastMessage: "太好了，我要買！",
    time: "1 天前",
    unread: 0,
    avatar: "張",
    product: "Dell XPS 筆電",
    productImage: "https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBkZXNrfGVufDF8fHx8MTc2Mjc4MzEyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

const messages = [
  {
    id: "1",
    sender: "them",
    text: "你好！我對這張復古實木椅很有興趣，請問還有在賣嗎？",
    time: "上午 10:30",
  },
  {
    id: "2",
    sender: "me",
    text: "你好！還有在賣喔！想了解更多資訊嗎？",
    time: "上午 10:32",
  },
  {
    id: "3",
    sender: "them",
    text: "狀況如何？有沒有刮痕？",
    time: "上午 10:33",
  },
  {
    id: "4",
    sender: "me",
    text: "狀況非常好！只有一些輕微使用痕跡。如果你需要的話，我可以傳更多照片給你。",
    time: "上午 10:35",
  },
  {
    id: "5",
    sender: "them",
    text: "那太好了，謝謝！另外，你願意在台北市區面交嗎？",
    time: "上午 10:36",
  },
  {
    id: "6",
    sender: "me",
    text: "當然可以！這個週末有空，我可以配合你的時間。",
    time: "上午 10:38",
  },
];

export function ChatPage({ onNavigate }: ChatPageProps) {
  const [selectedChat, setSelectedChat] = useState(conversations[0]);
  const [messageText, setMessageText] = useState("");

  return (
    <div className="h-[calc(100vh-64px)] bg-neutral-50">
      <div className="h-full max-w-7xl mx-auto flex">
        {/* Conversations List */}
        <div className="w-full md:w-96 bg-white border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="mb-4">訊息</h2>
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
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv)}
                  className={`w-full p-4 flex gap-3 hover:bg-neutral-50 transition-colors ${
                    selectedChat.id === conv.id ? 'bg-neutral-50' : ''
                  }`}
                >
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage src="" />
                    <AvatarFallback>{conv.avatar}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-start justify-between mb-1">
                      <span className="truncate">{conv.name}</span>
                      <span className="text-muted-foreground flex-shrink-0 ml-2">{conv.time}</span>
                    </div>
                    <p className="text-muted-foreground truncate">{conv.lastMessage}</p>
                    <div className="text-muted-foreground mt-1">
                      關於：{conv.product}
                    </div>
                  </div>
                  
                  {conv.unread > 0 && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground flex-shrink-0">
                      {conv.unread}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white hidden md:flex">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="" />
                <AvatarFallback>{selectedChat.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <div>{selectedChat.name}</div>
                <div className="text-muted-foreground">目前上線</div>
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

          {/* Product Context */}
          <Card className="m-4 rounded-2xl border-border overflow-hidden">
            <div className="flex gap-3 p-3 cursor-pointer hover:bg-neutral-50 transition-colors">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                <ImageWithFallback
                  src={selectedChat.productImage}
                  alt={selectedChat.product}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-1">{selectedChat.product}</div>
                <div className="text-muted-foreground">查看商品</div>
              </div>
              <Button variant="ghost" size="sm" className="rounded-full">
                查看
              </Button>
            </div>
          </Card>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${message.sender === 'me' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        message.sender === 'me'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-neutral-100'
                      }`}
                    >
                      {message.text}
                    </div>
                    <div className="text-muted-foreground mt-1 px-2">
                      {message.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
                <Image className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                placeholder="輸入訊息..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 h-11 rounded-full bg-input-background border-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    setMessageText("");
                  }
                }}
              />
              <Button size="icon" className="rounded-full flex-shrink-0">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
