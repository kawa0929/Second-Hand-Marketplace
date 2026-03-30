import { useState } from "react";
import { ArrowLeft, TrendingUp, Eye, Package, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface SellerDashboardPageProps {
    onNavigate: (page: string) => void;
}

// 模擬的圖表假資料 (近七天流量與銷售額)
const weeklyData = [
    { name: '週一', views: 120, sales: 1500 },
    { name: '週二', views: 200, sales: 3200 },
    { name: '週三', views: 150, sales: 800 },
    { name: '週四', views: 280, sales: 4500 },
    { name: '週五', views: 350, sales: 6000 },
    { name: '週六', views: 420, sales: 8500 },
    { name: '週日', views: 380, sales: 7200 },
];

// 模擬的熱門商品假資料
const topProductsData = [
    { name: 'Nintendo Switch', views: 845 },
    { name: 'TWS 金道勳小卡', views: 520 },
    { name: '復古皮衣', views: 310 },
    { name: '二手 AirPods Pro', views: 280 },
];

export function SellerDashboardPage({ onNavigate }: SellerDashboardPageProps) {
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
                                    <h3 className="text-3xl font-bold text-primary">NT$ 31,700</h3>
                                </div>
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-sm text-green-600 mt-4 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" /> 較上月成長 12.5%
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">商品總瀏覽量</p>
                                    <h3 className="text-3xl font-bold">1,900</h3>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                    <Eye className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-sm text-green-600 mt-4 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" /> 較上月成長 8.2%
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">上架中商品</p>
                                    <h3 className="text-3xl font-bold">24</h3>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                                    <Package className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-4">
                                有 3 件商品即將售完
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">訂單轉換率</p>
                                    <h3 className="text-3xl font-bold">4.8%</h3>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-sm text-green-600 mt-4 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" /> 較上月成長 1.1%
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
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={weeklyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Line yAxisId="left" type="monotone" dataKey="sales" name="銷售額(NT$)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
                                        <Line yAxisId="right" type="monotone" dataKey="views" name="瀏覽量(次)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 熱門商品排行 (長條圖) */}
                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold mb-6">熱門商品瀏覽排行</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#333', fontSize: 12 }} width={100} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar dataKey="views" name="瀏覽次數" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}