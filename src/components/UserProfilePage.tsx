import { Settings, MapPin, Calendar, Package, Heart, LogOut, Edit, Receipt } from "lucide-react";
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

const userListings = [
  {
    id: "1",
    title: "復古實木椅",
    price: "NT$2,550",
    image: "https://images.unsplash.com/photo-1759643161985-5fcb6dfc9a13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZnVybml0dXJlJTIwY2hhaXJ8ZW58MXx8fHwxNzYyODY0NDA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "上架中",
    views: 147,
  },
  {
    id: "5",
    title: "復古相機組",
    price: "NT$8,400",
    image: "https://images.unsplash.com/photo-1530519507795-42213b27dabf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWNvbmRoYW5kJTIwY2FtZXJhfGVufDF8fHx8MTc2Mjg2OTY5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "上架中",
    views: 89,
  },
];

const favorites = [
  {
    id: "3",
    title: "登山自行車",
    price: "NT$9,600",
    image: "https://images.unsplash.com/photo-1652640867694-afdac071d881?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWN5Y2xlJTIwb3V0ZG9vcnxlbnwxfHx8fDE3NjI4Mzk3MjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "台中市",
  },
  {
    id: "7",
    title: "無線耳機",
    price: "NT$2,850",
    image: "https://images.unsplash.com/photo-1649956736509-f359d191bbcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwbXVzaWN8ZW58MXx8fHwxNzYyODE5NzI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "新竹市",
  },
];

export function UserProfilePage({ onNavigate, onLogout }: UserProfilePageProps) {
  const handleLogout = () => {
    onLogout();
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="rounded-2xl border-border mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" />
                  <AvatarFallback>王</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                  <Edit className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="mb-2">王曉民</h2>
                    <div className="flex flex-wrap gap-3 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>台北市</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>加入於 2023 年 11 月</span>
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

                <p className="text-muted-foreground mb-6">
                  熱愛復古物件和永續購物。總是在尋找獨特的單品來增添我的收藏！
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

                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-neutral-50 rounded-xl">
                    <div className="mb-1">24</div>
                    <div className="text-muted-foreground">刊登商品</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-xl">
                    <div className="mb-1">12</div>
                    <div className="text-muted-foreground">已售出</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-xl">
                    <div className="mb-1">98%</div>
                    <div className="text-muted-foreground">好評率</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-xl">
                    <div className="mb-1">152</div>
                    <div className="text-muted-foreground">評價</div>
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
                    <div className="mb-2">{item.title}</div>
                    <div className="mb-3">{item.price}</div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{item.views} 次瀏覽</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 rounded-full"
                        onClick={(e) => {
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
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3>已收藏的商品 ({favorites.length})</h3>
            </div>

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
                      className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </button>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">{item.title}</div>
                    <div className="mb-3">{item.price}</div>
                    <div className="text-muted-foreground">{item.location}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}