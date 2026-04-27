import { ChevronLeft, Trash2, Plus, Minus, ShoppingBag, Loader2, AlertCircle, Store } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CartPageProps {
    onNavigate: (page: string, data?: any) => void;
}

interface CartItem {
    cartId: string;
    productId: string;
    variationName: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
    seller: string;
    stock: number;
    status: string;
}

export function CartPage({ onNavigate }: CartPageProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // 🌟 新增：用來記錄目前「被勾選」要結帳的商品 ID
    const [selectedCartIds, setSelectedCartIds] = useState<string[]>([]);

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
        if (item.status === '已下架') return;

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
                body: JSON.stringify({
                    email: user.email,
                    productId: item.productId,
                    quantity: change,
                    variationName: item.variationName
                })
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
                // 如果刪除的商品剛好有被勾選，也要從勾選名單移除
                setSelectedCartIds(prev => prev.filter(id => id !== cartId));
                toast.success("已從雲端購物車移除");
            }
        } catch (error) {
            toast.error("移除失敗");
        }
    };

    // 取得所有未下架的有效商品
    const validItems = cartItems.filter(item => item.status !== '已下架');
    
    // 🌟 新增邏輯：將商品依照「賣家(seller)」進行分群
    const groupedCartItems = Object.entries(
        validItems.reduce((acc, item) => {
            const sellerName = item.seller || '未知賣家';
            if (!acc[sellerName]) acc[sellerName] = [];
            acc[sellerName].push(item);
            return acc;
        }, {} as Record<string, CartItem[]>)
    );

    // 🌟 新增邏輯：勾選 / 取消勾選單一商品
    const toggleItemSelection = (cartId: string, seller: string) => {
        // 先檢查目前已經打勾的商品，是不是屬於「其他賣家」
        const currentlySelected = validItems.filter(i => selectedCartIds.includes(i.cartId));
        
        if (currentlySelected.length > 0 && currentlySelected[0].seller !== seller) {
            toast.error("不同賣家的商品無法合併結帳喔！系統已自動為您切換賣家。");
            // 直接切換為只勾選當前點擊的這個商品
            setSelectedCartIds([cartId]);
            return;
        }

        setSelectedCartIds(prev => 
            prev.includes(cartId) ? prev.filter(id => id !== cartId) : [...prev, cartId]
        );
    };

    // 🌟 新增邏輯：點擊賣家名稱旁的「全選」按鈕
    const toggleSellerSelection = (seller: string, sellerItems: CartItem[]) => {
        const itemIds = sellerItems.map(i => i.cartId);
        const isAllSelected = itemIds.every(id => selectedCartIds.includes(id));

        if (isAllSelected) {
            // 如果該賣家商品已經全選，則全部取消
            setSelectedCartIds([]);
        } else {
            // 選擇該賣家所有商品 (並清除其他賣家的勾選，確保單一賣家結帳原則)
            const currentlySelected = validItems.filter(i => selectedCartIds.includes(i.cartId));
            if (currentlySelected.length > 0 && currentlySelected[0].seller !== seller) {
                toast.error("不同賣家的商品無法合併結帳喔！系統已自動為您切換賣家。");
            }
            setSelectedCartIds(itemIds);
        }
    };

    // 🌟 動態計算：只計算「有被打勾」的商品總額與數量
    const selectedItems = validItems.filter(item => selectedCartIds.includes(item.cartId));
    const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            toast.error("請先勾選要結帳的商品喔！");
            return;
        }
        
        // 將被勾選的商品存入 localStorage 給 CheckoutPage 讀取
        localStorage.setItem('checkout_items', JSON.stringify(selectedItems));
        onNavigate('checkout');
    };

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
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* 🌟 依照賣家群組來渲染商品清單 */}
                            {groupedCartItems.map(([seller, items]) => {
                                // 判斷這個賣家的商品是否「全選」了
                                const isSellerAllSelected = items.every(item => selectedCartIds.includes(item.cartId));

                                return (
                                    <div key={seller} className="bg-white rounded-3xl p-4 sm:p-6 border border-border shadow-sm">
                                        
                                        {/* 賣家標題列 */}
                                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-100">
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 rounded border-neutral-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                                                checked={isSellerAllSelected}
                                                onChange={() => toggleSellerSelection(seller, items)}
                                            />
                                            <Store className="w-5 h-5 text-neutral-500" />
                                            <span className="font-bold text-lg">{seller}</span>
                                        </div>

                                        {/* 該賣家底下的商品列表 */}
                                        <div className="space-y-4">
                                            {items.map((item) => {
                                                const isSelected = selectedCartIds.includes(item.cartId);

                                                return (
                                                    <div key={item.cartId} className="flex items-center gap-4">
                                                        
                                                        {/* 單一商品的勾選框 */}
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-5 h-5 rounded border-neutral-300 text-primary focus:ring-primary accent-primary cursor-pointer flex-shrink-0"
                                                            checked={isSelected}
                                                            onChange={() => toggleItemSelection(item.cartId, seller)}
                                                        />

                                                        {/* 商品卡片本體 */}
                                                        <Card className="flex-1 rounded-2xl border-none bg-neutral-50/50 shadow-none">
                                                            <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-neutral-200 flex-shrink-0 border border-border cursor-pointer relative" onClick={() => onNavigate('product-detail', item.productId)}>
                                                                    <ImageWithFallback src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                                </div>

                                                                <div className="flex-1 w-full">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <div>
                                                                            <h3 className="font-bold text-base cursor-pointer hover:text-primary transition-colors line-clamp-2" onClick={() => onNavigate('product-detail', item.productId)}>
                                                                                {item.title}
                                                                            </h3>
                                                                            {item.variationName && item.variationName !== "單一款式" && (
                                                                                <p className="text-sm text-muted-foreground mt-1">規格：{item.variationName}</p>
                                                                            )}
                                                                        </div>
                                                                        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-red-500 rounded-full h-8 w-8 -mr-2" onClick={() => removeItem(item.cartId)}>
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>

                                                                    <div className="flex items-center justify-between mt-3">
                                                                        <div className="text-base font-bold text-primary">
                                                                            NT${item.price.toLocaleString()}
                                                                        </div>

                                                                        <div className="flex items-center border border-border rounded-full p-1 bg-white">
                                                                            <button
                                                                                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                onClick={() => handleUpdateQuantity(item, -1)}
                                                                                disabled={item.quantity <= 1}
                                                                            >
                                                                                <Minus className="w-3 h-3" />
                                                                            </button>
                                                                            <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                                                                            <button
                                                                                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                onClick={() => handleUpdateQuantity(item, 1)}
                                                                                disabled={item.quantity >= item.stock}
                                                                            >
                                                                                <Plus className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    {item.quantity >= item.stock && (
                                                                        <p className="text-xs text-red-500 text-right mt-1">已達庫存上限 ({item.stock} 件)</p>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* 顯示已下架商品 (不可勾選，僅供刪除) */}
                            {cartItems.filter(i => i.status === '已下架').length > 0 && (
                                <div className="bg-neutral-100 rounded-3xl p-4 sm:p-6 border border-border opacity-70">
                                    <div className="flex items-center gap-2 mb-4 text-neutral-500">
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="font-bold">已失效商品</span>
                                    </div>
                                    <div className="space-y-4">
                                        {cartItems.filter(i => i.status === '已下架').map(item => (
                                            <div key={item.cartId} className="flex items-center gap-4 pl-9">
                                                <Card className="flex-1 rounded-2xl border-none bg-neutral-200/50 shadow-none">
                                                    <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-4">
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 grayscale">
                                                            <ImageWithFallback src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 w-full flex justify-between items-center">
                                                            <div>
                                                                <h3 className="font-bold text-neutral-500 line-through text-sm">{item.title}</h3>
                                                                <span className="text-xs text-red-500 font-bold px-2 py-0.5 bg-red-100 rounded mt-1 inline-block">已下架</span>
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-red-600 rounded-full" onClick={() => removeItem(item.cartId)}>
                                                                <Trash2 className="w-5 h-5" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 右側：訂單摘要 */}
                        <div className="lg:col-span-1">
                            <Card className="rounded-3xl border-border bg-white sticky top-24 shadow-sm">
                                <CardContent className="p-6 sm:p-8">
                                    <h2 className="text-xl font-bold mb-6">訂單摘要</h2>

                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between items-end">
                                            {/* 🌟 動態顯示：只顯示有勾選的件數與總額 */}
                                            <span className="text-muted-foreground">已選購 ({selectedItems.length} 件)</span>
                                            <span className="text-2xl font-bold text-primary">NT${total.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <Separator className="my-6" />

                                    <Button
                                        size="lg"
                                        className={`w-full rounded-full text-lg h-14 ${selectedItems.length === 0 ? 'bg-neutral-300 text-neutral-500 hover:bg-neutral-300 cursor-not-allowed' : ''}`}
                                        disabled={selectedItems.length === 0}
                                        onClick={handleCheckout}
                                    >
                                        {selectedItems.length === 0 ? "請勾選結帳商品" : "前往結帳"}
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