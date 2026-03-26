import { useState } from "react";
import { ArrowLeft, MapPin, CreditCard, Store, Truck, Wallet, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CheckoutPageProps {
    onNavigate: (page: string) => void;
}

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
    // 模擬購物車傳過來的商品資料 (對應你圖二的粉紅豬小妹)
    const mockCartItem = {
        id: "item-1",
        title: "Peppa Pig 粉紅豬小妹佩佩豬喬治絨毛娃娃玩偶抱枕物款",
        variant: "喬治款",
        price: 150,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1559805906-81a94127598c?w=500&q=80" // 隨意放個佔位圖
    };

    const [deliveryMethod, setDeliveryMethod] = useState("711"); // 預設 7-11
    const [paymentMethod, setPaymentMethod] = useState("cod"); // 預設貨到付款
    const [receiver, setReceiver] = useState({ name: "", phone: "", address: "" });

    // 計算金額
    const itemTotal = mockCartItem.price * mockCartItem.quantity;
    const shippingFee = deliveryMethod === "home" ? 100 : 60; // 宅配 100，超商 60
    const orderTotal = itemTotal + shippingFee;

    const handleCheckoutSubmit = () => {
        if (!receiver.name || !receiver.phone || !receiver.address) {
            toast.error("請填寫完整的收件人資訊喔！");
            return;
        }

        // 這裡未來可以串接後端 API，把訂單資料寫入資料庫
        console.log("送出訂單:", { items: [mockCartItem], deliveryMethod, paymentMethod, receiver, total: orderTotal });

        // 模擬送出成功的體驗
        toast.success("🎉 訂單已建立！模擬結帳成功！");
        // 專題展示用：結帳完導回首頁或導向交易紀錄頁面
        onNavigate('home');
    };

    return (
        <div className="min-h-screen bg-neutral-50 pb-20">
            {/* 頂部導覽 */}
            <div className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onNavigate('cart')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-bold">結帳</h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 左側：填寫資訊區 (佔 2 欄) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 物流方式 */}
                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-primary" /> 選擇物流方式
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryMethod === '711' ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-primary/50'}`}
                                    onClick={() => setDeliveryMethod('711')}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 font-bold"><Store className="w-4 h-4" /> 7-11 取貨</div>
                                        {deliveryMethod === '711' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                    </div>
                                    <div className="text-sm text-muted-foreground">運費 NT$60</div>
                                </div>
                                <div
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryMethod === 'home' ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-primary/50'}`}
                                    onClick={() => setDeliveryMethod('home')}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 font-bold"><Truck className="w-4 h-4" /> 宅配到府</div>
                                        {deliveryMethod === 'home' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                    </div>
                                    <div className="text-sm text-muted-foreground">運費 NT$100</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 付款方式 */}
                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" /> 選擇付款方式
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-primary/50'}`}
                                    onClick={() => setPaymentMethod('cod')}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 font-bold"><Wallet className="w-4 h-4" /> 貨到付款</div>
                                        {paymentMethod === 'cod' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                    </div>
                                    <div className="text-sm text-muted-foreground">取貨時付款即可</div>
                                </div>
                                <div
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'transfer' ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-primary/50'}`}
                                    onClick={() => setPaymentMethod('transfer')}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 font-bold"><CreditCard className="w-4 h-4" /> 銀行轉帳</div>
                                        {paymentMethod === 'transfer' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                    </div>
                                    <div className="text-sm text-muted-foreground">提供專屬虛擬帳號</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 收件資訊 */}
                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" /> 收件資訊
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">收件人姓名</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="請輸入真實姓名"
                                        value={receiver.name}
                                        onChange={(e) => setReceiver({ ...receiver, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">聯絡電話</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="例如: 0912345678"
                                        value={receiver.phone}
                                        onChange={(e) => setReceiver({ ...receiver, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {deliveryMethod === '711' ? '取貨門市' : '詳細地址'}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder={deliveryMethod === '711' ? '請輸入門市名稱或店號' : '請輸入縣市、區、街道地址'}
                                        value={receiver.address}
                                        onChange={(e) => setReceiver({ ...receiver, address: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 右側：訂單摘要 (佔 1 欄) */}
                <div>
                    <Card className="rounded-2xl border-border shadow-sm sticky top-24">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold mb-4">訂單摘要</h2>

                            {/* 商品明細 (簡單版) */}
                            <div className="flex gap-4 mb-6 pb-6 border-b border-neutral-100">
                                <div className="w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                                    <ImageWithFallback src={mockCartItem.image} alt="商品圖" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium line-clamp-2 mb-1">{mockCartItem.title}</div>
                                    <div className="text-xs text-muted-foreground mb-1">規格: {mockCartItem.variant}</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-primary">NT${mockCartItem.price}</span>
                                        <span className="text-xs text-muted-foreground">x{mockCartItem.quantity}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 金額計算 */}
                            <div className="space-y-3 text-sm mb-6">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>商品總計 (1 件)</span>
                                    <span>NT${itemTotal}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>運費 ({deliveryMethod === '711' ? '超商' : '宅配'})</span>
                                    <span>NT${shippingFee}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-3 border-t border-neutral-100">
                                    <span>結帳總金額</span>
                                    <span className="text-primary">NT${orderTotal}</span>
                                </div>
                            </div>

                            <Button className="w-full rounded-full py-6 text-base font-bold" onClick={handleCheckoutSubmit}>
                                確認送出訂單
                            </Button>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}