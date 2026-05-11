import { useState } from "react";
import {
    ArrowLeft, MapPin, CreditCard, Store, Truck, Wallet,
    CheckCircle2, Smartphone, ExternalLink, Home, FileText, User,
    Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";

// 🌟 台灣縣市與行政區資料
const taiwanDistricts: Record<string, string[]> = {
    "台北市": ["中正區", "萬華區", "大同區", "中山區", "松山區", "大安區", "信義區", "內湖區", "南港區", "士林區", "北投區", "文山區"],
    "新北市": ["板橋區", "三重區", "中和區", "永和區", "新莊區", "新店區", "樹林區", "鶯歌區", "三峽區", "淡水區", "汐止區", "瑞芳區", "土城區", "蘆洲區", "五股區", "泰山區", "林口區", "深坑區", "石碇區", "坪林區", "三芝區", "石門區", "八里區", "平溪區", "雙溪區", "貢寮區", "金山區", "萬里區", "烏來區"],
    "桃園市": ["桃園區", "中壢區", "大溪區", "楊梅區", "蘆竹區", "大園區", "龜山區", "八德區", "龍潭區", "平鎮區", "新屋區", "觀音區", "復興區"],
    "台中市": ["中區", "東區", "南區", "西區", "北區", "北屯區", "西屯區", "南屯區", "太平區", "大里區", "霧峰區", "烏日區", "豐原區", "後里區", "石岡區", "東勢區", "和平區", "新社區", "潭子區", "大雅區", "神岡區", "大肚區", "龍井區", "沙鹿區", "梧棲區", "清水區", "大甲區", "外埔區", "大安區"],
    "台南市": ["中西區", "東區", "南區", "北區", "安平區", "安南區", "永康區", "歸仁區", "新化區", "左鎮區", "玉井區", "楠西區", "南化區", "仁德區", "關廟區", "龍崎區", "官田區", "麻豆區", "佳里區", "西港區", "七股區", "學甲區", "下營區", "六甲區", "下營區", "新營區", "後壁區", "白河區", "東山區", "六甲區", "下營區", "柳營區", "鹽水區", "善化區", "大內區", "山上區", "新市區", "安定區"],
    "高雄市": ["新興區", "前金區", "苓雅區", "鹽埕區", "鼓山區", "旗津區", "前鎮區", "三民區", "楠梓區", "小港區", "左營區", "仁武區", "大社區", "岡山區", "路竹區", "阿蓮區", "田寮區", "燕巢區", "橋頭區", "梓官區", "彌陀區", "永安區", "湖內區", "鳳山區", "大寮區", "林園區", "鳥松區", "大樹區", "旗山區", "美濃區", "六龜區", "內門區", "杉林區", "甲仙區", "桃源區", "那瑪夏區", "茂林區", "茄萣區"],
    "宜蘭縣": ["宜蘭市", "羅東鎮", "蘇澳鎮", "頭城鎮", "礁溪鄉", "壯圍鄉", "員山鄉", "冬山鄉", "五結鄉", "三星鄉", "大同鄉", "南澳鄉"],
    "新竹市": ["東區", "北區", "香山區"],
    "新竹縣": ["竹北市", "竹東鎮", "新埔鎮", "關西鎮", "湖口鄉", "新豐鄉", "芎林鄉", "橫山鄉", "北埔鄉", "寶山鄉", "峨眉鄉", "尖石鄉", "五峰鄉"],
    "苗栗縣": ["苗栗市", "頭份市", "竹南鎮", "後龍鎮", "通霄鎮", "苑裡鎮", "卓蘭鎮", "造橋鄉", "西湖鄉", "頭屋鄉", "公館鄉", "銅鑼鄉", "三義鄉", "大湖鄉", "獅潭鄉", "三灣鄉", "南庄鄉", "泰安鄉"],
    "彰化縣": ["彰化市", "員林市", "和美鎮", "鹿港鎮", "溪湖鎮", "二林鎮", "田中鎮", "北斗鎮", "花壇鄉", "芬園鄉", "大村鄉", "永靖鄉", "伸港鄉", "線西鄉", "福興鄉", "秀水鄉", "埔心鄉", "埔鹽鄉", "大城鄉", "芳苑鄉", "竹塘鄉", "溪州鄉", "埤頭鄉", "二水鄉", "田尾鄉", "社頭鄉"],
    "南投縣": ["南投市", "埔里鎮", "草屯鎮", "竹山鎮", "集集鎮", "名間鄉", "鹿谷鄉", "中寮鄉", "魚池鄉", "國姓鄉", "水里鄉", "信義鄉", "仁愛鄉"],
    "雲林縣": ["斗六市", "斗南鎮", "虎尾鎮", "西螺鎮", "土庫鎮", "北港鎮", "古坑鄉", "大埤鄉", "莿桐鄉", "林內鄉", "二崙鄉", "崙背鄉", "麥寮鄉", "東勢鄉", "褒忠鄉", "台西鄉", "元長鄉", "四湖鄉", "口湖鄉", "水林鄉"],
    "嘉義市": ["東區", "西區"],
    "嘉義縣": ["太保市", "朴子市", "布袋鎮", "大林鎮", "民雄鄉", "溪口鄉", "新港鄉", "六腳鄉", "東石鄉", "義竹鄉", "鹿草鄉", "水上鄉", "中埔鄉", "竹崎鄉", "梅山鄉", "番路鄉", "大埔鄉", "阿里山鄉"],
    "屏東縣": ["屏東市", "潮州鎮", "東港鎮", "恆春鎮", "萬丹鄉", "長治鄉", "麟洛鄉", "九如鄉", "里港鄉", "高樹鄉", "鹽埔鄉", "內埔鄉", "竹田鄉", "萬巒鄉", "新埤鄉", "枋寮鄉", "新園鄉", "崁頂鄉", "林邊鄉", "南州鄉", "佳冬鄉", "琉球鄉", "車城鄉", "滿州鄉", "枋山鄉", "三地門鄉", "霧台鄉", "瑪家鄉", "泰武鄉", "來義鄉", "春日鄉", "獅子鄉", "牡丹鄉"],
    "花蓮縣": ["花蓮市", "鳳林鎮", "玉里鎮", "新城鄉", "吉安鄉", "壽豐鄉", "光復鄉", "豐濱鄉", "瑞穗鄉", "富里鄉", "秀林鄉", "萬榮鄉", "卓溪鄉"],
    "台東縣": ["台東市", "成功鎮", "關山鎮", "卑南鄉", "鹿野鄉", "池上鄉", "東河鄉", "長濱鄉", "太麻里鄉", "大武鄉", "綠島鄉", "海端鄉", "延平鄉", "金峰鄉", "達仁鄉", "蘭嶼鄉"],
    "澎湖縣": ["馬公市", "湖西鄉", "白沙鄉", "西嶼鄉", "望安鄉", "七美鄉"],
    "金門縣": ["金城鎮", "金湖鎮", "金沙鎮", "金寧鄉", "烈嶼鄉", "烏坵鄉"],
    "連江縣": ["南竿鄉", "北竿鄉", "莒光鄉", "東引鄉"]
};

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

    // 🌟 更新 State：新增 city 與 district
    const [receiver, setReceiver] = useState({
        name: "",
        phone: "",
        city: "",
        district: "",
        address: "",
        cardNumber: ""
    });

    const getRedirectMessage = () => {
        switch (paymentMethod) {
            case 'credit_card': return "正在詢問發卡機構...";
            case 'linepay':
            case 'jkopay':
            case 'easywallet':
            case 'pxpay': return "正在連結至電子支付安全加密頁面...";
            default: return "交易處理中，請稍候...";
        }
    };

    const groupedItems = checkoutItems.reduce((acc: any, item: any) => {
        const sellerName = item.seller || "個人賣家";
        if (!acc[sellerName]) acc[sellerName] = [];
        acc[sellerName].push(item);
        return acc;
    }, {});

    const itemTotal = checkoutItems.reduce((sum, item) => sum + (Number(item.price || 0) * (item.quantity || 1)), 0);
    const shippingFee = deliveryMethod === "home" ? 100 : 60;
    const orderTotal = itemTotal + shippingFee;

    // 🌟 核心功能：驗證、呼叫 API 並控制跳轉流程 (已修復衝突合併)
    const handleCheckoutSubmit = async () => {
        const { name, phone, city, district, address, cardNumber } = receiver;

        // 1. 欄位驗證
        if (name.trim().length < 2) {
            toast.error("請輸入真實姓名（至少2個字）");
            return;
        }

        const phoneRegex = /^09\d{8}$/;
        if (!phoneRegex.test(phone)) {
            toast.error("電話格式錯誤：須為 09 開頭的 10 位數字");
            return;
        }

        if (!city || !district) {
            toast.error("請選擇收件縣市與地區");
            return;
        }

        if (address.trim().length < 3) {
            toast.error("詳細地址資訊過短");
            return;
        }

        if (paymentMethod === 'credit_card') {
            const cardRegex = /^\d{16}$/;
            if (!cardRegex.test(cardNumber)) {
                toast.error("信用卡號須為 16 位純數字");
                return;
            }
        }

        // 2. 登入狀態驗證
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            toast.error("請先登入才能結帳喔！");
            return;
        }
        const user = JSON.parse(userStr);

        // 3. 準備儲存至本機的交易紀錄資料
        const newTransaction = {
            id: "ORDER-" + Date.now(),
            date: new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }),
            items: checkoutItems,
            totalPrice: orderTotal,
            status: "已完成",
            payment: paymentMethod === 'credit_card' ? '信用卡' : (paymentMethod === 'cod' ? '貨到付款' : '電子支付'),
            delivery: deliveryMethod === 'home' ? '宅配' : '超商取貨',
            fullAddress: `${city}${district}${address}` // 儲存包含縣市地區的完整地址
        };

        // 4. 準備發送給後端 API 的資料
        const checkoutData = {
            email: user.email,
            items: checkoutItems,
            receiver: receiver,
            paymentMethod: newTransaction.payment,
            deliveryMethod: newTransaction.delivery,
            totalAmount: orderTotal
        };

        try {
            // 將紀錄存入本機 LocalStorage (保留你原本的功能)
            const history = JSON.parse(localStorage.getItem('user_transactions') || '[]');
            history.unshift(newTransaction);
            localStorage.setItem('user_transactions', JSON.stringify(history));

            // 呼叫後端結帳 API
            const response = await fetch('http://localhost:3001/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(checkoutData)
            });

            const data = await response.json();

            if (!data.success) {
                toast.error(`結帳失敗：${data.message}`);
                return;
            }

            // 5. 控制跳轉流程
            if (paymentMethod === 'cod') {
                toast.success("🎉 訂單已成功建立！交易紀錄已更新。");
                localStorage.removeItem('checkout_items');
                setCheckoutStep('success');
            } else {
                setCheckoutStep('redirect');
                setTimeout(() => {
                    toast.success("🎉 支付成功！訂單已完成。");
                    localStorage.removeItem('checkout_items');
                    setCheckoutStep('success');
                }, 2500);
            }

        } catch (error) {
            console.error("結帳連線錯誤", error);
            toast.error("系統連線錯誤，請稍後再試");
        }
    };

    if (checkoutStep === 'redirect') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <div className="space-y-6 text-center animate-in fade-in duration-500">
                    <div className="relative flex items-center justify-center">
                        <Loader2 className="w-16 h-16 text-neutral-800 animate-spin" />
                        <div className="absolute w-8 h-8 bg-neutral-100 rounded-full animate-ping" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-neutral-800 tracking-tight">{getRedirectMessage()}</h2>
                        <p className="text-sm text-neutral-400">請勿關閉或重新整理頁面</p>
                    </div>
                </div>
            </div>
        );
    }

    if (checkoutStep === 'success') {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
                <Card className="max-w-sm w-full rounded-2xl border-none shadow-sm text-center overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="bg-green-500 py-8 flex justify-center"><CheckCircle2 className="w-16 h-16 text-white" /></div>
                    <CardContent className="p-8 space-y-6">
                        <h1 className="text-xl font-bold">訂單建立成功！</h1>
                        <p className="text-sm text-neutral-500">您的交易紀錄已更新，您可以隨時查看進度。</p>
                        <div className="flex flex-col gap-2">
                            <Button className="w-full rounded-xl font-bold py-5 bg-[#333] hover:bg-black" onClick={() => onNavigate('transactions')}>查看訂單紀錄</Button>
                            <Button variant="ghost" className="w-full" onClick={() => onNavigate('home')}>回首頁繼續逛逛</Button>
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

                    {/* 收件資訊 */}
                    <Card className="rounded-2xl border-none shadow-sm bg-white">
                        <CardContent className="p-6">
                            <h2 className="text-sm font-bold mb-5 flex items-center gap-1 text-neutral-600">
                                <MapPin className="w-4 h-4" /> 收件資訊
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-neutral-500 uppercase">收件人姓名 <span className="text-red-500 font-bold ml-0.5">*</span></label>
                                    <input type="text" className="w-full p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 outline-none focus:border-neutral-300 text-sm" placeholder="姓名" value={receiver.name} onChange={e => setReceiver({ ...receiver, name: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-neutral-500 uppercase">聯絡電話 <span className="text-red-500 font-bold ml-0.5">*</span></label>
                                    <input type="text" className="w-full p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 outline-none focus:border-neutral-300 text-sm" placeholder="09xxxxxxxx" value={receiver.phone} onChange={e => setReceiver({ ...receiver, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                                </div>

                                {/* 🌟 縣市地區下拉選單 */}
                                <div className="md:col-span-2 grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-500 uppercase">縣市 <span className="text-red-500 font-bold ml-0.5">*</span></label>
                                        <select
                                            className="w-full p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 outline-none focus:border-neutral-300 text-sm appearance-none cursor-pointer"
                                            value={receiver.city}
                                            onChange={(e) => setReceiver({ ...receiver, city: e.target.value, district: "" })}
                                        >
                                            <option value="">請選擇縣市</option>
                                            {Object.keys(taiwanDistricts).map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-500 uppercase">地區 <span className="text-red-500 font-bold ml-0.5">*</span></label>
                                        <select
                                            className="w-full p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 outline-none focus:border-neutral-300 text-sm appearance-none cursor-pointer disabled:opacity-50"
                                            value={receiver.district}
                                            onChange={(e) => setReceiver({ ...receiver, district: e.target.value })}
                                            disabled={!receiver.city}
                                        >
                                            <option value="">請選擇地區</option>
                                            {receiver.city && taiwanDistricts[receiver.city].map(dist => (
                                                <option key={dist} value={dist}>{dist}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-xs font-bold text-neutral-500 uppercase">詳細收件地址 / 門市名稱 <span className="text-red-500 font-bold ml-0.5">*</span></label>
                                    <input type="text" className="w-full p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 outline-none focus:border-neutral-300 text-sm" placeholder="例如：忠孝東路三段1號 或 宜大門市" value={receiver.address} onChange={e => setReceiver({ ...receiver, address: e.target.value })} />
                                </div>

                                {paymentMethod === 'credit_card' && (
                                    <div className="md:col-span-2 pt-2 animate-in fade-in slide-in-from-top-1">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-neutral-500 uppercase">信用卡卡號 <span className="text-red-500 font-bold ml-0.5">*</span></label>
                                            <input type="text" className="w-full p-2.5 rounded-lg bg-primary/5 border border-primary/20 outline-none focus:border-primary/40 font-mono text-sm tracking-widest" placeholder="16 碼卡號" value={receiver.cardNumber} onChange={e => setReceiver({ ...receiver, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

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