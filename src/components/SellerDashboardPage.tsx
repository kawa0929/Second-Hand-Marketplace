import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, Eye, Package, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface SellerDashboardPageProps {
    onNavigate: (page: string) => void;
}

export function SellerDashboardPage({ onNavigate }: SellerDashboardPageProps) {
    // 圖表與商品清單 State
    const [chartData, setChartData] = useState<any[]>([]);
    const [weeklyData, setWeeklyData] = useState<any[]>([]);

    // KPI 數據 State
    const [stats, setStats] = useState({
        totalViews: 0,
        activeProducts: 0,
        totalSales: 0,
        conversionRate: 0,
        salesGrowth: 0, // 銷售額成長率
        conversionGrowth: 0 // 轉換成長率
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSellerData = async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setIsLoading(false);
                return;
            }
            const user = JSON.parse(userStr);

            try {
                // 1. 獲取商品清單 (提供給長條圖與商品總數/瀏覽量)
                const productsRes = await fetch(`/api/products?sellerEmail=${user.email}`);
                const productsData = await productsRes.json();

                // 2. 獲取賣家儀表板統計資料 (提供給折線圖、銷售額、轉換率)
                // 註：這需要你的後端建立一隻對應的 API
                const dashboardRes = await fetch(`/api/seller/dashboard?sellerEmail=${user.email}`);
                const dashboardData = dashboardRes.ok ? await dashboardRes.json() : null;

                if (productsData.success && productsData.products) {
                    const myProductsOnly = productsData.products.filter((p: any) => p.sellerEmail === user.email);

                    // 處理熱門商品長條圖資料
                    const formattedData = myProductsOnly.map((product: any) => ({
                        name: product.title,
                        views: product.views || 0
                    }));
                    formattedData.sort((a: any, b: any) => b.views - a.views);
                    setChartData(formattedData.slice(0, 5));

                    const totalViews = myProductsOnly.reduce((sum: number, p: any) => sum + (p.views || 0), 0);

                    // 整合所有數據到 State
                    setStats({
                        totalViews: totalViews,
                        activeProducts: myProductsOnly.length,
                        // 如果 dashboard API 有回傳資料就用真實的，否則預設為 0
                        totalSales: dashboardData?.totalSales || 0,
                        conversionRate: dashboardData?.conversionRate || 0,
                        salesGrowth: dashboardData?.salesGrowth || 0,
                        conversionGrowth: dashboardData?.conversionGrowth || 0
                    });

                    // 設定七天走勢圖資料
                    if (dashboardData?.weeklyData) {
                        setWeeklyData(dashboardData.weeklyData);
                    }
                }
            } catch (error) {
                console.error("抓取賣家數據失敗:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSellerData();
    }, []);

    return (
        <div className="min-h-screen bg-neutral-50 pb-20">
            {/* 頂部導覽 */}
            <div className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onNavigate('profile')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-bold">賣家數據中心</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

                {/* 第一區塊：核心數據卡片 (KPI) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">本月總銷售額</p>
                                    <h3 className="text-3xl font-bold text-primary">
                                        {isLoading ? "---" : `NT$ ${stats.totalSales.toLocaleString()}`}
                                    </h3>
                                </div>
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                            </div>
                            <p className={`text-sm mt-4 flex items-center gap-1 ${stats.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <TrendingUp className={`w-4 h-4 ${stats.salesGrowth < 0 && 'rotate-180'}`} />
                                較上月{stats.salesGrowth >= 0 ? '成長' : '衰退'} {Math.abs(stats.salesGrowth)}%
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">商品總瀏覽量</p>
                                    <h3 className="text-3xl font-bold">{isLoading ? "---" : stats.totalViews.toLocaleString()}</h3>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                    <Eye className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-sm text-green-600 mt-4 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" /> 數據即時同步中
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">上架中商品</p>
                                    <h3 className="text-3xl font-bold">{isLoading ? "---" : stats.activeProducts}</h3>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                                    <Package className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-4">
                                管理您的刊登物
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">訂單轉換率</p>
                                    <h3 className="text-3xl font-bold">
                                        {isLoading ? "---" : `${stats.conversionRate}%`}
                                    </h3>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                            <p className={`text-sm mt-4 flex items-center gap-1 ${stats.conversionGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <TrendingUp className={`w-4 h-4 ${stats.conversionGrowth < 0 && 'rotate-180'}`} />
                                較上月{stats.conversionGrowth >= 0 ? '成長' : '衰退'} {Math.abs(stats.conversionGrowth)}%
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* 第二區塊：視覺化圖表 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* 銷售額與流量走勢圖 (折線圖) */}
                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold mb-6">近七天銷售與流量走勢</h3>
                            <div className="h-[300px] w-full">
                                {isLoading ? (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">數據讀取中...</div>
                                ) : weeklyData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={weeklyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Line yAxisId="left" type="monotone" dataKey="sales" name="銷售額(NT$)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
                                            <Line yAxisId="right" type="monotone" dataKey="views" name="瀏覽量(次)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">尚無走勢數據</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 熱門商品排行 (長條圖) */}
                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold mb-6">熱門商品瀏覽排行</h3>
                            <div className="h-[300px] w-full">
                                {isLoading ? (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">數據讀取中...</div>
                                ) : chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#333', fontSize: 12 }} width={100} />
                                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="views" name="瀏覽次數" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">尚無屬於您的商品數據</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}