import { Heart, Share2, MessageCircle, ChevronLeft, ShoppingCart, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ProductDetailPageProps {
  onNavigate: (page: string, productId?: string) => void;
  productId: string;
  previousPage?: string;
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

const formatPostDate = (dateString?: string) => {
  if (!dateString) return "剛剛";
  const postDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - postDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    return diffHours === 0 ? "剛剛" : `${diffHours} 小時前`;
  } else if (diffDays <= 7) {
    return `${diffDays} 天前`;
  } else {
    const y = postDate.getFullYear();
    const m = String(postDate.getMonth() + 1).padStart(2, '0');
    const d = String(postDate.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  }
};

export function ProductDetailPage({ onNavigate, productId, previousPage = 'home' }: ProductDetailPageProps) {
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false); // 🌟 收藏狀態

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/product/${productId}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
        } else {
          toast.error("找不到該商品");
          onNavigate(previousPage);
        }
      } catch (error) {
        toast.error("伺服器連線錯誤");
      } finally {
        setIsLoading(false);
      }
    };

    // 🌟 檢查該使用者是否已收藏此商品
    const checkFavoriteStatus = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      try {
        const res = await fetch(`http://localhost:3001/api/favorites/check?email=${user.email}&productId=${productId}`);
        const data = await res.json();
        setIsFavorite(data.isFavorite);
      } catch (e) {
        console.error("檢查收藏失敗", e);
      }
    };

    if (productId) {
      fetchProduct();
      checkFavoriteStatus();
    }
  }, [productId, onNavigate, previousPage]);

  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  };

  // 🌟 收藏切換功能
  const handleFavoriteToggle = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      toast.error("請先登入才能收藏商品喔！");
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, productId: productId })
      });
      const data = await res.json();
      if (data.success) {
        setIsFavorite(data.isFavorite);
        toast.success(data.message);
      }
    } catch (error) {
      toast.error("操作失敗，請檢查連線");
    }
  };

  const handleChatClick = () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      toast.error("請先登入才能傳送訊息喔！", { style: { background: '#ef4444', color: '#fff', border: 'none' } });
      return;
    }
    if (currentUser.email === product.sellerEmail) {
      toast.error("這是您自己刊登的商品，無法傳送訊息給自己！", { style: { background: '#f59e0b', color: '#fff', border: 'none' } });
      return;
    }
    onNavigate('chat');
  };

  const handleAddToCart = () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      toast.error("請先登入才能加入購物車喔！", { style: { background: '#ef4444', color: '#fff', border: 'none' } });
      return;
    }
    if (currentUser.email === product.sellerEmail) {
      toast.error("無法將自己刊登的商品加入購物車！", { style: { background: '#ef4444', color: '#fff', border: 'none' } });
      return;
    }

    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = savedCart.find((item: any) => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      savedCart.push({ productId: productId, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(savedCart));
    toast.success("🛒 已加入購物車！");
  };

  const handleCheckoutClick = () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      toast.error("請先登入才能購買喔！", { style: { background: '#ef4444', color: '#fff', border: 'none' } });
      return;
    }
    if (currentUser.email === product.sellerEmail) {
      toast.error("無法購買自己刊登的商品喔！", { style: { background: '#ef4444', color: '#fff', border: 'none' } });
      return;
    }
    toast.info("🚀 即將推出：結帳與付款功能");
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">載入中...</div>;
  if (!product) return null;

  const formattedPrice = `NT$${Number(product.price).toLocaleString()}`;
  const displayCategory = categoryMap[product.category] || "其他";
  const displayCondition = conditionMap[product.condition] || "未知";
  const images = product.images && product.images.length > 0 ? product.images : ["https://via.placeholder.com/800"];

  const sellerName = product.sellerInfo?.fullname || (product.sellerEmail ? product.sellerEmail.split('@')[0] : "未知賣家");
  const sellerAvatar = product.sellerInfo?.avatarUrl || "";

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => onNavigate(previousPage)} className="mb-6 rounded-full">
          <ChevronLeft className="w-4 h-4 mr-2" />
          返回列表
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Card className="rounded-2xl border-border overflow-hidden">
              <div className="aspect-square bg-neutral-100">
                <ImageWithFallback src={images[mainImageIndex]} alt={product.title} className="w-full h-full object-cover" />
              </div>
            </Card>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img: string, idx: number) => (
                  <Card
                    key={idx}
                    onClick={() => setMainImageIndex(idx)}
                    className={`rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${mainImageIndex === idx ? 'border-primary' : 'border-transparent hover:border-border'}`}
                  >
                    <div className="aspect-square bg-neutral-100">
                      <ImageWithFallback src={img} alt={`縮圖 ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="rounded-full">{displayCategory}</Badge>
                    <Badge variant="outline" className="rounded-full">{displayCondition}</Badge>
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700 rounded-full">{product.status || '上架中'}</Badge>
                  </div>
                  <h1 className="mb-2 text-3xl font-bold">{product.title}</h1>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full" onClick={() => toast.success("商品連結已複製！")}>
                    <Share2 className="w-4 h-4" />
                  </Button>

                  {/* 🌟 修改後的收藏按鈕 */}
                  <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-full transition-all ${isFavorite ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' : ''}`}
                    onClick={handleFavoriteToggle}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>

              <div className="mb-6 text-3xl font-bold text-primary">{formattedPrice}</div>

              <div className="flex gap-3">
                <Button variant="outline" size="lg" className="flex-1 rounded-xl" onClick={handleChatClick}>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  聊聊
                </Button>
                <Button variant="secondary" size="lg" className="flex-1 rounded-xl" onClick={handleAddToCart}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  加購物車
                </Button>
                <Button size="lg" className="flex-[1.5] rounded-xl" onClick={handleCheckoutClick}>
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  立即下單
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 font-bold text-lg">商品描述</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>

            <Separator />

            <div>
              <h3 className="mb-4 font-bold text-lg">商品資訊</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">狀況</span>
                  <span className="font-medium">{displayCondition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">分類</span>
                  <span className="font-medium">{displayCategory}</span>
                </div>

                {/* 🌟 數量文字修正為黑色 */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">商品數量</span>
                  <span className="font-medium">{product.stock || 1}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">刊登日期</span>
                  <span className="font-medium">{formatPostDate(product.createdAt)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <Card className="rounded-2xl border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {sellerAvatar ? (
                        sellerAvatar.startsWith('http') || sellerAvatar.startsWith('data:image') ? (
                          <img src={sellerAvatar} alt={sellerName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">{sellerAvatar}</span>
                        )
                      ) : (
                        sellerName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="font-medium text-lg">{sellerName}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      const currentUser = getCurrentUser();
                      if (currentUser && currentUser.email === product.sellerEmail) {
                        onNavigate('profile');
                      } else {
                        onNavigate('seller-profile', product.sellerEmail);
                      }
                    }}
                  >
                    查看檔案
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-xl">
                  <div className="text-center">
                    <div className="mb-1 font-medium text-lg">{product.sellerInfo?.totalProducts || 0}</div>
                    <div className="text-sm text-muted-foreground">刊登商品</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-1 font-medium text-lg">{product.sellerInfo?.ratingRate || 100}%</div>
                    <div className="text-sm text-muted-foreground">好評率</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-1 font-medium text-lg">{product.sellerInfo?.reviewCount || 0}</div>
                    <div className="text-sm text-muted-foreground">評價</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}