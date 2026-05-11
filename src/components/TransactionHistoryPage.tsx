import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingBag, Store, User, Calendar, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface TransactionHistoryPageProps {
    onNavigate: (page: string) => void;
}

export function TransactionHistoryPage({ onNavigate }: TransactionHistoryPageProps) {
    // 狀態：切換「我購買的」與「我賣出的」
    const [activeTab, setActiveTab] = useState<'purchases' | 'sales'>('purchases');
    
    // 🌟 核心：用來存取從 localStorage 讀取的真實交易紀錄
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        // 從 localStorage 抓取結帳頁面存入的 'user_transactions'
        const loadData = () => {
            try {
                const savedData = localStorage.getItem('user_transactions');
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    // 為了配合原本的 UI 格式，我們將資料標準化
                    // 假設結帳頁存入的是 { id, date, items: [], totalPrice, status }
                    setTransactions(parsedData);
                }
            } catch (error) {
                console.error("讀取交易紀錄失敗", error);
            }
        };

        loadData();
    }, []);

    // 根據標籤過濾（目前我們只實作了「購買」的儲存，賣出的資料通常來自後端）
    const buyingTransactions = transactions; 
    const sellingTransactions: any[] = []; // 暫時預留給賣出功能

    const currentList = activeTab === 'purchases' ? buyingTransactions : sellingTransactions;

    return (
        <div className="min-h-screen bg-neutral-50 pb-20">
            <div className="max-w-5xl mx-auto px-4 py-8">
                
                {/* 頂部返回按鈕 */}
                <button
                    className="flex items-center text-sm font-medium text-neutral-600 hover:text-primary mb-8 transition-colors"
                    onClick={() => onNavigate('profile')}
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
                        className={`rounded-full shadow-sm ${activeTab === 'purchases' ? 'bg-[#333]' : 'bg-white'}`}
                        onClick={() => setActiveTab('purchases')}
                    >
                        <ShoppingBag className="w-4 h-4 mr-2" /> 我購買的
                    </Button>
                    <Button
                        variant={activeTab === 'sales' ? 'default' : 'outline'}
                        className={`rounded-full shadow-sm ${activeTab === 'sales' ? 'bg-[#333]' : 'bg-white'}`}
                        onClick={() => setActiveTab('sales')}
                    >
                        <Store className="w-4 h-4 mr-2" /> 我賣出的
                    </Button>
                </div>

                <div className="text-sm text-neutral-500 mb-4">
                    共 {currentList.length} 筆交易
                </div>

                {/* 交易紀錄清單列表 */}
                <div className="space-y-4">
                    {currentList.length > 0 ? (
                        currentList.map((transaction) => {
                            // 因為一筆訂單可能有包含多個商品，我們取第一個商品作為代表顯示
                            const mainItem = transaction.items[0];
                            const hasMultipleItems = transaction.items.length > 1;

                            return (
                                <Card key={transaction.id} className="rounded-2xl border-border shadow-sm overflow-hidden bg-white">
                                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
                                        
                                        {/* 右上角狀態標籤 */}
                                        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                transaction.status === '已完成'
                                                    ? 'bg-neutral-100 text-neutral-600'
                                                    : 'bg-blue-50 text-blue-600'
                                            }`}>
                                                {transaction.status || '已完成'}
                                            </span>
                                        </div>

                                        {/* 商品圖片 (取訂單中第一個商品) */}
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-100">
                                            <ImageWithFallback 
                                                src={mainItem?.image} 
                                                alt={mainItem?.title} 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>

                                        {/* 商品資訊與操作區 */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold mb-1 pr-20 truncate">
                                                    {mainItem?.title}
                                                    {hasMultipleItems && <span className="text-neutral-400 text-sm ml-2">等共 {transaction.items.length} 件商品</span>}
                                                </h3>
                                                <div className="text-base font-medium text-primary mb-4">
                                                    NT${Number(transaction.totalPrice).toLocaleString()}
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
                                                {/* 交易對象與日期 */}
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 text-sm text-neutral-500">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        <span>
                                                            {activeTab === 'purchases' ? '賣家' : '買家'} : {mainItem?.seller || "個人賣家"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{transaction.date}</span>
                                                    </div>
                                                </div>

                                                {/* 查看詳情按鈕 */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full sm:w-auto rounded-full font-bold shadow-sm hover:bg-neutral-50"
                                                    onClick={() => onNavigate('order-detail', transaction.id)}
                                                >
                                                    查看詳情
                                                    <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-200">
                            <div className="bg-neutral-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-300">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <p className="text-neutral-400">目前尚無{activeTab === 'purchases' ? '購買' : '銷售'}紀錄</p>
                            {activeTab === 'purchases' && (
                                <Button 
                                    variant="link" 
                                    className="mt-2 text-primary"
                                    onClick={() => onNavigate('home')}
                                >
                                    去商城逛逛吧
                                </Button>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}