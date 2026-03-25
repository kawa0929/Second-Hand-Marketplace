import { ChevronLeft, Trash2, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CartPageProps {
    onNavigate: (page: string) => void;
}

// 定義購物車商品的格式
interface CartItem {
    id: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
    seller: string;
}

export function CartPage({ onNavigate }: CartPageProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🌟 1. 進到購物車時，從資料庫撈取最新商品資料
    useEffect(() => {
        const loadCartFromDB = async () => {
            setIsLoading(true);
            try {
                // 從本機暫存 (localStorage) 取得加入購物車的商品 ID 與數量
                const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');

                if (savedCart.length === 0) {
                    setCartItems([]);
                    setIsLoading(false);
                    return;
                }

                const fetchedItems: CartItem[] = [];

                // 針對每一個購物車裡的商品 ID，去資料庫抓最新的真實資料
                for (const item of savedCart) {
                    const res = await fetch(`http://localhost:3001/api/product/${item.productId}`);
                    const data = await res.json();

                    if (data.success && data.product) {
                        fetchedItems.push({
                            id: data.product.id,
                            title: data.product.title,
                            price: Number(data.product.price),
                            quantity: item.quantity,
                            image: data.product.images?.[0] || "",
                            seller: data.product.sellerInfo?.fullname || data.product.sellerEmail?.split('@')[0] || "未知"
                        });
                    }
                }
                setCartItems(fetchedItems);
            } catch (error) {
                toast.error("載入購物車失敗，請檢查網路連線");
            } finally {
                setIsLoading(false);
            }
        };

        loadCartFromDB();
    }, []);

    // 🌟 輔助函數：更新狀態的同時，也把最新的數量存回 localStorage
    const updateLocalStorage = (newItems: CartItem[]) => {
        const saveFormat = newItems.map(item => ({ productId: item.id, quantity: item.quantity }));
        localStorage.setItem('cart', JSON.stringify(saveFormat));
    };

    // 增加數量
    const increaseQuantity = (id: string) => {
        setCartItems(items => {
            const newItems = items.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
            updateLocalStorage(newItems);
            return newItems;
        });
    };

    // 減少數量
    const decreaseQuantity = (id: string) => {
        setCartItems(items => {
            const newItems = items.map(item => item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item);
            updateLocalStorage(newItems);
            return newItems;
        });
    };

    // 移除商品
    const removeItem = (id: string) => {
        setCartItems(items => {
            const newItems = items.filter(item => item.id !== id);
            updateLocalStorage(newItems);
            return newItems;
        });
        toast.success("已將商品移出購物車");
    };

    // 計算金額
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = cartItems.length > 0 ? 60 : 0;
    const total = subtotal + shippingFee;

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" onClick={() => onNavigate('products')} className="rounded-full">
                        <ChevronLeft className="w-4 h-4 mr-2" /> 繼續購物
                    </Button>
                    <h1 className="text-2xl font-bold">我的購物車</h1>
                </div>

                {/* 🌟 載入中狀態 */}
                {isLoading ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-border flex flex-col items-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground font-medium">正在連線資料庫讀取商品...</p>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-border">
                        <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">購物車是空的</h2>
                        <p className="text-muted-foreground mb-6">快去逛逛有沒有喜歡的二手好物吧！</p>
                        <Button size="lg" className="rounded-full px-8" onClick={() => onNavigate('products')}>
                            去逛逛
                        </Button>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <Card key={item.id} className="rounded-2xl border-border bg-white overflow-hidden">
                                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-border">
                                            <ImageWithFallback src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>

                                        <div className="flex-1 w-full">
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                                    <p className="text-sm text-muted-foreground">賣家：{item.seller}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-red-500 rounded-full" onClick={() => removeItem(item.id)}>
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="text-lg font-bold text-primary">
                                                    NT${item.price.toLocaleString()}
                                                </div>

                                                <div className="flex items-center border border-border rounded-full p-1 bg-neutral-50">
                                                    <button
                                                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all disabled:opacity-50"
                                                        onClick={() => decreaseQuantity(item.id)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                                                    <button
                                                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all"
                                                        onClick={() => increaseQuantity(item.id)}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="lg:col-span-1">
                            <Card className="rounded-3xl border-border bg-white sticky top-24 shadow-sm">
                                <CardContent className="p-6 sm:p-8">
                                    <h2 className="text-xl font-bold mb-6">訂單摘要</h2>

                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">商品總計 ({cartItems.length} 件)</span>
                                            <span className="font-medium">NT${subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">運費</span>
                                            <span className="font-medium">NT${shippingFee.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <Separator className="my-6" />

                                    <div className="flex justify-between items-end mb-8">
                                        <span className="font-bold text-lg">總付款金額</span>
                                        <span className="text-3xl font-bold text-primary">NT${total.toLocaleString()}</span>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full rounded-full text-lg h-14"
                                        onClick={() => toast.info("🚀 即將前往結帳頁面")}
                                    >
                                        前往結帳
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}