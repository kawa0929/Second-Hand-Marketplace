import { Search, Heart, ChevronLeft, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, Variants } from "framer-motion";

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

const conditionConfig: Record<string, { label: string; colorClass: string }> = {
  "new": { label: "全新", colorClass: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
  "like-new": { label: "近全新", colorClass: "bg-blue-50 text-blue-600 border border-blue-100" },
  "excellent": { label: "極佳", colorClass: "bg-indigo-50 text-indigo-600 border border-indigo-100" },
  "good": { label: "良好", colorClass: "bg-amber-50 text-amber-600 border border-amber-100" },
  "fair": { label: "尚可", colorClass: "bg-stone-100 text-stone-500 border border-stone-100" },
};

// ── Animation variants — mirrors HomePage exactly ────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] } },
};

// ────────────────────────────────────────────────────────────────────────────

export function ProductListPage({ onNavigate, initialSearch = "" }: ProductListPageProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.error("獲取商品失敗:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserFavorites = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    try {
      const res = await fetch(`http://localhost:3001/api/favorites/${user.email}`);
      const data = await res.json();
      if (data.success) setUserFavorites(data.favorites.map((f: any) => f.id));
    } catch (e) { console.error("載入收藏清單失敗", e); }
  };

  useEffect(() => { fetchProducts(); fetchUserFavorites(); }, [categoryFilter, sortOrder, searchQuery]);

  useEffect(() => {
    const isCat = Object.keys(categoryMap).includes(initialSearch);
    if (isCat) { setCategoryFilter(initialSearch); setSearchQuery(""); }
    else { setSearchQuery(initialSearch); setCategoryFilter("all"); }
  }, [initialSearch]);

  const handleLocalSearch = (e: React.FormEvent) => { e.preventDefault(); fetchProducts(); };

  const handleToggleFavorite = async (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    const userStr = localStorage.getItem("user");
    if (!userStr) { toast.error("請先登入才能收藏喔！"); return; }
    const user = JSON.parse(userStr);
    if (product.status === "已下架") { toast.error("此商品已下架，無法加入收藏喔！"); return; }
    if (user.email === product.sellerEmail) { toast.error("這是您自己刊登的商品，不需要收藏啦！"); return; }
    try {
      const res = await fetch("http://localhost:3001/api/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, productId: product.id }),
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
    } catch { toast.error("收藏操作失敗"); }
  };

  const handleProductClick = (product: any) => {
    const userStr = localStorage.getItem("user");
    const currentUser = userStr ? JSON.parse(userStr) : null;
    if (product.status === "已下架") {
      currentUser?.email === product.sellerEmail
        ? onNavigate("edit-product", product.id)
        : toast.error("此商品目前已下架");
    } else {
      onNavigate("product-detail", product.id);
    }
  };

  const resultLabel = searchQuery
    ? `「${searchQuery}」的搜尋結果`
    : categoryFilter !== "all"
      ? `${categoryMap[categoryFilter]}`
      : "所有商品";

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-10 py-10">

        {/* ── Back link — FIXED: "BACK" route + "返回" label ── */}
        <motion.button
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          onClick={() => onNavigate("BACK")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors duration-200 mb-10 -ml-1"
        >
          <ChevronLeft className="w-4 h-4" />
          返回
        </motion.button>

        {/* ── Page heading ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">瀏覽商品</h1>
          <p className="text-gray-400 mt-2 text-sm">探索優質二手好物，找到屬於你的寶物</p>
        </motion.div>

        {/* ── Search + Filters ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row gap-3 mb-6"
        >
          <form onSubmit={handleLocalSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              placeholder="搜尋商品關鍵字..."
              className="w-full pl-11 pr-4 h-11 text-sm bg-gray-50 border border-gray-200 rounded-full text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all duration-200"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-44 h-11 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-700 focus:ring-2 focus:ring-gray-300 px-4">
              <SelectValue placeholder="分類" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-gray-100 shadow-lg">
              <SelectItem value="all">全部分類</SelectItem>
              {Object.entries(categoryMap).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full md:w-44 h-11 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-700 focus:ring-2 focus:ring-gray-300 px-4">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-gray-100 shadow-lg">
              <SelectItem value="recent">最新上架</SelectItem>
              <SelectItem value="price-low">價格：低到高</SelectItem>
              <SelectItem value="price-high">價格：高到低</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* ── Result count label ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-3 mb-8"
        >
          <p className="text-sm font-medium text-gray-700">{resultLabel}</p>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            共 {products.length} 件
          </span>
        </motion.div>

        {/* ── Loading ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-gray-300">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">正在載入商品...</p>
          </div>

          /* ── Empty state ── */
        ) : products.length === 0 ? (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center py-40 text-gray-300 gap-3"
          >
            <p className="text-4xl">🔍</p>
            <p className="text-sm">找不到符合的商品，換個分類或關鍵字試試看吧！</p>
          </motion.div>

          /* ── Product grid ── */
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12"
          >
            {products.map(product => {
              const cond = conditionConfig[product.condition] ?? { label: "未知", colorClass: "bg-stone-100 text-stone-500 border border-stone-200" };
              const isFav = userFavorites.includes(product.id);
              const isDelisted = product.status === "已下架";

              return (
                <motion.div
                  key={product.id}
                  variants={cardVariant}
                  onClick={() => handleProductClick(product)}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                  className={`group cursor-pointer ${isDelisted ? "opacity-50" : ""}`}
                >
                  {/* ── Image card ── */}
                  <div className="relative aspect-square rounded-2xl bg-gray-50 overflow-hidden mb-4 group-hover:shadow-lg transition-shadow duration-300">
                    <ImageWithFallback
                      src={product.images?.[0] || ""}
                      alt={product.title}
                      className={`w-full h-full object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-105 ${isDelisted ? "grayscale" : ""}`}
                    />

                    {isDelisted && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-500 bg-white/80 px-3 py-1 rounded-full">
                          已下架
                        </span>
                      </div>
                    )}

                    <button
                      onClick={e => handleToggleFavorite(e, product)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200
                        ${isFav
                          ? "bg-red-50 text-red-400 opacity-100"
                          : "opacity-0 group-hover:opacity-100 bg-white/80 text-gray-400 hover:text-red-400"
                        }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  {/* ── Info below card ── */}
                  <div>
                    <p className={`text-sm font-medium text-gray-900 truncate mb-1 ${isDelisted ? "line-through text-gray-400" : ""}`}>
                      {product.title}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-gray-500">
                        NT${Number(product.price).toLocaleString()}
                      </p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cond.colorClass}`}>
                        {cond.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── Load more ── */}
        {!isLoading && products.length >= 20 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="mt-16 text-center"
          >
            <button className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 border border-gray-200 px-10 py-3.5 rounded-full hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300">
              載入更多商品
            </button>
          </motion.div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold tracking-widest text-gray-900 uppercase">二手好物市集</p>
          <p className="text-xs text-gray-400">© 2026 二手好物市集管理平台．All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}