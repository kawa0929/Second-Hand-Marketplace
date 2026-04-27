import { useState } from "react";
import { 
    ArrowLeft, MapPin, CreditCard, Store, Truck, Wallet, 
    CheckCircle2, Smartphone, ExternalLink, Home, FileText, User
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CheckoutPageProps {
    onNavigate: (page: string, data?: any) => void;
}

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
    const [checkoutStep, setCheckoutStep] = useState<'form' | 'redirect' | 'success'>('form');
    
    const [checkoutItems] = useState<any[]>(() => {
        try {
            const savedData = localStorage.getItem('checkout_items');
            return savedData ? JSON.parse(savedData) : [];
        } catch { return []; }
    });

    const [deliveryMethod, setDeliveryMethod] = useState("711");
    const [paymentMethod, setPaymentMethod] = useState("credit_card");
    const [receiver, setReceiver] = useState({ name: "", phone: "", address: "", cardNumber: "" });

    const groupedItems = checkoutItems.reduce((acc: any, item: any) => {
        const sellerName = item.seller || "個人賣家";
        if (!acc[sellerName]) acc[sellerName] = [];
        acc[sellerName].push(item);
        return acc;
    }, {});

    const itemTotal = checkoutItems.reduce((sum, item) => sum + (Number(item.price || 0) * (item.quantity || 1)), 0);
    const shippingFee = deliveryMethod === "home" ? 100 : 60;
    const orderTotal = itemTotal + shippingFee;

    // 🌟 核心：嚴格格式驗證邏輯
    const handleCheckoutSubmit = () => {
        const { name, phone, address, cardNumber } = receiver;

        // 1. 姓名驗證 (至少2個字)
        if (name.trim().length < 2) {
            toast.error("姓名格式錯誤：請輸入真實姓名（至少2個字）");
            return;
        }

        // 2. 電話驗證 (正規表示式：09開頭且後接8位數字，共10位)
        const phoneRegex = /^09\d{8}$/;
        if (!phoneRegex.test(phone)) {
            toast.error("電話格式錯誤：須為 09 開頭的 10 位數字（例如 0912345678）");
            return;
        }

        // 3. 地址驗證 (至少5個字)
        if (address.trim().length < 5) {
            toast.error("地址或門市資訊過短：請填寫詳細且完整的取貨資訊");
            return;
        }

        // 4. 信用卡驗證 (如果選擇信用卡)
        if (paymentMethod === 'credit_card') {
            const cardRegex = /^\d{16}$/;
            if (!cardRegex.test(cardNumber)) {
                toast.error("卡號格式錯誤：信用卡號須為 16 位純數字");
                return;
            }
        }

        // 通過驗證後執行
        toast.success("🎉 資料格式正確，訂單已建立！");
        localStorage.removeItem('checkout_items');
        setCheckoutStep('success');
    };

    if (checkoutStep === 'success') {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
                <Card className="max-w-sm w-full rounded-2xl border-none shadow-sm text-center overflow-hidden">
                    <div className="bg-green-500 py-8 flex justify-center"><CheckCircle2 className="w-16 h-16 text-white" /></div>
                    <CardContent className="p-8 space-y-6">
                        <h1 className="text-xl font-bold">訂單建立成功！</h1>
                        <div className="flex flex-col gap-2">
                            <Button className="w-full rounded-xl font-bold py-5" onClick={() => onNavigate('transactions')}>查看訂單</Button>
                            <Button variant="ghost" className="w-full" onClick={() => onNavigate('home')}>回首頁</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] pb-10">
            <div className="bg-white border-b border-neutral-100 sticky top-0 z-10 h-14 flex items-center">
                <div className="max-w-6xl mx-auto px-4 w-full flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => onNavigate('cart')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-lg font-bold text-neutral-800">結帳</h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                    
                    {/* 物流選擇 */}
                    <Card className="rounded-2xl border-none shadow-sm bg-white">
                        <CardContent className="p-6">
                            <h2 className="text-sm font-bold mb-4 flex items-center gap-1 text-neutral-600">
                                <Truck className="w-4 h-4" /> 選擇物流方式 <span className="text-red-500 font-bold ml-1 text-lg">*</span>
                            </h2>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {[
                                    { id: '711', label: '7-11', icon: Store, fee: 60 },
                                    { id: 'family', label: '全家', icon: Store, fee: 60 },
                                    { id: 'hilife', label: '萊爾富', icon: Store, fee: 60 },
                                    { id: 'home', label: '宅配', icon: Truck, fee: 100 }
                                ].map((m) => (
                                    <div
                                        key={m.id}
                                        className={`flex-shrink-0 w-36 p-4 rounded-xl border-2 transition-all cursor-pointer ${deliveryMethod === m.id ? 'border-[#333] bg-neutral-50 shadow-sm' : 'border-neutral-100 hover:border-neutral-200'}`}
                                        onClick={() => setDeliveryMethod(m.id)}
                                    >
                                        <div className="flex justify-between items-center mb-2 text-sm font-bold">
                                            <div className="flex items-center gap-1.5"><m.icon className="w-3.5 h-3.5" /> {m.label}</div>
                                            {deliveryMethod === m.id && <CheckCircle2 className="w-4 h-4 text-[#333]" />}
                                        </div>
                                        <div className="text-[11px] text-neutral-500">運費 NT${m.fee}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 付款方式 */}
                    <Card className="rounded-2xl border-none shadow-sm bg-white">
                        <CardContent className="p-6">
                            <h2 className="text-sm font-bold mb-4 flex items-center gap-1 text-neutral-600">
                                <CreditCard className="w-4 h-4" /> 選擇付款方式 <span className="text-red-500 font-bold ml-1 text-lg">*</span>
                            </h2>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {[
                                    { id: 'credit_card', label: '信用卡', desc: '線上刷卡' },
                                    { id: 'cod', label: '貨到付款', desc: '取貨時付款' },
                                    { id: 'linepay', label: 'LINE Pay', desc: '電子支付' },
                                    { id: 'jkopay', label: '街口支付', desc: '電子支付' },
                                    { id: 'easywallet', label: '悠遊付', desc: '電子支付' },
                                    { id: 'pxpay', label: '全支付', desc: '電子支付' },
                                ].map((p) => (
                                    <div
                                        key={p.id}
                                        className={`flex-shrink-0 w-36 p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === p.id ? 'border-[#333] bg-neutral-50 shadow-sm' : 'border-neutral-100 hover:border-neutral-200'}`}
                                        onClick={() => setPaymentMethod(p.id)}
                                    >
                                        <div className="flex justify-between items-center mb-1 text-sm font-bold">
                                            <span>{p.label}</span>
                                            {paymentMethod === p.id && <CheckCircle2 className="w-4 h-4 text-[#333]" />}
                                        </div>
                                        <div className="text-[10px] text-neutral-400">{p.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 收件資訊 - 硬性格式校驗 */}
                    <Card className="rounded-2xl border-none shadow-sm bg-white">
                        <CardContent className="p-6">
                            <h2 className="text-sm font-bold mb-5 flex items-center gap-1 text-neutral-600">
                                <MapPin className="w-4 h-4" /> 收件資訊
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-neutral-500 uppercase">
                                        收件人姓名 <span className="text-red-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <input type="text" className="w-full p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 outline-none focus:border-neutral-300 text-sm" placeholder="姓名" value={receiver.name} onChange={e => setReceiver({...receiver, name: e.target.value})} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-neutral-500 uppercase">
                                        聯絡電話 <span className="text-red-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <input type="text" className="w-full p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 outline-none focus:border-neutral-300 text-sm" placeholder="09xx-xxx-xxx" value={receiver.phone} onChange={e => setReceiver({...receiver, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} />
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-xs font-bold text-neutral-500 uppercase">
                                        詳細收件地址 / 門市名稱 <span className="text-red-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <input type="text" className="w-full p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 outline-none focus:border-neutral-300 text-sm" placeholder="地址或取貨店名" value={receiver.address} onChange={e => setReceiver({...receiver, address: e.target.value})} />
                                </div>

                                {paymentMethod === 'credit_card' && (
                                    <div className="md:col-span-2 pt-2 animate-in fade-in slide-in-from-top-1">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-neutral-500 uppercase">
                                                信用卡卡號 <span className="text-red-500 font-bold ml-0.5">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                className="w-full p-2.5 rounded-lg bg-primary/5 border border-primary/20 outline-none focus:border-primary/40 font-mono text-sm tracking-widest" 
                                                placeholder="16 碼卡號" 
                                                value={receiver.cardNumber} 
                                                onChange={e => setReceiver({...receiver, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)})} 
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 右側：摘要 */}
                <div className="lg:col-span-1">
                    <Card className="rounded-2xl border-none shadow-sm bg-white sticky top-20 overflow-hidden">
                        <CardContent className="p-6">
                            <h2 className="text-base font-bold mb-5 flex items-center gap-2 text-neutral-400">
                                <FileText className="w-4 h-4" /> 訂單摘要
                            </h2>
                            <div className="space-y-4 mb-6 max-h-[220px] overflow-y-auto pr-1">
                                {Object.keys(groupedItems).map((seller) => (
                                    <div key={seller} className="space-y-2">
                                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-bold uppercase tracking-tight">
                                            <User className="w-2.5 h-2.5" /> {seller}
                                        </div>
                                        {groupedItems[seller].map((item: any, idx: number) => (
                                            <div key={idx} className="flex gap-3 bg-neutral-50/50 p-2 rounded-lg">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-100">
                                                    <ImageWithFallback src={item.image} alt="圖" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0 py-0.5">
                                                    <div className="font-bold text-neutral-800 truncate text-[11px]">{item.title}</div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-neutral-500 text-[10px]">NT${Number(item.price).toLocaleString()}</span>
                                                        <span className="text-neutral-400 text-[10px]">x{item.quantity || 1}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 pt-4 border-t border-neutral-50 text-[11px]">
                                <div className="flex justify-between text-neutral-400"><span>商品總計</span><span>NT${itemTotal.toLocaleString()}</span></div>
                                <div className="flex justify-between text-neutral-400"><span>運費</span><span>NT${shippingFee}</span></div>
                                <div className="flex justify-between font-bold text-base pt-2 text-neutral-800 border-t border-dashed">
                                    <span>總計</span>
                                    <span className="text-primary font-black">NT${orderTotal.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <Button 
                                className="w-full mt-6 rounded-xl py-5 text-sm font-bold bg-[#333] hover:bg-black text-white shadow-sm transition-all" 
                                onClick={handleCheckoutSubmit}
                            >
                                確認送出訂單
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}