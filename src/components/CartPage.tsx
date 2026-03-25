import { ChevronLeft, Trash2, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CartPageProps {
    onNavigate: (page: string, productId?: string) => void;
}
// 配合後端回傳的格式
interface CartItem {
    cartId: string;    // 資料庫裡的文件 ID (email_productId)
    productId: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
    seller: string;
    stock: number;
}

export function CartPage({ onNavigate }: CartPageProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🌟 1. 從資料庫讀取該使用者的雲端購物車
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

    // 🌟 2. 更改數量 (直接與後端同步)
    const handleUpdateQuantity = async (productId: string, change: number) => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);

        try {
            // 呼叫 add API，傳入 change (1 或 -1)
            const res = await fetch('http://localhost:3001/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    productId: productId,
                    quantity: change
                })
            });
            const data = await res.json();
            if (data.success) {
                // 成功後重新抓取最新資料，確保前端與資料庫一致
                fetchCartItems();
            }
        } catch (error) {
            toast.error("更新數量失敗");
        }
    };

    // 🌟 3. 移除商品 (從資料庫刪除)
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

    // 計算金額
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = cartItems.length > 0 ? 60 : 0;
    const total = subtotal + shippingFee;

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
                            {cartItems.map((item) => (
                                <Card key={item.cartId} className="rounded-2xl border-border bg-white overflow-hidden">
                                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-border cursor-pointer" onClick={() => onNavigate('product-detail', item.productId)}>
                                            <ImageWithFallback src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>

                                        <div className="flex-1 w-full">
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <h3 className="font-bold text-lg cursor-pointer hover:text-primary transition-colors" onClick={() => onNavigate('product-detail', item.productId)}>
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">賣家：{item.seller}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-red-500 rounded-full" onClick={() => removeItem(item.cartId)}>
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
                                                        onClick={() => handleUpdateQuantity(item.productId, -1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                                                    <button
                                                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all"
                                                        onClick={() => handleUpdateQuantity(item.productId, 1)}
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
                                        onClick={() => toast.info("🚀 即將推出結帳功能")}
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