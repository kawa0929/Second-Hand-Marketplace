import { useState, useEffect } from "react";
import { ChevronLeft, Package, Star, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";

interface SellerProfilePageProps {
    onNavigate: (page: string, productId?: string) => void;
    sellerEmail: string;
}

// 分類與狀況的中文化對照表 (維持不變)
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

// 格式化日期的函數 (維持不變)
const formatJoinDate = (dateString?: string) => {
    if (!dateString) return "近期加入";
    const d = new Date(dateString);
    return `${d.getFullYear()}年${d.getMonth() + 1}月 加入`;
};

export function SellerProfilePage({ onNavigate, sellerEmail }: SellerProfilePageProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [sellerInfo, setSellerInfo] = useState<any>(null); // 儲存賣家真實資料
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!sellerEmail) return;

        const fetchSellerData = async () => {
            try {
                // 1. 抓取賣家統計數據 & 基本資料
                const statsRes = await fetch(`http://localhost:3001/api/user-stats/${sellerEmail}`);
                const statsData = await statsRes.json();
                if (statsData.success) {
                    setStats(statsData.stats);
                    setSellerInfo(statsData.userInfo);
                }

                // 2. 抓取賣家商品
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

    // 決定要顯示的名字和頭貼
    const displayName = sellerInfo?.fullname || sellerEmail.split('@')[0];
    const displayAvatar = sellerInfo?.avatarUrl || "";

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 返回按鈕 */}
                <Button variant="ghost" onClick={() => onNavigate('products')} className="mb-6 rounded-full">
                    <ChevronLeft className="w-4 h-4 mr-2" /> 返回瀏覽商品
                </Button>

                {/* 🌟 賣家資訊區塊 - 修改為簡潔的純白全幅卡片設計 */}
                <Card className="rounded-3xl border-border bg-white mb-8 overflow-hidden">
                    {/* ❌ 移除了灰色的背景 div (h-32 bg-primary/10) */}

                    <CardContent className="p-8 relative"> {/* 修改：統一內邊距為 p-8 */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6"> {/* 修改：移除負邊距 (-mt)，改為垂直居中 (items-center) */}

                            {/* 🌟 賣家真實頭貼 - 優化顯示邏輯 */}
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0 shadow-sm border border-border"> {/* 修改：移除白色粗邊框，加入 border-border，BG 改回 bg-primary/10 */}
                                {displayAvatar ? (
                                    displayAvatar.startsWith('http') || displayAvatar.startsWith('data:image') ? (
                                        <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl">{displayAvatar}</span> // 🌟 智慧判斷顯示 Emoji 頭貼，確保居中且不被切到
                                    )
                                ) : (
                                    <span className="text-4xl">{displayName.charAt(0).toUpperCase()}</span> // 沒有頭貼就顯示第一個字
                                )}
                            </div>

                            {/* 賣家文字資訊 */}
                            <div className="flex-1 text-center sm:text-left"> {/* 修改：文字區域置左 */}
                                <h1 className="text-2xl font-bold">{displayName} 的賣場</h1>
                                <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1"> {/* 修改：在手機版置中，電腦版置左 */}
                                    <Calendar className="w-4 h-4" /> 註冊時間：{formatJoinDate(sellerInfo?.createdAt)}
                                </p>
                            </div>
                            <Button className="rounded-full shadow-sm" onClick={() => onNavigate('chat')}>
                                傳送訊息
                            </Button>
                        </div>

                        {/* 統計數字 */}
                        <div className="flex gap-8 border-t border-border pt-6 justify-center sm:justify-start"> {/* 修改：手機版置中，電腦版置左 */}
                            <div>
                                <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
                                <div className="text-sm text-muted-foreground">刊登商品</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold flex items-center gap-1">
                                    {stats?.ratingRate || 100}%
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mb-1" />
                                </div>
                                <div className="text-sm text-muted-foreground">好評率</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 賣家商品列表 */}
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    賣場所有商品
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