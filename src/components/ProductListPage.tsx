import { Search, Filter, Heart, SlidersHorizontal, AlertCircle } from "lucide-react"; // 🌟 引入 AlertCircle
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { toast } from "sonner"; // 🌟 引入 toast

interface ProductListPageProps {
  onNavigate: (page: string, productId?: string) => void;
  initialSearch?: string;
}

const categoryMap: Record<string, string> = {
  electronics: "電子產品",
  fashion: "服飾配件",
  furniture: "家具",
  sports: "運動用品",
  books: "書籍",
  toys: "玩具",
  plants: "居家園藝",
  kitchen: "廚房用品",
  idol: "偶像周邊",
  other: "其他",
};

const conditionMap: Record<string, string> = {
  new: "全新",
  "like-new": "近全新",
  excellent: "極佳",
  good: "良好",
  fair: "尚可",
};

export function ProductListPage({ onNavigate, initialSearch = "" }: ProductListPageProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState(initialSearch);

  const fetchProducts = async (keyword: string) => {
    setIsLoading(true);
    try {
      const url = keyword
        ? `http://localhost:3001/api/products?search=${encodeURIComponent(keyword)}`
        : `http://localhost:3001/api/products`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("獲取商品失敗:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSearchQuery(initialSearch);
    setAppliedSearch(initialSearch);
    fetchProducts(initialSearch);
  }, [initialSearch]);

  const handleLocalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchQuery.trim());
    fetchProducts(searchQuery.trim());
  };

  // 🌟 核心修改：智慧點擊處理邏輯 (跟首頁一致)
  const handleProductClick = (product: any) => {
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    if (product.status === "已下架") {
      if (currentUser && currentUser.email === product.sellerEmail) {
        toast.info("此商品目前為下架狀態，已為您導向編輯頁面。");
        onNavigate('edit-product', product.id);
      } else {
        toast.error("此商品目前已下架，無法查看詳情喔！", {
          style: { background: '#4b5563', color: '#fff', border: 'none' }
        });
      }
    } else {
      onNavigate('product-detail', product.id);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">瀏覽商品</h1>
          <p className="text-muted-foreground mt-2">
            探索數千件優質二手商品
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleLocalSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                placeholder="搜尋商品..."
                className="w-full pl-10 h-11 rounded-xl bg-neutral-50 border-0 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px] h-11 rounded-xl bg-neutral-50 border-0">
                  <SelectValue placeholder="分類" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分類</SelectItem>
                  <SelectItem value="electronics">電子產品</SelectItem>
                  <SelectItem value="furniture">家具</SelectItem>
                  <SelectItem value="fashion">服飾配件</SelectItem>
                  <SelectItem value="sports">運動用品</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="recent">
                <SelectTrigger className="w-[160px] h-11 rounded-xl bg-neutral-50 border-0">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">最新上架</SelectItem>
                  <SelectItem value="price-low">價格：低到高</SelectItem>
                  <SelectItem value="price-high">價格：高到低</SelectItem>
                  <SelectItem value="popular">最熱門</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground font-medium">
            {appliedSearch ? `"${appliedSearch}" 的搜尋結果` : "所有商品"}
            <span className="ml-2 text-sm bg-neutral-200 px-2 py-1 rounded-full text-neutral-700">共 {products.length} 件</span>
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">搜尋中...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">找不到符合的商品，換個關鍵字試試看吧！</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className={`group cursor-pointer hover:shadow-lg transition-all rounded-2xl border-border overflow-hidden bg-white ${product.status === '已下架' ? 'opacity-80' : ''}`}
                onClick={() => handleProductClick(product)} // 🌟 套用智慧點擊
              >
                <div className="relative aspect-square overflow-hidden bg-neutral-100">
                  {/* 🌟 下架反灰效果 */}
                  <ImageWithFallback
                    src={product.images?.[0] || ""}
                    alt={product.title}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${product.status === '已下架' ? 'grayscale' : ''}`}
                  />

                  {/* 🌟 狀態標籤與 Alert 圖示 */}
                  <div className="absolute top-3 left-3">
                    <Badge variant={product.status === '已下架' ? 'outline' : 'secondary'} className={`rounded-full shadow-sm ${product.status === '已下架' ? 'bg-neutral-200 text-neutral-500 border-none' : ''}`}>
                      {product.status === '已下架' ? '已下架' : (categoryMap[product.category] || "其他")}
                    </Badge>
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
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {conditionMap[product.condition] || "二手"}
                    </Badge>
                    <span className="text-muted-foreground truncate max-w-[100px]">
                      {product.location || ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {!isLoading && products.length >= 8 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="rounded-full">
              載入更多商品
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}