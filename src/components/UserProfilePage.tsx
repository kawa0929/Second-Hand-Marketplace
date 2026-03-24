import { useState, useEffect } from "react";
import { Settings, MapPin, Calendar, Package, Heart, LogOut, Receipt } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface UserProfilePageProps {
  onNavigate: (page: string, productId?: string) => void;
  onLogout: () => void;
}

// 設定商品型別
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
  location: string;
}

export function UserProfilePage({ onNavigate, onLogout }: UserProfilePageProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 🌟 將商品清單改為 State，準備接收後端資料
  const [userListings, setUserListings] = useState<ListingItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]); // 收藏功能未來再實作

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);

      // 🌟 登入後，立刻去後端撈取這個人的商品
      fetch(`http://localhost:3001/api/user-products/${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUserListings(data.products);
          }
        })
        .catch(err => console.error("抓取商品失敗:", err));

    } else {
      onNavigate('login');
    }
  }, [onNavigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    onLogout();
    onNavigate('home');
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
                  {currentUser.avatarUrl && currentUser.avatarUrl.includes('data:image') ? (
                    <AvatarImage src={currentUser.avatarUrl} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-neutral-100 border-2 border-dashed border-neutral-300">
                      {currentUser.avatarUrl || currentUser.fullname.charAt(0)}
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
                        <span>
                          {currentUser.createdAt
                            ? `加入於 ${new Date(currentUser.createdAt).getFullYear()} 年 ${new Date(currentUser.createdAt).getMonth() + 1} 月`
                            : "加入於 2026 年 3 月"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <MapPin className="w-4 h-4" />
                        <span>{currentUser.address || "尚未設定地區"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => onNavigate('edit-profile')}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      編輯個人資料
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      登出
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 whitespace-pre-wrap">
                  {currentUser.bio || `哈囉！我是 ${currentUser.fullname}，歡迎來到我的二手賣場。`}
                </p>

                <div className="flex gap-3 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => onNavigate('transactions')}
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    交易紀錄
                  </Button>
                </div>

                {/* 🌟 上方的統計數字也會自動隨著陣列長度改變 */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-neutral-50 rounded-xl">
                    <div className="mb-1 font-bold text-lg">{userListings.length}</div>
                    <div className="text-sm text-muted-foreground">刊登商品</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-xl">
                    <div className="mb-1 font-bold text-lg">0</div>
                    <div className="text-sm text-muted-foreground">已售出</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-xl">
                    <div className="mb-1 font-bold text-lg">0%</div>
                    <div className="text-sm text-muted-foreground">好評率</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-xl">
                    <div className="mb-1 font-bold text-lg">0</div>
                    <div className="text-sm text-muted-foreground">評價</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="bg-white border border-border rounded-xl p-1">
            <TabsTrigger value="listings" className="rounded-lg">
              <Package className="w-4 h-4 mr-2" />
              我的商品
            </TabsTrigger>
            <TabsTrigger value="favorites" className="rounded-lg">
              <Heart className="w-4 h-4 mr-2" />
              收藏
            </TabsTrigger>
          </TabsList>

          {/* 我的商品區塊 */}
          <TabsContent value="listings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3>上架中的商品 ({userListings.length})</h3>
              <Button
                className="rounded-full"
                onClick={() => onNavigate('post')}
              >
                新增刊登
              </Button>
            </div>

            {userListings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-border">
                <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-muted-foreground">目前還沒有刊登任何商品喔！</p>
                <Button variant="link" onClick={() => onNavigate('post')} className="mt-2 text-primary">
                  立刻去刊登一個吧
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userListings.map((item) => (
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
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="rounded-full">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2 font-medium">{item.title}</div>
                      <div className="mb-3 font-bold text-primary">{item.price}</div>
                      <div className="flex items-center justify-between text-muted-foreground text-sm">
                        <span>{item.views} 次瀏覽</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-full"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
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

          {/* 收藏區塊 */}
          <TabsContent value="favorites" className="space-y-4">
            <div className="flex items-center justify-between">
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
                      <button
                        className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-sm"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2 font-medium">{item.title}</div>
                      <div className="mb-3 font-bold text-primary">{item.price}</div>
                      <div className="text-muted-foreground text-sm">{item.location}</div>
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