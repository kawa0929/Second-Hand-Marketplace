import { Search, TrendingUp, Heart, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { LoginPromptDialog } from "./LoginPromptDialog";
import { useState, useEffect } from "react";
import { toast } from "sonner"; // 🌟 引入 toast

interface HomePageProps {
  onNavigate: (page: string, productId?: string, searchQuery?: string) => void;
  isLoggedIn?: boolean;
}

const categories = [
  { id: "electronics", name: "電子產品" },
  { id: "furniture", name: "家具" },
  { id: "fashion", name: "服飾配件" },
  { id: "sports", name: "運動用品" },
  { id: "books", name: "書籍" },
  { id: "toys", name: "玩具" },
  { id: "plants", name: "居家園藝" },
  { id: "kitchen", name: "廚房用品" },
  { id: "idol", name: "偶像周邊" },
  { id: "other", name: "其他" },
];

export function HomePage({ onNavigate, isLoggedIn }: HomePageProps) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch('http://localhost:3001/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) setLatestProducts(data.products);
      })
      .catch(err => console.error("獲取商品失敗:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('products', undefined, searchQuery.trim());
    }
  };

  const handleLoginConfirm = () => {
    setShowLoginPrompt(false);
    onNavigate('login');
  };

  // 🌟 核心修改：智慧點擊處理邏輯
  const handleProductClick = (product: any) => {
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    if (product.status === "已下架") {
      // 1. 如果是賣家本人點擊自己的下架商品
      if (currentUser && currentUser.email === product.sellerEmail) {
        toast.info("此商品目前為下架狀態，已為您導向編輯頁面。");
        onNavigate('edit-product', product.id);
      }
      // 2. 如果是其他使用者點擊
      else {
        toast.error("此商品目前已下架，無法查看詳情喔！", {
          style: { background: '#4b5563', color: '#fff', border: 'none' } // 深灰色提示
        });
      }
    } else {
      // 一般上架中的商品正常跳轉
      onNavigate('product-detail', product.id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight">輕鬆買賣二手好物</h1>
            <p className="mt-4 text-muted-foreground text-lg">
              探索社群中的優質二手商品，享受超值好價格
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex gap-2 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="搜尋商品關鍵字..."
                  className="pl-12 h-12 rounded-full border-0 shadow-md bg-white text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="rounded-full px-8 shadow-md"
              >
                搜尋
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">瀏覽分類</h2>
        </div>
        <div className="flex flex-nowrap gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="flex-shrink-0 w-40 cursor-pointer hover:shadow-md transition-all rounded-2xl border-border bg-white"
              onClick={() => onNavigate('products')}
            >
              <CardContent className="p-6 text-center">
                <div className="font-medium">{category.name}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">最新上架</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">載入商品中...</div>
        ) : latestProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">目前還沒有人刊登商品喔</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProducts.map((product) => (
              <Card
                key={product.id}
                className={`group cursor-pointer hover:shadow-lg transition-all rounded-2xl border-border overflow-hidden bg-white ${product.status === '已下架' ? 'opacity-80' : ''}`}
                onClick={() => handleProductClick(product)} // 🌟 使用新的點擊函式
              >
                <div className="relative aspect-square overflow-hidden bg-neutral-100">
                  <ImageWithFallback
                    src={product.images?.[0] || ""}
                    alt={product.title}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${product.status === '已下架' ? 'grayscale' : ''}`}
                  />

                  {/* 🌟 狀態標籤與遮罩圖示 */}
                  <div className="absolute top-3 left-3">
                    {product.status === '已下架' && (
                      <Badge variant="outline" className="bg-neutral-200/90 text-neutral-600 border-none rounded-full">已下架</Badge>
                    )}
                  </div>

                  {product.status === '已下架' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                      <AlertCircle className="w-10 h-10 text-white/70" />
                    </div>
                  )}

                  <button
                    className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <CardContent className="p-4">
                  <div className={`mb-1 font-medium truncate ${product.status === '已下架' ? 'text-neutral-400 line-through' : ''}`}>
                    {product.title}
                  </div>
                  <div className={`mb-3 font-bold text-lg ${product.status === '已下架' ? 'text-neutral-400' : 'text-primary'}`}>
                    NT${Number(product.price).toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="rounded-full text-[10px]">
                      {product.condition === 'new' ? '全新' : '二手'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-sm text-muted-foreground">
            © 二手好物管理平台
          </p>
        </div>
      </footer>

      <LoginPromptDialog
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        onConfirm={handleLoginConfirm}
      />
    </div>
  );
}