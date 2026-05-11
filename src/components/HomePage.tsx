import {
  Search, Heart, ChevronRight, ArrowRight, MoveRight,
  Laptop, Sofa, Shirt, Dumbbell, BookOpen, Gamepad, Flower2, Disc3, Box,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { LoginPromptDialog } from "./LoginPromptDialog";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { motion, useScroll, useTransform, useSpring, Variants } from "framer-motion";


interface HomePageProps {
  onNavigate: (page: string, productId?: string, searchQuery?: string) => void;
  isLoggedIn?: boolean;
}

const categories = [
  { id: "electronics", name: "電子產品", bracketName: "[ 電子產品 ]", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80", Icon: Laptop },
  { id: "furniture", name: "家具", bracketName: "[ 家具 ]", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80", Icon: Sofa },
  { id: "fashion", name: "服飾配件", bracketName: "[ 服飾配件 ]", img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80", Icon: Shirt },
  { id: "sports", name: "運動用品", bracketName: "[ 運動用品 ]", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", Icon: Dumbbell },
  { id: "books", name: "書籍", bracketName: "[ 書籍 ]", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80", Icon: BookOpen },
  { id: "toys", name: "玩具", bracketName: "[ 玩具 ]", img: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&q=80", Icon: Gamepad },
  { id: "plants", name: "居家園藝", bracketName: "[ 居家園藝 ]", img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80", Icon: Flower2 },
  { id: "kitchen", name: "廚房用品", bracketName: "[ 廚房用品 ]", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80", Icon: Box },
  { id: "idol", name: "偶像周邊", bracketName: "[ 偶像周邊 ]", img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80", Icon: Disc3 },
  { id: "other", name: "其他", bracketName: "[ 其他 ]", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", Icon: Box },
];

const conditionConfig: Record<string, { label: string; colorClass: string }> = {
  "new": { label: "全新", colorClass: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
  "like-new": { label: "近全新", colorClass: "bg-blue-50 text-blue-600 border border-blue-100" },
  "excellent": { label: "極佳", colorClass: "bg-indigo-50 text-indigo-600 border border-indigo-100" },
  "good": { label: "良好", colorClass: "bg-amber-50 text-amber-600 border border-amber-100" },
  "fair": { label: "尚可", colorClass: "bg-stone-100 text-stone-500 border border-stone-100" },
};

// ── Shared animation variants ────────────────────────────────────────────────

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

// ── Hero headline — each line clips up independently ─────────────────────────
const lineVariant: Variants = {
  hidden: { opacity: 0, y: "110%" },
  visible: (i: number) => ({
    opacity: 1,
    y: "0%",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.12 },
  }),
};

export function HomePage({ onNavigate, isLoggedIn }: HomePageProps) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Parallax & Scroll setup ──────────────────────────────────────────────────
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();

  // 背景大圖的視差變數
  const rawParallax = useTransform(scrollY, [0, 600], ["0%", "22%"]);
  const parallaxY = useSpring(rawParallax, { stiffness: 80, damping: 20, mass: 0.5 });

  // ✨ 新增：文字的滾動連動變數 (往下滾動 0~300px 之間，透明度 1 -> 0，位置 0 -> 往下沉 50px)
  const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const textY = useTransform(scrollY, [0, 300], [0, 50]);

  useEffect(() => {
    fetch("http://localhost:3001/api/products")
      .then(r => r.json())
      .then(data => { if (data.success) setLatestProducts(data.products.slice(0, 8)); })
      .catch(err => console.error("獲取商品失敗:", err))
      .finally(() => setIsLoading(false));

    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      fetch(`http://localhost:3001/api/favorites/${user.email}`)
        .then(r => r.json())
        .then(data => { if (data.success) setUserFavorites(data.favorites.map((f: any) => f.id)); });
    }
  }, []);

  const handleToggleFavorite = async (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    const userStr = localStorage.getItem("user");
    if (!userStr) { setShowLoginPrompt(true); return; }
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
          toast.success("已加入收藏 ❤️");
        } else {
          setUserFavorites(prev => prev.filter(id => id !== product.id));
          toast.success("已取消收藏");
        }
      }
    } catch { toast.error("操作失敗，請檢查網路"); }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) onNavigate("products", undefined, searchQuery.trim());
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

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 antialiased overflow-x-hidden">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO — full-bleed with true parallax
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        ref={heroRef}
        className="relative w-full h-screen min-h-[600px] overflow-hidden -mt-[var(--nav-height,0px)]"
      >
        {/* Parallax image — moves slower than scroll */}
        <motion.img
          src="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1800&q=85"
          alt="hero background"
          style={{ y: parallaxY, scale: 1.15 }}
          className="absolute inset-0 w-full h-full object-cover object-center select-none origin-top"
          draggable={false}
        />

        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10 pointer-events-none" />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-8 sm:px-16 pb-14 flex flex-col sm:flex-row items-end justify-between gap-6">

          {/* ✨ 修改重點：將左側文字區塊用 style 綁定滾動變數 */}
          <motion.div style={{ opacity: textOpacity, y: textY }}>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="text-white/55 text-xs tracking-[0.25em] uppercase mb-4 font-medium"
            >
              二手好物市集
            </motion.p>

            {/* Headline lines — each clips up independently */}
            <div className="overflow-hidden mb-1">
              <motion.h1
                custom={0}
                variants={lineVariant}
                initial="hidden"
                animate="visible"
                className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight"
              >
                讓閒置物品，
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                custom={1}
                variants={lineVariant}
                initial="hidden"
                animate="visible"
                className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight"
              >
                找到新的歸屬
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
              className="mt-4 text-white/65 text-base max-w-sm leading-relaxed"
            >
              探索社群中的優質二手商品，享受超值好價格。
            </motion.p>
          </motion.div>

          {/* ✨ 右側按鈕也可以跟著加上透明度變化，讓畫面更乾淨 */}
          <motion.div
            style={{ opacity: textOpacity }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            className="shrink-0"
          >
            <button
              onClick={() => onNavigate("products")}
              className="flex items-center gap-2 bg-white/95 backdrop-blur-sm text-gray-900 text-sm font-semibold px-8 py-4 rounded-full hover:bg-white active:scale-95 transition-all duration-200 shadow-xl"
            >
              立即探索 <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SEARCH BAR
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        className="w-full bg-white border-b border-gray-100"
      >
        <form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-3"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="搜尋商品關鍵字..."
              className="w-full pl-11 pr-4 h-11 text-sm bg-gray-50 border border-gray-200 rounded-full text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all duration-200"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="h-11 px-7 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 active:scale-95 transition-all duration-200"
          >
            搜尋
          </button>
        </form>
      </motion.div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CATEGORY IMAGE GRID — staggered reveal
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="max-w-7xl mx-auto w-full px-6 sm:px-10 pt-20 pb-10">

        {/* Section heading */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="flex items-end justify-between mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">瀏覽分類</h2>
          <button
            onClick={() => onNavigate("products")}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-900 transition-colors duration-200"
          >
            查看全部 <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Staggered grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {categories.map(cat => (
            <motion.div
              key={cat.id}
              variants={cardVariant}
              onClick={() => onNavigate("products", undefined, cat.id)}
              className="group cursor-pointer"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-gray-100">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <cat.Icon className="w-8 h-8 text-white/80" />
                </div>
                <span className="absolute bottom-3 right-3 flex items-center gap-1 text-white/0 group-hover:text-white/90 text-[10px] font-medium tracking-wide transition-all duration-300">
                  逛逛 <MoveRight className="w-3 h-3" />
                </span>
              </div>
              <p className="text-xs font-medium text-gray-500 group-hover:text-gray-900 tracking-wide text-center transition-colors duration-200">
                {cat.bracketName}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          LATEST PRODUCTS — staggered reveal
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="max-w-7xl mx-auto w-full px-6 sm:px-10 pt-16 pb-28">

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="flex items-end justify-between mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">最新上架</h2>
          <button
            onClick={() => onNavigate("products")}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-900 transition-colors duration-200"
          >
            查看全部 <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse mb-4" />
                <div className="h-3 rounded bg-gray-100 w-2/3 mb-2 animate-pulse" />
                <div className="h-3 rounded bg-gray-100 w-1/3 animate-pulse" />
              </div>
            ))}
          </div>
        ) : latestProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-gray-300">
            <p className="text-sm">目前還沒有人刊登商品喔</p>
          </div>
        ) : (
          <>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.05 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12"
            >
              {latestProducts.map(product => {
                const cond = conditionConfig[product.condition] ?? { label: "未知", colorClass: "bg-gray-50 text-gray-500 border border-gray-200" };
                const isFav = userFavorites.includes(product.id);
                const isDelisted = product.status === "已下架";

                return (
                  <motion.div
                    key={product.id}
                    variants={cardVariant}
                    onClick={() => handleProductClick(product)}
                    className={`group cursor-pointer ${isDelisted ? "opacity-50" : ""}`}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18 }}
                  >
                    {/* Image card */}
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

                    {/* Info */}
                    <div>
                      <p className={`text-sm font-medium text-gray-900 truncate mb-1 ${isDelisted ? "line-through text-gray-400" : ""}`}>
                        {product.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">NT${Number(product.price).toLocaleString()}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cond.colorClass}`}>
                          {cond.label}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.5 }}
              className="mt-16 text-center"
            >
              <button
                onClick={() => onNavigate("products")}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 border border-gray-200 px-10 py-3.5 rounded-full hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300"
              >
                查看更多商品 <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </>
        )}
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOOTER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="border-t border-gray-100 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold tracking-widest text-gray-900 uppercase">二手好物市集</p>
          <p className="text-xs text-gray-400">© 2026 二手好物市集管理平台．All rights reserved.</p>
        </div>
      </footer>

      <LoginPromptDialog
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        onConfirm={() => { setShowLoginPrompt(false); onNavigate("login"); }}
        description="登入後即可收藏您心儀的商品！"
      />
    </div>
  );
}