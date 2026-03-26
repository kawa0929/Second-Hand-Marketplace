import { useState, useEffect } from "react";
import { Settings, MapPin, Calendar, Package, Heart, LogOut, Receipt, AlertCircle, Edit, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";

interface UserProfilePageProps {
  onNavigate: (page: string, productId?: string) => void;
  onLogout: () => void;
}

interface ListingItem {
  id: string;
  title: string;
  price: string;
  image: string;
  status: string;
  views: number;
}

interface FavoriteItem {
  id: string;
  title: string;
  price: string;
  image: string;
}

// 🌟 新增：安全的日期格式化函數 (徹底消滅 NaN)
const formatDate = (dateString?: string) => {
  if (!dateString) return "2026 年 3 月"; // 預設近期時間
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "2026 年 3 月"; // 防呆機制：如果時間壞掉，給個預設值
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`;
};

export function UserProfilePage({ onNavigate, onLogout }: UserProfilePageProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userListings, setUserListings] = useState<ListingItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const [sellerStats, setSellerStats] = useState({
    totalProducts: 0,
    soldCount: 0,
    ratingRate: 100,
    reviewCount: 0
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // 先用舊的撐著，等一下 fetch 完會換成資料庫最新的
      setCurrentUser(user);

      // 🌟 核心修正：1. 抓取資料庫內最新的個人檔案 (含頭貼網址)
      fetch(`http://localhost:3001/api/user/${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setCurrentUser(data.user);
        });

      // 🌟 核心修正：2. 修正商品路徑，並轉換格式符合妳原本的 ListingItem 介面
      fetch(`http://localhost:3001/api/products/seller/${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const formatted = data.products.map((p: any) => ({
              id: p.id,
              title: p.title,
              price: `NT$${p.price}`, // 轉成字串讓妳下方的 replace 邏輯過
              image: p.images?.[0] || "",
              status: p.status || "上架中",
              views: p.views || 0
            }));
            setUserListings(formatted);
          }
        })
        .catch(err => console.error("抓取商品失敗:", err));

      // 3. 撈取賣場統計數據
      fetch(`http://localhost:3001/api/user-stats/${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setSellerStats(data.stats);
        })
        .catch(err => console.error("抓取統計失敗:", err));

      // 4. 撈取我的收藏清單
      fetch(`http://localhost:3001/api/favorites/${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setFavorites(data.favorites);
        })
        .catch(err => console.error("抓取收藏失敗:", err));

    } else {
      onNavigate('login');
    }
  }, [onNavigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    onLogout();
    onNavigate('home');
  };

  const handleItemClick = (item: ListingItem) => {
    if (item.status === "已下架") {
      toast.info("此商品目前為下架狀態，已為您導向編輯頁面。");
      onNavigate('edit-product', item.id);
    } else {
      onNavigate('product-detail', item.id);
    }
  };

  if (!currentUser) return <div className="min-h-screen bg-neutral-50 flex justify-center items-center">載入中...</div>;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Profile Header */}
        <Card className="rounded-2xl border-border mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 text-5xl">
                  {currentUser.avatarUrl ? (
                    currentUser.avatarUrl.startsWith('http') || currentUser.avatarUrl.includes('data:image') ? (
                      <AvatarImage src={currentUser.avatarUrl} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-neutral-100 border-2 border-dashed border-neutral-300">
                        {currentUser.avatarUrl}
                      </AvatarFallback>
                    )
                  ) : (
                    <AvatarFallback className="bg-neutral-100 border-2 border-dashed border-neutral-300">
                      {currentUser.fullname.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="mb-2 font-bold text-2xl flex items-center gap-2">
                      {currentUser.fullname}
                      {currentUser.role === 'admin' && (
                        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">管理員</Badge>
                      )}
                    </h2>
                    <div className="flex flex-row flex-wrap items-center gap-5 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar className="w-4 h-4" />
                        {/* 🌟 修改：套用我們寫好的 formatDate 函數 */}
                        <span>加入於 {formatDate(currentUser.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <MapPin className="w-4 h-4" />
                        <span>{currentUser.address || "尚未設定地區"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => onNavigate('edit-profile')}>
                      <Settings className="w-4 h-4 mr-2" /> 編輯個人資料
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" /> 登出
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6 whitespace-pre-wrap">
                  {currentUser.bio || `哈囉！我是 ${currentUser.fullname}，歡迎來到我的二手賣場。`}
                </p>
                <div className="flex gap-3 mb-6">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => onNavigate('transactions')}>
                    <Receipt className="w-4 h-4 mr-2" /> 交易紀錄
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-neutral-50 rounded-xl">
                    <div className="mb-1 font-bold text-lg">{sellerStats.totalProducts}</div>
                    <div className="text-sm text-muted-foreground">刊登商品</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-xl">
                    <div className="mb-1 font-bold text-lg">{sellerStats.soldCount}</div>
                    <div className="text-sm text-muted-foreground">已售出</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-xl">
                    <div className="mb-1 font-bold text-lg">{sellerStats.ratingRate}%</div>
                    <div className="text-sm text-muted-foreground">好評率</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-xl">
                    <div className="mb-1 font-bold text-lg">{sellerStats.reviewCount}</div>
                    <div className="text-sm text-muted-foreground">評價</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="bg-white border border-border rounded-xl p-1">
            <TabsTrigger value="listings" className="rounded-lg">
              <Package className="w-4 h-4 mr-2" /> 我的商品
            </TabsTrigger>
            <TabsTrigger value="favorites" className="rounded-lg">
              <Heart className="w-4 h-4 mr-2" /> 收藏清單
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">上架中的商品 ({userListings.length})</h3>
              <Button className="rounded-full" onClick={() => onNavigate('post')}>
                <Plus className="w-4 h-4 mr-2" /> 新增刊登
              </Button>
            </div>
            {userListings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-border">
                <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-muted-foreground">目前還沒有刊登任何商品喔！</p>
                <Button variant="link" onClick={() => onNavigate('post')} className="mt-2 text-primary">立刻去刊登一個吧</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userListings.map((item) => (
                  <Card key={item.id} className={`group cursor-pointer hover:shadow-lg transition-all rounded-2xl border-border overflow-hidden ${item.status === '已下架' ? 'opacity-80' : ''}`} onClick={() => handleItemClick(item)}>
                    <div className="relative aspect-square overflow-hidden bg-neutral-100">
                      <ImageWithFallback src={item.image} alt={item.title} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${item.status === '已下架' ? 'grayscale' : ''}`} />
                      <div className="absolute top-3 right-3">
                        <Badge variant={item.status === '已下架' ? 'outline' : 'secondary'} className={`rounded-full ${item.status === '已下架' ? 'bg-neutral-200 text-neutral-500 border-none' : ''}`}>
                          {item.status}
                        </Badge>
                      </div>
                      {item.status === '已下架' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <AlertCircle className="w-12 h-12 text-white/80" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className={`mb-2 font-medium ${item.status === '已下架' ? 'text-neutral-400 line-through' : ''}`}>
                        {item.title}
                      </div>
                      <div className={`mb-3 font-bold ${item.status === '已下架' ? 'text-neutral-400' : 'text-primary'}`}>
                        NT${Number(item.price.replace('NT$', '').replace(',', '')).toLocaleString()}
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground text-sm">
                        <span>{item.views} 次瀏覽</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onNavigate('edit-product', item.id);
                          }}
                        >
                          編輯
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <div className="text-lg font-bold">
              <h3>已收藏的商品 ({favorites.length})</h3>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-border">
                <Heart className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-muted-foreground">目前還沒有收藏任何商品喔！</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((item) => (
                  <Card
                    key={item.id}
                    className="group cursor-pointer hover:shadow-lg transition-all rounded-2xl border-border overflow-hidden"
                    onClick={() => onNavigate('product-detail', item.id)}
                  >
                    <div className="relative aspect-square overflow-hidden bg-neutral-100">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2 font-medium">{item.title}</div>
                      <div className="mb-1 font-bold text-primary">{item.price}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}