import { Search, Heart, ChevronLeft, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ProductListPageProps {
  onNavigate: (page: string, productId?: string, searchQuery?: string) => void;
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

const conditionConfig: Record<string, { label: string; color: string }> = {
  "new": { label: "全新", color: "bg-emerald-100 text-emerald-700" },
  "like-new": { label: "近全新", color: "bg-blue-100 text-blue-700" },
  "excellent": { label: "極佳", color: "bg-indigo-100 text-indigo-700" },
  "good": { label: "良好", color: "bg-amber-100 text-amber-700" },
  "fair": { label: "尚可", color: "bg-stone-200 text-stone-700" },
};

export function ProductListPage({ onNavigate, initialSearch = "" }: ProductListPageProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 核心修正：判斷 initialSearch 到底是一般搜尋關鍵字，還是分類的 ID
  const isCategory = Object.keys(categoryMap).includes(initialSearch);

  const [searchQuery, setSearchQuery] = useState(isCategory ? "" : initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(isCategory ? initialSearch : "all");
  const [sortOrder, setSortOrder] = useState("recent");

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let url = `http://localhost:3001/api/products?`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      if (categoryFilter !== "all") url += `category=${categoryFilter}&`;
      url += `sort=${sortOrder}`;

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

  const fetchUserFavorites = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    try {
      const res = await fetch(`http://localhost:3001/api/favorites/${user.email}`);
      const data = await res.json();
      if (data.success) {
        setUserFavorites(data.favorites.map((f: any) => f.id));
      }
    } catch (e) {
      console.error("載入收藏清單失敗", e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUserFavorites();
  }, [categoryFilter, sortOrder, searchQuery]);

  // 🌟 新增：當從其他頁面（如首頁）重新傳入 initialSearch 時，更新狀態
  useEffect(() => {
    const isCat = Object.keys(categoryMap).includes(initialSearch);
    if (isCat) {
      setCategoryFilter(initialSearch);
      setSearchQuery("");
    } else {
      setSearchQuery(initialSearch);
      setCategoryFilter("all");
    }
  }, [initialSearch]);

  const handleLocalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleToggleFavorite = async (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error("請先登入才能收藏喔！");
      return;
    }
    const user = JSON.parse(userStr);

    if (product.status === '已下架') {
      toast.error("此商品已下架，無法加入收藏喔！");
      return;
    }

    if (user.email === product.sellerEmail) {
      toast.error("這是您自己刊登的商品，不需要收藏啦！");
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, productId: product.id })
      });
      const data = await res.json();
      if (data.success) {
        if (data.isFavorite) {
          setUserFavorites(prev => [...prev, product.id]);
          toast.success("已收藏 ❤️");
        } else {
          setUserFavorites(prev => prev.filter(id => id !== product.id));
          toast.success("已取消收藏");
        }
      }
    } catch (e) {
      toast.error("收藏操作失敗");
    }
  };

  const handleProductClick = (product: any) => {
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    if (product.status === "已下架") {
      if (currentUser && currentUser.email === product.sellerEmail) {
        onNavigate('edit-product', product.id);
      } else {
        toast.error("此商品目前已下架");
      }
    } else {
      onNavigate('product-detail', product.id);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Button variant="ghost" onClick={() => onNavigate('home')} className="mb-6 rounded-full -ml-2 hover:bg-neutral-200">
          <ChevronLeft className="w-4 h-4 mr-2" /> 返回首頁
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">瀏覽商品</h1>
          <p className="text-muted-foreground mt-2">探索數千件優質二手商品</p>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-6 border border-border shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleLocalSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                placeholder="搜尋商品關鍵字..."
                className="w-full pl-10 h-11 rounded-xl bg-neutral-50 border-0 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] h-11 rounded-xl bg-neutral-50 border-0">
                  <SelectValue placeholder="分類" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分類</SelectItem>
                  {Object.entries(categoryMap).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[160px] h-11 rounded-xl bg-neutral-50 border-0">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">最新上架</SelectItem>
                  <SelectItem value="price-low">價格：低到高</SelectItem>
                  <SelectItem value="price-high">價格：高到低</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground font-medium">
            {searchQuery 
              ? `"${searchQuery}" 的搜尋結果` 
              : categoryFilter !== "all" 
                ? `${categoryMap[categoryFilter]} 的商品` 
                : "所有商品"}
            <span className="ml-2 text-sm bg-neutral-200 px-2 py-1 rounded-full text-neutral-700">共 {products.length} 件</span>
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-32 flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary/40 mb-4" />
            <p className="text-muted-foreground">正在載入商品...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">找不到符合的商品，換個分類或關鍵字試試看吧！</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const conditionData = conditionConfig[product.condition] || { label: "未知", color: "bg-neutral-100 text-neutral-600" };

              return (
                <Card
                  key={product.id}
                  className={`group cursor-pointer hover:shadow-lg transition-all rounded-2xl border-border overflow-hidden bg-white ${product.status === '已下架' ? 'opacity-80' : ''}`}
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative aspect-square overflow-hidden bg-neutral-100">
                    <ImageWithFallback
                      src={product.images?.[0] || ""}
                      alt={product.title}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${product.status === '已下架' ? 'grayscale' : ''}`}
                    />

                    <button
                      className={`absolute top-3 right-3 w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-sm ${userFavorites.includes(product.id)
                        ? 'bg-red-50 text-red-500'
                        : 'bg-white/80 hover:bg-white text-neutral-600'
                        }`}
                      onClick={(e) => handleToggleFavorite(e, product)}
                    >
                      <Heart className={`w-4 h-4 ${userFavorites.includes(product.id) ? 'fill-current' : ''}`} />
                    </button>

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
                  </div>
                  <CardContent className="p-4">
                    <div className={`mb-1 font-medium truncate ${product.status === '已下架' ? 'text-neutral-400 line-through' : ''}`}>
                      {product.title}
                    </div>
                    <div className={`mb-3 font-bold text-lg ${product.status === '已下架' ? 'text-neutral-400' : 'text-primary'}`}>
                      NT${Number(product.price).toLocaleString()}
                    </div>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <Badge className={`rounded-full text-[10px] font-medium border-none shadow-none hover:opacity-80 ${conditionData.color}`}>
                        {conditionData.label}
                      </Badge>
                      <span className="text-muted-foreground truncate max-w-[100px]">
                        {product.location || ""}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && products.length >= 20 && (
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