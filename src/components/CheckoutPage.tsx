import { useState, useEffect } from "react";
import { 
    ArrowLeft, MapPin, CreditCard, Store, Truck, Wallet, 
    CheckCircle2, Smartphone, ExternalLink, Home, FileText 
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CheckoutPageProps {
    // 🌟 修改：讓 onNavigate 可以接收第二個參數 (商品ID)
    onNavigate: (page: string, productId?: string) => void;
    productId?: string | null;
}

export function CheckoutPage({ onNavigate, productId }: CheckoutPageProps) {
    const [checkoutStep, setCheckoutStep] = useState<'form' | 'redirect' | 'success'>('form');
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [deliveryMethod, setDeliveryMethod] = useState("711");
    const [paymentMethod, setPaymentMethod] = useState("credit_card");
    const [receiver, setReceiver] = useState({ name: "", phone: "", city: "", address: "", cardNumber: "" });

    const cityOptions = ['基隆市', '台北市', '新北市', '桃園市', '新竹市', '新竹縣', '苗栗縣', '台中市', '彰化縣', '南投縣', '雲林縣', '嘉義市', '嘉義縣', '台南市', '高雄市', '屏東縣', '宜蘭縣', '花蓮縣', '台東縣', '澎湖縣', '金門縣', '連江縣'];

    const paymentOptions = [
        { id: 'credit_card', label: '信用卡', icon: CreditCard, desc: '線上刷卡最方便' },
        { id: 'cod', label: '貨到付款', icon: Wallet, desc: '取貨時付款即可' },
        { id: 'jkopay', label: '街口支付', icon: Smartphone, desc: '電子支付' },
        { id: 'linepay', label: 'LINE Pay', icon: Smartphone, desc: '電子支付' },
        { id: 'easywallet', label: '悠遊付', icon: Smartphone, desc: '電子支付' },
        { id: 'pxpay', label: '全支付', icon: Smartphone, desc: '電子支付' },
    ];

    useEffect(() => {
        if (productId) {
            fetch(`http://localhost:3001/api/product/${productId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setProduct(data.product);
                    } else {
                        toast.error("讀取商品資料失敗");
                    }
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("連線錯誤", err);
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, [productId]);

    if (isLoading) {
        return <div className="min-h-screen bg-neutral-50 flex items-center justify-center">載入結帳資訊中...</div>;
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center">
                <div className="text-xl font-bold mb-4">無法取得商品資訊</div>
                <Button onClick={() => onNavigate('home')}>回首頁</Button>
            </div>
        );
    }

    const itemPrice = Number(product.price) || 0;
    const itemTotal = itemPrice * 1;
    const shippingFee = deliveryMethod === "home" ? 100 : 60;
    const orderTotal = itemTotal + shippingFee;
    const mockOrderNumber = `ORD${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
    const displayImage = product.images?.[0] || product.image || product.imageUrl || "https://via.placeholder.com/500";

    const handleCheckoutSubmit = () => {
        if (!receiver.name || !receiver.phone || !receiver.address) {
            toast.error("請填寫完整的收件人基本資訊喔！");
            return;
        }
        if (deliveryMethod === "home" && !receiver.city) {
            toast.error("宅配請記得選擇縣市！");
            return;
        }
        if (paymentMethod === "credit_card" && !receiver.cardNumber) {
            toast.error("請輸入信用卡卡號！");
            return;
        }

        if (paymentMethod === 'credit_card' || paymentMethod === 'cod') {
            toast.success("🎉 訂單已建立！");
            setCheckoutStep('success');
        } else {
            setCheckoutStep('redirect');
        }
    };

    if (checkoutStep === 'redirect') {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-border max-w-sm w-full text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                            <Smartphone className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-3">準備前往第三方支付</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            您選擇了電子支付方式。<br/>
                            請點擊下方按鈕，系統將引導您至對應的支付平台完成扣款手續。
                        </p>
                    </div>
                    <Button 
                        className="w-full rounded-xl py-6 text-base font-bold flex items-center justify-center gap-2" 
                        onClick={() => {
                            toast.success("付款完成！");
                            setCheckoutStep('success');
                        }}
                    >
                        立即前往 <ExternalLink className="w-5 h-5" />
                    </Button>
                    <button 
                        className="text-sm text-muted-foreground hover:text-primary transition-colors mt-4"
                        onClick={() => setCheckoutStep('form')}
                    >
                        返回重選付款方式
                    </button>
                </div>
            </div>
        );
    }

    if (checkoutStep === 'success') {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
                <Card className="max-w-md w-full rounded-2xl border-border shadow-sm text-center overflow-hidden">
                    <div className="bg-green-500 py-8 flex justify-center">
                        <CheckCircle2 className="w-20 h-20 text-white" />
                    </div>
                    <CardContent className="p-8 space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">訂單建立成功！</h1>
                            <p className="text-muted-foreground text-sm">
                                感謝您的購買，賣家將會盡快為您安排出貨。
                            </p>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-xl text-left border border-neutral-100">
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-muted-foreground">訂單編號</span>
                                <span className="font-mono font-medium">{mockOrderNumber}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">付款狀態</span>
                                <span className="text-green-600 font-bold">已完成 / 等待付款</span>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button 
                                variant="outline" 
                                className="flex-1 rounded-xl"
                                onClick={() => onNavigate('home')} 
                            >
                                <Home className="w-4 h-4 mr-2" /> 回首頁
                            </Button>
                            <Button 
                                className="flex-1 rounded-xl font-bold"
                                onClick={() => onNavigate('transactions')} 
                            >
                                <FileText className="w-4 h-4 mr-2" /> 查看訂單
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 pb-20">
            <div className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
                    {/* 🌟 核心修改 1：點擊返回按鈕時，帶上商品 ID 回到商品詳細頁面 */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full" 
                        onClick={() => onNavigate('product-detail', productId || undefined)}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-bold">結帳</h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-primary" /> 選擇物流方式 <span className="text-red-500">*</span>
                            </h2>
                            <div className="flex overflow-x-auto gap-4 pb-2 snap-x">
                                {[
                                    { id: '711', label: '7-11 取貨', icon: Store, fee: 60 },
                                    { id: 'family', label: '全家取貨', icon: Store, fee: 60 },
                                    { id: 'hilife', label: '萊爾富取貨', icon: Store, fee: 60 },
                                    { id: 'home', label: '宅配到府', icon: Truck, fee: 100 }
                                ].map((method) => (
                                    <div
                                        key={method.id}
                                        className={`flex-shrink-0 w-[200px] snap-center p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryMethod === method.id ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-primary/50'}`}
                                        onClick={() => setDeliveryMethod(method.id)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2 font-bold whitespace-nowrap">
                                                <method.icon className="w-4 h-4" /> {method.label}
                                            </div>
                                            {deliveryMethod === method.id && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
                                        </div>
                                        <div className="text-sm text-muted-foreground">運費 NT${method.fee}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" /> 選擇付款方式 <span className="text-red-500">*</span>
                            </h2>
                            <div className="flex overflow-x-auto gap-4 pb-2 snap-x">
                                {paymentOptions.map((option) => (
                                    <div
                                        key={option.id}
                                        className={`flex-shrink-0 w-[200px] snap-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === option.id ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-primary/50'}`}
                                        onClick={() => setPaymentMethod(option.id)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2 font-bold whitespace-nowrap text-sm">
                                                <option.icon className="w-4 h-4" /> {option.label}
                                            </div>
                                            {paymentMethod === option.id && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
                                        </div>
                                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" /> 收件資訊
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">收件人姓名 <span className="text-red-500">*</span></label>
                                    <input type="text" className="w-full p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="請輸入真實姓名" value={receiver.name} onChange={(e) => setReceiver({ ...receiver, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">聯絡電話 <span className="text-red-500">*</span></label>
                                    <input type="text" className="w-full p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="例如: 0912345678" value={receiver.phone} onChange={(e) => setReceiver({ ...receiver, phone: e.target.value })} />
                                </div>

                                {deliveryMethod === 'home' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">縣市 <span className="text-red-500">*</span></label>
                                        <select className="w-full p-3 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" value={receiver.city} onChange={(e) => setReceiver({ ...receiver, city: e.target.value })}>
                                            <option value="">請選擇縣市</option>
                                            {cityOptions.map(city => <option key={city} value={city}>{city}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-1">{deliveryMethod === 'home' ? '詳細地址' : '取貨門市'} <span className="text-red-500">*</span></label>
                                    <input type="text" className="w-full p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder={deliveryMethod === 'home' ? '請輸入區、街道、巷弄、樓層' : '請輸入門市名稱或店號'} value={receiver.address} onChange={(e) => setReceiver({ ...receiver, address: e.target.value })} />
                                </div>

                                {paymentMethod === 'credit_card' && (
                                    <div className="pt-4 mt-4 border-t border-neutral-100">
                                        <label className="block text-sm font-medium mb-1">信用卡卡號 <span className="text-red-500">*</span></label>
                                        <input type="text" maxLength={16} className="w-full p-3 rounded-xl border border-primary/40 bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono tracking-widest" placeholder="請輸入 16 碼信用卡號" value={receiver.cardNumber} onChange={(e) => setReceiver({ ...receiver, cardNumber: e.target.value.replace(/\D/g, '') })} />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="rounded-2xl border-border shadow-sm sticky top-24">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold mb-4">訂單摘要</h2>
                            <div className="flex gap-4 mb-6 pb-6 border-b border-neutral-100">
                                <div className="w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                                    <ImageWithFallback src={displayImage} alt="商品圖" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium line-clamp-2 mb-1">{product.title || product.name}</div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm font-bold text-primary">NT${itemPrice.toLocaleString()}</span>
                                        <span className="text-xs text-muted-foreground">x1</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm mb-6">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>商品總計 (1 件)</span>
                                    <span>NT${itemTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>運費 ({deliveryMethod === 'home' ? '宅配' : '超商'})</span>
                                    <span>NT${shippingFee}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-3 border-t border-neutral-100">
                                    <span>結帳總金額</span>
                                    <span className="text-primary">NT${orderTotal.toLocaleString()}</span>
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