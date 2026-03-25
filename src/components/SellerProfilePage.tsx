import { useState, useEffect } from "react";
import { ChevronLeft, Package, Calendar, MapPin, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";

interface SellerProfilePageProps {
    onNavigate: (page: string, productId?: string) => void;
    sellerEmail: string;
}

// 🌟 安全的日期格式化 (徹底消滅 NaN)
const formatJoinDate = (dateString?: string) => {
    if (!dateString) return "近期";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "近期"; // 防呆：如果轉換失敗，顯示近期
    return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`;
};

export function SellerProfilePage({ onNavigate, sellerEmail }: SellerProfilePageProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [sellerInfo, setSellerInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!sellerEmail) return;

        const fetchSellerData = async () => {
            try {
                const statsRes = await fetch(`http://localhost:3001/api/user-stats/${sellerEmail}`);
                const statsData = await statsRes.json();
                if (statsData.success) {
                    setStats(statsData.stats);
                    setSellerInfo(statsData.userInfo);
                }

                const productsRes = await fetch(`http://localhost:3001/api/user-products/${sellerEmail}`);
                const productsData = await productsRes.json();
                if (productsData.success) {
                    setProducts(productsData.products);
                }
            } catch (error) {
                toast.error("讀取賣場資料失敗");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSellerData();
    }, [sellerEmail]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50">載入賣場中...</div>;
    }

    const displayName = sellerInfo?.fullname || sellerEmail.split('@')[0];
    const displayAvatar = sellerInfo?.avatarUrl || "";

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Button variant="ghost" onClick={() => onNavigate('products')} className="mb-6 rounded-full">
                    <ChevronLeft className="w-4 h-4 mr-2" /> 返回瀏覽商品
                </Button>

                {/* 🌟 賣家資訊區塊 - 完全比照 UserProfile 的設計 */}
                <Card className="rounded-3xl border-border bg-white mb-8 shadow-sm">
                    <CardContent className="p-6 sm:p-8">
                        {/* 上半部：頭貼、資料與按鈕 */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-6">
                                {/* 頭貼 */}
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0 border border-border">
                                    {displayAvatar ? (
                                        displayAvatar.startsWith('http') || displayAvatar.startsWith('data:image') ? (
                                            <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl">{displayAvatar}</span>
                                        )
                                    ) : (
                                        <span className="text-4xl">{displayName.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>

                                {/* 名字與詳細資訊 */}
                                <div>
                                    <h1 className="text-2xl font-bold mb-2">{displayName}</h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" /> 加入於 {formatJoinDate(sellerInfo?.createdAt)}
                                        </span>
                                        {sellerInfo?.address && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" /> {sellerInfo.address}
                                            </span>
                                        )}
                                    </div>
                                    {sellerInfo?.bio && <p className="text-sm text-neutral-800">{sellerInfo.bio}</p>}
                                </div>
                            </div>

                            {/* 傳送訊息按鈕 */}
                            <Button className="rounded-full shadow-sm" onClick={() => onNavigate('chat')}>
                                <MessageCircle className="w-4 h-4 mr-2" />
                                傳送訊息
                            </Button>
                        </div>

                        {/* 下半部：四格統計數據 */}
                        <div className="grid grid-cols-4 gap-4 pt-6 border-t border-border text-center">
                            <div>
                                <div className="text-2xl font-bold mb-1">{stats?.totalProducts || 0}</div>
                                <div className="text-sm text-muted-foreground">刊登商品</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold mb-1">{stats?.soldCount || 0}</div>
                                <div className="text-sm text-muted-foreground">已售出</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold mb-1">{stats?.ratingRate || 100}%</div>
                                <div className="text-sm text-muted-foreground">好評率</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold mb-1">{stats?.reviewCount || 0}</div>
                                <div className="text-sm text-muted-foreground">評價</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 賣家商品列表 */}
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    上架中的商品 ({products.length})

                </h2>

                {products.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground bg-white rounded-2xl border border-border">
                        這位賣家目前沒有刊登任何商品喔！
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Card
                                key={product.id}
                                className="group cursor-pointer hover:shadow-lg transition-all rounded-2xl border-border overflow-hidden bg-white"
                                onClick={() => onNavigate('product-detail', product.id)}
                            >
                                <div className="relative aspect-square overflow-hidden bg-neutral-100">
                                    <ImageWithFallback
                                        src={product.image || ""}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <Badge variant="secondary" className="rounded-full shadow-sm">
                                            {product.status || "上架中"}
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <div className="mb-1 font-medium truncate">{product.title}</div>
                                    <div className="mb-3 text-primary font-bold text-lg">
                                        {product.price}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}