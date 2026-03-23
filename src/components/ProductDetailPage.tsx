import { Heart, MapPin, Clock, Shield, Share2, MessageCircle, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProductDetailPageProps {
  onNavigate: (page: string) => void;
}

const relatedProducts = [
  {
    id: "2",
    title: "經典底片相機",
    price: "NT$4,350",
    image: "https://images.unsplash.com/photo-1495121553079-4c61bcce1894?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2FtZXJhfGVufDF8fHx8MTc2MjgxOTk3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "3",
    title: "登山自行車",
    price: "NT$9,600",
    image: "https://images.unsplash.com/photo-1652640867694-afdac071d881?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWN5Y2xlJTIwb3V0ZG9vcnxlbnwxfHx8fDE3NjI4Mzk3MjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "4",
    title: "Dell XPS 筆電",
    price: "NT$19,500",
    image: "https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBkZXNrfGVufDF8fHx8MTc2Mjc4MzEyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

export function ProductDetailPage({ onNavigate }: ProductDetailPageProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('products')}
          className="mb-6 rounded-full"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          返回列表
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="rounded-2xl border-border overflow-hidden">
              <div className="aspect-square bg-neutral-100">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1759643161985-5fcb6dfc9a13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZnVybml0dXJlJTIwY2hhaXJ8ZW58MXx8fHwxNzYyODY0NDA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="復古實木椅"
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
            
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card 
                  key={i}
                  className="rounded-xl border-border overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                >
                  <div className="aspect-square bg-neutral-100">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1759643161985-5fcb6dfc9a13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZnVybml0dXJlJTIwY2hhaXJ8ZW58MXx8fHwxNzYyODY0NDA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt={`縮圖 ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="rounded-full">
                      家具
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      近全新
                    </Badge>
                  </div>
                  <h1 className="mb-2">復古實木椅</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>台北市</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="mb-6">NT$2,550</div>

              <div className="flex gap-3">
                <Button size="lg" className="flex-1 rounded-xl">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  聯絡賣家
                </Button>
                <Button size="lg" variant="outline" className="flex-1 rounded-xl">
                  出價
                </Button>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="mb-3">商品描述</h3>
              <p className="text-muted-foreground leading-relaxed">
                精美的復古實木椅，保存狀況極佳。這款椅子採用經典的中世紀設計風格，
                以堅固的橡木製成。椅子維護良好，僅有輕微使用痕跡。非常適合為您的
                家居或辦公空間增添特色。
              </p>
            </div>

            <Separator />

            {/* Details */}
            <div>
              <h3 className="mb-4">商品資訊</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">狀況</span>
                  <span>近全新</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">分類</span>
                  <span>家具</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">刊登時間</span>
                  <span>2 天前</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">瀏覽次數</span>
                  <span>147</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Seller Info */}
            <Card className="rounded-2xl border-border">
              <CardContent className="p-6">
                <h3 className="mb-4">賣家資訊</h3>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="" />
                    <AvatarFallback>王</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="mb-1">王曉民</div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>會員自 2023</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full">
                    查看檔案
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-xl">
                  <div className="text-center">
                    <div className="mb-1">24</div>
                    <div className="text-muted-foreground">刊登商品</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-1">98%</div>
                    <div className="text-muted-foreground">好評率</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-1">152</div>
                    <div className="text-muted-foreground">評價</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="rounded-2xl border-border bg-blue-50/50">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="mb-2">安全提示</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• 在公共場所見面</li>
                      <li>• 付款前先檢查商品</li>
                      <li>• 取得商品後才付款</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Items */}
        <section className="mt-16">
          <h2 className="mb-6">類似商品</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((product) => (
              <Card 
                key={product.id}
                className="group cursor-pointer hover:shadow-lg transition-all rounded-2xl border-border overflow-hidden"
                onClick={() => onNavigate('product-detail')}
              >
                <div className="relative aspect-square overflow-hidden bg-neutral-100">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="mb-2">{product.title}</div>
                  <div>{product.price}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
