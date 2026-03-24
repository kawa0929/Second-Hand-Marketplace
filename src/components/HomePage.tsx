import { Search, TrendingUp, Clock, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { LoginPromptDialog } from "./LoginPromptDialog";
import { useState } from "react";

interface HomePageProps {
  onNavigate: (page: string, productId?: string) => void;
  isLoggedIn?: boolean;
}

const categories = [
  { name: "電子產品", count: 234 },
  { name: "家具", count: 156 },
  { name: "服飾配件", count: 432 },
  { name: "書籍", count: 289 },
  { name: "運動用品", count: 178 },
  { name: "居家園藝", count: 345 },
];

const featuredProducts = [
  {
    id: "1",
    title: "復古實木椅",
    price: "NT$2,550",
    image: "https://images.unsplash.com/photo-1759643161985-5fcb6dfc9a13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZnVybml0dXJlJTIwY2hhaXJ8ZW58MXx8fHwxNzYyODY0NDA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    condition: "近全新",
    location: "台北市",
  },
  {
    id: "2",
    title: "經典底片相機",
    price: "NT$4,350",
    image: "https://images.unsplash.com/photo-1495121553079-4c61bcce1894?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2FtZXJhfGVufDF8fHx8MTc2MjgxOTk3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    condition: "良好",
    location: "新北市",
  },
  {
    id: "3",
    title: "登山自行車",
    price: "NT$9,600",
    image: "https://images.unsplash.com/photo-1652640867694-afdac071d881?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWN5Y2xlJTIwb3V0ZG9vcnxlbnwxfHx8fDE3NjI4Mzk3MjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    condition: "極佳",
    location: "台中市",
  },
  {
    id: "4",
    title: "Dell XPS 筆電",
    price: "NT$19,500",
    image: "https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBkZXNrfGVufDF8fHx8MTc2Mjc4MzEyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    condition: "良好",
    location: "高雄市",
  },
];

export function HomePage({ onNavigate, isLoggedIn }: HomePageProps) {
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
    /* 1. 刪除了 bg-neutral-50，讓整體背景透出 CSS 的薰衣草紫 */
    <div className="min-h-screen">
      {/* Hero Section */}
      {/* 2. 刪除了 bg-white，讓搜尋區域背景變透明 */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1>輕鬆買賣二手好物</h1>
            <p className="mt-4 text-muted-foreground">
              探索社群中的優質二手商品，享受超值好價格
            </p>
            
            <div className="mt-8 flex gap-2 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                {/* 3. 刪除了 bg-input-background */}
                <Input 
                  placeholder="搜尋商品..." 
                  className="pl-10 h-12 rounded-full border-0 shadow-sm"
                />
              </div>
              <Button 
                size="lg" 
                className="rounded-full px-8"
                onClick={() => onNavigate('products')}
              >
                搜尋
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2>瀏覽分類</h2>
          <Button variant="ghost" size="sm" className="rounded-full">
            查看全部
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Card 
              key={category.name}
              /* 這裡保留 Card 的背景色由 CSS 變數 --card 控制 */
              className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl border-border"
              onClick={() => onNavigate('products')}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-2 font-medium">{category.name}</div>
                <div className="text-muted-foreground text-sm">{category.count} 件商品</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5" />
          <h2>精選商品</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Card 
              key={product.id}
              className="group cursor-pointer hover:shadow-lg transition-all rounded-2xl border-border overflow-hidden"
              onClick={() => onNavigate('product-detail', product.id)}
            >
              <div className="relative aspect-square overflow-hidden bg-neutral-100">
                <ImageWithFallback
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <CardContent className="p-4">
                <div className="mb-1 font-medium">{product.title}</div>
                <div className="mb-3 text-primary font-bold">{product.price}</div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <Badge variant="secondary" className="rounded-full">
                    {product.condition}
                  </Badge>
                  <span className="text-muted-foreground">{product.location}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full"
            onClick={() => onNavigate('products')}
          >
            查看全部商品
          </Button>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5" />
          <h2>最新上架</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredProducts.slice(0, 3).map((product) => (
            <Card 
              key={`recent-${product.id}`}
              className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl border-border overflow-hidden"
              onClick={() => onNavigate('product-detail', product.id)}
            >
              <div className="flex gap-4 p-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 font-medium truncate">{product.title}</div>
                  <div className="mb-2 text-primary font-bold">{product.price}</div>
                  <div className="text-muted-foreground text-sm">{product.location}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {/* 4. 刪除了 bg-white */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2>立即開始販售</h2>
            <p className="mt-4 text-muted-foreground">
              加入成千上萬的賣家行列，將閒置物品變現金
            </p>
            <Button 
              size="lg" 
              className="mt-6 rounded-full px-8"
              onClick={handlePostClick}
            >
              刊登商品
            </Button>
          </div>
        </div>
      </section>

      {/* Login Prompt Dialog */}
      <LoginPromptDialog
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        onConfirm={handleLoginConfirm}
      />
    </div>
  );
}