import { Search, Filter, Heart, SlidersHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProductListPageProps {
  onNavigate: (page: string, productId?: string) => void;
}

const products = [
  {
    id: "1",
    title: "復古實木椅",
    price: "NT$2,550",
    image: "https://images.unsplash.com/photo-1759643161985-5fcb6dfc9a13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZnVybml0dXJlJTIwY2hhaXJ8ZW58MXx8fHwxNzYyODY0NDA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    condition: "近全新",
    location: "台北市",
    category: "家具",
  },
  {
    id: "2",
    title: "經典底片相機",
    price: "NT$4,350",
    image: "https://images.unsplash.com/photo-1495121553079-4c61bcce1894?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2FtZXJhfGVufDF8fHx8MTc2MjgxOTk3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    condition: "良好",
    location: "新北市",
    category: "電子產品",
  },
  {
    id: "3",
    title: "登山自行車",
    price: "NT$9,600",
    image: "https://images.unsplash.com/photo-1652640867694-afdac071d881?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWN5Y2xlJTIwb3V0ZG9vcnxlbnwxfHx8fDE3NjI4Mzk3MjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    condition: "極佳",
    location: "台中市",
    category: "運動用品",
  },
  {
    id: "4",
    title: "Dell XPS 筆電",
    price: "NT$19,500",
    image: "https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBkZXNrfGVufDF8fHx8MTc2Mjc4MzEyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    condition: "良好",
    location: "高雄市",
    category: "電子產品",
  },
  {
    id: "5",
    title: "復古相機組",
    price: "NT$8,400",
    image: "https://images.unsplash.com/photo-1530519507795-42213b27dabf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWNvbmRoYW5kJTIwY2FtZXJhfGVufDF8fHx8MTc2Mjg2OTY5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    condition: "近全新",
    location: "桃園市",
    category: "電子產品",
  },
  {
    id: "6",
    title: "旅行後背包",
    price: "NT$1,350",
    image: "https://images.unsplash.com/photo-1627803589917-65023f4a0e70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWNrcGFjayUyMGFjY2Vzc29yaWVzfGVufDF8fHx8MTc2Mjc2NjU3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    condition: "良好",
    location: "台南市",
    category: "服飾配件",
  },
  {
    id: "7",
    title: "無線耳機",
    price: "NT$2,850",
    image: "https://images.unsplash.com/photo-1649956736509-f359d191bbcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwbXVzaWN8ZW58MXx8fHwxNzYyODE5NzI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    condition: "極佳",
    location: "新竹市",
    category: "電子產品",
  },
  {
    id: "8",
    title: "經典白色球鞋",
    price: "NT$1,950",
    image: "https://images.unsplash.com/photo-1656944227480-98180d2a5155?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmVha2VycyUyMHNob2VzfGVufDF8fHx8MTc2Mjg2NjY0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    condition: "近全新",
    location: "嘉義市",
    category: "服飾配件",
  },
];

export function ProductListPage({ onNavigate }: ProductListPageProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1>瀏覽商品</h1>
          <p className="text-muted-foreground mt-2">
            探索數千件優質二手商品
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="搜尋商品..." 
                className="pl-10 h-11 rounded-xl bg-input-background border-0"
              />
            </div>
            
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px] h-11 rounded-xl bg-input-background border-0">
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
                <SelectTrigger className="w-[160px] h-11 rounded-xl bg-input-background border-0">
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
          <p className="text-muted-foreground">
            顯示 {products.length} 件商品
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card 
              key={product.id}
              className="group cursor-pointer hover:shadow-lg transition-all rounded-2xl border-border overflow-hidden"
              onClick={() => onNavigate('product-detail', product.id)}
            >
              <div className="relative aspect-square overflow-hidden bg-neutral-100">
                <ImageWithFallback
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button 
                  className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Heart className="w-4 h-4" />
                </button>
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="rounded-full">
                    {product.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="mb-2">{product.title}</div>
                <div className="mb-3">{product.price}</div>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="rounded-full">
                    {product.condition}
                  </Badge>
                  <span className="text-muted-foreground">{product.location}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="rounded-full">
            載入更多商品
          </Button>
        </div>
      </div>
    </div>
  );
}
