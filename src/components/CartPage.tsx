import { ChevronLeft, Trash2, Plus, Minus, ShoppingBag, Loader2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CartPageProps {
    onNavigate: (page: string, productId?: string) => void;
}

interface CartItem {
    cartId: string;
    productId: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
    seller: string;
    stock: number;
    status: string; // 🌟 接收後端傳來的狀態
}

export function CartPage({ onNavigate }: CartPageProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCartItems = async () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            onNavigate('login');
            return;
        }
        const user = JSON.parse(userStr);

        try {
            const res = await fetch(`http://localhost:3001/api/cart/${user.email}`);
            const data = await res.json();
            if (data.success) {
                setCartItems(data.cart);
            }
        } catch (error) {
            toast.error("讀取購物車失敗");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, []);

    const handleUpdateQuantity = async (item: CartItem, change: number) => {
        if (item.status === '已下架') return; // 🛑 防呆：下架商品不允許操作數量

        if (change > 0 && item.quantity >= item.stock) {
            toast.error(`庫存不足！此商品最多只能購買 ${item.stock} 件`);
            return;
        }

        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);

        try {
            const res = await fetch('http://localhost:3001/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, productId: item.productId, quantity: change })
            });
            const data = await res.json();
            if (data.success) fetchCartItems();
        } catch (error) {
            toast.error("更新數量失敗");
        }
    };

    const removeItem = async (cartId: string) => {
        try {
            const res = await fetch(`http://localhost:3001/api/cart/${cartId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setCartItems(prev => prev.filter(item => item.cartId !== cartId));
                toast.success("已從雲端購物車移除");
            }
        } catch (error) {
            toast.error("移除失敗");
        }
    };

    // 🌟 結帳邏輯判斷
    const validItems = cartItems.filter(item => item.status !== '已下架'); // 只計算上架中的商品
    const hasDelistedItems = cartItems.some(item => item.status === '已下架'); // 檢查是否有違規商品
    const total = validItems.reduce((sum, item) => sum + item.price * item.quantity, 0); // 金額只算有效商品

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" onClick={() => onNavigate('home')} className="rounded-full">
                        <ChevronLeft className="w-4 h-4 mr-2" /> 繼續購物
                    </Button>
                    <h1 className="text-2xl font-bold">我的購物車</h1>
                </div>

                {isLoading ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-border flex flex-col items-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground font-medium">正在同步雲端購物車...</p>
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
                            {cartItems.map((item) => {
                                const isDelisted = item.status === '已下架'; // 🌟 判斷是否下架

                                return (
                                    <Card key={item.cartId} className={`rounded-2xl border-border overflow-hidden ${isDelisted ? 'bg-neutral-100 opacity-80' : 'bg-white'}`}>
                                        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-neutral-200 flex-shrink-0 border border-border cursor-pointer relative" onClick={() => !isDelisted && onNavigate('product-detail', item.productId)}>
                                                <ImageWithFallback src={item.image} alt={item.title} className={`w-full h-full object-cover ${isDelisted ? 'grayscale' : ''}`} />

                                                {/* 下架商品圖片遮罩 */}
                                                {isDelisted && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                        <span className="text-white text-xs font-bold px-2 py-1 bg-black/50 rounded-full">已下架</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 w-full">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <h3 className={`font-bold text-lg ${isDelisted ? 'text-neutral-500' : 'cursor-pointer hover:text-primary transition-colors'}`} onClick={() => !isDelisted && onNavigate('product-detail', item.productId)}>
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">賣家：{item.seller}</p>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-red-500 rounded-full" onClick={() => removeItem(item.cartId)}>
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className={`text-lg font-bold ${isDelisted ? 'text-neutral-400 line-through' : 'text-primary'}`}>
                                                        NT${item.price.toLocaleString()}
                                                    </div>

                                                    <div className={`flex items-center border border-border rounded-full p-1 ${isDelisted ? 'bg-neutral-200' : 'bg-neutral-50'}`}>
                                                        <button
                                                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                            onClick={() => handleUpdateQuantity(item, -1)}
                                                            disabled={item.quantity <= 1 || isDelisted}
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className={`w-10 text-center font-medium ${isDelisted ? 'text-neutral-400' : ''}`}>{item.quantity}</span>
                                                        <button
                                                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                            onClick={() => handleUpdateQuantity(item, 1)}
                                                            disabled={item.quantity >= item.stock || isDelisted}
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* 下架警告文字 */}
                                                {isDelisted ? (
                                                    <p className="text-xs text-red-500 text-right mt-2 flex items-center justify-end gap-1">
                                                        <AlertCircle className="w-3 h-3" /> 此商品已失效，無法結帳
                                                    </p>
                                                ) : item.quantity >= item.stock && (
                                                    <p className="text-xs text-red-500 text-right mt-2">已達庫存上限 ({item.stock} 件)</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        <div className="lg:col-span-1">
                            <Card className="rounded-3xl border-border bg-white sticky top-24 shadow-sm">
                                <CardContent className="p-6 sm:p-8">
                                    <h2 className="text-xl font-bold mb-6">訂單摘要</h2>

                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between items-end">
                                            <span className="text-muted-foreground">商品總計 ({validItems.length} 件)</span>
                                            <span className="text-2xl font-bold text-primary">NT${total.toLocaleString()}</span>
                                        </div>

                                        {/* 如果有下架商品，這裡給個小提示 */}
                                        {hasDelistedItems && (
                                            <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg mt-2">
                                                您的購物車內含有已下架的失效商品，請將其移除後再進行結帳。
                                            </p>
                                        )}
                                    </div>

                                    <Separator className="my-6" />

                                    <Button
                                        size="lg"
                                        className={`w-full rounded-full text-lg h-14 ${hasDelistedItems ? 'bg-neutral-300 text-neutral-500 hover:bg-neutral-300 cursor-not-allowed' : ''}`}
                                        disabled={hasDelistedItems || validItems.length === 0}
                                        onClick={() => toast.info("🚀 即將推出結帳功能")}
                                    >
                                        {hasDelistedItems ? "請先移除下架商品" : "前往結帳"}
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