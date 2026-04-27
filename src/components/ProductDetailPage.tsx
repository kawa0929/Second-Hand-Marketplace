import { Heart, Share2, MessageCircle, ChevronLeft, ShoppingCart, ShoppingBag, Edit } from "lucide-react";
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

const conditionConfig: Record<string, { label: string; color: string }> = {
  "new": { label: "全新", color: "bg-emerald-100 text-emerald-700" },
  "like-new": { label: "近全新", color: "bg-blue-100 text-blue-700" },
  "excellent": { label: "極佳", color: "bg-indigo-100 text-indigo-700" },
  "good": { label: "良好", color: "bg-amber-100 text-amber-700" },
  "fair": { label: "尚可", color: "bg-stone-200 text-stone-700" },
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

export function ProductDetailPage({ onNavigate, productId }: ProductDetailPageProps) {
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/product/${productId}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
          if (data.product.variations && data.product.variations.length === 1) {
            setSelectedVariation(data.product.variations[0]);
          }
        } else {
          toast.error("找不到該商品");
          onNavigate('home');
        }
      } catch (error) {
        toast.error("伺服器連線錯誤");
      } finally {
        setIsLoading(false);
      }
    };

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

    if (productId) {
      const viewedProducts = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
      if (!viewedProducts.includes(productId)) {
        fetch(`http://localhost:3001/api/products/${productId}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              viewedProducts.push(productId);
              localStorage.setItem('viewedProducts', JSON.stringify(viewedProducts));
            }
          })
          .catch(err => console.error("更新瀏覽次數失敗:", err));
      }
    }
  }, [productId, onNavigate]);

  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  };

  const handleFavoriteToggle = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      toast.error("請先登入才能收藏商品喔！");
      return;
    }

    if (product.status === '已下架') {
      toast.error("此商品已下架，無法加入收藏喔！", { style: { background: '#4b5563', color: '#fff', border: 'none' } });
      return;
    }

    if (currentUser.email === product.sellerEmail) {
      toast.error("這是您自己刊登的商品，不需要收藏啦！", { style: { background: '#f59e0b', color: '#fff', border: 'none' } });
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

  const handleAddToCart = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      toast.error("請先登入才能加入購物車喔！", { style: { background: '#ef4444', color: '#fff', border: 'none' } });
      return;
    }
    if (currentUser.email === product.sellerEmail) {
      toast.error("無法將自己刊登的商品加入購物車！", { style: { background: '#ef4444', color: '#fff', border: 'none' } });
      return;
    }

    const hasMultipleVariations = product.variations && product.variations.length > 1;
    if (hasMultipleVariations && !selectedVariation) {
      toast.error("請先選擇您想要的款式規格喔！", { style: { background: '#ef4444', color: '#fff', border: 'none' } });
      return;
    }

    const variationName = selectedVariation ? selectedVariation.name : "單一款式";
    const currentStock = selectedVariation ? selectedVariation.stock : (product.stock || 1);

    try {
      const checkRes = await fetch(`http://localhost:3001/api/cart/${currentUser.email}`);
      const checkData = await checkRes.json();

      if (checkData.success) {
        const existingItem = checkData.cart.find((item: any) =>
          item.productId === productId && item.variationName === variationName
        );

        if (existingItem && existingItem.quantity >= currentStock) {
          toast.error(`此商品已在購物車中，且已達庫存上限 (${currentStock} 件)！`, {
            style: { background: '#f59e0b', color: '#fff', border: 'none' }
          });
          return;
        }
      }

      const res = await fetch('http://localhost:3001/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          productId: productId,
          quantity: 1,
          variationName: variationName
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("🛒 已加入雲端購物車！");
      }
    } catch (error) {
      toast.error("加入購物車失敗，請檢查網路");
    }
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

    const hasMultipleVariations = product.variations && product.variations.length > 1;
    if (hasMultipleVariations && !selectedVariation) {
      toast.error("請先選擇您想要的款式規格喔！", { style: { background: '#ef4444', color: '#fff', border: 'none' } });
      return;
    }

    onNavigate('checkout', productId);
  };

  // 👇 這邊就是剛剛可能不小心刪掉括號的地方，我已經補好了！
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">載入中...</div>;
  if (!product) return null;

  const displayPrice = selectedVariation ? selectedVariation.price : product.price;
  const formattedPrice = `NT$${Number(displayPrice).toLocaleString()}`;
  const displayStock = selectedVariation ? selectedVariation.stock : (product.stock || 1);

  const displayCategory = categoryMap[product.category] || "其他";
  const conditionData = conditionConfig[product.condition] || { label: "未知", color: "bg-neutral-100 text-neutral-600" };
  const images = product.images && product.images.length > 0 ? product.images : ["https://via.placeholder.com/800"];

  const sellerName = product.sellerInfo?.fullname || (product.sellerEmail ? product.sellerEmail.split('@')[0] : "未知賣家");
  const sellerAvatar = product.sellerInfo?.avatarUrl || "";

  const activeUser = getCurrentUser();
  const isSeller = activeUser && activeUser.email === product.sellerEmail;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 🌟 打破迴圈的關鍵：左上角按鈕寫死強制回首頁 ('home') */}
        <Button variant="ghost" onClick={() => onNavigate('home')} className="mb-6 rounded-full">
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

                    <Badge className={`rounded-full border-none shadow-none font-medium hover:opacity-80 transition-opacity ${conditionData.color}`}>
                      {conditionData.label}
                    </Badge>

                    <Badge variant={product.status === '已下架' ? 'outline' : 'default'} className={`rounded-full ${product.status === '已下架' ? 'bg-neutral-200 text-neutral-600 border-none' : 'bg-green-600 hover:bg-green-700'}`}>
                      {product.status || '上架中'}
                    </Badge>
                  </div>
                  <h1 className="mb-2 text-3xl font-bold">{product.title}</h1>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full" onClick={() => toast.success("商品連結已複製！")}>
                    <Share2 className="w-4 h-4" />
                  </Button>

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

              {product.variations && product.variations.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-muted-foreground mb-3">選擇款式</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.variations.map((v: any, idx: number) => {
                      const isSelected = selectedVariation?.name === v.name;
                      const isOutOfStock = v.stock <= 0;
                      return (
                        <Button
                          key={idx}
                          variant={isSelected ? "default" : "outline"}
                          className={`rounded-xl px-5 h-10 transition-all ${isSelected ? "bg-primary text-white shadow-md ring-2 ring-primary ring-offset-2" : "bg-white"} ${isOutOfStock ? "opacity-50 line-through cursor-not-allowed" : ""}`}
                          onClick={() => !isOutOfStock && setSelectedVariation(v)}
                          disabled={isOutOfStock}
                        >
                          {v.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

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
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">商品描述</h3>
                {isSeller && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80 hover:bg-primary/10 rounded-full h-8 px-3"
                    onClick={() => onNavigate('edit-product', productId)}
                  >
                    <Edit className="w-4 h-4 mr-1.5" />
                    編輯商品
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>

            <Separator />

            <div>
              <h3 className="mb-4 font-bold text-lg">商品資訊</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">狀況</span>
                  <span className="font-medium">{conditionData.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">分類</span>
                  <span className="font-medium">{displayCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">商品數量</span>
                  <span className="font-medium">{displayStock}</span>
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
                      if (isSeller) {
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