import { useState } from "react";
import { ArrowLeft, ShoppingBag, Store, User, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface TransactionHistoryPageProps {
    onNavigate: (page: string) => void;
}

export function TransactionHistoryPage({ onNavigate }: TransactionHistoryPageProps) {
    // 狀態：切換「我購買的」與「我賣出的」
    const [activeTab, setActiveTab] = useState<'purchases' | 'sales'>('purchases');

    // 模擬你的截圖中的假資料
    const mockTransactions = [
        {
            id: '1',
            type: 'purchases',
            title: '登山自行車',
            price: 9600,
            partner: '黃美惠', // 賣家
            date: '2024 年 11 月 15 日',
            status: '已完成',
            image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&q=80' // 自行車示意圖
        },
        {
            id: '2',
            type: 'purchases',
            title: '無線耳機',
            price: 2850,
            partner: '林志豪', // 賣家
            date: '2024 年 11 月 18 日',
            status: '交易中',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' // 耳機示意圖
        }
    ];

    // 根據當前選擇的頁籤過濾資料
    const filteredTransactions = mockTransactions.filter(t => t.type === activeTab);

    return (
        <div className="min-h-screen bg-neutral-50 pb-20">
            <div className="max-w-5xl mx-auto px-4 py-8">
                
                {/* 頂部返回按鈕 */}
                <button
                    className="flex items-center text-sm font-medium text-neutral-600 hover:text-primary mb-8 transition-colors"
                    onClick={() => onNavigate('profile')} // 返回個人資料頁
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> 返回個人資料
                </button>

                {/* 標題區塊 */}
                <h1 className="text-2xl font-bold mb-2">交易紀錄</h1>
                <p className="text-neutral-500 mb-8">查看您的所有購買和銷售紀錄</p>

                {/* 頁籤切換按鈕 */}
                <div className="flex gap-3 mb-8">
                    <Button
                        variant={activeTab === 'purchases' ? 'default' : 'outline'}
                        className="rounded-full shadow-sm"
                        onClick={() => setActiveTab('purchases')}
                    >
                        <ShoppingBag className="w-4 h-4 mr-2" /> 我購買的
                    </Button>
                    <Button
                        variant={activeTab === 'sales' ? 'default' : 'outline'}
                        className="rounded-full shadow-sm bg-white"
                        onClick={() => setActiveTab('sales')}
                    >
                        <Store className="w-4 h-4 mr-2" /> 我賣出的
                    </Button>
                </div>

                <div className="text-sm text-neutral-500 mb-4">
                    共 {filteredTransactions.length} 筆交易
                </div>

                {/* 交易紀錄清單列表 */}
                <div className="space-y-4">
                    {filteredTransactions.map((transaction) => (
                        <Card key={transaction.id} className="rounded-2xl border-border shadow-sm overflow-hidden">
                            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
                                
                                {/* 右上角狀態標籤 */}
                                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        transaction.status === '已完成'
                                            ? 'bg-neutral-200 text-neutral-600' // 灰色
                                            : 'bg-blue-100 text-blue-700' // 藍色
                                    }`}>
                                        {transaction.status}
                                    </span>
                                </div>

                                {/* 商品圖片 */}
                                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200">
                                    <ImageWithFallback src={transaction.image} alt={transaction.title} className="w-full h-full object-cover" />
                                </div>

                                {/* 商品資訊與操作區 */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold mb-1 pr-20">{transaction.title}</h3>
                                        <div className="text-base font-medium text-neutral-800 mb-4">
                                            NT${transaction.price.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
                                        {/* 交易對象與日期 */}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 text-sm text-neutral-500">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                <span>{activeTab === 'purchases' ? '賣家' : '買家'} : {transaction.partner}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{transaction.date}</span>
                                            </div>
                                        </div>

                                        {/* 🌟 核心功能：查看詳情按鈕跳轉至 order-detail */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full sm:w-auto rounded-full font-bold shadow-sm"
                                            onClick={() => onNavigate('order-detail')}
                                        >
                                            查看詳情
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

            </div>
        </div>
    );
}