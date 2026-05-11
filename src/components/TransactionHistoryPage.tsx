import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingBag, Store, User, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";

interface TransactionHistoryPageProps {
    onNavigate: (page: string, data?: any) => void;
}

export function TransactionHistoryPage({ onNavigate }: TransactionHistoryPageProps) {
    const [activeTab, setActiveTab] = useState<'purchases' | 'sales'>('purchases');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🌟 核心：根據目前頁籤，動態決定打哪一支 API
    const fetchOrders = async (type: 'purchases' | 'sales') => {
        setIsLoading(true);
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            onNavigate('login');
            return;
        }
        const user = JSON.parse(userStr);

        try {
            // 判斷要呼叫「買家 API」還是「賣家 API」
            const endpoint = type === 'purchases'
                ? `http://localhost:3001/api/orders/buyer/${user.email}`
                : `http://localhost:3001/api/orders/seller/${user.email}`;

            const res = await fetch(endpoint);
            const data = await res.json();

            if (data.success) {
                setTransactions(data.orders);
            } else {
                setTransactions([]);
            }
        } catch (error) {
            console.error("讀取交易紀錄失敗", error);
            toast.error("無法載入交易紀錄");
            setTransactions([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 🌟 當 activeTab 改變時，自動重新抓取對應的資料
    useEffect(() => {
        fetchOrders(activeTab);
    }, [activeTab]);

    const currentList = transactions;

    return (
        <div className="min-h-screen bg-neutral-50 pb-20">
            <div className="max-w-5xl mx-auto px-4 py-8">

                <button
                    className="flex items-center text-sm font-medium text-neutral-600 hover:text-primary mb-8 transition-colors"
                    onClick={() => onNavigate('profile')}
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> 返回個人資料
                </button>

                <h1 className="text-2xl font-bold mb-2">交易紀錄</h1>
                <p className="text-neutral-500 mb-8">查看您的所有購買和銷售紀錄</p>

                <div className="flex gap-3 mb-8">
                    <Button
                        variant={activeTab === 'purchases' ? 'default' : 'outline'}
                        className={`rounded-full shadow-sm border-none transition-all ${activeTab === 'purchases' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white text-neutral-500 hover:bg-neutral-50'}`}
                        onClick={() => setActiveTab('purchases')}
                    >
                        <ShoppingBag className="w-4 h-4 mr-2" /> 我購買的
                    </Button>

                    <Button
                        variant={activeTab === 'sales' ? 'default' : 'outline'}
                        className={`rounded-full shadow-sm border-none transition-all ${activeTab === 'sales' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white text-neutral-500 hover:bg-neutral-50'}`}
                        onClick={() => setActiveTab('sales')}
                    >
                        <Store className="w-4 h-4 mr-2" /> 我賣出的
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-neutral-300 mb-2" />
                        <p className="text-neutral-400">載入紀錄中...</p>
                    </div>
                ) : (
                    <>
                        <div className="text-sm text-neutral-500 mb-4">
                            共 {currentList.length} 筆交易
                        </div>

                        <div className="space-y-4">
                            {currentList.length > 0 ? (
                                currentList.map((transaction) => {
                                    const mainItem = transaction.items[0];
                                    const hasMultipleItems = transaction.items.length > 1;

                                    return (
                                        <Card key={transaction.id} className="rounded-2xl border-border shadow-sm overflow-hidden bg-white">
                                            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 relative">

                                                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${transaction.status === '已完成'
                                                        ? 'bg-neutral-100 text-neutral-600'
                                                        : 'bg-blue-50 text-blue-600'
                                                        }`}>
                                                        {transaction.status || '已完成'}
                                                    </span>
                                                </div>

                                                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-100">
                                                    <ImageWithFallback
                                                        src={mainItem?.image}
                                                        alt={mainItem?.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-bold mb-1 pr-20 truncate">
                                                            {mainItem?.title}
                                                            {hasMultipleItems && <span className="text-neutral-400 text-sm ml-2">等共 {transaction.items.length} 件商品</span>}
                                                        </h3>
                                                        <div className="text-base font-medium text-primary mb-4">
                                                            NT${Number(transaction.totalAmount || transaction.totalPrice).toLocaleString()}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 text-sm text-neutral-500">
                                                            <div className="flex items-center gap-2">
                                                                <User className="w-4 h-4" />
                                                                <span>
                                                                    {/* 🌟 根據分頁動態顯示 賣方 或 買方 */}
                                                                    {activeTab === 'purchases' ? '賣方' : '買方'} :
                                                                    {activeTab === 'purchases'
                                                                        ? (mainItem?.seller || "個人賣家")
                                                                        : (transaction.email?.split('@')[0] || "買家")
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>{new Date(transaction.date || transaction.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>

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
                                    <ShoppingBag className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                                    {/* 🌟 根據分頁動態顯示空狀態文案 */}
                                    <p className="text-neutral-400">目前尚無{activeTab === 'purchases' ? '購買' : '銷售'}紀錄</p>
                                    {activeTab === 'purchases' && (
                                        <Button variant="link" className="mt-2 text-primary" onClick={() => onNavigate('home')}>去商城逛逛吧</Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}