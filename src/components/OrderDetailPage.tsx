import { useMemo } from "react";
import { ChevronLeft, ReceiptText, CreditCard, Truck, PackageCheck, Star, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface OrderDetailPageProps {
    onNavigate: (page: string) => void;
}

export function OrderDetailPage({ onNavigate }: OrderDetailPageProps) {
    // 模擬訂單進度狀態
    const orderSteps = [
        { label: '訂單已成立', time: '2026-03-14 16:43', icon: ReceiptText, active: true },
        { label: '付款資訊確認', time: '2026-03-14 16:44', icon: CreditCard, active: true },
        { label: '訂單已出貨', time: '2026-03-15 17:09', icon: Truck, active: true },
        { label: '完成訂單', time: '2026-03-20 02:29', icon: PackageCheck, active: true },
        { label: '待評價', time: '', icon: Star, active: false },
    ];

    // 模擬物流追蹤紀錄
    const logisticsTracking = [
        { status: '買家取件成功', time: '2026-03-19 17:57', active: true },
        { status: '包裹已抵達買家取件門市', time: '2026-03-19 11:36', active: false },
        { status: '包裹整理中', time: '2026-03-17 10:29', active: false },
        { status: '包裹抵達理貨中心，處理中', time: '2026-03-16 10:31', active: false },
        { status: '包裹離店作業中', time: '2026-03-16 05:00', active: false },
        { status: '賣家已寄件成功', time: '2026-03-15 17:09', active: false },
    ];

    // 🌟 隨機生成買家個資 (電話與地址)
    const buyerInfo = useMemo(() => {
        const randomPhones = [
            '(+886) 912 345 678',
            '(+886) 987 654 321',
            '(+886) 955 666 777',
            '(+886) 933 111 222',
            '(+886) 900 888 999'
        ];
        
        const randomAddresses = [
            '台北市 信義區 台北市信義區信義路五段7號',
            '台中市 西屯區 台中市西屯區台灣大道三段99號',
            '高雄市 左營區 高雄市左營區博愛二路777號',
            '台南市 安平區 台南市安平區永華路二段33號',
            '新北市 板橋區 新北市板橋區縣民大道二段7號'
        ];

        // 隨機抽取一筆資料
        const phone = randomPhones[Math.floor(Math.random() * randomPhones.length)];
        const address = randomAddresses[Math.floor(Math.random() * randomAddresses.length)];
        
        // 隨機生成 6 碼取件驗證碼
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        return { phone, address, verifyCode };
    }, []); // 加上空陣列確保進入此頁面時只會隨機生成一次，不會因為畫面更新而一直變動

    return (
        <div className="min-h-screen bg-neutral-50 pb-20">
            {/* 頂部導覽列 */}
            <div className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button 
                        className="flex items-center text-neutral-600 hover:text-primary transition-colors font-medium"
                        onClick={() => onNavigate('transactions')} // 返回交易紀錄
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" /> 回上頁
                    </button>
                    <div className="text-sm font-medium text-neutral-500">
                        訂單編號. 26031454V4U51Q <span className="mx-2">|</span> <span className="text-primary font-bold">訂單已完成</span>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                
                {/* 第一區塊：訂單進度軸與操作按鈕 */}
                <Card className="rounded-xl border-border shadow-sm overflow-hidden">
                    <CardContent className="p-8">
                        {/* 橫向進度條 */}
                        <div className="flex items-start justify-between relative mb-12">
                            {/* 背景連接線 */}
                            <div className="absolute top-8 left-10 right-10 h-1 bg-neutral-200 -z-10 rounded-full"></div>
                            {/* 活躍的連接線 (依據進度改變寬度) */}
                            <div className="absolute top-8 left-10 right-10 h-1 bg-green-500 -z-10 rounded-full w-[75%]"></div>

                            {orderSteps.map((step, index) => (
                                <div key={index} className="flex flex-col items-center flex-1 z-10 bg-white px-2">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 mb-3 transition-colors ${step.active ? 'border-green-500 text-green-500 bg-white' : 'border-neutral-200 text-neutral-300 bg-white'}`}>
                                        <step.icon className="w-8 h-8" />
                                    </div>
                                    <div className={`text-sm font-bold mb-1 ${step.active ? 'text-neutral-800' : 'text-neutral-400'}`}>{step.label}</div>
                                    <div className="text-xs text-neutral-400">{step.time}</div>
                                </div>
                            ))}
                        </div>

                        {/* 評價與聯絡按鈕 */}
                        <div className="flex flex-col md:flex-row items-center justify-between bg-orange-50/50 p-4 rounded-lg border border-orange-100">
                            <div className="text-sm text-neutral-600 mb-4 md:mb-0">
                                在 <span className="font-bold">2026-04-19</span> 前評論商品，以獲得回饋！
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <Button className="bg-primary hover:bg-primary/90 text-white min-w-[120px]">評價</Button>
                                
                                <Button 
                                    variant="outline" 
                                    className="min-w-[120px] bg-white"
                                    onClick={() => onNavigate('chat')}
                                >
                                    <MessageSquare className="w-4 h-4 mr-2"/>聯絡賣家
                                </Button>
                                {/* 💡 已移除「再買一次」按鈕 */}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 第二區塊：收件資訊與物流時間軸 */}
                <Card className="rounded-xl border-border shadow-sm">
                    {/* 信封邊框裝飾 */}
                    <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-red-400 to-blue-400" style={{ backgroundSize: '50px 100%' }}></div>
                    
                    <CardContent className="p-8 flex flex-col md:flex-row gap-8">
                        {/* 左側：收件地址 */}
                        <div className="flex-1 md:pr-8 md:border-r border-neutral-100">
                            <h3 className="text-lg font-bold mb-4">收件地址</h3>
                            <div className="space-y-2 text-sm text-neutral-600">
                                {/* 💡 修改姓名為清清子，帶入隨機電話與地址 */}
                                <div className="font-bold text-neutral-800 text-base">清清子</div>
                                <div>{buyerInfo.phone}</div>
                                <div>{buyerInfo.address}</div>
                                <div className="pt-4">
                                    <span className="text-neutral-500 text-xs block mb-1">取件驗證碼:</span>
                                    <span className="text-xl font-bold tracking-widest text-primary">{buyerInfo.verifyCode}</span>
                                </div>
                            </div>
                        </div>

                        {/* 右側：物流追蹤 */}
                        <div className="flex-[2]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-transparent select-none">物流動態</h3>
                                <div className="text-sm text-neutral-500 text-right">
                                    <div>7-11 門市取貨</div>
                                    <div>TW2643189916084</div>
                                </div>
                            </div>
                            
                            {/* 垂直時間軸 */}
                            <div className="relative pl-4 space-y-6 border-l-2 border-neutral-200 ml-2">
                                {logisticsTracking.map((track, index) => (
                                    <div key={index} className="relative">
                                        {/* 圓點 */}
                                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${track.active ? 'bg-green-500' : 'bg-neutral-300'}`}></div>
                                        <div className={`flex flex-col sm:flex-row sm:gap-4 ${track.active ? 'text-green-600 font-medium' : 'text-neutral-500'}`}>
                                            <span className="text-sm min-w-[140px] mb-1 sm:mb-0">{track.time}</span>
                                            <span className="text-sm">{track.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}